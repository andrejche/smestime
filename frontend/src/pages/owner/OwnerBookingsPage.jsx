import { useState } from 'react';
import { format } from 'date-fns';
import { useOwnerBookings, useOwnerUpdateBooking } from '../../hooks/useOwner';
import { PageLoader } from '../../components/common/Loader';

const STATUS = {
  pending: { label: 'Чека потврда', badge: 'badge-yellow' },
  confirmed: { label: 'Потврдена', badge: 'badge-green' },
  cancelled: { label: 'Откажана', badge: 'badge-red' },
  completed: { label: 'Завршена', badge: 'badge-blue' },
};

export default function OwnerBookingsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const { data: bookings, isLoading } = useOwnerBookings({ status: statusFilter || undefined });
  const updateBooking = useOwnerUpdateBooking();

  if (isLoading) return <PageLoader />;

  const pending = bookings?.filter((b) => b.status === 'pending') || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Резервации</h1>

      <div className="flex gap-2 flex-wrap mb-6">
        {[
          { value: '', label: 'Сите' },
          { value: 'pending', label: `Чекаат${pending.length > 0 ? ` (${pending.length})` : ''}` },
          { value: 'confirmed', label: 'Потврдени' },
          { value: 'completed', label: 'Завршени' },
          { value: 'cancelled', label: 'Откажани' },
        ].map(({ value, label }) => (
          <button key={value} onClick={() => setStatusFilter(value)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${statusFilter === value ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'}`}>
            {label}
          </button>
        ))}
      </div>

      {!bookings?.length ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-gray-400">Нема резервации</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const st = STATUS[b.status];
            const nights = Math.ceil((new Date(b.check_out) - new Date(b.check_in)) / (1000 * 60 * 60 * 24));
            return (
              <div key={b.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="font-semibold text-gray-900">{b.property_title}</p>
                    <p className="text-sm text-gray-400">{b.city}</p>
                  </div>
                  <span className={`badge flex-shrink-0 ${st.badge}`}>{st.label}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Гостин</p>
                    <p className="font-medium text-gray-900">{b.guest_name}</p>
                    <p className="text-xs text-gray-500">{b.guest_email}</p>
                    <p className="text-xs text-gray-500">{b.guest_phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Датуми</p>
                    <p className="font-medium">{format(new Date(b.check_in), 'dd.MM.yyyy')}</p>
                    <p className="text-xs text-gray-500">→ {format(new Date(b.check_out), 'dd.MM.yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Ноќи / Гости</p>
                    <p className="font-medium">{nights} {nights === 1 ? 'ноќ' : 'ноќи'}</p>
                    <p className="text-xs text-gray-500">{b.guests} гости</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Вкупно</p>
                    <p className="font-semibold text-gray-900">{parseInt(b.total_price).toLocaleString()} {b.currency}</p>
                  </div>
                </div>

                {b.special_requests && (
                  <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 mb-4 text-xs text-yellow-800">💬 {b.special_requests}</div>
                )}

                {b.status === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => updateBooking.mutate({ id: b.id, status: 'confirmed' })} disabled={updateBooking.isPending} className="btn-primary btn-sm rounded-xl">✓ Потврди</button>
                    <button onClick={() => updateBooking.mutate({ id: b.id, status: 'cancelled' })} disabled={updateBooking.isPending} className="btn-danger btn-sm rounded-xl">✕ Откажи</button>
                  </div>
                )}
                {b.status === 'confirmed' && (
                  <div className="flex gap-2">
                    <button onClick={() => updateBooking.mutate({ id: b.id, status: 'completed' })} disabled={updateBooking.isPending} className="btn-outline btn-sm rounded-xl text-xs">✓ Означи завршена</button>
                    <button onClick={() => updateBooking.mutate({ id: b.id, status: 'cancelled' })} disabled={updateBooking.isPending} className="btn-danger btn-sm rounded-xl">Откажи</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
