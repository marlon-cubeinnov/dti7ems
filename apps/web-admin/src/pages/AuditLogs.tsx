import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminIdentityApi } from '@/lib/api';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { format } from 'date-fns';

const ACTION_COLORS: Record<string, string> = {
  STATUS_CHANGE: 'text-yellow-700 bg-yellow-50',
  ROLE_CHANGE:   'text-purple-700 bg-purple-50',
  ENTERPRISE:    'text-teal-700 bg-teal-50',
  LOGIN:         'text-blue-700 bg-blue-50',
  DEFAULT:       'text-gray-700 bg-gray-50',
};

function getActionColor(action: string): string {
  if (action.startsWith('STATUS_CHANGE')) return ACTION_COLORS.STATUS_CHANGE;
  if (action.startsWith('ROLE_CHANGE'))   return ACTION_COLORS.ROLE_CHANGE;
  if (action.includes('ENTERPRISE'))      return ACTION_COLORS.ENTERPRISE;
  if (action.includes('LOGIN'))           return ACTION_COLORS.LOGIN;
  return ACTION_COLORS.DEFAULT;
}

interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: { id: string; email: string; firstName: string; lastName: string; role: string } | null;
}

export function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [entityType, setEntityType] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit-logs', page, entityType, actionFilter],
    queryFn: () =>
      adminIdentityApi.getAuditLogs({
        page,
        limit: 25,
        ...(entityType ? { entityType } : {}),
        ...(actionFilter ? { action: actionFilter } : {}),
      }),
  });

  const logs: AuditLog[] = Array.isArray((data as any)?.data) ? (data as any).data : [];
  const meta = (data as any)?.meta;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-sm text-gray-500 mt-0.5">{meta?.total ?? 0} log entries</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={entityType}
          onChange={(e) => { setEntityType(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">All entity types</option>
          <option value="UserProfile">UserProfile</option>
          <option value="EnterpriseProfile">EnterpriseProfile</option>
        </select>
        <div className="relative flex-1 min-w-[160px]">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Filter by action (e.g. STATUS_CHANGE)…"
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dti-blue"
          />
        </div>
      </div>

      {/* Logs list */}
      <div className="bg-white rounded-xl shadow-card divide-y divide-gray-100">
        {isLoading ? (
          Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></div>
          ))
        ) : logs.length === 0 ? (
          <div className="px-5 py-8 text-center text-gray-400">No audit logs found.</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="px-5 py-3.5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                    <span className="text-xs text-gray-400">{log.entityType}:{log.entityId.slice(0, 8)}…</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">
                    {log.user ? (
                      <span className="font-medium">{log.user.firstName} {log.user.lastName}</span>
                    ) : (
                      <span className="text-gray-400">System</span>
                    )}
                    {' '}performed <strong>{log.action}</strong> on {log.entityType}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400">
                    {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm')}
                  </p>
                  {(log.oldData || log.newData) && (
                    <button
                      onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                      className="text-[11px] text-dti-blue hover:underline mt-0.5"
                    >
                      {expanded === log.id ? 'Hide details' : 'View details'}
                    </button>
                  )}
                </div>
              </div>

              {expanded === log.id && (
                <div className="mt-3 bg-gray-50 rounded-lg p-3 text-xs font-mono space-y-2 overflow-x-auto">
                  {log.oldData && (
                    <div>
                      <span className="text-red-500 font-sans font-medium">Before:</span>
                      <pre className="text-gray-600 mt-0.5">{JSON.stringify(log.oldData, null, 2)}</pre>
                    </div>
                  )}
                  {log.newData && (
                    <div>
                      <span className="text-green-600 font-sans font-medium">After:</span>
                      <pre className="text-gray-600 mt-0.5">{JSON.stringify(log.newData, null, 2)}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 bg-gray-50">
            <span className="text-xs text-gray-500">Page {meta.page} of {meta.totalPages}</span>
            <div className="flex gap-1">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-30">
                <ChevronLeft size={16} />
              </button>
              <button disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)} className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-30">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
