import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { organizerApi, eventsApi } from '@/lib/api';
import { ArrowLeft, Users, CheckCircle, Award, BarChart3, ClipboardList } from 'lucide-react';

export function OrganizerEventReportPage() {
  const { id: eventId } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['event-report', eventId],
    queryFn: () => organizerApi.getEventReport(eventId!),
    enabled: Boolean(eventId),
  });

  const report = (data as any)?.data;

  if (isLoading) {
    return <div className="card text-center py-16 text-gray-400">Loading report…</div>;
  }

  if (!report) {
    return (
      <div className="card text-center py-16">
        <p className="text-gray-500">Report not available.</p>
        <Link to={`/organizer/events/${eventId}`} className="text-dti-blue text-sm mt-2 inline-block">← Back to event</Link>
      </div>
    );
  }

  const { event: evt, participation, attendance, certificates, csf, checklist } = report;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link to={`/organizer/events/${eventId}`} className="text-gray-500 hover:text-gray-700 mt-1">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Event Report</h1>
          <p className="text-sm text-gray-500 mt-0.5">{evt.title}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(evt.startDate).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}
            {evt.venue ? ` · ${evt.venue}` : ''}
            {' · '}{evt.deliveryMode.replace(/_/g, ' ')}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Registered', value: participation.total, icon: Users, color: 'text-blue-600' },
          { label: 'Attended', value: participation.attended, icon: CheckCircle, color: 'text-green-600' },
          { label: 'Attendance Rate', value: `${participation.attendanceRate}%`, icon: BarChart3, color: 'text-purple-600' },
          { label: 'Certificates Issued', value: certificates.totalIssued, icon: Award, color: 'text-teal-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-3">
            <Icon size={24} className={color} />
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Participation Breakdown */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Users size={18} /> Participation Breakdown
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(participation.breakdown as Record<string, number>).map(([status, count]) => (
            <div key={status} className="text-center p-3 rounded-lg bg-gray-50">
              <p className="text-lg font-bold text-gray-900">{count}</p>
              <p className="text-xs text-gray-500">{status.replace(/_/g, ' ')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance by Session */}
      {attendance.bySessions.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Attendance by Session</h2>
          <div className="space-y-2">
            {attendance.bySessions.map((session: any) => {
              const pct = participation.total > 0 ? Math.round((session.attendanceCount / participation.total) * 100) : 0;
              return (
                <div key={session.sessionId} className="flex items-center gap-3">
                  <p className="text-sm text-gray-700 w-48 shrink-0 truncate">{session.sessionTitle}</p>
                  <div className="flex-1 bg-gray-200 rounded-full h-4">
                    <div className="bg-blue-500 h-4 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm text-gray-600 w-24 text-right shrink-0">{session.attendanceCount} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CSF Survey Results */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <BarChart3 size={18} /> Customer Satisfaction (CSF)
        </h2>
        {csf.totalResponses === 0 ? (
          <p className="text-sm text-gray-400">No CSF responses yet.</p>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{csf.totalResponses} response(s)</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Overall', value: csf.averages.overallRating },
                { label: 'Content', value: csf.averages.contentRating },
                { label: 'Facilitator', value: csf.averages.facilitatorRating },
                { label: 'Logistics', value: csf.averages.logisticsRating },
              ].map(({ label, value }) => (
                <div key={label} className="text-center p-3 rounded-lg bg-gray-50">
                  <p className="text-2xl font-bold text-gray-900">{value ? Number(value).toFixed(1) : '—'}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                  <div className="flex justify-center gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star} className={`text-sm ${value && star <= Math.round(Number(value)) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Feedback */}
            {csf.feedback.highlights.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Highlights</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {csf.feedback.highlights.map((text: string, i: number) => (
                    <p key={i} className="text-sm text-gray-600 bg-green-50 px-3 py-2 rounded-lg">"{text}"</p>
                  ))}
                </div>
              </div>
            )}
            {csf.feedback.improvements.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Areas for Improvement</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {csf.feedback.improvements.map((text: string, i: number) => (
                    <p key={i} className="text-sm text-gray-600 bg-yellow-50 px-3 py-2 rounded-lg">"{text}"</p>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Checklist Progress */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <ClipboardList size={18} /> Preparation Checklist Progress
        </h2>
        {checklist.total === 0 ? (
          <p className="text-sm text-gray-400">No checklist created for this event.</p>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${checklist.completionPct === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                  style={{ width: `${checklist.completionPct}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-600">{checklist.completed}/{checklist.total} ({checklist.completionPct}%)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(checklist.byPhase as Record<string, { total: number; completed: number }>).map(([phase, data]) => (
                <div key={phase} className="text-center p-2 rounded-lg bg-gray-50">
                  <p className="text-lg font-bold text-gray-900">{data.completed}/{data.total}</p>
                  <p className="text-xs text-gray-500">{phase.replace(/_/g, ' ')}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Certificate breakdown */}
      {Object.keys(certificates.breakdown).length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Award size={18} /> Certificate Status
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(certificates.breakdown as Record<string, number>).map(([status, count]) => (
              <div key={status} className="text-center p-3 rounded-lg bg-gray-50">
                <p className="text-lg font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-500">{status}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
