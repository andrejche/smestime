import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAdminAnalytics } from '../../hooks/useAdmin';
import { PageLoader } from '../../components/common/Loader';

export default function AdminDashboard() {
  const { data, isLoading, error } = useAdminAnalytics();

  if (isLoading) return <PageLoader />;

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 font-semibold mb-2">Грешка при вчитување</p>
          <p className="text-red-500 text-sm">Провери дали backend-от работи и дали си логиран.</p>
        </div>
      </div>
    );
  }

  const { properties, bookings, revenue, trend = [], topCities = [] } = data;

  const stats = [
    {
      label: 'Огласи', value: properties?.total || 0,
      sub: `${properties?.pending_approval || 0} чекаат одобрување`,
      icon: '🏠', color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Резервации', value: bookings?.total || 0,
      sub: `${bookings?.pending || 0} во чекање`,
      icon: '📅', color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Потврдени', value: bookings?.confirmed || 0,
      sub: `${bookings?.completed || 0} завршени`,
      icon: '✅', color: 'bg-brand-50 text-brand-600',
    },
    {
      label: 'Откажани', value: bookings?.cancelled || 0,
      sub: 'вкупно откажани',
      icon: '❌', color: 'bg-red-50 text-red-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-ink mb-8">Контролна табла</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, sub, icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-xl mb-3`}>
              {icon}
            </div>
            <p className="text-2xl font-bold text-ink">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Trend chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 lg:col-span-2">
          <h2 className="font-semibold text-ink mb-4">Резервации — последни 6 месеци</h2>
          {trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="bookings" fill="#4F86C6" radius={[4,4,0,0]} name="Резервации" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">
              Нема доволно податоци
            </div>
          )}
        </div>

        {/* Top cities */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-ink mb-4">Топ градови</h2>
          {topCities.length > 0 ? (
            <div className="space-y-3">
              {topCities.map((city, i) => (
                <div key={city.city} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-300 w-4">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-ink">{city.city}</span>
                      <span className="text-gray-400">{city.property_count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div
                        className="h-1.5 bg-brand-400 rounded-full"
                        style={{ width: `${(city.property_count / topCities[0].property_count) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Нема одобрени огласи</p>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { to: '/admin/properties', label: 'Управувај огласи', icon: '🏠', desc: `${properties?.pending_approval || 0} чекаат одобрување` },
          { to: '/admin/bookings', label: 'Управувај резервации', icon: '📅', desc: `${bookings?.pending || 0} во чекање` },
          { to: '/admin/users', label: 'Корисници', icon: '👤', desc: 'Управувај со admin сметки' },
        ].map(({ to, label, icon, desc }) => (
          <Link key={to} to={to} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-hover transition-shadow group">
            <span className="text-3xl block mb-3">{icon}</span>
            <p className="font-semibold text-ink group-hover:text-brand-600 transition-colors">{label}</p>
            <p className="text-sm text-gray-400 mt-0.5">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
