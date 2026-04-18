import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi, ApiError } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { AlertCircle } from 'lucide-react';

export function LoginPage() {
  const navigate  = useNavigate();
  const { login } = useAuthStore();

  const [form, setForm]   = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: () => authApi.login(form),
    onSuccess: (res) => {
      const d = res.data as { accessToken: string; user: { id: string; email: string; role: import('@dti-ems/shared-types').UserRole; firstName: string; lastName: string } };
      login(d.accessToken, d.user);
      const isOrganizer = ['PROGRAM_MANAGER', 'EVENT_ORGANIZER', 'DIVISION_CHIEF', 'REGIONAL_DIRECTOR', 'PROVINCIAL_DIRECTOR', 'SYSTEM_ADMIN', 'SUPER_ADMIN'].includes(d.user.role);
      navigate(isOrganizer ? '/organizer/dashboard' : '/dashboard');
    },
    onError: (err) => {
      if (err instanceof ApiError) setError(err.message);
      else setError('Login failed. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    mutation.mutate();
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your DTI Region 7 EMS account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="you@example.com"
              autoComplete="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="label" htmlFor="password">Password</label>
              <Link to="/forgot-password" className="text-xs text-dti-blue hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              className="input"
              placeholder="••••••••••"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 text-red-600 bg-red-50 rounded-input p-3 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="btn-primary w-full py-3 text-base"
          >
            {mutation.isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-dti-blue font-medium hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
