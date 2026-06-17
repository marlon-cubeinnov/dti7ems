import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { authApi } from '@/lib/api';
import dtiLogo from '@/assets/dti-bp-logo.png';
import { LayoutDashboard, CalendarDays, PlusCircle, LogOut, User, Users, Building2, ScrollText, BarChart3, ShieldCheck, Settings, ClipboardList, Shield, FileText } from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
  PROGRAM_MANAGER:    'Technical Staff',
  EVENT_ORGANIZER:    'Facilitator',
  DIVISION_CHIEF:     'Technical Divisions Chief',
  REGIONAL_DIRECTOR:  'Provincial/Regional Director',
  PROVINCIAL_DIRECTOR:'Provincial Director',
  SYSTEM_ADMIN:       'System Admin',
  SUPER_ADMIN:        'Super Admin',
  DTI_EMPLOYEE:       'DTI Employee',
};

// Nav for Program Managers (Technical Staff): can create proposals/events
const PM_NAV = [
  { to: '/organizer/dashboard',     label: 'Dashboard',      icon: LayoutDashboard },
  { to: '/organizer/proposals',     label: 'My Proposals',   icon: FileText        },
  { to: '/organizer/proposals/new', label: 'New Proposal',   icon: PlusCircle      },
  { to: '/organizer/tna',           label: 'TNA',            icon: ClipboardList   },
  { to: '/organizer/events',        label: 'My Events',      icon: CalendarDays    },
  { to: '/organizer/reports',       label: 'Reports',        icon: BarChart3       },
];

// Nav for Event Organizers (Facilitators): see only assigned events, cannot create
const EO_NAV = [
  { to: '/organizer/dashboard', label: 'Dashboard',      icon: LayoutDashboard },
  { to: '/organizer/events',    label: 'My Events',      icon: CalendarDays    },
  { to: '/organizer/reports',   label: 'Reports',        icon: BarChart3       },
];

// Nav for Division Chief: sees proposals submitted for review
const DC_NAV = [
  { to: '/organizer/dashboard', label: 'Dashboard',       icon: LayoutDashboard },
  { to: '/organizer/proposals', label: 'Proposals Queue',  icon: FileText        },
];

// Nav for Regional Director: sees proposals under review for final decision
const RD_NAV = [
  { to: '/organizer/dashboard', label: 'Dashboard',      icon: LayoutDashboard },
  { to: '/organizer/proposals', label: 'For Approval',   icon: FileText        },
];

// Admin/System users see PM_NAV
const ADMIN_NAV = [
  { to: '/admin/dashboard',          label: 'Admin Dashboard',    icon: ShieldCheck   },
  { to: '/admin/users',              label: 'Users',              icon: Users         },
  { to: '/admin/enterprises',        label: 'Enterprises',        icon: Building2     },
  { to: '/admin/enterprise-updates', label: 'Company Updates',    icon: Building2     },
  { to: '/admin/events',             label: 'All Events',         icon: CalendarDays  },
  { to: '/admin/audit-logs',         label: 'Audit Logs',         icon: ScrollText    },
  { to: '/admin/reports',            label: 'Reports',            icon: BarChart3     },
  { to: '/admin/roles',              label: 'Roles & Permissions', icon: Shield       },
  { to: '/admin/settings',           label: 'Settings',           icon: Settings      },
];

const ADMIN_ROLES = ['SYSTEM_ADMIN', 'SUPER_ADMIN'];

function getOrganizerNav(role?: string) {
  if (role === 'EVENT_ORGANIZER') return EO_NAV;
  if (role === 'DTI_EMPLOYEE')    return EO_NAV;
  if (role === 'DIVISION_CHIEF') return DC_NAV;
  if (role === 'REGIONAL_DIRECTOR') return RD_NAV;
  if (role === 'PROVINCIAL_DIRECTOR') return RD_NAV;
  return PM_NAV;
}

export function OrganizerLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isAdminUser = ADMIN_ROLES.includes(user?.role ?? '');
  const organizerNav = getOrganizerNav(user?.role);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* best-effort */ }
    qc.clear();
    logout();
    navigate('/');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
      isActive
        ? 'bg-[#172187] text-white'
        : 'text-[#172187] hover:bg-[#172187]/10'
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <Link to="/organizer/dashboard" className="flex items-center gap-3">
            <img src={dtiLogo} alt="DTI Bagong Pilipinas" className="h-10 w-auto" />
            <span className="text-[#172187] font-bold text-sm hidden sm:block">DTI Region 7 EMS</span>
          </Link>

          <div className="flex items-center gap-2 text-sm">
            <NavLink to={ADMIN_ROLES.includes(user?.role ?? '') ? '/admin/dashboard' : '/organizer/dashboard'} className={navLinkClass}>Home</NavLink>
            <NavLink to="/events" className={navLinkClass}>Events</NavLink>
            <NavLink to="/directory" className={navLinkClass}>Directory</NavLink>
            <a href="/docs/USER-MANUAL.html" target="_blank" rel="noopener noreferrer" className={navLinkClass({ isActive: false })}>User Manual</a>

            <div className="w-px h-6 bg-gray-300 mx-2" />

            <span className="text-gray-500 text-xs hidden sm:block">
              {user?.firstName}
              <span className="ml-2 bg-[#172187] text-white text-[10px] px-1.5 py-0.5 rounded">
                {ROLE_LABELS[user?.role ?? ''] ?? user?.role}
              </span>
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-1.5 rounded-full text-sm font-medium border border-[#172187]/40 text-[#172187] hover:bg-[#172187] hover:text-white transition-all"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Sidebar */}
        <aside className="w-52 shrink-0 hidden md:block">
          <nav className="space-y-1">
            {organizerNav.map(({ to, label, icon: Icon }) => (
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

            {user?.role && isAdminUser && (
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
