import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Save,
  Send,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
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

// ── Provider presets ──────────────────────────────────────────────────────────

const PRESETS = {
  mailpit: {
    label: 'Local — Mailpit (development)',
    host: 'localhost', port: 1025, secure: false,
    user: '', pass: '',
    from: 'DTI Region 7 EMS <noreply@dti7-ems.local>',
  },
  gmail: {
    label: 'Gmail / Google Workspace (App Password)',
    host: 'smtp.gmail.com', port: 587, secure: false,
    user: '', pass: '',
    from: '',
  },
  gmail_ssl: {
    label: 'Gmail / Google Workspace (SSL port 465)',
    host: 'smtp.gmail.com', port: 465, secure: true,
    user: '', pass: '',
    from: '',
  },
  custom: {
    label: 'Custom SMTP',
    host: '', port: 587, secure: false,
    user: '', pass: '',
    from: '',
  },
} as const;

type PresetKey = keyof typeof PRESETS;

interface EmailForm {
  host: string; port: string; secure: boolean;
  user: string; pass: string; from: string;
}

function EmailSettingsSection() {
  const queryClient = useQueryClient();
  const [preset, setPreset] = useState<PresetKey>('mailpit');
  const [form, setForm] = useState<EmailForm>({
    host: 'localhost', port: '1025', secure: false,
    user: '', pass: '', from: 'DTI Region 7 EMS <noreply@dti7-ems.local>',
  });
  const [showPass, setShowPass] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [toast, setToast] = useState<{ type: 'ok' | 'error'; msg: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-email-settings'],
    queryFn: () => adminIdentityApi.getEmailSettings(),
  });

  // Populate form once we have server data
  useEffect(() => {
    const d = (data as any)?.data;
    if (!d) return;
    setForm({
      host:   d.host   ?? '',
      port:   String(d.port ?? 587),
      secure: d.secure ?? false,
      user:   d.user   ?? '',
      pass:   d.pass   ?? '',
      from:   d.from   ?? '',
    });
    // Detect preset from loaded host
    if (d.host === 'localhost' || d.host === '127.0.0.1') setPreset('mailpit');
    else if (d.host === 'smtp.gmail.com' && !d.secure)    setPreset('gmail');
    else if (d.host === 'smtp.gmail.com' && d.secure)     setPreset('gmail_ssl');
    else setPreset('custom');
  }, [data]);

  const showToast = (type: 'ok' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 5000);
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      adminIdentityApi.updateEmailSettings({
        host:   form.host,
        port:   Number(form.port),
        secure: form.secure,
        user:   form.user,
        pass:   form.pass,
        from:   form.from,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-email-settings'] });
      showToast('ok', 'Email settings saved and mailer reconnected.');
    },
    onError: (err: any) => {
      const msg = err?.data?.error?.message ?? err?.message ?? 'Failed to save settings.';
      showToast('error', msg);
    },
  });

  const testMutation = useMutation({
    mutationFn: () => adminIdentityApi.sendTestEmail(testEmail),
    onSuccess: (res: any) => showToast('ok', res?.message ?? `Test email sent to ${testEmail}.`),
    onError: (err: any) => {
      const msg = err?.data?.error?.message ?? err?.message ?? 'Test email failed.';
      showToast('error', msg);
    },
  });

  function applyPreset(key: PresetKey) {
    setPreset(key);
    const p = PRESETS[key];
    setForm((prev) => ({
      ...prev,
      host:   p.host   || prev.host,
      port:   String(p.port),
      secure: p.secure,
      // Don't clear user/pass/from when switching — only clear if preset fills them
      user:   p.user  !== '' ? p.user  : prev.user,
      pass:   p.pass  !== '' ? p.pass  : prev.pass,
      from:   p.from  !== '' ? p.from  : prev.from,
    }));
  }

  function field(k: keyof EmailForm, value: string | boolean) {
    setForm((prev) => ({ ...prev, [k]: value }));
  }

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className={`flex items-start gap-2 rounded-lg px-4 py-3 text-sm ${toast.type === 'ok' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {toast.type === 'ok'
            ? <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-green-600" />
            : <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-600" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Provider preset selector */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">Email Provider Preset</label>
        <div className="relative">
          <select
            value={preset}
            onChange={(e) => applyPreset(e.target.value as PresetKey)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-dti-blue pr-8"
          >
            {(Object.keys(PRESETS) as PresetKey[]).map((k) => (
              <option key={k} value={k}>{PRESETS[k].label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        {preset === 'gmail' || preset === 'gmail_ssl' ? (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 space-y-1">
            <p className="font-semibold">Google Gmail / Workspace — Setup Instructions</p>
            <ol className="list-decimal pl-4 space-y-0.5">
              <li>In your Google Account, go to <strong>Security → 2-Step Verification</strong> and enable it.</li>
              <li>Then go to <strong>Security → App Passwords</strong> and create a new App Password for <em>"Mail"</em>.</li>
              <li>Enter your full Gmail address in <strong>Username</strong> below and the 16-character App Password in <strong>Password</strong>.</li>
              <li>Set <strong>From</strong> to the same Gmail address (or your Google Workspace display name).</li>
            </ol>
            <p className="text-blue-600 pt-0.5">Use port <strong>587 (STARTTLS)</strong> for most accounts. Use port <strong>465 (SSL)</strong> only if required by your org.</p>
          </div>
        ) : null}
      </div>

      {/* Form fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">SMTP Host *</label>
          <input
            value={form.host}
            onChange={(e) => field('host', e.target.value)}
            placeholder="smtp.gmail.com"
            disabled={isLoading}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-dti-blue disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Port *</label>
          <input
            type="number"
            value={form.port}
            onChange={(e) => field('port', e.target.value)}
            placeholder="587"
            disabled={isLoading}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-dti-blue disabled:bg-gray-50"
          />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.secure}
              onChange={(e) => field('secure', e.target.checked)}
              className="w-4 h-4 accent-dti-blue"
            />
            SSL (port 465) — uncheck for STARTTLS
          </label>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Username / Email Login</label>
          <input
            value={form.user}
            onChange={(e) => field('user', e.target.value)}
            placeholder="you@gmail.com"
            disabled={isLoading}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dti-blue disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">App Password</label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              value={form.pass}
              onChange={(e) => field('pass', e.target.value)}
              placeholder="16-character App Password"
              disabled={isLoading}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-9 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-dti-blue disabled:bg-gray-50"
            />
            <button
              type="button"
              onClick={() => setShowPass((p) => !p)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            >
              {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <p className="mt-1 text-[11px] text-gray-400">Leave blank to keep the existing password unchanged.</p>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">From Address *</label>
          <input
            value={form.from}
            onChange={(e) => field('from', e.target.value)}
            placeholder='DTI Region 7 EMS <noreply@yourdomain.com>'
            disabled={isLoading}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dti-blue disabled:bg-gray-50"
          />
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending || !form.host || !form.from}
          className="flex items-center gap-2 px-4 py-2 bg-dti-blue text-white rounded-lg text-sm font-medium hover:bg-dti-blue-dark disabled:opacity-50"
        >
          <Save size={14} />
          {saveMutation.isPending ? 'Saving…' : 'Save & Reconnect'}
        </button>
      </div>

      {/* Test email */}
      <div className="border-t pt-5">
        <p className="text-xs font-medium text-gray-600 mb-2">Send a Test Email</p>
        <div className="flex gap-2">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="recipient@example.com"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dti-blue"
          />
          <button
            onClick={() => testMutation.mutate()}
            disabled={testMutation.isPending || !testEmail}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 disabled:opacity-50"
          >
            <Send size={13} />
            {testMutation.isPending ? 'Sending…' : 'Send Test'}
          </button>
        </div>
        <p className="mt-1.5 text-[11px] text-gray-400">Uses the currently <strong>active</strong> configuration. Save settings first if you made changes.</p>
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

      {/* Email Settings — full-width */}
      <SettingsSection title="Email / Notification Settings" icon={Mail}>
        <EmailSettingsSection />
      </SettingsSection>
    </div>
  );
}
