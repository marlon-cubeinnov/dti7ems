import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';

const ADMIN_ROLES = ['SYSTEM_ADMIN', 'SUPER_ADMIN'];

export function AdminGuard() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user && !ADMIN_ROLES.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You must be a System Admin or Super Admin to access this console.</p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
