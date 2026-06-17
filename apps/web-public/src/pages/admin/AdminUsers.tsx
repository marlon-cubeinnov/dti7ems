import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminIdentityApi, ApiError } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { Search, ChevronLeft, ChevronRight, UserCog, ShieldCheck, ShieldOff, MailCheck, Eye, Pencil, Trash2, X, UserCheck, Plus } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_BADGE: Record<string, string> = {
  ACTIVE:               'bg-green-100 text-green-700',
  PENDING_VERIFICATION: 'bg-yellow-100 text-yellow-700',
  PENDING_APPROVAL:     'bg-amber-100 text-amber-700',
  SUSPENDED:            'bg-red-100 text-red-600',
  DEACTIVATED:          'bg-gray-100 text-gray-600',
};

const APPROVE_ROLES = ['PROGRAM_MANAGER', 'EVENT_ORGANIZER', 'DIVISION_CHIEF', 'REGIONAL_DIRECTOR', 'PROVINCIAL_DIRECTOR', 'SYSTEM_ADMIN', 'SUPER_ADMIN'];

const ROLE_BADGE: Record<string, string> = {
  PARTICIPANT:              'bg-blue-50 text-blue-700',
  DTI_EMPLOYEE:             'bg-slate-100 text-slate-700',
  ENTERPRISE_REPRESENTATIVE:'bg-teal-50 text-teal-700',
  DIVISION_CHIEF:           'bg-amber-50 text-amber-700',
  REGIONAL_DIRECTOR:        'bg-rose-50 text-rose-700',
  PROVINCIAL_DIRECTOR:      'bg-pink-50 text-pink-700',
  SYSTEM_ADMIN:             'bg-orange-50 text-orange-700',
  SUPER_ADMIN:              'bg-red-50 text-red-700',
};

const ROLE_DISPLAY: Record<string, string> = {
  PARTICIPANT:               'Participant',
  DTI_EMPLOYEE:              'DTI Employee',
  ENTERPRISE_REPRESENTATIVE: 'Enterprise Rep',
  DIVISION_CHIEF:            'Division Chief',
  REGIONAL_DIRECTOR:         'Regional Director',
  PROVINCIAL_DIRECTOR:       'Provincial Director',
  SYSTEM_ADMIN:              'System Admin',
  SUPER_ADMIN:               'Super Admin',
};

const ALL_ROLES = [
  'PARTICIPANT', 'DTI_EMPLOYEE', 'ENTERPRISE_REPRESENTATIVE',
  'DIVISION_CHIEF', 'REGIONAL_DIRECTOR', 'PROVINCIAL_DIRECTOR', 'SYSTEM_ADMIN', 'SUPER_ADMIN',
];

const SOCIAL_CLASSIFICATIONS = ['ABLED', 'PWD', 'FOUR_PS', 'YOUTH', 'SENIOR_CITIZEN', 'INDIGENOUS_PERSON', 'OFW', 'OTHERS'];

