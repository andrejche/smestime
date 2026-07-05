import { useState, useRef, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/auth.store';
import { useLogout } from '../../hooks/useAuth';
import LanguageSwitcher from './LanguageSwitcher';
import logo from '../../assets/logo.png';

export default function Navbar() {
  const { user, isAuthenticated } = useAuthStore();
  const logout = useLogout();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isAdmin = isAuthenticated && user?.role === 'admin';
  const isOwner = isAuthenticated && user?.role === 'owner';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src={logo} alt="SmestiMe" className="h-10 w-auto" />
            <span className="font-bold text-xl text-ink tracking-tight">smestime</span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            <NavLink to="/properties"
              className={({ isActive }) =>
                `px-4 py-2 rounded-full text-sm font-semibold transition-colors ${isActive ? 'text-ink bg-gray-100' : 'text-gray-500 hover:text-ink hover:bg-gray-50'}`
              }
            >
              {t('nav.listings')}
            </NavLink>

            {(!isAuthenticated || isOwner) && (
              <Link to="/list-property"
                className="px-4 py-2 rounded-full text-sm font-semibold text-gray-500 hover:text-ink hover:bg-gray-50 transition-colors">
                {t('nav.addListing')}
              </Link>
            )}

            <LanguageSwitcher />

            {isOwner && (
              <div className="relative ml-2" ref={menuRef}>
                <button onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 border border-gray-300 rounded-full pl-3 pr-2 py-1.5 hover:shadow-card transition-shadow">
                  <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <div className="w-7 h-7 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">
                    {user?.firstName?.[0]}
                  </div>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-modal border border-gray-100 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-ink">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <Link to="/owner" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">📊 Контролна табла</Link>
                    <Link to="/owner/listings" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">🏠 Мои огласи</Link>
                    <Link to="/owner/bookings" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">📅 Резервации</Link>
                    <Link to="/owner/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">👤 Профил</Link>
                    <div className="border-t border-gray-100">
                      <button onClick={() => { logout.mutate(); setMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">↩ Одјави се</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {isAdmin && (
              <div className="relative ml-2" ref={menuRef}>
                <button onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 border border-gray-300 rounded-full pl-3 pr-2 py-1.5 hover:shadow-card transition-shadow">
                  <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <div className="w-7 h-7 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">A</div>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-modal border border-gray-100 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-ink">Admin</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">📊 Контролна табла</Link>
                    <Link to="/admin/properties" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">🏠 Огласи</Link>
                    <Link to="/admin/bookings" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">📅 Резервации</Link>
                    <div className="border-t border-gray-100">
                      <button onClick={() => { logout.mutate(); setMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">↩ Одјави се</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!isAuthenticated && (
              <Link to="/login" className="ml-2 btn-outline btn-sm rounded-full text-sm font-semibold">
                Најава →
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg text-gray-600 hover:bg-gray-100">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          <Link to="/properties" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">🔍 {t('nav.listings')}</Link>
          {isOwner && <>
            <Link to="/owner" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">📊 Контролна табла</Link>
            <Link to="/owner/listings" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">🏠 Мои огласи</Link>
            <Link to="/owner/bookings" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">📅 Резервации</Link>
            <button onClick={() => { logout.mutate(); setMobileOpen(false); }} className="block w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50">↩ Одјави се</button>
          </>}
          {isAdmin && <>
            <Link to="/admin" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">📊 Admin панел</Link>
            <button onClick={() => { logout.mutate(); setMobileOpen(false); }} className="block w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50">↩ Одјави се</button>
          </>}
          {!isAuthenticated && <>
            <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-medium text-brand-600 hover:bg-brand-50">Најава за домаќини</Link>
            <Link to="/owner/register" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">➕ {t('nav.addListing')}</Link>
          </>}
        </div>
      )}
    </header>
  );
}
