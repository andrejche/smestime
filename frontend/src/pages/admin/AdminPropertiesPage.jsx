import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminProperties, useApproveProperty, useDeleteAdminProperty } from '../../hooks/useAdmin';
import { PageLoader } from '../../components/common/Loader';

const TYPE_LABELS = { apartment: 'Апартман', house: 'Куќа', villa: 'Вила', studio: 'Студио', room: 'Соба', hostel: 'Хостел' };

export default function AdminPropertiesPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const params = {};
  if (filter === 'pending') params.approved = 'false';
  if (filter === 'approved') params.approved = 'true';
  if (search) params.search = search;

  const { data, isLoading } = useAdminProperties(params);
  const approveProperty = useApproveProperty();
  const deleteProperty = useDeleteAdminProperty();

  const properties = filter === 'promo'
    ? data?.properties?.filter((p) => p.promo_social)
    : data?.properties;

  if (isLoading) return <PageLoader />;

  const promoCount = data?.properties?.filter((p) => p.promo_social).length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Огласи</h1>
        <span className="text-sm text-gray-400">{data?.total || 0} вкупно</span>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {[
          { value: 'all', label: 'Сите' },
          { value: 'pending', label: 'Чекаат одобрување' },
          { value: 'approved', label: 'Одобрени' },
          { value: 'promo', label: `📣 Социјални мрежи${promoCount > 0 ? ` (${promoCount})` : ''}` },
        ].map(({ value, label }) => (
          <button key={value} onClick={() => setFilter(value)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              filter === value ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
            }`}>
            {label}
          </button>
        ))}
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Пребарај..." className="border border-gray-200 rounded-full px-4 py-2 text-sm outline-none focus:border-gray-400 ml-auto" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {!properties?.length ? (
          <div className="text-center py-16 text-gray-400">Нема огласи</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {properties.map((p) => (
              <div key={p.id} className="flex gap-4 p-5 hover:bg-gray-50 transition-colors">
                {p.primary_image
                  ? <img src={p.primary_image} alt="" className="w-20 h-16 rounded-xl object-cover flex-shrink-0" />
                  : <div className="w-20 h-16 rounded-xl bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-300 text-xl">🏠</div>
                }
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-1 flex-wrap">
                    <Link to={`/properties/${p.id}`} className="font-semibold text-gray-900 text-sm hover:text-brand-600 truncate">
                      {p.title}
                    </Link>
                    {p.promo_social && <span className="badge bg-purple-100 text-purple-700 flex-shrink-0">📣 Промоција</span>}
                    <span className={`badge flex-shrink-0 ${p.is_approved ? 'badge-green' : 'badge-yellow'}`}>
                      {p.is_approved ? 'Одобрен' : 'Чека'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">📍 {p.city} · {TYPE_LABELS[p.property_type]} · {parseInt(p.price_per_night).toLocaleString()} МКД/ноќ</p>
                  <p className="text-xs text-gray-400">👤 {p.owner_name} · {p.owner_phone} · {p.owner_email}</p>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {!p.is_approved ? (
                    <button onClick={() => approveProperty.mutate({ id: p.id, isApproved: true })}
                      disabled={approveProperty.isPending} className="btn-primary btn-sm rounded-lg text-xs px-3 py-1.5">
                      ✓ Одобри
                    </button>
                  ) : (
                    <button onClick={() => approveProperty.mutate({ id: p.id, isApproved: false })}
                      disabled={approveProperty.isPending} className="btn-outline btn-sm rounded-lg text-xs px-3 py-1.5">
                      Одбиј
                    </button>
                  )}
                  <button onClick={() => { if (confirm(`Избриши "${p.title}"?`)) deleteProperty.mutate(p.id); }}
                    className="btn-danger btn-sm rounded-lg text-xs px-3 py-1.5">
                    🗑 Избриши
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
