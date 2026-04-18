import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { eventsApi } from '@/lib/api';
import { format } from 'date-fns';
import { Calendar, Award, ClipboardList } from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuthStore();

  const { data } = useQuery({
    queryKey: ['my-participations', 'recent'],
    queryFn: () => eventsApi.getMyParticipations({ limit: 5 }),
  });

  const participations = (data?.data as unknown as Array<{
    id: string;
    status: string;
    event: { id: string; title: string; startDate: string; venue?: string };
    certificate?: { status: string } | null;
  }>) ?? [];

  const stats = {
    total:          participations.length,
    completed:      participations.filter((p) => p.status === 'COMPLETED').length,
    certificates:   participations.filter((p) => p.certificate?.status === 'ISSUED').length,
  };

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Good day, {user?.firstName}! 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here's your activity summary.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: <Calendar className="w-5 h-5 text-dti-blue" />, label: 'Events Registered', value: data?.meta?.total ?? 0 },
          { icon: <ClipboardList className="w-5 h-5 text-green-600" />, label: 'Completed', value: stats.completed },
          { icon: <Award className="w-5 h-5 text-dti-orange" />, label: 'Certificates', value: stats.certificates },
        ].map((s) => (
          <div key={s.label} className="card text-center p-4">
            <div className="flex justify-center mb-2">{s.icon}</div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recent Events</h2>
          <Link to="/my-events" className="text-sm text-dti-blue hover:underline">View all</Link>
        </div>

        {participations.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            <p>You haven't registered for any events yet.</p>
            <Link to="/events" className="btn-primary mt-4 inline-flex">Browse Events</Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {participations.map((p) => (
              <li key={p.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{p.event.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {format(new Date(p.event.startDate), 'MMM d, yyyy')}
                    {p.event.venue && ` · ${p.event.venue}`}
                  </p>
                </div>
                <span className={`badge shrink-0 ${
                  p.status === 'COMPLETED'      ? 'badge-green' :
                  p.status === 'RSVP_CONFIRMED' ? 'badge-blue'  :
                  p.status === 'WAITLISTED'     ? 'badge-yellow' :
                  'badge-gray'
                }`}>
                  {p.status.replace('_', ' ')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
