import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import dtiLogo from '@/assets/dti-logo.jpg';
import { useAuthStore } from '@/stores/auth.store';
import { authApi } from '@/lib/api';

export function PublicLayout() {
  const { isAuthenticated, user, logout } = useAuthStore();
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
    <div className="min-h-screen flex flex-col">
      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <header className="bg-dti-blue shadow-md sticky top-0 z-40">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={dtiLogo} alt="DTI Central Visayas Region" className="h-10 w-auto" />
            <span className="text-white font-bold text-sm leading-tight hidden sm:block">
              DTI Region 7<br />
              <span className="font-normal text-blue-200 text-xs">Events Management</span>
            </span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-2 text-sm">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/events" className={navLinkClass}>
              Events
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/directory" className={navLinkClass}>
                Directory
              </NavLink>
            )}
            {isAuthenticated && (
              <a href="/docs/USER-MANUAL.html" target="_blank" rel="noopener noreferrer" className="px-4 py-1.5 rounded-full text-sm font-medium text-blue-100 hover:bg-white/10 hover:text-white transition-all">
                User Manual
              </a>
            )}

            <div className="w-px h-6 bg-white/20 mx-2" />

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <NavLink to="/dashboard" className={navLinkClass}>
                  {user?.firstName}
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="px-4 py-1.5 rounded-full text-sm font-medium border border-white/40 text-white hover:bg-white hover:text-dti-blue transition-all"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <NavLink to="/login" className={navLinkClass}>
                  Log in
                </NavLink>
                <Link to="/register" className="btn-accent text-xs px-4 py-1.5 rounded-full">
                  Register
                </Link>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* ── Page content ───────────────────────────────────────────────── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="bg-dti-blue-dark text-blue-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm">
            <div>
              <p className="font-semibold text-white mb-2">DTI Region 7</p>
              <p className="text-xs leading-relaxed">
                Department of Trade and Industry<br />
                Region VII — Central Visayas<br />
                Cebu City, Philippines
              </p>
            </div>
            <div>
              <p className="font-semibold text-white mb-2">Quick Links</p>
              <ul className="space-y-1 text-xs">
                <li><Link to="/events" className="hover:text-white">Browse Events</Link></li>
                <li><Link to="/directory" className="hover:text-white">Enterprise Directory</Link></li>
                <li><Link to="/register" className="hover:text-white">Create Account</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-white mb-2">Data Privacy</p>
              <p className="text-xs leading-relaxed">
                Your data is protected under RA 10173 (Data Privacy Act of 2012).
                We only collect information needed to manage event participation.
              </p>
            </div>
          </div>
          <div className="border-t border-blue-700 mt-8 pt-6 text-xs text-center text-blue-300">
            © {new Date().getFullYear()} Department of Trade and Industry Region 7. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
