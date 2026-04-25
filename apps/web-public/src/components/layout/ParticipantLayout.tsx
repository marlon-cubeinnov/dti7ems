import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import dtiLogo from '@/assets/dti-logo.jpg';
import { useAuthStore } from '@/stores/auth.store';
import { authApi } from '@/lib/api';
import { WifiOff } from 'lucide-react';

function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const goOff = () => setOffline(true);
    const goOn  = () => setOffline(false);
    window.addEventListener('offline', goOff);
    window.addEventListener('online', goOn);
    return () => { window.removeEventListener('offline', goOff); window.removeEventListener('online', goOn); };
  }, []);
  if (!offline) return null;
  return (
    <div className="bg-amber-500 text-white text-xs flex items-center justify-center gap-2 py-1.5 px-4">
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>You are currently offline. Some features may not be available until your connection is restored.</span>
    </div>
  );
}

const NAV = [
  { to: '/dashboard',       label: 'Dashboard'        },
  { to: '/my-events',       label: 'My Events'        },
  { to: '/my-certificates', label: 'My Certificates'  },
  { to: '/profile',         label: 'Profile'          },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
    isActive
      ? 'bg-white/20 text-white'
      : 'text-blue-100 hover:bg-white/10 hover:text-white'
  }`;

export function ParticipantLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authApi.logout();
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <OfflineBanner />
      {/* Header */}
      <header className="bg-dti-blue shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2">
            <img src={dtiLogo} alt="DTI Central Visayas Region" className="h-9 w-auto" />
            <span className="text-white font-bold text-sm hidden sm:block">DTI Region 7 EMS</span>
          </Link>

          <div className="flex items-center gap-2 text-sm">
            <NavLink to="/" end className={navLinkClass}>Home</NavLink>
            <NavLink to="/events" className={navLinkClass}>Events</NavLink>
            <NavLink to="/directory" className={navLinkClass}>Directory</NavLink>
            <a href="/docs/USER-MANUAL.html" target="_blank" rel="noopener noreferrer" className={navLinkClass({ isActive: false })}>User Manual</a>

            <div className="w-px h-6 bg-white/20 mx-2" />

            <span className="text-blue-200 text-xs hidden sm:block">
              {user?.firstName} {user?.lastName}
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

      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Sidebar */}
        <aside className="w-48 shrink-0 hidden md:block">
          <nav className="space-y-1">
            {NAV.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-input text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-dti-blue text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
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
