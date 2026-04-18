import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi, enterpriseApi, ApiError } from '@/lib/api';
import type { UserProfile } from '@dti-ems/shared-types';
import { CheckCircle2, AlertCircle, Building2 } from 'lucide-react';

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
  'Construction & Real Estate',
  'Transportation & Logistics',
  'Financial Services',
  'Education & Training',
  'Other',
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
  isActive: boolean;
  enterprise: { id: string; businessName: string; industrySector: string; stage: string; isVerified: boolean };
}

function EnterpriseMembershipSection() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ businessName: '', industrySector: '' });
  const [createError, setCreateError] = useState('');

  const { data: membershipData, isLoading } = useQuery({
    queryKey: ['my-membership'],
    queryFn: () => enterpriseApi.getMyMembership(),
  });

  const membership = (membershipData as { data?: MembershipData | null })?.data;

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

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    if (!createForm.businessName.trim() || !createForm.industrySector) return;
    createMutation.mutate(createForm);
  };

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

      {membership ? (
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
      ) : (
        <>
          <p className="text-sm text-gray-500">
            Link your company to track enterprise-level training completion across team members.
          </p>

          {!showCreate ? (
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="btn-secondary text-sm"
            >
              Register a Company
            </button>
          ) : (
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
