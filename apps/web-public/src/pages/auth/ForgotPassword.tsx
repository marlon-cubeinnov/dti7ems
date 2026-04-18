import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi, ApiError } from '@/lib/api';
import { CheckCircle2 } from 'lucide-react';

export function ForgotPasswordPage() {
  const [email, setEmail]   = useState('');
  const [error, setError]   = useState('');
  const [sent, setSent]     = useState(false);

  const mutation = useMutation({
    mutationFn: () => authApi.forgotPassword(email),
    onSuccess: () => setSent(true),
    onError: (err) => setError(err instanceof ApiError ? err.message : 'Request failed.'),
  });

  if (sent) return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card w-full max-w-sm text-center">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h2 className="font-bold text-xl mb-2">Check your email</h2>
        <p className="text-gray-500 text-sm">If an account exists for {email}, we've sent a password reset link.</p>
        <Link to="/login" className="btn-outline mt-6">Back to Login</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-1">Forgot password?</h1>
        <p className="text-sm text-gray-500 mb-6">Enter your email and we'll send a reset link.</p>
        <form onSubmit={(e) => { e.preventDefault(); setError(''); mutation.mutate(); }} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={mutation.isPending} className="btn-primary w-full py-2.5">
            {mutation.isPending ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>
        <Link to="/login" className="block text-center text-sm text-dti-blue mt-4 hover:underline">Back to Login</Link>
      </div>
    </div>
  );
}
