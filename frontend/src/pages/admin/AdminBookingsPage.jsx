import { useState } from 'react';
import { format } from 'date-fns';
import { useAdminBookings } from '../../hooks/useAdmin';
import { TableSkeleton } from '../../components/common/Loader';

const STATUS = {
  pending: { label: 'Чека', badge: 'badge-yellow' },
  confirmed: { label: 'Потврдена', badge: 'badge-green' },
  cancelled: { label: 'Откажана', badge: 'badge-red' },
  completed: { label: 'Завршена', badge: 'badge-blue' },
};

export default function AdminBookingsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAdminBookings({
    status: statusFilter || undefined,
    page,
    limit: 20,
  });

  const bookings = Array.isArray(data) ? data : data?.bookings || [];
  const total = Array.isArray(data) ? data.length : data?.total || 0;
  const totalPages = Math.ceil(total / 20) || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Резервации</h1>

      <div className="flex gap-2 flex-wrap mb-6">
        {[
          { value: '', label: 'Сите' },
          { value: 'pending', label: 'Во чекање' },
          { value: 'confirmed', label: 'Потврдени' },
          { value: 'completed', label: 'Завршени' },
          { value: 'cancelled', label: 'Откажани' },
        ].map(({ value, label }) => (
          <button key={value} onClick={() => { setStatusFilter(value); setPage(1); }}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              statusFilter === value ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
            }`}>
            {label}
          </button>
        ))}
        <span className="text-sm text-gray-400 self-center ml-auto">{total} резервации</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-6"><TableSkeleton rows={8} cols={6} /></div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 text-gray-400">Нема резервации</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Оглас', 'Гостин', 'Телефон', 'Датуми', 'Сума', 'Статус'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map((b) => {
                  const st = STATUS[b.status] || { label: b.status, badge: 'badge-gray' };
                  return (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 line-clamp-1 max-w-[160px]">{b.property_title}</p>
                        <p className="text-xs text-gray-400">{b.city}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{b.guest_name}</p>
                        <p className="text-xs text-gray-400">{b.guest_email}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{b.guest_phone}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        <p>{format(new Date(b.check_in), 'dd.MM.yy')}</p>
                        <p>→ {format(new Date(b.check_out), 'dd.MM.yy')}</p>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {parseInt(b.total_price).toLocaleString()}
                        <span className="text-xs font-normal text-gray-400 ml-1">{b.currency}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${st.badge}`}>{st.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="btn-outline btn-sm rounded-full disabled:opacity-40">←</button>
          <span className="btn-outline btn-sm rounded-full">{page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="btn-outline btn-sm rounded-full disabled:opacity-40">→</button>
        </div>
      )}
    </div>
  );
}
