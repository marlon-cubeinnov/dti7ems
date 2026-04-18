import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { authApi, ApiError } from '@/lib/api';
import { Shield } from 'lucide-react';

const ADMIN_ROLES = ['SYSTEM_ADMIN', 'SUPER_ADMIN'];

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.login({ email, password });
      const { accessToken, user } = res.data!;

      if (!ADMIN_ROLES.includes(user.role)) {
        setError('Access denied. Only administrators can log in here.');
        setLoading(false);
        return;
      }

      login(accessToken, {
        id: user.id,
        email: user.email,
        role: user.role as any,
        firstName: user.firstName,
        lastName: user.lastName,
      });
      navigate('/');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Unable to connect. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-dti-blue mb-4">
            <Shield className="text-dti-orange" size={28} />
          </div>
          <h1 className="text-xl font-bold text-gray-900">DTI EMS Admin Console</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in with your admin credentials</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-card space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dti-blue focus:border-transparent"
              placeholder="admin@dti.gov.ph"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dti-blue focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-dti-blue text-white py-2.5 rounded-lg text-sm font-medium hover:bg-dti-blue-dark disabled:opacity-50 transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">DTI Region 7 — Central Visayas</p>
      </div>
    </div>
  );
}