function displayCategory(value: string | null | undefined): string {
  if (!value) return '—';
  return value.replace(/_/g, ' ');
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  roles?: string[];
  status: string;
  mobileNumber: string | null;
  region: string | null;
  companyOrOffice?: string | null;
  classificationCategory?: string | null;
  emailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

interface UserDetail {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  role: string;
  roles?: string[];
  status: string;
  mobileNumber: string | null;
  region: string | null;
  province: string | null;
  cityMunicipality: string | null;
  barangay: string | null;
  jobTitle: string | null;
  industryClassification: string | null;
  dpaConsentGiven: boolean;
  dpaConsentAt: string | null;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function AdminUsersPage() {
  const { user: currentUser } = useAuthStore();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [actionModal, setActionModal] = useState<{ type: 'status' | 'role'; user: User } | null>(null);
  const [actionValue, setActionValue] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  const [viewUser, setViewUser] = useState<UserDetail | null>(null);
  const [editUser, setEditUser] = useState<UserDetail | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    roles: ['PARTICIPANT'],
    industryClassification: '',
    socialClassification: '',
    employmentCategory: '',
    clientType: '',
  });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search, statusFilter, roleFilter],
    queryFn: () =>
      adminIdentityApi.listUsers({
        page,
        limit: 20,
        ...(search ? { search } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(roleFilter ? { role: roleFilter } : {}),
      }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: string; reason: string }) =>
      adminIdentityApi.changeUserStatus(id, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setActionModal(null);
      setReason('');
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, roles }: { id: string; roles: string[] }) =>
      adminIdentityApi.changeUserRole(id, roles),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setActionModal(null);
      setSelectedRoles([]);
    },
  });

  const verifyEmailMutation = useMutation({
    mutationFn: (id: string) => adminIdentityApi.verifyUserEmail(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      adminIdentityApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setEditUser(null);
      setEditForm({});
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => adminIdentityApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setDeleteConfirm(null);
    },
  });

  const createUserMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => adminIdentityApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setCreateOpen(false);
      setCreateForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        roles: ['PARTICIPANT'],
        industryClassification: '',
        socialClassification: '',
        employmentCategory: '',
        clientType: '',
      });
    },
  });

  async function handleViewUser(u: User) {
    try {
      const res = await adminIdentityApi.getUser(u.id);
      setViewUser((res as any).data as UserDetail);
    } catch { /* ignore */ }
  }

  async function handleEditUser(u: User) {
    try {
      const res = await adminIdentityApi.getUser(u.id);
      const detail = (res as any).data as UserDetail;
      setEditUser(detail);
      setEditForm({
        firstName: detail.firstName ?? '',
        lastName: detail.lastName ?? '',
        middleName: detail.middleName ?? '',
        mobileNumber: detail.mobileNumber ?? '',
        region: detail.region ?? '',
        province: detail.province ?? '',
        cityMunicipality: detail.cityMunicipality ?? '',
        barangay: detail.barangay ?? '',
        jobTitle: detail.jobTitle ?? '',
        industryClassification: detail.industryClassification ?? '',
      });
    } catch { /* ignore */ }
  }

  const users: User[] = Array.isArray((data as any)?.data) ? (data as any).data : [];
  const meta = (data as any)?.meta;

  function toggleRoleSelection(role: string, source: string[], onChange: (roles: string[]) => void) {
    const next = source.includes(role)
      ? source.filter((value) => value !== role)
      : [...source, role];
    onChange(next.length ? next : ['PARTICIPANT']);
  }

  function getUserRoles(user: Pick<User, 'role' | 'roles'> | Pick<UserDetail, 'role' | 'roles'>): string[] {
    return user.roles?.length ? user.roles : [user.role];
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">{meta?.total ?? 0} total users</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dti-blue"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING_VERIFICATION">Pending Verification</option>
          <option value="PENDING_APPROVAL">Pending Approval</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="DEACTIVATED">Deactivated</option>
        </select>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">All roles</option>
          {ALL_ROLES.map((r) => (
            <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-dti-blue text-white rounded-lg text-sm font-medium hover:bg-dti-blue-dark"
        >
          <Plus size={14} /> Add User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Company / Office</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Classification Category</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Joined</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 5 }, (_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">No users found.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{u.firstName} {u.lastName}</td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3 text-gray-600">{u.companyOrOffice || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{displayCategory(u.classificationCategory)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {getUserRoles(u).map((role) => (
                          <span key={`${u.id}-${role}`} className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${ROLE_BADGE[role] ?? 'bg-gray-100 text-gray-600'}`}>
                            {ROLE_DISPLAY[role] ?? role.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[u.status] ?? ''}`}>
                        {u.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {format(new Date(u.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <button
                        onClick={() => handleViewUser(u)}
                        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800"
                        title="View details"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        onClick={() => handleEditUser(u)}
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                        title="Edit user"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => { setActionModal({ type: 'role', user: u }); setSelectedRoles(getUserRoles(u)); }}
                        className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800"
                        title="Change role"
                      >
                        <UserCog size={13} />
                      </button>
                      {!u.emailVerified && (
                        <button
                          onClick={() => verifyEmailMutation.mutate(u.id)}
                          disabled={verifyEmailMutation.isPending}
                          className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800"
                          title="Verify email"
                        >
                          <MailCheck size={13} />
                        </button>
                      )}
                      {u.status === 'ACTIVE' ? (
                        <button
                          onClick={() => { setActionModal({ type: 'status', user: u }); setActionValue('SUSPENDED'); }}
                          className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-800"
                          title="Suspend"
                        >
                          <ShieldOff size={13} />
                        </button>
                      ) : u.status === 'SUSPENDED' ? (
                        <button
                          onClick={() => { setActionModal({ type: 'status', user: u }); setActionValue('ACTIVE'); }}
                          className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-800"
                          title="Reactivate"
                        >
                          <ShieldCheck size={13} />
                        </button>
                      ) : u.status === 'PENDING_APPROVAL' && APPROVE_ROLES.includes(currentUser?.role ?? '') ? (
                        <button
                          onClick={() => { setActionModal({ type: 'status', user: u }); setActionValue('ACTIVE'); }}
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                          title="Approve account"
                        >
                          <UserCheck size={13} />
                          <span>Approve</span>
                        </button>
                      ) : null}
                      <button
                        onClick={() => setDeleteConfirm(u)}
                        className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                        title="Delete user"
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
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

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add User</h3>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <EditField label="First Name" value={createForm.firstName} onChange={v => setCreateForm(f => ({ ...f, firstName: v }))} />
              <EditField label="Last Name" value={createForm.lastName} onChange={v => setCreateForm(f => ({ ...f, lastName: v }))} />
            </div>

            <div className="space-y-3 mb-3">
              <div>
                <label className="text-xs text-gray-500 block mb-0.5">Email</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dti-blue"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-0.5">Temporary Password</label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dti-blue"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Roles</label>
                <div className="border border-gray-300 rounded-lg p-2 space-y-1 max-h-44 overflow-y-auto">
                  {ALL_ROLES.map((role) => (
                    <label key={role} className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={createForm.roles.includes(role)}
                        onChange={() => toggleRoleSelection(role, createForm.roles, (roles) => setCreateForm((f) => ({ ...f, roles })))}
                        className="accent-dti-blue"
                      />
                      <span>{ROLE_DISPLAY[role] ?? role.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-0.5">Classification Category</label>
                <select
                  value={createForm.socialClassification}
                  onChange={e => setCreateForm(f => ({ ...f, socialClassification: e.target.value }))}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Select…</option>
                  {SOCIAL_CLASSIFICATIONS.map((s) => (
                    <option key={s} value={s}>{displayCategory(s)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <EditField
                label="Company / Office"
                value={createForm.industryClassification}
                onChange={v => setCreateForm(f => ({ ...f, industryClassification: v }))}
              />
              <div>
                <label className="text-xs text-gray-500 block mb-0.5">Employment Category</label>
                <select
                  value={createForm.employmentCategory}
                  onChange={e => setCreateForm(f => ({ ...f, employmentCategory: e.target.value }))}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Select…</option>
                  <option value="SELF_EMPLOYED">Self Employed</option>
                  <option value="EMPLOYED_GOVT">Employed Government</option>
                  <option value="EMPLOYED_PRIVATE">Employed Private</option>
                  <option value="GENERAL_PUBLIC">General Public</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs text-gray-500 block mb-0.5">Client Type</label>
              <select
                value={createForm.clientType}
                onChange={e => setCreateForm(f => ({ ...f, clientType: e.target.value }))}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Select…</option>
                <option value="CITIZEN">Citizen</option>
                <option value="BUSINESS">Business</option>
                <option value="GOVERNMENT">Government</option>
              </select>
            </div>

            {createUserMutation.error && (
              <p className="text-sm text-red-600 mb-3">{(createUserMutation.error as ApiError)?.message ?? 'Create user failed.'}</p>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setCreateOpen(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  createUserMutation.mutate({
                    firstName: createForm.firstName.trim(),
                    lastName: createForm.lastName.trim(),
                    email: createForm.email.trim(),
                    password: createForm.password,
                    roles: createForm.roles,
                    socialClassification: createForm.socialClassification || null,
                    employmentCategory: createForm.employmentCategory || null,
                    clientType: createForm.clientType || null,
                    industryClassification: createForm.industryClassification.trim() || null,
                  });
                }}
                disabled={
                  createUserMutation.isPending
                  || !createForm.firstName.trim()
                  || !createForm.lastName.trim()
                  || !createForm.email.trim()
                  || !createForm.roles.length
                  || createForm.password.length < 8
                }
                className="px-4 py-2 bg-dti-blue text-white rounded-lg text-sm font-medium hover:bg-dti-blue-dark disabled:opacity-50"
              >
                {createUserMutation.isPending ? 'Creating…' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {actionModal.type === 'role' ? 'Change Role' : 'Change Status'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {actionModal.user.firstName} {actionModal.user.lastName} ({actionModal.user.email})
            </p>

            {actionModal.type === 'role' ? (
              <div className="w-full border border-gray-300 rounded-lg p-3 text-sm mb-4 space-y-2 max-h-60 overflow-y-auto">
                {ALL_ROLES.map((role) => (
                  <label key={role} className="flex items-center gap-2 text-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role)}
                      onChange={() => toggleRoleSelection(role, selectedRoles, setSelectedRoles)}
                      className="accent-dti-blue"
                    />
                    <span>{ROLE_DISPLAY[role] ?? role.replace(/_/g, ' ')}</span>
                  </label>
                ))}
              </div>
            ) : (
              <>
                <select
                  value={actionValue}
                  onChange={(e) => setActionValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="DEACTIVATED">Deactivated</option>
                </select>
                <input
                  type="text"
                  placeholder="Reason for change (required)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-4"
                />
              </>
            )}

            {(statusMutation.error || roleMutation.error) && (
              <p className="text-sm text-red-600 mb-3">
                {((statusMutation.error || roleMutation.error) as ApiError)?.message ?? 'Action failed.'}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <button onClick={() => { setActionModal(null); setReason(''); }} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
                Cancel
              </button>
              <button
                onClick={() => {
                  if (actionModal.type === 'role') {
                    roleMutation.mutate({ id: actionModal.user.id, roles: selectedRoles });
                  } else {
                    if (!reason.trim()) return;
                    statusMutation.mutate({ id: actionModal.user.id, status: actionValue, reason });
                  }
                }}
                disabled={statusMutation.isPending || roleMutation.isPending || (actionModal.type === 'status' && !reason.trim()) || (actionModal.type === 'role' && !selectedRoles.length)}
                className="px-4 py-2 bg-dti-blue text-white rounded-lg text-sm font-medium hover:bg-dti-blue-dark disabled:opacity-50"
              >
                {statusMutation.isPending || roleMutation.isPending ? 'Saving…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View User Details Modal */}
      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white rounded-t-xl">
              <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
              <button onClick={() => setViewUser(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="px-6 py-4 space-y-3 text-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-dti-blue text-white flex items-center justify-center font-bold text-sm">
                  {viewUser.firstName?.[0]}{viewUser.lastName?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{viewUser.firstName} {viewUser.middleName ? viewUser.middleName + ' ' : ''}{viewUser.lastName}</p>
                  <p className="text-xs text-gray-500">{viewUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <DetailRow label="Roles" value={getUserRoles(viewUser).map((role) => ROLE_DISPLAY[role] ?? role.replace(/_/g, ' ')).join(', ')} />
                <DetailRow label="Status" value={viewUser.status.replace(/_/g, ' ')} />
                <DetailRow label="Mobile" value={viewUser.mobileNumber} />
                <DetailRow label="Email Verified" value={viewUser.emailVerified ? 'Yes' : 'No'} />
                <DetailRow label="Region" value={viewUser.region} />
                <DetailRow label="Province" value={viewUser.province} />
                <DetailRow label="City/Municipality" value={viewUser.cityMunicipality} />
                <DetailRow label="Barangay" value={viewUser.barangay} />
                <DetailRow label="Job Title" value={viewUser.jobTitle} />
                <DetailRow label="Industry" value={viewUser.industryClassification} />
                <DetailRow label="DPA Consent" value={viewUser.dpaConsentGiven ? 'Given' : 'Not given'} />
                <DetailRow label="DPA Consent Date" value={viewUser.dpaConsentAt ? format(new Date(viewUser.dpaConsentAt), 'MMM d, yyyy') : null} />
                <DetailRow label="Last Login" value={viewUser.lastLoginAt ? format(new Date(viewUser.lastLoginAt), 'MMM d, yyyy h:mm a') : null} />
                <DetailRow label="Joined" value={format(new Date(viewUser.createdAt), 'MMM d, yyyy')} />
                <DetailRow label="Updated" value={format(new Date(viewUser.updatedAt), 'MMM d, yyyy')} />
              </div>
            </div>
            <div className="px-6 py-3 border-t flex justify-end">
              <button onClick={() => setViewUser(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white rounded-t-xl">
              <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
              <button onClick={() => { setEditUser(null); setEditForm({}); }} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="px-6 py-4 space-y-3">
              <p className="text-sm text-gray-500 mb-2">{editUser.email}</p>
              <div className="grid grid-cols-2 gap-3">
                <EditField label="First Name" value={editForm.firstName ?? ''} onChange={v => setEditForm(f => ({ ...f, firstName: v }))} />
                <EditField label="Last Name" value={editForm.lastName ?? ''} onChange={v => setEditForm(f => ({ ...f, lastName: v }))} />
                <EditField label="Middle Name" value={editForm.middleName ?? ''} onChange={v => setEditForm(f => ({ ...f, middleName: v }))} />
                <EditField label="Mobile Number" value={editForm.mobileNumber ?? ''} onChange={v => setEditForm(f => ({ ...f, mobileNumber: v }))} />
                <EditField label="Region" value={editForm.region ?? ''} onChange={v => setEditForm(f => ({ ...f, region: v }))} />
                <EditField label="Province" value={editForm.province ?? ''} onChange={v => setEditForm(f => ({ ...f, province: v }))} />
                <EditField label="City/Municipality" value={editForm.cityMunicipality ?? ''} onChange={v => setEditForm(f => ({ ...f, cityMunicipality: v }))} />
                <EditField label="Barangay" value={editForm.barangay ?? ''} onChange={v => setEditForm(f => ({ ...f, barangay: v }))} />
                <EditField label="Job Title" value={editForm.jobTitle ?? ''} onChange={v => setEditForm(f => ({ ...f, jobTitle: v }))} />
                <EditField label="Industry" value={editForm.industryClassification ?? ''} onChange={v => setEditForm(f => ({ ...f, industryClassification: v }))} />
              </div>

              {updateUserMutation.error && (
                <p className="text-sm text-red-600">{(updateUserMutation.error as ApiError)?.message ?? 'Update failed.'}</p>
              )}
            </div>
            <div className="px-6 py-3 border-t flex justify-end gap-2">
              <button onClick={() => { setEditUser(null); setEditForm({}); }} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
              <button
                onClick={() => {
                  const data: Record<string, unknown> = {};
                  for (const [k, v] of Object.entries(editForm)) {
                    const val = v.trim();
                    data[k] = val || null;
                  }
                  if (data.firstName) updateUserMutation.mutate({ id: editUser.id, data });
                }}
                disabled={updateUserMutation.isPending || !editForm.firstName?.trim()}
                className="px-4 py-2 bg-dti-blue text-white rounded-lg text-sm font-medium hover:bg-dti-blue-dark disabled:opacity-50"
              >
                {updateUserMutation.isPending ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete User</h3>
            <p className="text-sm text-gray-600 mb-1">
              Are you sure you want to delete <strong>{deleteConfirm.firstName} {deleteConfirm.lastName}</strong>?
            </p>
            <p className="text-xs text-gray-400 mb-4">{deleteConfirm.email}</p>
            <p className="text-xs text-red-500 mb-4">This action cannot be undone. All user data will be permanently removed.</p>

            {deleteUserMutation.error && (
              <p className="text-sm text-red-600 mb-3">{(deleteUserMutation.error as ApiError)?.message ?? 'Delete failed.'}</p>
            )}

            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
              <button
                onClick={() => deleteUserMutation.mutate(deleteConfirm.id)}
                disabled={deleteUserMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {deleteUserMutation.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm text-gray-900">{value || '—'}</p>
    </div>
  );
}

function EditField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-gray-500 block mb-0.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dti-blue"
      />
    </div>
  );
}
