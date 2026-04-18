import { useQuery } from '@tanstack/react-query';
import { adminEventsApi, adminIdentityApi } from '@/lib/api';
import {
  Settings,
  Server,
  Database,
  Mail,
  MessageSquare,
  Clock,
  Shield,
  Activity,
} from 'lucide-react';

function SettingsSection({ title, icon: Icon, children }: {
  title: string; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3 bg-gray-50 border-b">
        <Icon size={16} className="text-dti-blue" />
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function SettingRow({ label, value, status }: {
  label: string; value: string; status?: 'ok' | 'warning' | 'error';
}) {
  const statusColors = {
    ok: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    error: 'bg-red-100 text-red-700',
  };

  return (
    <div className="flex items-center justify-between py-2 border-b last:border-b-0">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-900 font-mono">{value}</span>
        {status && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusColors[status]}`}>
            {status.toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
}

export function AdminSettingsPage() {
  const { data: identityStats, isLoading: loadingId } = useQuery({
    queryKey: ['admin-identity-stats'],
    queryFn: () => adminIdentityApi.getStats(),
  });

  const { data: eventStats, isLoading: loadingEv } = useQuery({
    queryKey: ['admin-event-stats'],
    queryFn: () => adminEventsApi.getStats(),
  });

  const { data: analyticsData, isLoading: loadingAnalytics } = useQuery({
    queryKey: ['admin-analytics-overview'],
    queryFn: () => adminEventsApi.getAnalyticsOverview(),
  });

  const iStats = (identityStats as any)?.data;
  const eStats = (eventStats as any)?.data;
  const analytics = (analyticsData as any)?.data;
  const isLoading = loadingId || loadingEv || loadingAnalytics;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-card p-8 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Service configuration and system health overview</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Services */}
        <SettingsSection title="Microservices" icon={Server}>
          <div className="space-y-0">
            <SettingRow label="Identity Service" value="Port 3011" status="ok" />
            <SettingRow label="Event Service" value="Port 3012" status="ok" />
            <SettingRow label="Notification Service" value="Port 3013" status="ok" />
            <SettingRow label="Frontend (web-public)" value="Port 5173" status="ok" />
          </div>
        </SettingsSection>

        {/* Database */}
        <SettingsSection title="Database" icon={Database}>
          <div className="space-y-0">
            <SettingRow label="PostgreSQL" value="Port 5433" status="ok" />
            <SettingRow label="Redis (BullMQ)" value="Port 6379" status="ok" />
            <SettingRow label="Users" value={String(iStats?.users?.total ?? '—')} />
            <SettingRow label="Enterprises" value={String(iStats?.enterprises?.total ?? '—')} />
            <SettingRow label="Events" value={String(eStats?.events?.total ?? '—')} />
          </div>
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title="Notification Providers" icon={Mail}>
          <div className="space-y-0">
            <SettingRow label="Email Provider" value="Resend API" status="ok" />
            <SettingRow label="SMS Provider" value="Semaphore PH" status="ok" />
            <SettingRow label="Email Queue" value="notification-email" />
            <SettingRow label="SMS Queue" value="notification-sms" />
          </div>
        </SettingsSection>

        {/* Authentication */}
        <SettingsSection title="Authentication" icon={Shield}>
          <div className="space-y-0">
            <SettingRow label="Algorithm" value="RS256 (JWT)" status="ok" />
            <SettingRow label="Access Token TTL" value="15 minutes" />
            <SettingRow label="Refresh Token TTL" value="7 days" />
            <SettingRow label="Cookie Auth" value="httpOnly + SameSite" status="ok" />
          </div>
        </SettingsSection>

        {/* Scheduled Jobs */}
        <SettingsSection title="Scheduled Jobs (Cron)" icon={Clock}>
          <div className="space-y-0">
            <SettingRow label="Impact Survey Dispatch" value="Daily 09:00" status="ok" />
            <SettingRow label="Survey Expiry Check" value="Daily 02:00" status="ok" />
            <SettingRow label="RSVP Reminders" value="Daily 08:00" status="ok" />
          </div>
        </SettingsSection>

        {/* System Health */}
        <SettingsSection title="System Health" icon={Activity}>
          <div className="space-y-0">
            <SettingRow label="Active Users" value={String(iStats?.users?.active ?? '—')} status="ok" />
            <SettingRow label="Pending Verification" value={String(iStats?.users?.pending ?? '—')} status={iStats?.users?.pending > 0 ? 'warning' : 'ok'} />
            <SettingRow label="Suspended Users" value={String(iStats?.users?.suspended ?? '—')} status={iStats?.users?.suspended > 0 ? 'warning' : 'ok'} />
            <SettingRow label="Unverified Enterprises" value={String(iStats?.enterprises?.unverified ?? '—')} status={iStats?.enterprises?.unverified > 0 ? 'warning' : 'ok'} />
          </div>
        </SettingsSection>

        {/* Survey Stats */}
        <SettingsSection title="Survey & Impact Metrics" icon={MessageSquare}>
          <div className="space-y-0">
            <SettingRow label="CSF Response Rate" value={`${analytics?.surveys?.csf?.rate ?? 0}%`} status={(analytics?.surveys?.csf?.rate ?? 0) >= 50 ? 'ok' : 'warning'} />
            <SettingRow label="CSF Submitted" value={String(analytics?.surveys?.csf?.submitted ?? 0)} />
            <SettingRow label="Impact Response Rate" value={`${analytics?.surveys?.impact?.rate ?? 0}%`} status={(analytics?.surveys?.impact?.rate ?? 0) >= 30 ? 'ok' : 'warning'} />
            <SettingRow label="Impact Submitted" value={String(analytics?.surveys?.impact?.submitted ?? 0)} />
            <SettingRow label="Certificates Issued" value={String(analytics?.certificates?.issued ?? 0)} />
          </div>
        </SettingsSection>

        {/* Feature Flags / Deployment */}
        <SettingsSection title="Deployment" icon={Settings}>
          <div className="space-y-0">
            <SettingRow label="Environment" value="Local Development" status="ok" />
            <SettingRow label="Cloud Provider" value="GCP (Planned)" status="warning" />
            <SettingRow label="Tunnel" value="Cloudflare" status="ok" />
            <SettingRow label="Phase" value="Phase 3 — Impact + Directory" />
          </div>
        </SettingsSection>
      </div>
    </div>
  );
}
