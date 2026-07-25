import { Link } from 'react-router-dom';
import { useAdminStats } from '../../hooks/useAdmin';
import { PageLoader } from '../../components/common/Loader';

export default function AdminDashboard() {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) return <PageLoader />;

  const cards = [
    { label: 'Домаќини', value: stats?.totalOwners || 0, icon: '👥', to: '/admin/users' },
    { label: 'Огласи', value: stats?.totalProperties || 0, icon: '🏠', to: '/admin/properties' },
    { label: 'Резервации', value: stats?.totalBookings || 0, icon: '📅', to: '/admin/bookings' },
    { label: 'Чекаат одобрување', value: stats?.pendingApproval || 0, icon: '⏳', to: '/admin/properties', highlight: stats?.pendingApproval > 0 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Контролна табла</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon, to, highlight }) => (
          <Link key={label} to={to}
            className={`bg-white rounded-2xl border p-5 hover:shadow-card transition-shadow ${highlight ? 'border-orange-300 bg-orange-50' : 'border-gray-200'}`}>
            <p className="text-3xl mb-2">{icon}</p>
            <p className={`text-2xl font-bold ${highlight ? 'text-orange-600' : 'text-gray-900'}`}>{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/admin/properties" className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-card transition-shadow">
          <h3 className="font-semibold text-gray-900 mb-1">🏠 Огласи</h3>
          <p className="text-sm text-gray-500">Одобри, одбиј или избриши огласи</p>
        </Link>
        <Link to="/admin/social" className="bg-white rounded-2xl border border-purple-200 bg-purple-50 p-5 hover:shadow-card transition-shadow">
          <h3 className="font-semibold text-purple-900 mb-1">📣 Социјални мрежи</h3>
          <p className="text-sm text-purple-600">Преземи слики за промоција</p>
        </Link>
      </div>
    </div>
  );
}
