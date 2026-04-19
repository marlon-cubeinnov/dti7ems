import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { organizerApi, eventsApi, certificatesApi } from '@/lib/api';
import { ArrowLeft, Download, ExternalLink, Eye, FileDown } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';

const STATUS_COLORS: Record<string, string> = {
  REGISTERED:    'bg-blue-50 text-blue-700',
  WAITLISTED:    'bg-yellow-50 text-yellow-700',
  RSVP_PENDING:  'bg-orange-50 text-orange-700',
  RSVP_CONFIRMED:'bg-green-50 text-green-700',
  ATTENDED:      'bg-teal-50 text-teal-700',
  NO_SHOW:       'bg-red-50 text-red-600',
  CANCELLED:     'bg-gray-50 text-gray-500',
};

const STATUSES = ['', 'REGISTERED', 'WAITLISTED', 'RSVP_PENDING', 'RSVP_CONFIRMED', 'ATTENDED', 'NO_SHOW', 'CANCELLED'];

const CSF_STATUS_COLORS: Record<string, string> = {
  SUBMITTED: 'bg-green-50 text-green-700',
  PENDING:   'bg-amber-50 text-amber-700',
  EXPIRED:   'bg-gray-100 text-gray-500',
};

export function OrganizerParticipantListPage() {
  const { id } = useParams<{ id: string }>();
  const { accessToken } = useAuthStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 50;

  const { data: eventData } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.get(id!),
    enabled: Boolean(id),
  });

  const { data: participantsData, isLoading } = useQuery({
    queryKey: ['event-participants', id, statusFilter, page],
    queryFn: () => organizerApi.getParticipants(id!, { page, limit, ...(statusFilter ? { status: statusFilter } : {}) }),
    enabled: Boolean(id),
    placeholderData: (prev) => prev,
  });

  const event = eventData?.data as any;
  const rawList: any[] = (participantsData?.data as any) ?? [];
  const meta: any = (participantsData as any)?.meta ?? {};
  const total: number = meta.total ?? rawList.length;
  const totalPages: number = meta.totalPages ?? 1;

  // Client-side name/email filter (server doesn't support full-text yet)
  const participants = search.trim()
    ? rawList.filter((p: any) => {
        const q = search.toLowerCase();
        return (
          (p.participantName ?? '').toLowerCase().includes(q) ||
          (p.participantEmail ?? '').toLowerCase().includes(q)
        );
      })
    : rawList;

  async function handleExport() {
    const url = organizerApi.exportParticipants(id!);
    const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken ?? ''}` } });
    if (!res.ok) return;
    const blob = await res.blob();
    const objUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objUrl;
    const disp = res.headers.get('content-disposition') ?? '';
    const match = disp.match(/filename="([^"]+)"/);
    a.download = match?.[1] ?? 'participants.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objUrl);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to={`/organizer/events/${id}`} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Participants</h1>
          {event && <p className="text-sm text-gray-500 mt-0.5">{event.title}</p>}
        </div>
      </div>

      {/* Filters + Export */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="search"
          placeholder="Search name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-48"
        />
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {STATUSES.map(s => (
            <option key={s} value={s}>{s || 'All Statuses'}</option>
          ))}
        </select>
        <button
          onClick={handleExport}
          className="btn-secondary flex items-center gap-1.5 text-sm shrink-0"
        >
          <Download size={14} /> Export CSV
        </button>
        <Link
          to={`/organizer/events/${id}/attendance-sheet`}
          className="btn-secondary flex items-center gap-1.5 text-sm shrink-0"
        >
          <ExternalLink size={14} /> Print Attendance Sheet
        </Link>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">
            {search ? `${participants.length} match${participants.length !== 1 ? 'es' : ''}` : `${total} participant${total !== 1 ? 's' : ''}`}
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-2 py-0.5 border rounded disabled:opacity-40">‹</button>
              <span>{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-2 py-0.5 border rounded disabled:opacity-40">›</button>
            </div>
          )}
        </div>

        {isLoading ? (
          <p className="text-center text-gray-400 text-sm py-10">Loading…</p>
        ) : participants.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10">No participants found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="text-left border-b bg-gray-50">
                  <th className="px-4 py-3 font-semibold text-gray-600">Name</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Email</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-right">TNA Score</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-right">Sessions</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">CSF Survey</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Certificate</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {participants.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {p.participantName ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.participantEmail ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {p.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {p.tnaResponse?.compositeScore != null
                        ? `${Number(p.tnaResponse.compositeScore).toFixed(2)}%`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {p._count?.attendanceRecords ?? 0}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {p.csfSurveyResponse?.status ? (
                        p.csfSurveyResponse.status === 'SUBMITTED' ? (
                          <Link
                            to={`/organizer/events/${id}/csf-results`}
                            className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700 hover:bg-green-100 transition-colors`}
                          >
                            SUBMITTED <Eye size={10} />
                          </Link>
                        ) : (
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${CSF_STATUS_COLORS[p.csfSurveyResponse.status] ?? 'bg-gray-100 text-gray-600'}`}>
                            {p.csfSurveyResponse.status}
                          </span>
                        )
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {p.certificate?.status ? (
                        p.certificate.status === 'ISSUED' ? (
                          <button
                            onClick={() => certificatesApi.downloadCertificatePdf(p.id)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors cursor-pointer"
                          >
                            ISSUED <FileDown size={10} />
                          </button>
                        ) : (
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600`}>
                            {p.certificate.status}
                          </span>
                        )
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(p.registeredAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
