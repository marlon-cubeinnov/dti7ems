import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi, ApiError } from '@/lib/api';

export function ResetPasswordPage() {
  const [params]   = useSearchParams();
  const token      = params.get('token') ?? '';
  const navigate   = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');

  const mutation = useMutation({
    mutationFn: () => authApi.resetPassword(token, password),
    onSuccess: () => navigate('/login', { state: { passwordReset: true } }),
    onError: (err) => setError(err instanceof ApiError ? err.message : 'Reset failed.'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 10) { setError('Password must be at least 10 characters.'); return; }
    setError('');
    mutation.mutate();
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-1">Set new password</h1>
        <p className="text-sm text-gray-500 mb-6">Choose a strong password for your account.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">New Password</label>
            <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Min. 10 characters" />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input type="password" className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={mutation.isPending} className="btn-primary w-full py-2.5">
            {mutation.isPending ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>
        <Link to="/login" className="block text-center text-sm text-dti-blue mt-4 hover:underline">Back to Login</Link>
      </div>
    </div>
  );
}
