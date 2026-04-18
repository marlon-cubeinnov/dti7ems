import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminIdentityApi, ApiError } from '@/lib/api';
import { Search, ChevronLeft, ChevronRight, UserCog, ShieldCheck, ShieldOff, MailCheck } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_BADGE: Record<string, string> = {
  ACTIVE:               'bg-green-100 text-green-700',
  PENDING_VERIFICATION: 'bg-yellow-100 text-yellow-700',
  SUSPENDED:            'bg-red-100 text-red-600',
  DEACTIVATED:          'bg-gray-100 text-gray-600',
};

const ROLE_BADGE: Record<string, string> = {
  PARTICIPANT:              'bg-blue-50 text-blue-700',
  ENTERPRISE_REPRESENTATIVE:'bg-teal-50 text-teal-700',
  PROGRAM_MANAGER:          'bg-purple-50 text-purple-700',
  EVENT_ORGANIZER:          'bg-indigo-50 text-indigo-700',
  SYSTEM_ADMIN:             'bg-orange-50 text-orange-700',
  SUPER_ADMIN:              'bg-red-50 text-red-700',
};

const ALL_ROLES = [
  'PARTICIPANT', 'ENTERPRISE_REPRESENTATIVE', 'PROGRAM_MANAGER',
  'EVENT_ORGANIZER', 'SYSTEM_ADMIN', 'SUPER_ADMIN',
];

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  mobileNumber: string | null;
  region: string | null;
  emailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionModal, setActionModal] = useState<{ type: 'status' | 'role'; user: User } | null>(null);
  const [actionValue, setActionValue] = useState('');
  const [reason, setReason] = useState('');
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
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      adminIdentityApi.changeUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setActionModal(null);
    },
  });

  const verifyEmailMutation = useMutation({
    mutationFn: (id: string) => adminIdentityApi.verifyUserEmail(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const users: User[] = Array.isArray((data as any)?.data) ? (data as any).data : [];
  const meta = (data as any)?.meta;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{meta?.total ?? 0} total users</p>
        </div>
      </div>

      {/* Filters */}
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
          <option value="PENDING_VERIFICATION">Pending</option>
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
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
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
                    <td colSpan={6} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">No users found.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${ROLE_BADGE[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                        {u.role.replace(/_/g, ' ')}
                      </span>
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
                        onClick={() => { setActionModal({ type: 'role', user: u }); setActionValue(u.role); }}
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
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <span className="text-xs text-gray-500">Page {meta.page} of {meta.totalPages}</span>
            <div className="flex gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={page >= meta.totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action modal */}
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
              <select
                value={actionValue}
                onChange={(e) => setActionValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-4"
              >
                {ALL_ROLES.map((r) => (
                  <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
                ))}
              </select>
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
              <button
                onClick={() => { setActionModal(null); setReason(''); }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (actionModal.type === 'role') {
                    roleMutation.mutate({ id: actionModal.user.id, role: actionValue });
                  } else {
                    if (!reason.trim()) return;
                    statusMutation.mutate({ id: actionModal.user.id, status: actionValue, reason });
                  }
                }}
                disabled={statusMutation.isPending || roleMutation.isPending || (actionModal.type === 'status' && !reason.trim())}
                className="px-4 py-2 bg-dti-blue text-white rounded-lg text-sm font-medium hover:bg-dti-blue-dark disabled:opacity-50"
              >
                {statusMutation.isPending || roleMutation.isPending ? 'Saving…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
