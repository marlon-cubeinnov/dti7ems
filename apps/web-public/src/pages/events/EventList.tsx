import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '@/lib/api';
import { EventCard } from '@/components/events/EventCard';
import type { Event } from '@dti-ems/shared-types';
import { Search, ChevronDown, Check } from 'lucide-react';

const SECTORS = ['All', 'Manufacturing', 'Food Processing', 'Tourism', 'ICT', 'Agriculture', 'Retail', 'Services'];
const MODES   = ['All', 'FACE_TO_FACE', 'ONLINE', 'HYBRID'];

const STATUS_OPTIONS = [
  { value: 'REGISTRATION_OPEN', label: 'Open for Registration' },
  { value: 'ONGOING',           label: 'On-going' },
  { value: 'COMPLETED',         label: 'Completed' },
];

export function EventListPage() {
  const [search,   setSearch]   = useState('');
  const [sector,   setSector]   = useState('');
  const [mode,     setMode]     = useState('');
  const [statuses, setStatuses] = useState<string[]>(['REGISTRATION_OPEN', 'ONGOING']);
  const [page,     setPage]     = useState(1);
  const [statusOpen, setStatusOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setStatusOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function toggleStatus(value: string) {
    setStatuses((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
    setPage(1);
  }

  const { data, isLoading } = useQuery({
    queryKey: ['events', { search, sector, mode, statuses, page }],
    queryFn: () => eventsApi.list({
      search:       search || undefined,
      sector:       sector || undefined,
      deliveryMode: mode   || undefined,
      status:       statuses.length > 0 && statuses.length < STATUS_OPTIONS.length ? statuses.join(',') : undefined,
      page,
      limit: 12,
    }),
    placeholderData: (prev) => prev,
    staleTime: 0, // always refetch so participant counts stay accurate
  });

  const events = (data?.data as unknown as (Event & { _count: { participations: number } })[]) ?? [];
  const meta   = data?.meta;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Events</h1>
      <p className="text-gray-500 mb-8">Training programs, seminars, and capability-building events across Region 7.</p>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Search events..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="input sm:w-48"
          value={sector}
          onChange={(e) => { setSector(e.target.value === 'All' ? '' : e.target.value); setPage(1); }}
        >
          {SECTORS.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select
          className="input sm:w-44"
          value={mode}
          onChange={(e) => { setMode(e.target.value === 'All' ? '' : e.target.value); setPage(1); }}
        >
          {MODES.map((m) => <option key={m}>{m}</option>)}
        </select>

        {/* Status multi-select */}
        <div className="relative sm:w-52" ref={statusRef}>
          <button
            type="button"
            className="input w-full flex items-center justify-between text-left"
            onClick={() => setStatusOpen((o) => !o)}
          >
            <span className="truncate text-sm text-gray-700">
              {statuses.length === 0
                ? 'All Statuses'
                : statuses.length === STATUS_OPTIONS.length
                ? 'All Statuses'
                : STATUS_OPTIONS.filter((o) => statuses.includes(o.value)).map((o) => o.label).join(', ')}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
          </button>
          {statusOpen && (
            <div className="absolute z-20 top-full mt-1 left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-1">
              {STATUS_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50"
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${statuses.includes(opt.value) ? 'bg-[#172187] border-[#172187]' : 'border-gray-300'}`}>
                    {statuses.includes(opt.value) && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={statuses.includes(opt.value)}
                    onChange={() => toggleStatus(opt.value)}
                  />
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Event grid ───────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-full mb-1" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg font-medium mb-2">No events found</p>
          <p className="text-sm">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} participantCount={event._count?.participations ?? 0} />
          ))}
        </div>
      )}

      {/* ── Pagination ───────────────────────────────────────────────────── */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            className="btn-outline px-3 py-1.5 text-xs disabled:opacity-40"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {meta.totalPages}
          </span>
          <button
            className="btn-outline px-3 py-1.5 text-xs disabled:opacity-40"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
