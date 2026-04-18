import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminEventsApi } from '@/lib/api';
import { BarChart3, FileText, TrendingUp, Shield, Zap } from 'lucide-react';
import { format } from 'date-fns';

type ReportTab = 'csf' | 'impact' | 'completion' | 'trends' | 'dpa';

const TABS: { key: ReportTab; label: string; icon: React.ElementType }[] = [
  { key: 'csf',        label: 'CSF Summary',       icon: BarChart3 },
  { key: 'impact',     label: 'Impact Survey',     icon: Zap },
  { key: 'completion', label: 'Event Completion',   icon: FileText },
  { key: 'trends',     label: 'Registration Trends', icon: TrendingUp },
  { key: 'dpa',        label: 'DPA Compliance',    icon: Shield },
];

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>('csf');

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-0.5">System-wide analytics and reports</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={14} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'csf' && <CsfReport />}
      {activeTab === 'impact' && <ImpactReport />}
      {activeTab === 'completion' && <CompletionReport />}
      {activeTab === 'trends' && <TrendsReport />}
      {activeTab === 'dpa' && <DpaReport />}
    </div>
  );
}

// ── CSF Report ──────────────────────────────────────────────────────────────

function CsfReport() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-report-csf'],
    queryFn: () => adminEventsApi.getCsfReport(),
  });

  const report = (data as any)?.data;

  if (isLoading) return <div className="bg-white rounded-xl shadow-card p-8 text-center text-gray-400">Loading…</div>;

  if (!report || report.count === 0) {
    return <div className="bg-white rounded-xl shadow-card p-8 text-center text-gray-400">No CSF survey responses yet.</div>;
  }

  return (
    <div className="space-y-4">
      {/* Overall averages */}
      <div className="bg-white rounded-xl shadow-card p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">System-wide CSF Averages ({report.count} responses)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Overall', value: report.averages?.overall },
            { label: 'Content', value: report.averages?.content },
            { label: 'Facilitator', value: report.averages?.facilitator },
            { label: 'Logistics', value: report.averages?.logistics },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-bold text-dti-blue">{value ?? '—'}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-dti-blue rounded-full"
                  style={{ width: `${((value ?? 0) / 5) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Per-event breakdown */}
      {report.byEvent?.length > 0 && (
        <div className="bg-white rounded-xl shadow-card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">By Event</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Event ID</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-600">Responses</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-600">Overall</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-600">Content</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-600">Facilitator</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-600">Logistics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {report.byEvent.map((ev: any) => (
                  <tr key={ev.eventId}>
                    <td className="px-3 py-2 text-gray-600 font-mono text-xs">{ev.eventId.slice(0, 12)}…</td>
                    <td className="px-3 py-2 text-right text-gray-900 font-medium">{ev.count}</td>
                    <td className="px-3 py-2 text-right">{ev.averages.overall ?? '—'}</td>
                    <td className="px-3 py-2 text-right">{ev.averages.content ?? '—'}</td>
                    <td className="px-3 py-2 text-right">{ev.averages.facilitator ?? '—'}</td>
                    <td className="px-3 py-2 text-right">{ev.averages.logistics ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Impact Report ───────────────────────────────────────────────────────────

function ImpactReport() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-report-impact'],
    queryFn: () => adminEventsApi.getImpactReport(),
  });

  const report = (data as any)?.data;

  if (isLoading) return <div className="bg-white rounded-xl shadow-card p-8 text-center text-gray-400">Loading…</div>;

  if (!report || report.count === 0) {
    return <div className="bg-white rounded-xl shadow-card p-8 text-center text-gray-400">No impact survey responses yet.</div>;
  }

  return (
    <div className="space-y-4">
      {/* Overall averages */}
      <div className="bg-white rounded-xl shadow-card p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">System-wide Impact Averages ({report.count} responses)</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Knowledge Application', value: report.averages?.knowledgeApplication },
            { label: 'Skill Improvement',     value: report.averages?.skillImprovement },
            { label: 'Business Impact',       value: report.averages?.businessImpact },
            { label: 'Revenue Change',        value: report.averages?.revenueChange },
            { label: 'Employee Growth',       value: report.averages?.employeeGrowth },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-bold text-dti-blue">{value ?? '—'}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-dti-blue rounded-full" style={{ width: `${((value ?? 0) / 5) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quantitative summary */}
      {report.quantitative && (
        <div className="bg-white rounded-xl shadow-card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Quantitative Impact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">
                {report.quantitative.avgRevenueChangePct != null ? `${report.quantitative.avgRevenueChangePct}%` : '—'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Avg Revenue Change %</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">
                {report.quantitative.avgEmployeeGrowth != null ? `+${report.quantitative.avgEmployeeGrowth}` : '—'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Avg Employee Growth</p>
            </div>
          </div>
        </div>
      )}

      {/* Success stories */}
      {report.successStories?.length > 0 && (
        <div className="bg-white rounded-xl shadow-card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Success Stories ({report.successStories.length})</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {report.successStories.map((s: any, i: number) => (
              <div key={i} className="p-3 bg-green-50 border border-green-100 rounded-lg">
                <p className="text-sm text-gray-800">{s.story}</p>
                <p className="text-[10px] text-gray-400 mt-1">
                  {s.submittedAt && format(new Date(s.submittedAt), 'MMM d, yyyy')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Per-event breakdown */}
      {report.byEvent?.length > 0 && (
        <div className="bg-white rounded-xl shadow-card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">By Event</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Event ID</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-600">Responses</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-600">Knowledge</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-600">Skills</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-600">Business</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-600">Revenue</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-600">Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {report.byEvent.map((ev: any) => (
                  <tr key={ev.eventId}>
                    <td className="px-3 py-2 text-gray-600 font-mono text-xs">{ev.eventId.slice(0, 12)}…</td>
                    <td className="px-3 py-2 text-right text-gray-900 font-medium">{ev.count}</td>
                    <td className="px-3 py-2 text-right">{ev.averages.knowledgeApplication ?? '—'}</td>
                    <td className="px-3 py-2 text-right">{ev.averages.skillImprovement ?? '—'}</td>
                    <td className="px-3 py-2 text-right">{ev.averages.businessImpact ?? '—'}</td>
                    <td className="px-3 py-2 text-right">{ev.averages.revenueChange ?? '—'}</td>
                    <td className="px-3 py-2 text-right">{ev.averages.employeeGrowth ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Completion Report ───────────────────────────────────────────────────────

function CompletionReport() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-report-completion'],
    queryFn: () => adminEventsApi.getCompletionReport(),
  });

  const events = Array.isArray((data as any)?.data) ? (data as any).data : [];

  if (isLoading) return <div className="bg-white rounded-xl shadow-card p-8 text-center text-gray-400">Loading…</div>;

  if (events.length === 0) {
    return <div className="bg-white rounded-xl shadow-card p-8 text-center text-gray-400">No completed events yet.</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden">
      <div className="p-5 border-b">
        <h3 className="text-sm font-semibold text-gray-900">Completed Events Report ({events.length} events)</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left px-4 py-2 font-medium text-gray-600">Event</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Date</th>
              <th className="text-right px-4 py-2 font-medium text-gray-600">Registered</th>
              <th className="text-right px-4 py-2 font-medium text-gray-600">Attended</th>
              <th className="text-right px-4 py-2 font-medium text-gray-600">Att. Rate</th>
              <th className="text-right px-4 py-2 font-medium text-gray-600">Certified</th>
              <th className="text-right px-4 py-2 font-medium text-gray-600">CSF Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {events.map((ev: any) => (
              <tr key={ev.id}>
                <td className="px-4 py-2">
                  <div className="font-medium text-gray-900 max-w-xs truncate">{ev.title}</div>
                  {ev.targetSector && <div className="text-[10px] text-gray-400">{ev.targetSector}</div>}
                </td>
                <td className="px-4 py-2 text-xs text-gray-500 whitespace-nowrap">
                  {format(new Date(ev.endDate), 'MMM d, yyyy')}
                </td>
                <td className="px-4 py-2 text-right font-medium">{ev._count.participations}</td>
                <td className="px-4 py-2 text-right">{ev.attended}</td>
                <td className="px-4 py-2 text-right">
                  <span className={ev.attendanceRate >= 70 ? 'text-green-600' : 'text-amber-600'}>
                    {ev.attendanceRate}%
                  </span>
                </td>
                <td className="px-4 py-2 text-right">{ev.certified}</td>
                <td className="px-4 py-2 text-right">
                  <span className={ev.csfResponseRate >= 50 ? 'text-green-600' : 'text-amber-600'}>
                    {ev.csfResponseRate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Trends Report ───────────────────────────────────────────────────────────

function TrendsReport() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-report-trends'],
    queryFn: () => adminEventsApi.getTrends(12),
  });

  const trends = Array.isArray((data as any)?.data) ? (data as any).data : [];
  const maxVal = Math.max(...trends.map((t: any) => t.registrations), 1);

  if (isLoading) return <div className="bg-white rounded-xl shadow-card p-8 text-center text-gray-400">Loading…</div>;

  if (trends.length === 0) {
    return <div className="bg-white rounded-xl shadow-card p-8 text-center text-gray-400">No registration data yet.</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-card p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Monthly Registration Trends (Last 12 Months)</h3>
      <div className="flex items-end gap-2 h-48">
        {trends.map((t: any) => (
          <div key={t.month} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] font-medium text-gray-700">{t.registrations}</span>
            <div
              className="w-full bg-dti-blue rounded-t-sm transition-all"
              style={{ height: `${(t.registrations / maxVal) * 100}%`, minHeight: '4px' }}
            />
            <span className="text-[10px] text-gray-400 -rotate-45 origin-top-left whitespace-nowrap">
              {t.month}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── DPA Compliance Report ───────────────────────────────────────────────────

function DpaReport() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-report-dpa'],
    queryFn: () => adminEventsApi.getDpaReport(),
  });

  const report = (data as any)?.data;

  if (isLoading) return <div className="bg-white rounded-xl shadow-card p-8 text-center text-gray-400">Loading…</div>;

  return (
    <div className="bg-white rounded-xl shadow-card p-5 space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">DPA Compliance Report</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Registrations</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{report?.totalRegistrations ?? 0}</p>
          <p className="text-xs text-gray-400 mt-1">All event registrations with implied DPA consent</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Recent (90 Days)</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{report?.recentRegistrations ?? 0}</p>
          <p className="text-xs text-gray-400 mt-1">Registrations in the last 90 days</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
        <strong>Note:</strong> {report?.note ?? 'DPA consent is captured at user registration in the identity service.'}
      </div>
    </div>
  );
}
