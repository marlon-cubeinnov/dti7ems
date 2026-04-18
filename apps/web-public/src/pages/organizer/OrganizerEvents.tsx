import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizerApi, ApiError, type EventStatus } from '@/lib/api';
import { PlusCircle, Pencil, Users, ChevronRight, Eye } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  DRAFT:               'bg-gray-100 text-gray-600',
  PUBLISHED:           'bg-blue-100 text-blue-700',
  REGISTRATION_OPEN:   'bg-green-100 text-green-700',
  REGISTRATION_CLOSED: 'bg-yellow-100 text-yellow-700',
  ONGOING:             'bg-purple-100 text-purple-700',
  COMPLETED:           'bg-teal-100 text-teal-700',
  CANCELLED:           'bg-red-100 text-red-600',
};

const TRANSITIONS: Record<string, EventStatus[]> = {
  DRAFT:               ['PUBLISHED', 'CANCELLED'],
  PUBLISHED:           ['REGISTRATION_OPEN', 'CANCELLED'],
  REGISTRATION_OPEN:   ['REGISTRATION_CLOSED', 'ONGOING', 'CANCELLED'],
  REGISTRATION_CLOSED: ['ONGOING', 'CANCELLED'],
  ONGOING:             ['COMPLETED', 'CANCELLED'],
  COMPLETED:           [],
  CANCELLED:           [],
};

const STATUS_ACTION_LABELS: Record<string, string> = {
  PUBLISHED:           'Publish',
  CANCELLED:           'Cancel',
  REGISTRATION_OPEN:   'Open Registration',
  REGISTRATION_CLOSED: 'Close Registration',
  ONGOING:             'Mark Ongoing',
  COMPLETED:           'Mark Complete',
  DRAFT:               'Revert to Draft',
};

interface Event {
  id: string;
  title: string;
  status: string;
  startDate: string;
  endDate: string;
  deliveryMode: string;
  venue: string | null;
  maxParticipants: number | null;
}

export function OrganizerEventsPage() {
  const qc = useQueryClient();
  const [statusError, setStatusError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['organizer-events'],
    queryFn: () => organizerApi.listMyEvents({ limit: 50 }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: EventStatus }) =>
      organizerApi.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['organizer-events'] });
      qc.invalidateQueries({ queryKey: ['organizer-events-all'] });
      setStatusError(null);
    },
    onError: (err) => {
      setStatusError(err instanceof ApiError ? err.message : 'Failed to update status.');
    },
  });

  const events: Event[] = Array.isArray((data as any)?.data) ? (data as any).data : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Events</h1>
        <Link to="/organizer/events/new" className="btn-primary flex items-center gap-2">
          <PlusCircle size={16} /> Create Event
        </Link>
      </div>

      {statusError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-input px-4 py-3">
          {statusError}
        </div>
      )}

      {isLoading ? (
        <div className="card text-center py-12 text-gray-400 text-sm">Loading events…</div>
      ) : events.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-3">No events yet.</p>
          <Link to="/organizer/events/new" className="btn-primary inline-flex items-center gap-2">
            <PlusCircle size={16} /> Create your first event
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b text-left">
                <th className="px-4 py-3 font-semibold text-gray-600">Title</th>
                <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Date</th>
                <th className="px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Mode</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {events.map((event) => {
                const transitions = TRANSITIONS[event.status] ?? [];
                return (
                  <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/organizer/events/${event.id}`} className="font-medium text-dti-blue hover:underline">
                        {event.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-500">
                      {new Date(event.startDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-500">
                      {event.deliveryMode.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[event.status] ?? ''}`}>
                        {event.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Link
                          to={`/organizer/events/${event.id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                          title="View Details"
                        >
                          <Eye size={13} /> View
                        </Link>
                        <Link
                          to={`/organizer/events/${event.id}/edit`}
                          className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                          title="Edit Event"
                        >
                          <Pencil size={13} /> Edit
                        </Link>
                        <Link
                          to={`/organizer/events/${event.id}/participants`}
                          className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                          title="Manage Participants"
                        >
                          <Users size={13} /> Participants
                        </Link>
                        {transitions.length > 0 && (
                          <select
                            className="text-xs font-medium border border-gray-300 rounded-lg px-2 py-1.5 text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors shadow-sm"
                            value=""
                            disabled={statusMutation.isPending}
                            onChange={(e) => {
                              if (e.target.value) {
                                statusMutation.mutate({ id: event.id, status: e.target.value as EventStatus });
                                e.target.value = '';
                              }
                            }}
                          >
                            <option value="">Move to…</option>
                            {transitions.map((s) => (
                              <option key={s} value={s}>{STATUS_ACTION_LABELS[s] ?? s.replace(/_/g, ' ')}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
