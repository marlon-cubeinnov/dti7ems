import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi, enterpriseApi, ApiError } from '@/lib/api';
import type { UserProfile } from '@dti-ems/shared-types';
import { CheckCircle2, AlertCircle, Building2, Users, UserPlus, Clock, ChevronDown, ChevronUp, Trash2, Check, X as XIcon } from 'lucide-react';

const PH_REGIONS = [
  'NCR – National Capital Region',
  'CAR – Cordillera Administrative Region',
  'Region I – Ilocos Region',
  'Region II – Cagayan Valley',
  'Region III – Central Luzon',
  'Region IV-A – CALABARZON',
  'MIMAROPA Region',
  'Region V – Bicol Region',
  'Region VI – Western Visayas',
  'Region VII – Central Visayas',
  'Region VIII – Eastern Visayas',
  'Region IX – Zamboanga Peninsula',
  'Region X – Northern Mindanao',
  'Region XI – Davao Region',
  'Region XII – SOCCSKSARGEN',
  'NCR – Caraga Region',
  'BARMM – Bangsamoro Autonomous Region',
];

const INDUSTRY_SECTORS = [
  'Agriculture, Forestry & Fishing',
  'Food & Beverage Manufacturing',
  'Textile & Garments',
  'Retail & Wholesale Trade',
  'Tourism, Hospitality & Food Service',
  'Information Technology & BPO',
  'Health & Social Services',
  'Arts, Entertainment & Recreation',
  'Creative Industries',
  'Startup / Innovation Ecosystem',
  'Construction & Real Estate',
  'Transportation & Logistics',
  'Financial Services',
  'Education & Training',
  'Other',
];

const SEX_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
];

const AGE_BRACKET_OPTIONS = [
  { value: 'AGE_19_OR_LOWER', label: '19 or below' },
  { value: 'AGE_20_TO_34', label: '20 – 34' },
  { value: 'AGE_35_TO_49', label: '35 – 49' },
  { value: 'AGE_50_TO_64', label: '50 – 64' },
  { value: 'AGE_65_OR_HIGHER', label: '65 or above' },
];

const EMPLOYMENT_CATEGORY_OPTIONS = [
  { value: 'SELF_EMPLOYED', label: 'Self-employed' },
  { value: 'EMPLOYED_GOVT', label: 'Employed – Government' },
  { value: 'EMPLOYED_PRIVATE', label: 'Employed – Private' },
  { value: 'GENERAL_PUBLIC', label: 'General Public' },
];

const SOCIAL_CLASSIFICATION_OPTIONS = [
  { value: 'ABLED', label: 'Abled' },
  { value: 'PWD', label: 'Person with Disability (PWD)' },
  { value: 'FOUR_PS', label: '4Ps Beneficiary' },
  { value: 'YOUTH', label: 'Youth' },
  { value: 'SENIOR_CITIZEN', label: 'Senior Citizen' },
  { value: 'INDIGENOUS_PERSON', label: 'Indigenous Person' },
  { value: 'OFW', label: 'OFW' },
  { value: 'OTHERS', label: 'Others' },
];

const CLIENT_TYPE_OPTIONS = [
  { value: 'CITIZEN', label: 'Citizen' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'GOVERNMENT', label: 'Government' },
];

