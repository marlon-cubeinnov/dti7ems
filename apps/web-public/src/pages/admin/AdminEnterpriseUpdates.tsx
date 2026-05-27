import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { enterpriseApi } from '@/lib/api';
import { format } from 'date-fns';
import { Building2, CheckCircle, Clock, AlertCircle, Download, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface UpdateLog {
  id: string;
  enterpriseId: string;
  updatedBy: string;
  updatedAt: string;
  updateYear: number;
  updateType: 'FIRST_LOGIN' | 'ANNUAL' | 'VOLUNTARY';
  changedFields: Array<{ field: string; oldValue: unknown; newValue: unknown }>;
  snapshotAfter: Record<string, unknown>;
  ipAddress: string | null;
  notes: string | null;
  enterprise: {
    id: string;
    businessName: string;
    industrySector: string;
    stage: string;
    region: string | null;
    province: string | null;
    cityMunicipality: string | null;
    isVerified: boolean;
  };
}

interface UpdateSummary {
  year: number;
  totalEnterprises: number;
  updatedThisYear: number;
  pendingUpdate: number;
  firstLoginPending: number;
  updatesByType: Record<string, number>;
  complianceRate: number;
}

const UPDATE_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  FIRST_LOGIN: { label: 'First Login', color: '#7c3aed' },
  ANNUAL:      { label: 'Annual',      color: '#172187' },
  VOLUNTARY:   { label: 'Voluntary',   color: '#059669' },
};

const FIELD_LABELS: Record<string, string> = {
  businessName: 'Business Name',
  tradeName: 'Trade Name',
  registrationNo: 'Registration No.',
  tinNumber: 'TIN Number',
  businessEmail: 'Business Email',
  businessPhone: 'Business Phone',
  websiteUrl: 'Website',
  description: 'Description',
  industrySector: 'Industry Sector',
  industryTags: 'Industry Tags',
  stage: 'Business Stage',
  employeeCount: 'Employee Count',
  annualRevenue: 'Annual Revenue',
  region: 'Region',
  province: 'Province',
  cityMunicipality: 'City/Municipality',
  barangay: 'Barangay',
  streetAddress: 'Street Address',
  isPubliclyListed: 'Public Listing',
};

