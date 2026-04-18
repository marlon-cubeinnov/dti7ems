import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi, ApiError } from '@/lib/api';
import { AlertCircle, CheckCircle2, Building2 } from 'lucide-react';

export function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [form, setForm] = useState({
    password: '',
    confirmPassword: '',
    dpaConsentGiven: false as true | false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.password.length < 10) e['password'] = 'Password must be at least 10 characters';
    if (!/[A-Z]/.test(form.password)) e['password'] = 'Password must contain an uppercase letter';
    if (!/[0-9]/.test(form.password)) e['password'] = (e['password'] ? e['password'] + ' and ' : '') + 'a number';
    if (form.password !== form.confirmPassword) e['confirmPassword'] = 'Passwords do not match';
    if (!form.dpaConsentGiven) e['dpa'] = 'You must agree to the data privacy policy';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const mutation = useMutation({
    mutationFn: () =>
      authApi.acceptInvite({
        token,
        password: form.password,
        dpaConsentGiven: true,
      }),
    onSuccess: () => setSuccess(true),
    onError: (err) => {
      if (err instanceof ApiError) setErrors({ api: err.message });
      else setErrors({ api: 'Failed to accept invitation. The link may be expired.' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) mutation.mutate();
  };

  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="card w-full max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Invitation Link</h2>
          <p className="text-gray-600 text-sm mb-6">
            This invitation link is missing or invalid. Please check your email for the correct link.
          </p>
          <Link to="/login" className="btn-primary">Go to Login</Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="card w-full max-w-md text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Account Activated!</h2>
          <p className="text-gray-600 text-sm mb-6">
            Your password has been set and your account is now active., You can now log in.
          </p>
          <Link to="/login" className="btn-primary">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="card">
        <div className="flex items-center gap-3 mb-1">
          <Building2 className="w-6 h-6 text-dti-blue" />
          <h1 className="text-2xl font-bold text-gray-900">Accept Invitation</h1>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          You've been invited to join an organization on DTI Region 7 EMS. Set your password below to activate your account.
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="label">Password *</label>
            <input
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={`input ${errors['password'] ? 'border-red-400 focus:ring-red-200' : ''}`}
              placeholder="Min. 10 characters"
            />
            {errors['password'] && <p className="text-red-500 text-xs mt-1">{errors['password']}</p>}
          </div>

          <div>
            <label className="label">Confirm Password *</label>
            <input
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className={`input ${errors['confirmPassword'] ? 'border-red-400 focus:ring-red-200' : ''}`}
              placeholder="Repeat password"
            />
            {errors['confirmPassword'] && <p className="text-red-500 text-xs mt-1">{errors['confirmPassword']}</p>}
          </div>

          {/* DPA Consent */}
          <div className="bg-blue-50 rounded-card p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5 accent-dti-blue"
                checked={form.dpaConsentGiven === true}
                onChange={(e) => setForm({ ...form, dpaConsentGiven: e.target.checked as true })}
              />
              <span className="text-xs text-gray-700 leading-relaxed">
                <strong>Data Privacy Consent (RA 10173)</strong><br />
                I consent to the Department of Trade and Industry Region 7 collecting, storing, and
                processing my personal information for the purpose of managing my event participation,
                issuing certificates, and conducting post-event impact surveys. I understand I can
                withdraw consent at any time by contacting DTI Region 7.
              </span>
            </label>
            {errors['dpa'] && <p className="text-red-500 text-xs mt-2">{errors['dpa']}</p>}
          </div>

          {errors['api'] && (
            <div className="flex items-start gap-2 text-red-600 bg-red-50 rounded-input p-3 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errors['api']}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="btn-primary w-full py-3 text-base"
          >
            {mutation.isPending ? 'Activating account…' : 'Set Password & Activate'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-dti-blue font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
