import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesApi, ApiError } from '@/lib/api';
import {
  Shield, Plus, Save, Trash2, ChevronDown, ChevronRight,
  Check, X, RefreshCw, Lock, Pencil,
} from 'lucide-react';

interface Permission {
  id: string;
  code: string;
  label: string;
  group: string;
}

interface Role {
  id: string;
  name: string;
  label: string;
  description: string | null;
  isSystem: boolean;
  permissions: Permission[];
}

const GROUP_COLORS: Record<string, string> = {
  Users: 'bg-blue-50 text-blue-700 border-blue-200',
  Events: 'bg-purple-50 text-purple-700 border-purple-200',
  Participants: 'bg-green-50 text-green-700 border-green-200',
  Attendance: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Certificates: 'bg-teal-50 text-teal-700 border-teal-200',
  Surveys: 'bg-orange-50 text-orange-700 border-orange-200',
  Checklists: 'bg-pink-50 text-pink-700 border-pink-200',
  Enterprises: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Reports: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Admin: 'bg-red-50 text-red-700 border-red-200',
  Notifications: 'bg-gray-50 text-gray-700 border-gray-200',
};

export function AdminRolesPermissionsPage() {
  const qc = useQueryClient();
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [editingPerms, setEditingPerms] = useState<Set<string> | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', label: '', description: '' });
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Queries
  const { data: rolesData, isLoading: loadingRoles } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: () => rolesApi.list(),
  });

  const { data: permsData } = useQuery({
    queryKey: ['admin-permissions'],
    queryFn: () => rolesApi.listPermissions(),
  });

  const roles: Role[] = (rolesData as any)?.data ?? [];
  const allPermissions: Permission[] = (permsData as any)?.data ?? [];
  const permGroups: Record<string, Permission[]> = (permsData as any)?.grouped ?? {};

  // Build groups from flat list if grouped not available
  const groups: Record<string, Permission[]> = Object.keys(permGroups).length > 0
    ? permGroups
    : allPermissions.reduce<Record<string, Permission[]>>((acc, p) => {
        if (!acc[p.group]) acc[p.group] = [];
        acc[p.group].push(p);
        return acc;
      }, {});

  const activeRole = roles.find(r => r.id === selectedRole);

  const flash = (message: string, type: 'success' | 'error' = 'success') => {
    setMsg(message);
    setMsgType(type);
    setTimeout(() => setMsg(''), 4000);
  };

  // Mutations
  const seedMut = useMutation({
    mutationFn: () => rolesApi.seed(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-roles'] });
      qc.invalidateQueries({ queryKey: ['admin-permissions'] });
      flash('Default roles and permissions seeded successfully.');
    },
    onError: (err) => flash(err instanceof ApiError ? err.message : 'Seed failed.', 'error'),
  });

  const savePermsMut = useMutation({
    mutationFn: ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }) =>
      rolesApi.updatePermissions(roleId, permissionIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-roles'] });
      setEditingPerms(null);
      flash('Permissions updated.');
    },
    onError: (err) => flash(err instanceof ApiError ? err.message : 'Failed to update permissions.', 'error'),
  });

  const createRoleMut = useMutation({
    mutationFn: () => rolesApi.create({
      name: newRole.name.toUpperCase().replace(/\s+/g, '_'),
      label: newRole.label,
      description: newRole.description || undefined,
      permissionIds: [],
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-roles'] });
      setShowCreate(false);
      setNewRole({ name: '', label: '', description: '' });
      flash('Role created.');
    },
    onError: (err) => flash(err instanceof ApiError ? err.message : 'Failed to create role.', 'error'),
  });

  const updateRoleMut = useMutation({
    mutationFn: ({ id, label, description }: { id: string; label: string; description: string }) =>
      rolesApi.update(id, { label, description: description || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-roles'] });
      setEditingRole(null);
      flash('Role updated.');
    },
    onError: (err) => flash(err instanceof ApiError ? err.message : 'Failed to update role.', 'error'),
  });

  const deleteRoleMut = useMutation({
    mutationFn: (id: string) => rolesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-roles'] });
      setSelectedRole(null);
      flash('Role deleted.');
    },
    onError: (err) => flash(err instanceof ApiError ? err.message : 'Failed to delete role.', 'error'),
  });

  const toggleGroup = (group: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      next.has(group) ? next.delete(group) : next.add(group);
      return next;
    });
  };

  const startEditingPerms = (role: Role) => {
    setSelectedRole(role.id);
    setEditingPerms(new Set(role.permissions.map(p => p.id)));
  };

  const togglePerm = (permId: string) => {
    if (!editingPerms) return;
    const next = new Set(editingPerms);
    next.has(permId) ? next.delete(permId) : next.add(permId);
    setEditingPerms(next);
  };

  const startEditingRole = (role: Role) => {
    setEditingRole(role.id);
    setEditLabel(role.label);
    setEditDesc(role.description ?? '');
  };

  if (loadingRoles) {
    return <div className="card text-center py-16 text-gray-400">Loading roles…</div>;
  }

  const noData = roles.length === 0 && allPermissions.length === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield size={24} className="text-dti-blue" />
            Roles & Permissions
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{roles.length} roles configured</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => seedMut.mutate()}
            disabled={seedMut.isPending}
            className="btn-secondary text-sm inline-flex items-center gap-1.5"
            title="Re-initialize default roles and permissions"
          >
            <RefreshCw size={14} className={seedMut.isPending ? 'animate-spin' : ''} />
            {seedMut.isPending ? 'Seeding…' : 'Seed Defaults'}
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary text-sm inline-flex items-center gap-1.5"
          >
            <Plus size={14} /> Create Role
          </button>
        </div>
      </div>

      {/* Flash message */}
      {msg && (
        <div className={`text-sm rounded-lg px-4 py-3 flex items-center justify-between ${
          msgType === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'
        }`}>
          <span>{msg}</span>
          <button onClick={() => setMsg('')}><X size={14} /></button>
        </div>
      )}

      {/* Empty state */}
      {noData && (
        <div className="card text-center py-16">
          <Shield size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">No Roles Configured</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
            Initialize the default roles and permissions to get started. This will create the standard DTI EMS roles
            (Participant, Event Organizer, Program Manager, System Admin, Super Admin) with appropriate permissions.
          </p>
          <button
            onClick={() => seedMut.mutate()}
            disabled={seedMut.isPending}
            className="btn-primary inline-flex items-center gap-2"
          >
            <RefreshCw size={16} className={seedMut.isPending ? 'animate-spin' : ''} />
            {seedMut.isPending ? 'Seeding…' : 'Seed Default Roles & Permissions'}
          </button>
        </div>
      )}

      {/* Create Role form */}
      {showCreate && (
        <div className="card border-2 border-dashed border-blue-300 bg-blue-50/30 space-y-3">
          <h3 className="font-semibold text-blue-800">Create New Role</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Role Name (uppercase, e.g. CONTENT_MANAGER)</label>
              <input
                value={newRole.name}
                onChange={e => setNewRole(f => ({ ...f, name: e.target.value.toUpperCase().replace(/[^A-Z_]/g, '') }))}
                className="input font-mono"
                placeholder="CUSTOM_ROLE"
              />
            </div>
            <div>
              <label className="label">Display Label</label>
              <input
                value={newRole.label}
                onChange={e => setNewRole(f => ({ ...f, label: e.target.value }))}
                className="input"
                placeholder="Content Manager"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <input
                value={newRole.description}
                onChange={e => setNewRole(f => ({ ...f, description: e.target.value }))}
                className="input"
                placeholder="Brief description of this role's purpose…"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => createRoleMut.mutate()}
              disabled={createRoleMut.isPending || !newRole.name || !newRole.label}
              className="btn-primary text-sm"
            >
              {createRoleMut.isPending ? 'Creating…' : 'Create Role'}
            </button>
            <button onClick={() => setShowCreate(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Roles list */}
      {roles.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Role cards */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Roles</h3>
            {roles.map(role => (
              <button
                key={role.id}
                onClick={() => {
                  setSelectedRole(role.id);
                  setEditingPerms(null);
                  setEditingRole(null);
                }}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedRole === role.id
                    ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900 text-sm">{role.label}</h4>
                      {role.isSystem && (
                        <Lock size={12} className="text-gray-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] font-mono text-gray-400 mt-0.5">{role.name}</p>
                    {role.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{role.description}</p>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full shrink-0">
                    {role.permissions.length}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Right: Permission matrix for selected role */}
          <div className="lg:col-span-2">
            {!activeRole ? (
              <div className="card text-center py-16 text-gray-400">
                <Shield size={32} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Select a role to view and manage its permissions</p>
              </div>
            ) : (
              <div className="card space-y-4">
                {/* Role header */}
                <div className="flex items-start justify-between gap-3">
                  {editingRole === activeRole.id ? (
                    <div className="flex-1 space-y-2">
                      <input
                        value={editLabel}
                        onChange={e => setEditLabel(e.target.value)}
                        className="input text-lg font-bold"
                      />
                      <input
                        value={editDesc}
                        onChange={e => setEditDesc(e.target.value)}
                        className="input text-sm"
                        placeholder="Description…"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateRoleMut.mutate({ id: activeRole.id, label: editLabel, description: editDesc })}
                          disabled={updateRoleMut.isPending}
                          className="btn-primary text-sm inline-flex items-center gap-1"
                        >
                          <Save size={13} /> Save
                        </button>
                        <button onClick={() => setEditingRole(null)} className="btn-secondary text-sm">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-gray-900">{activeRole.label}</h2>
                        <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{activeRole.name}</span>
                        {activeRole.isSystem && (
                          <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
                            <Lock size={9} /> System
                          </span>
                        )}
                      </div>
                      {activeRole.description && (
                        <p className="text-sm text-gray-500 mt-1">{activeRole.description}</p>
                      )}
                    </div>
                  )}

                  {editingRole !== activeRole.id && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => startEditingRole(activeRole)}
                        className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-lg transition-colors"
                        title="Edit role info"
                      >
                        <Pencil size={14} />
                      </button>
                      {editingPerms ? (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => savePermsMut.mutate({ roleId: activeRole.id, permissionIds: Array.from(editingPerms) })}
                            disabled={savePermsMut.isPending}
                            className="btn-primary text-sm inline-flex items-center gap-1"
                          >
                            <Save size={13} /> {savePermsMut.isPending ? 'Saving…' : 'Save Permissions'}
                          </button>
                          <button onClick={() => setEditingPerms(null)} className="btn-secondary text-sm">Cancel</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditingPerms(activeRole)}
                          className="btn-secondary text-sm inline-flex items-center gap-1"
                        >
                          <Pencil size={13} /> Edit Permissions
                        </button>
                      )}
                      {!activeRole.isSystem && (
                        <button
                          onClick={() => { if (confirm(`Delete role "${activeRole.label}"? This cannot be undone.`)) deleteRoleMut.mutate(activeRole.id); }}
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete role"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Permissions by group */}
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Permissions ({activeRole.permissions.length} of {allPermissions.length})
                  </p>

                  {Object.entries(groups).map(([group, perms]) => {
                    const isCollapsed = collapsedGroups.has(group);
                    const assignedCount = perms.filter(p =>
                      editingPerms ? editingPerms.has(p.id) : activeRole.permissions.some(rp => rp.id === p.id)
                    ).length;
                    const allChecked = assignedCount === perms.length;

                    return (
                      <div key={group} className={`rounded-lg border overflow-hidden ${GROUP_COLORS[group] ?? 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                        <button
                          onClick={() => toggleGroup(group)}
                          className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold"
                        >
                          <div className="flex items-center gap-2">
                            {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                            {group}
                          </div>
                          <span className="text-xs font-medium opacity-75">
                            {assignedCount}/{perms.length}
                          </span>
                        </button>

                        {!isCollapsed && (
                          <div className="bg-white border-t px-1 py-1">
                            {editingPerms && (
                              <button
                                onClick={() => {
                                  const next = new Set(editingPerms);
                                  if (allChecked) {
                                    perms.forEach(p => next.delete(p.id));
                                  } else {
                                    perms.forEach(p => next.add(p.id));
                                  }
                                  setEditingPerms(next);
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-1"
                              >
                                {allChecked ? 'Deselect All' : 'Select All'}
                              </button>
                            )}
                            {perms.map(perm => {
                              const isActive = editingPerms
                                ? editingPerms.has(perm.id)
                                : activeRole.permissions.some(rp => rp.id === perm.id);

                              return (
                                <label
                                  key={perm.id}
                                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer ${
                                    editingPerms
                                      ? 'hover:bg-gray-50'
                                      : ''
                                  }`}
                                >
                                  {editingPerms ? (
                                    <input
                                      type="checkbox"
                                      checked={isActive}
                                      onChange={() => togglePerm(perm.id)}
                                      className="h-4 w-4 accent-dti-blue rounded"
                                    />
                                  ) : (
                                    <span className={`shrink-0 ${isActive ? 'text-green-500' : 'text-gray-300'}`}>
                                      {isActive ? <Check size={16} /> : <X size={16} />}
                                    </span>
                                  )}
                                  <div className="min-w-0">
                                    <p className={`text-sm ${isActive ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                                      {perm.label}
                                    </p>
                                    <p className="text-[10px] font-mono text-gray-400">{perm.code}</p>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
