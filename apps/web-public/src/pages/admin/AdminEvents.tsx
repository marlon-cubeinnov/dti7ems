import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminEventsApi } from '@/lib/api';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_BADGE: Record<string, string> = {
  DRAFT:               'bg-gray-100 text-gray-600',
  PUBLISHED:           'bg-blue-100 text-blue-700',
  REGISTRATION_OPEN:   'bg-green-100 text-green-700',
  REGISTRATION_CLOSED: 'bg-yellow-100 text-yellow-700',
  ONGOING:             'bg-purple-100 text-purple-700',
  COMPLETED:           'bg-teal-100 text-teal-700',
  CANCELLED:           'bg-red-100 text-red-600',
};

const MODE_LABEL: Record<string, string> = {
  FACE_TO_FACE: 'F2F',
  ONLINE: 'Online',
  HYBRID: 'Hybrid',
};

interface Event {
  id: string;
  title: string;
  status: string;
  deliveryMode: string;
  venue: string | null;
  startDate: string;
  endDate: string;
  maxParticipants: number | null;
  targetSector: string | null;
  createdAt: string;
  _count: { participations: number; sessions: number };
}

export function AdminEventsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-events', page, search, statusFilter],
    queryFn: () =>
      adminEventsApi.listEvents({
        page, limit: 20,
        ...(search ? { search } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      }),
  });

  const events: Event[] = Array.isArray((data as any)?.data) ? (data as any).data : [];
  const meta = (data as any)?.meta;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Events Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">{meta?.total ?? 0} total events</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search events…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dti-blue"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">All statuses</option>
          {Object.keys(STATUS_BADGE).map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Event</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Mode</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Participants</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Sessions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 5 }, (_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
                ))
              ) : events.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No events found.</td></tr>
              ) : (
                events.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{e.title}</div>
                      {e.venue && <div className="text-xs text-gray-400">{e.venue}</div>}
                      {e.targetSector && <div className="text-[10px] text-gray-400">{e.targetSector}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[e.status] ?? ''}`}>
                        {e.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{MODE_LABEL[e.deliveryMode] ?? e.deliveryMode}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{format(new Date(e.startDate), 'MMM d, yyyy')}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {e._count.participations}
                      {e.maxParticipants && <span className="text-gray-400 font-normal">/{e.maxParticipants}</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">{e._count.sessions}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <span className="text-xs text-gray-500">Page {meta.page} of {meta.totalPages}</span>
            <div className="flex gap-1">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-30"><ChevronLeft size={16} /></button>
              <button disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)} className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-30"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