export function ProfilePage() {
  const qc = useQueryClient();
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState('');

  const { data: user, isLoading } = useQuery<UserProfile>({
    queryKey: ['me'],
    queryFn:  () => userApi.getMe().then((r) => r.data as UserProfile),
  });

  const [form, setForm] = useState<Partial<UserProfile>>({});

  // Merge server data once fetched
  const values = { ...user, ...form };
  const set = (field: keyof UserProfile, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const mutation = useMutation({
    mutationFn: (body: Partial<UserProfile>) => userApi.updateMe(body),
    onSuccess: (updated) => {
      qc.setQueryData(['me'], updated);
      setForm({});
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : 'Failed to save profile.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    mutation.mutate(form);
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="card h-16 bg-gray-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">
          Keep your information up to date so we can personalise your training recommendations.
        </p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 bg-green-50 text-green-700 rounded-input px-4 py-3 text-sm">
          <CheckCircle2 className="w-4 h-4" />
          Profile saved successfully.
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 rounded-input px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Personal Information */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Personal Information</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">First Name *</label>
              <input
                className="input"
                value={values.firstName ?? ''}
                onChange={(e) => set('firstName', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Last Name *</label>
              <input
                className="input"
                value={values.lastName ?? ''}
                onChange={(e) => set('lastName', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Middle Name</label>
            <input
              className="input"
              value={values.middleName ?? ''}
              onChange={(e) => set('middleName', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Name Suffix</label>
              <input
                className="input"
                placeholder="Jr., Sr., III, etc."
                value={(values as any).nameSuffix ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, nameSuffix: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Sex</label>
              <select
                className="input"
                value={(values as any).sex ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, sex: e.target.value || null }))}
              >
                <option value="">Select…</option>
                {SEX_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Age Bracket</label>
              <select
                className="input"
                value={(values as any).ageBracket ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, ageBracket: e.target.value || null }))}
              >
                <option value="">Select…</option>
                {AGE_BRACKET_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Client Type</label>
              <select
                className="input"
                value={(values as any).clientType ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, clientType: e.target.value || null }))}
              >
                <option value="">Select…</option>
                {CLIENT_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Employment Category</label>
              <select
                className="input"
                value={(values as any).employmentCategory ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, employmentCategory: e.target.value || null }))}
              >
                <option value="">Select…</option>
                {EMPLOYMENT_CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Social Classification</label>
              <select
                className="input"
                value={(values as any).socialClassification ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, socialClassification: e.target.value || null }))}
              >
                <option value="">Select…</option>
                {SOCIAL_CLASSIFICATION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Mobile Number</label>
            <input
              className="input"
              type="tel"
              placeholder="+63 9XX XXX XXXX"
              value={values.mobileNumber ?? ''}
              onChange={(e) => set('mobileNumber', e.target.value)}
            />
          </div>

          <div>
            <label className="label">Email Address</label>
            <input
              className="input bg-gray-50 cursor-not-allowed"
              value={user?.email ?? ''}
              readOnly
              disabled
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed here. Contact support if needed.</p>
          </div>
        </div>

        {/* Address */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Address</h2>

          <div>
            <label className="label">Region</label>
            <select
              className="input"
              value={values.region ?? ''}
              onChange={(e) => set('region', e.target.value)}
            >
              <option value="">Select region…</option>
              {PH_REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Province</label>
              <input
                className="input"
                value={values.province ?? ''}
                onChange={(e) => set('province', e.target.value)}
              />
            </div>
            <div>
              <label className="label">City / Municipality</label>
              <input
                className="input"
                value={values.cityMunicipality ?? ''}
                onChange={(e) => set('cityMunicipality', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label">Barangay</label>
            <input
              className="input"
              value={values.barangay ?? ''}
              onChange={(e) => set('barangay', e.target.value)}
            />
          </div>
        </div>

        {/* Professional */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Professional Information</h2>

          <div>
            <label className="label">Job Title / Position</label>
            <input
              className="input"
              value={values.jobTitle ?? ''}
              onChange={(e) => set('jobTitle', e.target.value)}
            />
          </div>

          <div>
            <label className="label">Industry / Business Sector</label>
            <select
              className="input"
              value={values.industryClassification ?? ''}
              onChange={(e) => set('industryClassification', e.target.value)}
            >
              <option value="">Select sector…</option>
              {INDUSTRY_SECTORS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Enterprise Membership */}
        <EnterpriseMembershipSection />

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => setForm({})} className="btn-ghost">
            Discard Changes
          </button>
          <button type="submit" disabled={mutation.isPending} className="btn-primary px-8">
            {mutation.isPending ? 'Saving…' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Enterprise Membership Section ─────────────────────────────────────────

interface MembershipData {
  id: string;
  role: string;
  status: string;
  isActive: boolean;
  enterprise: { id: string; businessName: string; industrySector: string; stage: string; isVerified: boolean };
}

interface MemberRow {
  id: string;
  role: string;
  status: string;
  user: { id: string; email: string; firstName?: string | null; lastName?: string | null };
}

interface PublicEnterprise {
  id: string;
  businessName: string;
  industrySector: string;
  stage: string;
}

function EnterpriseMembershipSection() {
  const qc = useQueryClient();

  // ── create-new state ──────────────────────────────────────────────────────
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ businessName: '', industrySector: '' });
  const [createError, setCreateError] = useState('');

  // ── join-existing state ───────────────────────────────────────────────────
  const [showJoin, setShowJoin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<PublicEnterprise[]>([]);
  const [searching, setSearching] = useState(false);
  const [joinError, setJoinError] = useState('');
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── manage-team state ─────────────────────────────────────────────────────
  const [showTeam, setShowTeam] = useState(false);
  const [addEmail, setAddEmail] = useState('');
  const [addRole, setAddRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER');
  const [addError, setAddError] = useState('');
  const [inviteForm, setInviteForm] = useState({ email: '', firstName: '', lastName: '', jobTitle: '' });
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  // ── membership query ──────────────────────────────────────────────────────
  const { data: membershipData, isLoading } = useQuery({
    queryKey: ['my-membership'],
    queryFn: () => enterpriseApi.getMyMembership(),
  });

  const membership = (membershipData as { data?: MembershipData | null })?.data;
  const enterpriseId = membership?.enterprise?.id;
  const isOwnerOrAdmin = membership?.role === 'OWNER' || membership?.role === 'ADMIN';
  const isPending = membership?.status === 'PENDING';

  // Members query (only load when team panel is open and user is owner/admin)
  const { data: membersData, refetch: refetchMembers } = useQuery({
    queryKey: ['enterprise-members', enterpriseId],
    queryFn: () => enterpriseApi.getMembers(enterpriseId!),
    enabled: !!enterpriseId && isOwnerOrAdmin && showTeam,
  });
  const members = ((membersData as { data?: MemberRow[] })?.data ?? []).filter(m => m.status === 'ACTIVE');

  // Join requests query
  const { data: joinReqData, refetch: refetchRequests } = useQuery({
    queryKey: ['enterprise-join-requests', enterpriseId],
    queryFn: () => enterpriseApi.getJoinRequests(enterpriseId!),
    enabled: !!enterpriseId && isOwnerOrAdmin && showTeam,
  });
  const joinRequests = (joinReqData as { data?: MemberRow[] })?.data ?? [];

  // ── mutations ─────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => enterpriseApi.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-membership'] });
      setShowCreate(false);
      setCreateForm({ businessName: '', industrySector: '' });
    },
    onError: (err) => {
      setCreateError(err instanceof ApiError ? err.message : 'Failed to register enterprise.');
    },
  });

  const joinMutation = useMutation({
    mutationFn: (id: string) => enterpriseApi.joinRequest(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-membership'] });
      setShowJoin(false);
      setSearchTerm('');
      setSearchResults([]);
    },
    onError: (err) => {
      setJoinError(err instanceof ApiError ? err.message : 'Failed to submit join request.');
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: () => enterpriseApi.addMember(enterpriseId!, { email: addEmail, role: addRole }),
    onSuccess: () => {
      refetchMembers();
      setAddEmail('');
      setAddError('');
    },
    onError: (err) => {
      setAddError(err instanceof ApiError ? err.message : 'Failed to add member.');
    },
  });

  const inviteMutation = useMutation({
    mutationFn: () => enterpriseApi.inviteEmployee(enterpriseId!, inviteForm),
    onSuccess: () => {
      refetchMembers();
      setInviteForm({ email: '', firstName: '', lastName: '', jobTitle: '' });
      setInviteSuccess('Invitation sent!');
      setInviteError('');
      setTimeout(() => setInviteSuccess(''), 4000);
    },
    onError: (err) => {
      setInviteError(err instanceof ApiError ? err.message : 'Failed to send invite.');
    },
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => enterpriseApi.removeMember(enterpriseId!, userId),
    onSuccess: () => refetchMembers(),
  });

  const respondMutation = useMutation({
    mutationFn: ({ membershipId, action }: { membershipId: string; action: 'APPROVE' | 'REJECT' }) =>
      enterpriseApi.respondToJoinRequest(enterpriseId!, membershipId, action),
    onSuccess: () => {
      refetchRequests();
      refetchMembers();
    },
  });

  // ── search helpers ────────────────────────────────────────────────────────
  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setJoinError('');
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (val.length < 2) { setSearchResults([]); return; }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await enterpriseApi.searchPublic(val) as { data?: PublicEnterprise[] };
        setSearchResults(res.data ?? []);
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    if (!createForm.businessName.trim() || !createForm.industrySector) return;
    createMutation.mutate(createForm);
  };

  // ── loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-900">Company / Enterprise</h2>
        <div className="h-12 bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="card space-y-4">
      <h2 className="font-semibold text-gray-900 flex items-center gap-2">
        <Building2 className="w-4 h-4 text-dti-blue" />
        Company / Enterprise
      </h2>

      {/* ── PENDING STATE ──────────────────────────────────────────────── */}
      {isPending && membership && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-yellow-700 font-medium">
            <Clock className="w-4 h-4" />
            Join Request Pending
          </div>
          <p className="text-sm text-gray-700 font-medium">{membership.enterprise.businessName}</p>
          <p className="text-xs text-gray-500">
            Your request to join this company is awaiting approval from the company owner or administrator.
          </p>
        </div>
      )}

      {/* ── ACTIVE MEMBERSHIP ─────────────────────────────────────────── */}
      {!isPending && membership && (
        <>
          <div className="bg-blue-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-medium text-gray-900">{membership.enterprise.businessName}</p>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                {membership.role}
              </span>
            </div>
            <p className="text-xs text-gray-500">{membership.enterprise.industrySector}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="px-2 py-0.5 bg-white rounded-full">{membership.enterprise.stage.replace(/_/g, ' ')}</span>
              {membership.enterprise.isVerified && (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Your event registrations will be automatically linked to this company.
            </p>
          </div>

          {/* ── MANAGE TEAM (owner/admin only) ────────────────────────── */}
          {isOwnerOrAdmin && (
            <div>
              <button
                type="button"
                onClick={() => setShowTeam(!showTeam)}
                className="flex items-center gap-2 text-sm font-medium text-dti-blue hover:underline"
              >
                <Users className="w-4 h-4" />
                Manage Team
                {showTeam ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {showTeam && (
                <div className="mt-3 space-y-5 bg-gray-50 rounded-lg p-4">

                  {/* Pending join requests */}
                  {joinRequests.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Pending Requests ({joinRequests.length})
                      </p>
                      <div className="space-y-2">
                        {joinRequests.map(req => (
                          <div key={req.id} className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded px-3 py-2">
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {req.user.firstName} {req.user.lastName}
                              </p>
                              <p className="text-xs text-gray-500">{req.user.email}</p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => respondMutation.mutate({ membershipId: req.id, action: 'APPROVE' })}
                                className="flex items-center gap-1 text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                              >
                                <Check className="w-3 h-3" /> Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => respondMutation.mutate({ membershipId: req.id, action: 'REJECT' })}
                                className="flex items-center gap-1 text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200"
                              >
                                <XIcon className="w-3 h-3" /> Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Current members */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Members ({members.length})
                    </p>
                    {members.length === 0 ? (
                      <p className="text-xs text-gray-400">No members yet.</p>
                    ) : (
                      <div className="space-y-1">
                        {members.map(m => (
                          <div key={m.id} className="flex items-center justify-between bg-white border border-gray-100 rounded px-3 py-2">
                            <div>
                              <p className="text-sm text-gray-800">
                                {m.user.firstName} {m.user.lastName}
                                <span className="ml-2 text-[10px] text-gray-400 font-medium uppercase">{m.role}</span>
                              </p>
                              <p className="text-xs text-gray-400">{m.user.email}</p>
                            </div>
                            {m.role !== 'OWNER' && (
                              <button
                                type="button"
                                onClick={() => removeMutation.mutate(m.user.id)}
                                className="text-gray-400 hover:text-red-500 ml-2"
                                title="Remove member"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add existing user by email */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Add Existing User</p>
                    {addError && (
                      <div className="flex items-center gap-1 text-red-600 text-xs mb-2">
                        <AlertCircle className="w-3 h-3" /> {addError}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        className="input flex-1 text-sm"
                        type="email"
                        placeholder="user@email.com"
                        value={addEmail}
                        onChange={(e) => setAddEmail(e.target.value)}
                      />
                      <select
                        className="input w-28 text-sm"
                        value={addRole}
                        onChange={(e) => setAddRole(e.target.value as 'MEMBER' | 'ADMIN')}
                      >
                        <option value="MEMBER">Member</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => addMemberMutation.mutate()}
                        disabled={!addEmail || addMemberMutation.isPending}
                        className="btn-primary text-sm px-3"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Invite new employee */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Invite New Employee</p>
                    <p className="text-xs text-gray-400 mb-2">
                      Creates a new account and sends them an invitation email.
                    </p>
                    {inviteError && (
                      <div className="flex items-center gap-1 text-red-600 text-xs mb-2">
                        <AlertCircle className="w-3 h-3" /> {inviteError}
                      </div>
                    )}
                    {inviteSuccess && (
                      <div className="flex items-center gap-1 text-green-600 text-xs mb-2">
                        <CheckCircle2 className="w-3 h-3" /> {inviteSuccess}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        className="input text-sm"
                        placeholder="First name *"
                        value={inviteForm.firstName}
                        onChange={(e) => setInviteForm(f => ({ ...f, firstName: e.target.value }))}
                      />
                      <input
                        className="input text-sm"
                        placeholder="Last name *"
                        value={inviteForm.lastName}
                        onChange={(e) => setInviteForm(f => ({ ...f, lastName: e.target.value }))}
                      />
                      <input
                        className="input text-sm col-span-2"
                        type="email"
                        placeholder="Email address *"
                        value={inviteForm.email}
                        onChange={(e) => setInviteForm(f => ({ ...f, email: e.target.value }))}
                      />
                      <input
                        className="input text-sm col-span-2"
                        placeholder="Job title (optional)"
                        value={inviteForm.jobTitle}
                        onChange={(e) => setInviteForm(f => ({ ...f, jobTitle: e.target.value }))}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => inviteMutation.mutate()}
                      disabled={!inviteForm.email || !inviteForm.firstName || !inviteForm.lastName || inviteMutation.isPending}
                      className="btn-secondary text-sm mt-2 flex items-center gap-1"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      {inviteMutation.isPending ? 'Sending…' : 'Send Invitation'}
                    </button>
                  </div>

                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── NO MEMBERSHIP — show options ──────────────────────────────── */}
      {!membership && (
        <>
          <p className="text-sm text-gray-500">
            Link your company to track enterprise-level training completion across team members.
          </p>

          {!showCreate && !showJoin && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowJoin(true)}
                className="btn-primary text-sm flex items-center gap-1"
              >
                <Building2 className="w-4 h-4" />
                Find &amp; Join a Company
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="btn-secondary text-sm"
              >
                Register a New Company
              </button>
            </div>
          )}

          {/* ── Join existing company ───────────────────────────────── */}
          {showJoin && (
            <div className="space-y-3 bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700">Search for your company</p>
              {joinError && (
                <div className="flex items-center gap-1 text-red-600 text-xs">
                  <AlertCircle className="w-3 h-3" /> {joinError}
                </div>
              )}
              <input
                className="input"
                placeholder="Type company name…"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                autoFocus
              />
              {searching && <p className="text-xs text-gray-400">Searching…</p>}
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map(ent => (
                    <div key={ent.id} className="flex items-center justify-between bg-white border border-gray-200 rounded px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{ent.businessName}</p>
                        <p className="text-xs text-gray-400">{ent.industrySector} · {ent.stage.replace(/_/g, ' ')}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => joinMutation.mutate(ent.id)}
                        disabled={joinMutation.isPending}
                        className="btn-primary text-xs px-3 py-1.5"
                      >
                        Request to Join
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {searchTerm.length >= 2 && !searching && searchResults.length === 0 && (
                <p className="text-xs text-gray-400">No matching companies found. Try registering it instead.</p>
              )}
              <button
                type="button"
                onClick={() => { setShowJoin(false); setSearchTerm(''); setSearchResults([]); }}
                className="btn-ghost text-sm"
              >
                Cancel
              </button>
            </div>
          )}

          {/* ── Register new company ────────────────────────────────── */}
          {showCreate && (
            <div className="space-y-3 bg-gray-50 rounded-lg p-4">
              {createError && (
                <div className="flex items-center gap-2 text-red-600 text-xs">
                  <AlertCircle className="w-3 h-3" /> {createError}
                </div>
              )}
              <div>
                <label className="label">Business Name *</label>
                <input
                  className="input"
                  value={createForm.businessName}
                  onChange={(e) => setCreateForm((f) => ({ ...f, businessName: e.target.value }))}
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <label className="label">Industry Sector *</label>
                <select
                  className="input"
                  value={createForm.industrySector}
                  onChange={(e) => setCreateForm((f) => ({ ...f, industrySector: e.target.value }))}
                >
                  <option value="">Select sector…</option>
                  {INDUSTRY_SECTORS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                  className="btn-primary text-sm px-4"
                >
                  {createMutation.isPending ? 'Creating…' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="btn-ghost text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
