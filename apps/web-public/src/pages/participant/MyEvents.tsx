import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '@/lib/api';
import { format } from 'date-fns';

export function MyEventsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['my-participations', page],
    queryFn: () => eventsApi.getMyParticipations({ page, limit: 10 }),
    placeholderData: (prev) => prev,
  });

  const participations = (data?.data as unknown as Array<{
    id: string;
    status: string;
    event: { id: string; title: string; startDate: string; endDate: string; venue?: string; status: string };
    tnaResponse?: { compositeScore: string; recommendedTrack: string } | null;
    certificate?: { status: string; verificationCode?: string } | null;
    csfSurveyResponse?: { status: string; submittedAt?: string } | null;
    impactSurveyResponse?: { status: string; submittedAt?: string } | null;
  }>) ?? [];
  const meta = data?.meta;

  const STATUS_COLOR: Record<string, string> = {
    COMPLETED: 'badge-green', RSVP_CONFIRMED: 'badge-blue',
    TNA_PENDING: 'badge-yellow', REGISTERED: 'badge-gray',
    WAITLISTED: 'badge-yellow', NO_SHOW: 'badge-red', CANCELLED: 'badge-red',
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Events</h1>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : participations.length === 0 ? (
        <div className="card text-center py-12 text-gray-500">
          <p>You haven't registered for any events yet.</p>
          <Link to="/events" className="btn-primary mt-4 inline-flex">Browse Events</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {participations.map((p) => (
            <div key={p.id} className="card">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <Link to={`/events/${p.event.id}`} className="font-semibold text-gray-900 hover:text-dti-blue">
                    {p.event.title}
                  </Link>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {format(new Date(p.event.startDate), 'MMM d, yyyy')}
                    {p.event.venue && ` · ${p.event.venue}`}
                  </p>
                </div>
                <span className={`badge shrink-0 ${STATUS_COLOR[p.status] ?? 'badge-gray'}`}>
                  {p.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {/* TNA CTA */}
                {p.status === 'REGISTERED' && (
                  <Link to={`/my-events/${p.id}/tna`} className="btn-accent text-xs px-3 py-1.5">
                    Complete TNA →
                  </Link>
                )}
                {/* QR attendance code */}
                {['RSVP_CONFIRMED', 'ATTENDED'].includes(p.status) && (
                  <Link to={`/my-events/${p.id}/qr`} className="btn-secondary text-xs px-3 py-1.5">
                    📱 My QR Code
                  </Link>
                )}
                {/* TNA result */}
                {p.tnaResponse && (
                  <div className="text-xs text-gray-600 bg-gray-50 rounded-input px-3 py-1.5">
                    TNA Score: <strong>{p.tnaResponse.compositeScore}</strong> · Track: <strong>{p.tnaResponse.recommendedTrack}</strong>
                  </div>
                )}
                {/* CSF Survey CTA */}
                {p.csfSurveyResponse?.status === 'PENDING' && (
                  <Link to={`/my-events/${p.id}/csf`} className="btn-accent text-xs px-3 py-1.5">
                    📋 Complete Feedback Survey →
                  </Link>
                )}
                {p.csfSurveyResponse?.status === 'SUBMITTED' && (
                  <Link to={`/my-events/${p.id}/responses`} className="text-xs text-blue-700 bg-blue-50 rounded-input px-3 py-1.5 font-medium hover:bg-blue-100 transition-colors">
                    Survey Submitted ✓
                  </Link>
                )}
                {/* Impact Survey CTA */}
                {p.impactSurveyResponse?.status === 'PENDING' && (
                  <Link to={`/my-events/${p.id}/impact`} className="btn-accent text-xs px-3 py-1.5">
                    📊 Complete Impact Survey →
                  </Link>
                )}
                {p.impactSurveyResponse?.status === 'SUBMITTED' && (
                  <Link to={`/my-events/${p.id}/responses`} className="text-xs text-purple-700 bg-purple-50 rounded-input px-3 py-1.5 font-medium hover:bg-purple-100 transition-colors">
                    Impact Survey Submitted ✓
                  </Link>
                )}
                {/* Certificate */}
                {p.certificate?.status === 'ISSUED' && (
                  <Link to="/my-certificates" className="text-xs text-green-700 bg-green-50 rounded-input px-3 py-1.5 font-medium">
                    Certificate Issued ✓
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button className="btn-outline text-xs px-3 py-1.5" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
          <span className="text-sm text-gray-600">Page {page} of {meta.totalPages}</span>
          <button className="btn-outline text-xs px-3 py-1.5" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}
