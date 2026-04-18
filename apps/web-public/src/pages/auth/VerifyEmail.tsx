import { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authApi, ApiError } from '@/lib/api';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token    = params.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const calledRef = useRef(false);

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('No verification token found in the link.'); return; }
    if (calledRef.current) return; // Prevent React strict-mode double invocation
    calledRef.current = true;
    authApi.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error');
        setMessage(err instanceof ApiError ? err.message : 'Verification failed.');
      });
  }, [token]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card w-full max-w-sm text-center">
        {status === 'loading' && (
          <><Loader2 className="w-10 h-10 text-dti-blue mx-auto mb-4 animate-spin" /><p>Verifying your email…</p></>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="font-bold text-xl mb-2">Email Verified!</h2>
            <p className="text-gray-500 text-sm mb-6">Your account is now active. You can log in.</p>
            <Link to="/login" className="btn-primary">Go to Login</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="font-bold text-xl mb-2">Verification Failed</h2>
            <p className="text-gray-500 text-sm mb-6">{message || 'The link may have expired. Please register again or contact support.'}</p>
            <Link to="/register" className="btn-outline">Back to Register</Link>
          </>
        )}
      </div>
    </div>
  );
}