export function AdminEnterpriseUpdatesPage() {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<UpdateLog | null>(null);
  const LIMIT = 20;

  // Debounce search
  const handleSearch = (val: string) => {
    setSearch(val);
    clearTimeout((window as unknown as Record<string, ReturnType<typeof setTimeout>>)['_searchTimer']);
    (window as unknown as Record<string, ReturnType<typeof setTimeout>>)['_searchTimer'] = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 400);
  };

  const summaryQuery = useQuery({
    queryKey: ['enterprise-update-summary'],
    queryFn: () => enterpriseApi.adminGetUpdateSummary().then((r) => r.data as UpdateSummary),
    staleTime: 5 * 60_000,
  });

  const logsQuery = useQuery({
    queryKey: ['enterprise-update-logs', year, debouncedSearch, page],
    queryFn: () =>
      enterpriseApi
        .adminGetUpdateLogs({ year, search: debouncedSearch || undefined, page, limit: LIMIT })
        .then((r) => r as { data: UpdateLog[]; meta: { total: number; totalPages: number } }),
    staleTime: 60_000,
  });

  const summary = summaryQuery.data;
  const logs = logsQuery.data?.data ?? [];
  const meta = logsQuery.data?.meta;

  function exportCsv() {
    if (!logs.length) return;
    const headers = ['Date', 'Company Name', 'Industry', 'Stage', 'Location', 'Update Type', 'Fields Changed', 'Notes'];
    const rows = logs.map((l) => [
      format(new Date(l.updatedAt), 'yyyy-MM-dd HH:mm'),
      l.enterprise.businessName,
      l.enterprise.industrySector,
      l.enterprise.stage,
      [l.enterprise.cityMunicipality, l.enterprise.province].filter(Boolean).join(', '),
      UPDATE_TYPE_LABELS[l.updateType]?.label ?? l.updateType,
      l.changedFields.length,
      l.notes ?? '',
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enterprise-updates-${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="text-dti-blue" size={24} />
            Enterprise Profile Updates
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Track annual company information updates submitted by enterprise primary contacts.
          </p>
        </div>
        <button
          onClick={exportCsv}
          disabled={!logs.length}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard
            icon={<Building2 size={18} />}
            label="Total Enterprises"
            value={summary.totalEnterprises}
            color="#172187"
          />
          <SummaryCard
            icon={<CheckCircle size={18} />}
            label={`Updated (${summary.year})`}
            value={summary.updatedThisYear}
            sub={`${summary.complianceRate}% compliance`}
            color="#059669"
          />
          <SummaryCard
            icon={<Clock size={18} />}
            label="Pending Update"
            value={summary.pendingUpdate}
            color="#d97706"
          />
          <SummaryCard
            icon={<AlertCircle size={18} />}
            label="Never Updated"
            value={summary.firstLoginPending}
            sub="First-login pending"
            color="#dc2626"
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Year:</label>
          <select
            value={year}
            onChange={(e) => { setYear(parseInt(e.target.value)); setPage(1); }}
            className="text-sm border border-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-dti-blue/30"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-48 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by company name..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dti-blue/30"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {logsQuery.isLoading ? (
          <div className="py-16 text-center text-gray-400">Loading update history...</div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Building2 size={36} className="mx-auto mb-3 opacity-30" />
            <p>No update records found for the selected filters.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Company</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Industry</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Location</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Fields</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const typeInfo = UPDATE_TYPE_LABELS[log.updateType] ?? { label: log.updateType, color: '#666' };
                return (
                  <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {format(new Date(log.updatedAt), 'MMM d, yyyy')}
                      <span className="block text-xs text-gray-400">{format(new Date(log.updatedAt), 'h:mm a')}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{log.enterprise.businessName}</div>
                      {log.enterprise.isVerified && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                          <CheckCircle size={10} /> Verified
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell max-w-[160px] truncate">
                      {log.enterprise.industrySector}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell whitespace-nowrap">
                      {[log.enterprise.cityMunicipality, log.enterprise.province].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: `${typeInfo.color}18`, color: typeInfo.color }}
                      >
                        {typeInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block min-w-[28px] text-center font-semibold text-dti-blue">
                        {log.changedFields.length}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-dti-blue hover:underline text-xs font-medium"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-sm text-gray-500">
              {meta.total} records — Page {page} of {meta.totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Drawer / Modal */}
      {selectedLog && (
        <UpdateDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function SummaryCard({
  icon, label, value, sub, color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2" style={{ color }}>
        {icon}
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-3xl font-bold" style={{ color }}>{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}

function UpdateDetailModal({ log, onClose }: { log: UpdateLog; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-dti-blue text-white px-6 py-4 flex justify-between items-start">
          <div>
            <h2 className="font-bold text-lg">{log.enterprise.businessName}</h2>
            <p className="text-blue-200 text-sm mt-0.5">
              {UPDATE_TYPE_LABELS[log.updateType]?.label} Update — {format(new Date(log.updatedAt), 'MMMM d, yyyy')}
            </p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-xl leading-none">✕</button>
        </div>

        <div className="overflow-y-auto p-6 space-y-5">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <MetaItem label="Update Year" value={String(log.updateYear)} />
            <MetaItem label="Update Type" value={UPDATE_TYPE_LABELS[log.updateType]?.label ?? log.updateType} />
            <MetaItem label="Industry" value={log.enterprise.industrySector} />
            <MetaItem label="Stage" value={log.enterprise.stage} />
            {log.enterprise.cityMunicipality && (
              <MetaItem
                label="Location"
                value={[log.enterprise.cityMunicipality, log.enterprise.province].filter(Boolean).join(', ')}
              />
            )}
            {log.notes && <MetaItem label="Notes" value={log.notes} />}
          </div>

          {/* Changed Fields */}
          {log.changedFields.length > 0 ? (
            <div>
              <h3 className="font-semibold text-gray-700 text-sm mb-2 uppercase tracking-wide">
                Changed Fields ({log.changedFields.length})
              </h3>
              <div className="space-y-2">
                {log.changedFields.map((cf) => (
                  <div key={cf.field} className="border border-gray-200 rounded-lg p-3 text-sm">
                    <div className="font-medium text-gray-800 mb-1">
                      {FIELD_LABELS[cf.field] ?? cf.field}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-400 block">Before</span>
                        <span className="text-red-600 line-through">
                          {cf.oldValue != null ? String(cf.oldValue) : '(empty)'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">After</span>
                        <span className="text-emerald-700 font-medium">
                          {cf.newValue != null ? String(cf.newValue) : '(empty)'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm italic">No field changes recorded (re-confirmation of existing data).</p>
          )}

          {/* Current Snapshot */}
          <details className="group">
            <summary className="cursor-pointer text-sm font-semibold text-gray-600 hover:text-dti-blue">
              View Full Company Snapshot After Update ▸
            </summary>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs bg-gray-50 rounded-lg p-3 border border-gray-200">
              {Object.entries(log.snapshotAfter).map(([key, val]) => (
                <MetaItem key={key} label={FIELD_LABELS[key] ?? key} value={val != null ? String(val) : '—'} />
              ))}
            </div>
          </details>
        </div>

        <div className="px-6 pb-4 flex justify-end border-t border-gray-100 pt-3">
          <button onClick={onClose} className="px-4 py-2 bg-dti-blue text-white rounded-lg text-sm font-medium hover:bg-dti-navy transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-gray-400 text-xs mb-0.5">{label}</div>
      <div className="text-gray-800 font-medium">{value}</div>
    </div>
  );
}
