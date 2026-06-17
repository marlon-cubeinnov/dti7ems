import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import dtiLogo from '@/assets/dti-bp-logo.png';
import { useAuthStore } from '@/stores/auth.store';
import { authApi, enterpriseApi } from '@/lib/api';
import { WifiOff } from 'lucide-react';
import { CompanyProfileModal } from '@/components/company/CompanyProfileModal';

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

const BASE_NAV = [
  { to: '/dashboard',       label: 'Dashboard'        },
  { to: '/my-events',       label: 'My Events'        },
  { to: '/my-certificates', label: 'My Certificates'  },
  { to: '/profile',         label: 'Profile'          },
];

const ENTERPRISE_NAV = [
  ...BASE_NAV,
  { to: '/company-profile', label: 'Company Profile'  },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
    isActive
      ? 'bg-[#172187] text-white'
      : 'text-[#172187] hover:bg-[#172187]/10'
  }`;

export function ParticipantLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const NAV = user?.role === 'ENTERPRISE_REPRESENTATIVE' ? ENTERPRISE_NAV : BASE_NAV;

  // Company profile update modal state
  const [profileModal, setProfileModal] = useState<{ enterpriseId: string } | null>(null);

  // On mount: check if the logged-in ENTERPRISE_REPRESENTATIVE needs to update their profile
  const checkProfileUpdate = useCallback(async () => {
    if (user?.role !== 'ENTERPRISE_REPRESENTATIVE') return;
    try {
      const res = await enterpriseApi.getMyEnterprises();
      const enterprises = (res?.data ?? []) as Array<{ id: string }>;
      if (enterprises.length === 0) return;
      const primary = enterprises[0];
      const statusRes = await enterpriseApi.getUpdateStatus(primary.id);
      const status = statusRes?.data as { updateDue?: boolean } | undefined;
      if (status?.updateDue) {
        setProfileModal({ enterpriseId: primary.id });
      }
    } catch {
      // silently ignore — don't block the UI if the check fails
    }
  }, [user?.role]);

  useEffect(() => {
    checkProfileUpdate();
  }, [checkProfileUpdate]);

  const handleLogout = async () => {
    await authApi.logout();
    qc.clear();
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <OfflineBanner />

      {/* Company Profile Update Modal */}
      {profileModal && (
        <CompanyProfileModal
          enterpriseId={profileModal.enterpriseId}
          onClose={() => setProfileModal(null)}
          onSaved={() => setProfileModal(null)}
        />
      )}
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-3">
            <img src={dtiLogo} alt="DTI Bagong Pilipinas" className="h-10 w-auto" />
            <span className="text-[#172187] font-bold text-sm hidden sm:block">DTI Region 7 EMS</span>
          </Link>

          <div className="flex items-center gap-2 text-sm">
            <NavLink to="/" end className={navLinkClass}>Home</NavLink>
            <NavLink to="/events" className={navLinkClass}>Events</NavLink>
            <NavLink to="/directory" className={navLinkClass}>Directory</NavLink>
            <a href="/docs/USER-MANUAL.html" target="_blank" rel="noopener noreferrer" className={navLinkClass({ isActive: false })}>User Manual</a>

            <div className="w-px h-6 bg-gray-300 mx-2" />

            <span className="text-gray-500 text-xs hidden sm:block">
              {user?.firstName} {user?.lastName}
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
