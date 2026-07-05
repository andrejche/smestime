import { NavLink, Outlet } from 'react-router-dom';

const NAV = [
  { to: '/owner', label: 'Преглед', icon: '📊', end: true },
  { to: '/owner/listings', label: 'Огласи', icon: '🏠' },
  { to: '/owner/bookings', label: 'Резервации', icon: '📅' },
  { to: '/owner/profile', label: 'Профил', icon: '👤' },
];

export default function OwnerLayout() {
  return (
    <div className="flex min-h-[calc(100vh-72px)] bg-gray-50">
      <aside className="w-56 bg-white border-r border-gray-200 flex-shrink-0 hidden md:block">
        <div className="p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Домаќин</p>
          <nav className="space-y-1">
            {NAV.map(({ to, label, icon, end }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <span>{icon}</span>{label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 flex">
        {NAV.map(({ to, label, icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2.5 text-xs font-semibold transition-colors ${
                isActive ? 'text-gray-900' : 'text-gray-400'
              }`
            }
          >
            <span className="text-lg mb-0.5">{icon}</span>{label}
          </NavLink>
        ))}
      </div>

      <main className="flex-1 overflow-auto pb-16 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
}
