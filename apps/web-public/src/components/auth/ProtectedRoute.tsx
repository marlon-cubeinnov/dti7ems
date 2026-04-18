import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import type { UserRole } from '@dti-ems/shared-types';

interface Props {
  roles?: UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({ roles, redirectTo = '/login' }: Props) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to={redirectTo} replace />;

  if (roles && user && !roles.includes(user.role)) {
    // Authenticated but wrong role — send to their home
    const isOrganizer = ['PROGRAM_MANAGER', 'EVENT_ORGANIZER', 'DIVISION_CHIEF', 'REGIONAL_DIRECTOR', 'PROVINCIAL_DIRECTOR', 'SYSTEM_ADMIN', 'SUPER_ADMIN'].includes(user.role);
    return <Navigate to={isOrganizer ? '/organizer/dashboard' : '/dashboard'} replace />;
  }

  return <Outlet />;
}
