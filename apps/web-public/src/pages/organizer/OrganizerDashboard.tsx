import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { organizerApi } from '@/lib/api';
import { CalendarDays, Users, CheckCircle, Clock, PlusCircle, TrendingUp } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';

const STATUS_COLORS: Record<string, string> = {
  DRAFT:               'bg-gray-100 text-gray-600',
  PUBLISHED:           'bg-blue-100 text-blue-700',
  REGISTRATION_OPEN:   'bg-green-100 text-green-700',
  REGISTRATION_CLOSED: 'bg-yellow-100 text-yellow-700',
  ONGOING:             'bg-purple-100 text-purple-700',
  COMPLETED:           'bg-teal-100 text-teal-700',
  CANCELLED:           'bg-red-100 text-red-600',
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

export function OrganizerDashboardPage() {
  const { user } = useAuthStore();
  const canCreateProposal = ['PROGRAM_MANAGER', 'SYSTEM_ADMIN', 'SUPER_ADMIN'].includes(user?.role ?? '');
  const { data, isLoading } = useQuery({
    queryKey: ['organizer-events-all'],
    queryFn: () => organizerApi.listMyEvents({ limit: 50 }),
  });

  const events: Event[] = Array.isArray((data as any)?.data) ? (data as any).data : [];

  const stats = {
    total:    events.length,
    draft:    events.filter((e) => e.status === 'DRAFT').length,
    open:     events.filter((e) => e.status === 'REGISTRATION_OPEN').length,
    ongoing:  events.filter((e) => e.status === 'ONGOING').length,
    completed:events.filter((e) => e.status === 'COMPLETED').length,
  };

  const upcoming = events
    .filter((e) => ['PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'ONGOING'].includes(e.status))
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and monitor your events</p>
        </div>
        {canCreateProposal && (
          <Link to="/organizer/proposals/new" className="btn-primary flex items-center gap-2">
            <PlusCircle size={16} /> New Proposal
          </Link>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Events',   value: stats.total,     icon: CalendarDays, color: 'text-dti-blue'   },
          { label: 'Drafts',         value: stats.draft,     icon: Clock,        color: 'text-gray-500'   },
          { label: 'Open for Reg.',  value: stats.open,      icon: Users,        color: 'text-green-600'  },
          { label: 'Completed',      value: stats.completed, icon: CheckCircle,  color: 'text-teal-600'   },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={`${color}`}><Icon size={28} /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{isLoading ? '—' : value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming events */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp size={18} /> Upcoming Events
          </h2>
          <Link to="/organizer/events" className="text-sm text-dti-blue hover:underline">View all</Link>
        </div>

        {isLoading ? (
          <p className="text-sm text-gray-400 py-4 text-center">Loading…</p>
        ) : upcoming.length === 0 ? (
          <div className="text-center py-8">
            <CalendarDays size={40} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No upcoming events.</p>
            {canCreateProposal && (
              <Link to="/organizer/proposals/new" className="text-sm text-dti-blue hover:underline mt-1 inline-block">
                Create your first proposal →
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y">
            {upcoming.map((event) => (
              <Link
                key={event.id}
                to={`/organizer/events/${event.id}`}
                className="flex items-center justify-between py-3 hover:bg-gray-50 px-2 -mx-2 rounded transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{event.title}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(event.startDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {event.venue ? ` · ${event.venue}` : ''}
                  </p>
                </div>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[event.status] ?? ''}`}>
                  {event.status.replace(/_/g, ' ')}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
