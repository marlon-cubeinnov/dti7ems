import { useQuery } from '@tanstack/react-query';
import { adminIdentityApi, adminEventsApi } from '@/lib/api';
import {
  Users,
  Building2,
  CalendarDays,
  Award,
  ClipboardCheck,
  TrendingUp,
  UserCheck,
  Clock,
} from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  sub?: string;
}

function StatCard({ label, value, icon: Icon, color, sub }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { data: identityStats, isLoading: loadingIdentity } = useQuery({
    queryKey: ['admin-identity-stats'],
    queryFn: () => adminIdentityApi.getStats(),
  });

  const { data: eventStats, isLoading: loadingEvents } = useQuery({
    queryKey: ['admin-event-stats'],
    queryFn: () => adminEventsApi.getStats(),
  });

  const iStats = (identityStats as any)?.data;
  const eStats = (eventStats as any)?.data;

  if (loadingIdentity || loadingEvents) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-card p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
              <div className="h-8 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">System-wide overview of DTI Region 7 EMS</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={iStats?.users?.total ?? 0}
          icon={Users}
          color="bg-blue-600"
          sub={`${iStats?.users?.active ?? 0} active`}
        />
        <StatCard
          label="Enterprises"
          value={iStats?.enterprises?.total ?? 0}
          icon={Building2}
          color="bg-emerald-600"
          sub={`${iStats?.enterprises?.verified ?? 0} verified`}
        />
        <StatCard
          label="Total Events"
          value={eStats?.events?.total ?? 0}
          icon={CalendarDays}
          color="bg-purple-600"
          sub={`${eStats?.events?.byStatus?.COMPLETED ?? 0} completed`}
        />
        <StatCard
          label="Registrations"
          value={eStats?.participations?.total ?? 0}
          icon={UserCheck}
          color="bg-orange-500"
          sub={`${eStats?.participations?.recentRegistrations ?? 0} last 30d`}
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Certificates Issued"
          value={eStats?.certificates?.issued ?? 0}
          icon={Award}
          color="bg-teal-600"
          sub={`of ${eStats?.certificates?.total ?? 0} total`}
        />
        <StatCard
          label="CSF Response Rate"
          value={`${eStats?.surveys?.csfResponseRate ?? 0}%`}
          icon={ClipboardCheck}
          color="bg-indigo-600"
          sub={`${eStats?.surveys?.submittedCsf ?? 0} submitted`}
        />
        <StatCard
          label="Attendance Records"
          value={eStats?.attendance?.totalRecords ?? 0}
          icon={TrendingUp}
          color="bg-cyan-600"
        />
        <StatCard
          label="Pending Users"
          value={iStats?.users?.pending ?? 0}
          icon={Clock}
          color="bg-amber-500"
          sub={`${iStats?.users?.suspended ?? 0} suspended`}
        />
      </div>

      {/* Role distribution + Event status breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User roles */}
        <div className="bg-white rounded-xl shadow-card p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Users by Role</h2>
          <div className="space-y-2">
            {iStats?.users?.byRole &&
              Object.entries(iStats.users.byRole as Record<string, number>)
                .sort(([, a], [, b]) => b - a)
                .map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{role.replace(/_/g, ' ')}</span>
                    <span className="font-medium text-gray-900">{count}</span>
                  </div>
                ))}
          </div>
        </div>

        {/* Event statuses */}
        <div className="bg-white rounded-xl shadow-card p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Events by Status</h2>
          <div className="space-y-2">
            {eStats?.events?.byStatus &&
              Object.entries(eStats.events.byStatus as Record<string, number>)
                .sort(([, a], [, b]) => b - a)
                .map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{status.replace(/_/g, ' ')}</span>
                    <span className="font-medium text-gray-900">{count}</span>
                  </div>
                ))}
          </div>
        </div>
      </div>

      {/* Recent signups */}
      <div className="bg-white rounded-xl shadow-card p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-2">Quick Info</h2>
        <p className="text-sm text-gray-500">
          <strong>{iStats?.users?.recentSignups ?? 0}</strong> new users registered in the last 30 days.
          There are currently <strong>{iStats?.enterprises?.unverified ?? 0}</strong> enterprises pending verification.
        </p>
      </div>
    </div>
  );
}
