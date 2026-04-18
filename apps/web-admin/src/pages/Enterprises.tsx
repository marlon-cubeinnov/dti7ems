import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminIdentityApi } from '@/lib/api';
import { Search, ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const STAGE_BADGE: Record<string, string> = {
  PRE_STARTUP: 'bg-gray-100 text-gray-600',
  STARTUP:     'bg-blue-100 text-blue-700',
  GROWTH:      'bg-green-100 text-green-700',
  EXPANSION:   'bg-purple-100 text-purple-700',
  MATURE:      'bg-teal-100 text-teal-700',
};

interface Enterprise {
  id: string;
  businessName: string;
  tradeName: string | null;
  industrySector: string;
  stage: string;
  isVerified: boolean;
  isPubliclyListed: boolean;
  employeeCount: number | null;
  region: string | null;
  createdAt: string;
  user: { id: string; email: string; firstName: string; lastName: string };
}

export function EnterprisesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-enterprises', page, search, stageFilter, verifiedFilter],
    queryFn: () =>
      adminIdentityApi.listEnterprises({
        page,
        limit: 20,
        ...(search ? { search } : {}),
        ...(stageFilter ? { stage: stageFilter } : {}),
        ...(verifiedFilter ? { verified: verifiedFilter } : {}),
      }),
  });

  const verifyMutation = useMutation({
    mutationFn: (id: string) => adminIdentityApi.verifyEnterprise(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-enterprises'] }),
  });

  const enterprises: Enterprise[] = Array.isArray((data as any)?.data) ? (data as any).data : [];
  const meta = (data as any)?.meta;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Enterprise Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">{meta?.total ?? 0} enterprises registered</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by business name or TIN…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dti-blue"
          />
        </div>
        <select
          value={stageFilter}
          onChange={(e) => { setStageFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">All stages</option>
          {Object.keys(STAGE_BADGE).map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <select
          value={verifiedFilter}
          onChange={(e) => { setVerifiedFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">All</option>
          <option value="true">Verified</option>
          <option value="false">Unverified</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Business Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Sector</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Stage</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Owner</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Verified</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Registered</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 5 }, (_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : enterprises.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">No enterprises found.</td>
                </tr>
              ) : (
                enterprises.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{e.businessName}</div>
                      {e.tradeName && <div className="text-xs text-gray-400">{e.tradeName}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{e.industrySector}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${STAGE_BADGE[e.stage] ?? ''}`}>
                        {e.stage.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {e.user.firstName} {e.user.lastName}
                    </td>
                    <td className="px-4 py-3">
                      {e.isVerified ? (
                        <CheckCircle size={16} className="text-green-500" />
                      ) : (
                        <XCircle size={16} className="text-gray-300" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {format(new Date(e.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!e.isVerified && (
                        <button
                          onClick={() => verifyMutation.mutate(e.id)}
                          disabled={verifyMutation.isPending}
                          className="text-xs text-dti-blue hover:text-dti-blue-dark font-medium"
                        >
                          Verify
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
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
