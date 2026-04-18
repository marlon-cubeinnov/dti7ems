import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { authApi } from '@/lib/api';
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarDays,
  ScrollText,
  BarChart3,
  LogOut,
  Shield,
  Menu,
  X,
} from 'lucide-react';

const NAV = [
  { to: '/',            label: 'Dashboard',    icon: LayoutDashboard, end: true },
  { to: '/users',       label: 'Users',        icon: Users },
  { to: '/enterprises', label: 'Enterprises',  icon: Building2 },
  { to: '/events',      label: 'Events',       icon: CalendarDays },
  { to: '/audit-logs',  label: 'Audit Logs',   icon: ScrollText },
  { to: '/reports',     label: 'Reports',      icon: BarChart3 },
];

export function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* best effort */ }
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-dti-blue shadow-md sticky top-0 z-50">
        <div className="px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-blue-200 hover:text-white"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link to="/" className="flex items-center gap-2">
              <Shield size={22} className="text-dti-orange" />
              <span className="text-white font-bold text-sm">DTI EMS Admin</span>
            </Link>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-blue-200 text-xs hidden sm:block">
              {user?.firstName} {user?.lastName}
              <span className="ml-2 bg-blue-700 text-blue-100 text-[10px] px-1.5 py-0.5 rounded">
                {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'System Admin'}
              </span>
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-blue-200 hover:text-white text-xs transition-colors"
            >
              <LogOut size={13} /> Log out
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-14 left-0 z-40 w-56 bg-white border-r border-gray-200
            transform transition-transform lg:translate-x-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <nav className="p-3 space-y-0.5">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-dti-blue text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
