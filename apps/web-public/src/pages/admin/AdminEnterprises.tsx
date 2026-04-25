import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminIdentityApi } from '@/lib/api';
import { Search, ChevronLeft, ChevronRight, CheckCircle, XCircle, Globe, GlobeLock, Pencil, Trash2, X, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

const STAGE_BADGE: Record<string, string> = {
  PRE_STARTUP: 'bg-gray-100 text-gray-600',
  STARTUP:     'bg-blue-100 text-blue-700',
  GROWTH:      'bg-green-100 text-green-700',
  EXPANSION:   'bg-purple-100 text-purple-700',
  MATURE:      'bg-teal-100 text-teal-700',
};

const INDUSTRY_SECTORS = [
  'Agriculture, Forestry & Fishing',
  'Food & Beverage Manufacturing',
  'Textile & Garments',
  'Retail & Wholesale Trade',
  'Trading / Retail',
  'Tourism, Hospitality & Food Service',
  'Information Technology & BPO',
  'Technology / IT',
  'Health & Social Services',
  'Arts, Entertainment & Recreation',
  'Creative Industries',
  'Handicrafts',
  'Startup / Innovation Ecosystem',
  'Construction & Real Estate',
  'Transportation & Logistics',
  'Financial Services',
  'Education & Training',
  'Other',
];

const STAGES = ['PRE_STARTUP', 'STARTUP', 'GROWTH', 'EXPANSION', 'MATURE'];

interface Enterprise {
  id: string;
  businessName: string;
  tradeName: string | null;
  registrationNo: string | null;
  tinNumber: string | null;
  industrySector: string;
  stage: string;
  employeeCount: number | null;
  annualRevenue: string | null;
  region: string | null;
  province: string | null;
  cityMunicipality: string | null;
  isVerified: boolean;
  isPubliclyListed: boolean;
  createdAt: string;
  user: { id: string; email: string; firstName: string; lastName: string };
}

interface EditForm {
  businessName: string;
  tradeName: string;
  registrationNo: string;
  tinNumber: string;
  industrySector: string;
  stage: string;
  employeeCount: string;
  annualRevenue: string;
  region: string;
  province: string;
  cityMunicipality: string;
  isVerified: boolean;
  isPubliclyListed: boolean;
}

function toEditForm(e: Enterprise): EditForm {
  return {
    businessName:    e.businessName,
    tradeName:       e.tradeName       ?? '',
    registrationNo:  e.registrationNo  ?? '',
    tinNumber:       e.tinNumber       ?? '',
    industrySector:  e.industrySector,
    stage:           e.stage,
    employeeCount:   e.employeeCount != null ? String(e.employeeCount) : '',
    annualRevenue:   e.annualRevenue  ?? '',
    region:          e.region         ?? '',
    province:        e.province       ?? '',
    cityMunicipality: e.cityMunicipality ?? '',
    isVerified:      e.isVerified,
    isPubliclyListed: e.isPubliclyListed,
  };
}

export function AdminEnterprisesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const queryClient = useQueryClient();

  // Edit modal state
  const [editTarget, setEditTarget] = useState<Enterprise | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<Enterprise | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-enterprises', page, search, stageFilter, verifiedFilter],
    queryFn: () =>
      adminIdentityApi.listEnterprises({
        page, limit: 20,
        ...(search       ? { search }           : {}),
        ...(stageFilter  ? { stage: stageFilter } : {}),
        ...(verifiedFilter ? { verified: verifiedFilter } : {}),
      }),
  });

  const verifyMutation = useMutation({
    mutationFn: (id: string) => adminIdentityApi.verifyEnterprise(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-enterprises'] }),
  });

  const toggleListingMutation = useMutation({
    mutationFn: ({ id, listed }: { id: string; listed: boolean }) =>
      adminIdentityApi.updateEnterprise(id, { isPubliclyListed: listed }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-enterprises'] }),
  });

  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      adminIdentityApi.updateEnterprise(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-enterprises'] });
      setEditTarget(null);
      setEditForm(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminIdentityApi.deleteEnterprise(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-enterprises'] });
      setDeleteTarget(null);
    },
  });

  const enterprises: Enterprise[] = Array.isArray((data as any)?.data) ? (data as any).data : [];
  const meta = (data as any)?.meta;

  function openEdit(e: Enterprise) {
    setEditTarget(e);
    setEditForm(toEditForm(e));
  }

  function handleEditField(field: keyof EditForm, value: string | boolean) {
    setEditForm((prev) => prev ? { ...prev, [field]: value } : prev);
  }

  function submitEdit() {
    if (!editTarget || !editForm) return;
    editMutation.mutate({
      id: editTarget.id,
      data: {
        businessName:    editForm.businessName.trim(),
        tradeName:       editForm.tradeName.trim()      || null,
        registrationNo:  editForm.registrationNo.trim() || null,
        tinNumber:       editForm.tinNumber.trim()      || null,
        industrySector:  editForm.industrySector,
        stage:           editForm.stage,
        employeeCount:   editForm.employeeCount ? parseInt(editForm.employeeCount, 10) : null,
        annualRevenue:   editForm.annualRevenue.trim() || null,
        region:          editForm.region.trim()        || null,
        province:        editForm.province.trim()      || null,
        cityMunicipality: editForm.cityMunicipality.trim() || null,
        isVerified:      editForm.isVerified,
        isPubliclyListed: editForm.isPubliclyListed,
      },
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Enterprise Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">{meta?.total ?? 0} enterprises registered</p>
      </div>

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
          {STAGES.map((s) => (
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
                <th className="text-left px-4 py-3 font-medium text-gray-600">Listed</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Registered</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 5 }, (_, i) => (
                  <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
                ))
              ) : enterprises.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No enterprises found.</td></tr>
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
                    <td className="px-4 py-3 text-gray-600 text-xs">{e.user.firstName} {e.user.lastName}</td>
                    <td className="px-4 py-3">
                      {e.isVerified ? <CheckCircle size={16} className="text-green-500" /> : <XCircle size={16} className="text-gray-300" />}
                    </td>
                    <td className="px-4 py-3">
                      {e.isPubliclyListed ? <Globe size={16} className="text-blue-500" /> : <GlobeLock size={16} className="text-gray-300" />}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{format(new Date(e.createdAt), 'MMM d, yyyy')}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!e.isVerified && (
                          <button
                            onClick={() => verifyMutation.mutate(e.id)}
                            disabled={verifyMutation.isPending}
                            className="text-xs text-dti-blue hover:text-dti-blue-dark font-medium px-1.5"
                          >
                            Verify
                          </button>
                        )}
                        <button
                          onClick={() => toggleListingMutation.mutate({ id: e.id, listed: !e.isPubliclyListed })}
                          disabled={toggleListingMutation.isPending}
                          className={`text-xs font-medium px-1.5 ${e.isPubliclyListed ? 'text-amber-600 hover:text-amber-700' : 'text-green-600 hover:text-green-700'}`}
                        >
                          {e.isPubliclyListed ? 'Unlist' : 'List'}
                        </button>
                        <button
                          onClick={() => openEdit(e)}
                          title="Edit enterprise"
                          className="p-1 text-gray-400 hover:text-dti-blue rounded"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(e)}
                          title="Delete enterprise"
                          className="p-1 text-gray-400 hover:text-red-600 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
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
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-30"><ChevronLeft size={16} /></button>
              <button disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)} className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-30"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* ── Edit Modal ─────────────────────────────────────────────────────── */}
      {editTarget && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-base font-semibold text-gray-900">Edit Enterprise</h2>
              <button onClick={() => { setEditTarget(null); setEditForm(null); }} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
            </div>
            <div className="px-6 py-5 grid grid-cols-2 gap-4">
              {/* Business Name */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Business Name *</label>
                <input
                  value={editForm.businessName}
                  onChange={(e) => handleEditField('businessName', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dti-blue"
                />
              </div>
              {/* Trade Name */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Trade Name</label>
                <input
                  value={editForm.tradeName}
                  onChange={(e) => handleEditField('tradeName', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dti-blue"
                />
              </div>
              {/* Registration No */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Registration No.</label>
                <input
                  value={editForm.registrationNo}
                  onChange={(e) => handleEditField('registrationNo', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dti-blue"
                />
              </div>
              {/* TIN */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">TIN Number</label>
                <input
                  value={editForm.tinNumber}
                  onChange={(e) => handleEditField('tinNumber', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dti-blue"
                />
              </div>
              {/* Industry Sector */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Industry Sector *</label>
                <select
                  value={editForm.industrySector}
                  onChange={(e) => handleEditField('industrySector', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dti-blue"
                >
                  {INDUSTRY_SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {/* Stage */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Business Stage *</label>
                <select
                  value={editForm.stage}
                  onChange={(e) => handleEditField('stage', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dti-blue"
                >
                  {STAGES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              {/* Employee Count */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Employee Count</label>
                <input
                  type="number"
                  min="1"
                  value={editForm.employeeCount}
                  onChange={(e) => handleEditField('employeeCount', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dti-blue"
                />
              </div>
              {/* Annual Revenue */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Annual Revenue</label>
                <input
                  value={editForm.annualRevenue}
                  onChange={(e) => handleEditField('annualRevenue', e.target.value)}
                  placeholder="e.g. ₱500,000 – ₱3M"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dti-blue"
                />
              </div>
              {/* Region */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Region</label>
                <input
                  value={editForm.region}
                  onChange={(e) => handleEditField('region', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dti-blue"
                />
              </div>
              {/* Province */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Province</label>
                <input
                  value={editForm.province}
                  onChange={(e) => handleEditField('province', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dti-blue"
                />
              </div>
              {/* City/Municipality */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">City / Municipality</label>
                <input
                  value={editForm.cityMunicipality}
                  onChange={(e) => handleEditField('cityMunicipality', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dti-blue"
                />
              </div>
              {/* Toggles */}
              <div className="col-span-2 flex gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={editForm.isVerified}
                    onChange={(e) => handleEditField('isVerified', e.target.checked)}
                    className="w-4 h-4 accent-dti-blue"
                  />
                  Verified
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={editForm.isPubliclyListed}
                    onChange={(e) => handleEditField('isPubliclyListed', e.target.checked)}
                    className="w-4 h-4 accent-dti-blue"
                  />
                  Publicly Listed
                </label>
              </div>
            </div>
            {editMutation.isError && (
              <p className="px-6 pb-2 text-xs text-red-600">Failed to save changes. Please try again.</p>
            )}
            <div className="flex justify-end gap-2 px-6 py-4 border-t bg-gray-50">
              <button
                onClick={() => { setEditTarget(null); setEditForm(null); }}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={submitEdit}
                disabled={editMutation.isPending || !editForm.businessName.trim()}
                className="px-4 py-2 text-sm font-medium bg-dti-blue text-white rounded-lg hover:bg-dti-blue-dark disabled:opacity-50"
              >
                {editMutation.isPending ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ───────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="px-6 pt-6 pb-4 flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle size={18} className="text-red-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">Delete Enterprise</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Are you sure you want to delete <span className="font-medium">{deleteTarget.businessName}</span>?
                  This will permanently remove the enterprise profile and all associated membership records. This action cannot be undone.
                </p>
              </div>
            </div>
            {deleteMutation.isError && (
              <p className="px-6 pb-2 text-xs text-red-600">Failed to delete. Please try again.</p>
            )}
            <div className="flex justify-end gap-2 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Delete Enterprise'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


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

export function AdminEnterprisesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-enterprises', page, search, stageFilter, verifiedFilter],
    queryFn: () =>
      adminIdentityApi.listEnterprises({
        page, limit: 20,
        ...(search ? { search } : {}),
        ...(stageFilter ? { stage: stageFilter } : {}),
        ...(verifiedFilter ? { verified: verifiedFilter } : {}),
      }),
  });

  const verifyMutation = useMutation({
    mutationFn: (id: string) => adminIdentityApi.verifyEnterprise(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-enterprises'] }),
  });

  const toggleListingMutation = useMutation({
    mutationFn: ({ id, listed }: { id: string; listed: boolean }) =>
      adminIdentityApi.updateEnterprise(id, { isPubliclyListed: listed }),
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
                <th className="text-left px-4 py-3 font-medium text-gray-600">Listed</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Registered</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 5 }, (_, i) => (
                  <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
                ))
              ) : enterprises.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No enterprises found.</td></tr>
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
                    <td className="px-4 py-3 text-gray-600 text-xs">{e.user.firstName} {e.user.lastName}</td>
                    <td className="px-4 py-3">
                      {e.isVerified ? <CheckCircle size={16} className="text-green-500" /> : <XCircle size={16} className="text-gray-300" />}
                    </td>
                    <td className="px-4 py-3">
                      {e.isPubliclyListed ? <Globe size={16} className="text-blue-500" /> : <GlobeLock size={16} className="text-gray-300" />}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{format(new Date(e.createdAt), 'MMM d, yyyy')}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {!e.isVerified && (
                        <button
                          onClick={() => verifyMutation.mutate(e.id)}
                          disabled={verifyMutation.isPending}
                          className="text-xs text-dti-blue hover:text-dti-blue-dark font-medium"
                        >
                          Verify
                        </button>
                      )}
                      <button
                        onClick={() => toggleListingMutation.mutate({ id: e.id, listed: !e.isPubliclyListed })}
                        disabled={toggleListingMutation.isPending}
                        className={`text-xs font-medium ${e.isPubliclyListed ? 'text-amber-600 hover:text-amber-700' : 'text-green-600 hover:text-green-700'}`}
                      >
                        {e.isPubliclyListed ? 'Unlist' : 'List'}
                      </button>
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
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-30"><ChevronLeft size={16} /></button>
              <button disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)} className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-30"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
