import { Link } from 'react-router-dom';
import { useMyListings, useOwnerBookings } from '../../hooks/useOwner';
import { useAuthStore } from '../../store/auth.store';
import { PageLoader } from '../../components/common/Loader';

const STATUS_BADGE = { pending: 'badge-yellow', confirmed: 'badge-green', cancelled: 'badge-red', completed: 'badge-blue' };
const STATUS_LABEL = { pending: 'Чека', confirmed: 'Потврдена', cancelled: 'Откажана', completed: 'Завршена' };

export default function OwnerDashboard() {
  const { user } = useAuthStore();
  const { data: listings, isLoading: l1 } = useMyListings();
  const { data: bookings, isLoading: l2 } = useOwnerBookings();

  if (l1 || l2) return <PageLoader />;

  const pendingBookings = bookings?.filter((b) => b.status === 'pending') || [];
  const confirmedBookings = bookings?.filter((b) => b.status === 'confirmed') || [];
  const totalRevenue = bookings?.filter((b) => ['confirmed','completed'].includes(b.status)).reduce((s, b) => s + parseFloat(b.total_price), 0) || 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Добредојде, {user?.firstName}!</h1>
          <p className="text-gray-500 text-sm mt-1">Преглед на твоите огласи и резервации</p>
        </div>
        <Link to="/list-property" className="btn-primary rounded-xl px-5 py-2.5 text-sm font-semibold">+ Нов оглас</Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Огласи', value: listings?.length || 0, icon: '🏠', sub: `${listings?.filter(l => l.is_approved).length || 0} активни` },
          { label: 'Во чекање', value: pendingBookings.length, icon: '⏳', sub: 'нови резервации' },
          { label: 'Потврдени', value: confirmedBookings.length, icon: '✅', sub: 'активни престои' },
          { label: 'Приход', value: `${totalRevenue.toLocaleString()} МКД`, icon: '💰', sub: 'вкупно' },
        ].map(({ label, value, icon, sub }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-200 p-5">
            <span className="text-2xl block mb-2">{icon}</span>
            <p className="text-xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Мои огласи</h2>
            <Link to="/owner/listings" className="text-sm text-brand-600 hover:underline">Сите →</Link>
          </div>
          {!listings?.length ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm mb-3">Немаш огласи</p>
              <Link to="/list-property" className="btn-primary btn-sm rounded-xl">Додај оглас</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {listings.slice(0, 4).map((l) => (
                <div key={l.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50">
                  {l.primary_image ? <img src={l.primary_image} alt="" className="w-12 h-10 rounded-lg object-cover flex-shrink-0" /> : <div className="w-12 h-10 rounded-lg bg-gray-100 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{l.title}</p>
                    <p className="text-xs text-gray-400">{l.city} · {parseInt(l.price_per_night).toLocaleString()} МКД/ноќ</p>
                  </div>
                  <span className={`badge flex-shrink-0 ${l.is_approved ? 'badge-green' : 'badge-yellow'}`}>{l.is_approved ? 'Активен' : 'Чека'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Последни резервации</h2>
            <Link to="/owner/bookings" className="text-sm text-brand-600 hover:underline">Сите →</Link>
          </div>
          {!bookings?.length ? (
            <div className="text-center py-8"><p className="text-gray-400 text-sm">Нема резервации</p></div>
          ) : (
            <div className="space-y-3">
              {bookings.slice(0, 5).map((b) => (
                <div key={b.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50">
                  <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 text-sm font-bold flex-shrink-0">{b.guest_name?.[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{b.guest_name}</p>
                    <p className="text-xs text-gray-400 truncate">{b.property_title}</p>
                  </div>
                  <span className={`badge flex-shrink-0 ${STATUS_BADGE[b.status]}`}>{STATUS_LABEL[b.status]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
