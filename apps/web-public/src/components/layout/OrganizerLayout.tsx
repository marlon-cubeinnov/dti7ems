import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { authApi } from '@/lib/api';
import dtiLogo from '@/assets/dti-logo.jpg';
import { LayoutDashboard, CalendarDays, PlusCircle, LogOut, User, Users, Building2, ScrollText, BarChart3, ShieldCheck, Settings, ClipboardList, Shield } from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
  PROGRAM_MANAGER:  'Program Manager',
  EVENT_ORGANIZER:  'Event Organizer',
  SYSTEM_ADMIN:     'System Admin',
  SUPER_ADMIN:      'Super Admin',
};

const NAV = [
  { to: '/organizer/dashboard', label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/organizer/events',    label: 'My Events',     icon: CalendarDays    },
  { to: '/organizer/events/new',label: 'Create Event',  icon: PlusCircle      },
  { to: '/organizer/reports',   label: 'Reports',       icon: BarChart3       },
];

const ADMIN_NAV = [
  { to: '/admin/dashboard',    label: 'Admin Dashboard',  icon: ShieldCheck      },
  { to: '/admin/users',        label: 'Users',            icon: Users            },
  { to: '/admin/enterprises',  label: 'Enterprises',      icon: Building2        },
  { to: '/admin/events',       label: 'All Events',       icon: CalendarDays     },
  { to: '/admin/audit-logs',   label: 'Audit Logs',       icon: ScrollText       },
  { to: '/admin/reports',      label: 'Reports',          icon: BarChart3        },
  { to: '/admin/roles',        label: 'Roles & Permissions', icon: Shield          },
  { to: '/admin/settings',     label: 'Settings',         icon: Settings         },
];

const ADMIN_ROLES = ['SYSTEM_ADMIN', 'SUPER_ADMIN'];

export function OrganizerLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authApi.logout();
    logout();
    navigate('/');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
      isActive
        ? 'bg-white/20 text-white'
        : 'text-blue-100 hover:bg-white/10 hover:text-white'
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-dti-blue shadow-md sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <Link to="/organizer/dashboard" className="flex items-center gap-2">
            <img src={dtiLogo} alt="DTI Central Visayas Region" className="h-9 w-auto" />
            <span className="text-white font-bold text-sm hidden sm:block">DTI Region 7 EMS</span>
          </Link>

          <div className="flex items-center gap-2 text-sm">
            <NavLink to="/" end className={navLinkClass}>Home</NavLink>
            <NavLink to="/events" className={navLinkClass}>Events</NavLink>
            <NavLink to="/directory" className={navLinkClass}>Directory</NavLink>

            <div className="w-px h-6 bg-white/20 mx-2" />

            <span className="text-blue-200 text-xs hidden sm:block">
              {user?.firstName} {user?.lastName}
              <span className="ml-2 bg-blue-700 text-blue-100 text-[10px] px-1.5 py-0.5 rounded">
                {ROLE_LABELS[user?.role ?? ''] ?? user?.role}
              </span>
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-1.5 rounded-full text-sm font-medium border border-white/40 text-white hover:bg-white hover:text-dti-blue transition-all"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-screen-xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Sidebar */}
        <aside className="w-52 shrink-0 hidden md:block">
          <nav className="space-y-1">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/organizer/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-input text-sm font-medium transition-colors ${
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
            <div className="border-t my-2" />
            <NavLink
              to="/organizer/profile"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-input text-sm font-medium transition-colors ${
                  isActive ? 'bg-dti-blue text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <User size={16} /> My Profile
            </NavLink>

            {user?.role && ADMIN_ROLES.includes(user.role) && (
              <>
                <div className="border-t my-2" />
                <p className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Admin</p>
                {ADMIN_NAV.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-input text-sm font-medium transition-colors ${
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
              </>
            )}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
