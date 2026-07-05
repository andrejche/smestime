import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useAdminProperties, useApproveProperty } from '../../hooks/useAdmin';
import { useDeleteProperty } from '../../hooks/useProperties';
import { TableSkeleton } from '../../components/common/Loader';

const TYPE_LABELS = {
  apartment: 'Апартман', house: 'Куќа', villa: 'Вила',
  studio: 'Студио', room: 'Соба', hostel: 'Хостел',
};

export default function AdminPropertiesPage() {
  const [search, setSearch] = useState('');
  const [approved, setApproved] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAdminProperties({
    search: search || undefined,
    approved: approved !== '' ? approved : undefined,
    page,
    limit: 20,
  });

  const approveProperty = useApproveProperty();
  const deleteProperty = useDeleteProperty();

  const totalPages = data ? Math.ceil(data.total / 20) : 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="page-header">Огласи</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Пребарај по наслов..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input max-w-xs"
        />
        <select
          value={approved}
          onChange={(e) => { setApproved(e.target.value); setPage(1); }}
          className="input w-auto"
        >
          <option value="">Сите</option>
          <option value="false">Чекаат одобрување</option>
          <option value="true">Одобрени</option>
        </select>
        {data && (
          <span className="text-sm text-gray-500 self-center ml-auto">{data.total} огласи</span>
        )}
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-6"><TableSkeleton rows={8} cols={5} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Оглас', 'Тип / Град', 'Сопственик', 'Цена', 'Статус', 'Акции'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.properties.map((prop) => (
                  <tr key={prop.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {prop.primary_image ? (
                          <img src={prop.primary_image} alt="" className="w-12 h-9 object-cover rounded-lg flex-shrink-0" />
                        ) : (
                          <div className="w-12 h-9 bg-gray-100 rounded-lg flex-shrink-0" />
                        )}
                        <div>
                          <Link to={`/properties/${prop.id}`} className="font-medium text-gray-900 hover:text-primary-600 line-clamp-1">
                            {prop.title}
                          </Link>
                          <p className="text-xs text-gray-400">{format(new Date(prop.created_at), 'dd.MM.yyyy')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <p>{TYPE_LABELS[prop.property_type] || prop.property_type}</p>
                      <p className="text-xs text-gray-400">{prop.city}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{prop.owner_first_name} {prop.owner_last_name}</p>
                      <p className="text-xs text-gray-400">{prop.owner_email}</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-navy-700">
                      {parseInt(prop.price_per_night).toLocaleString()} МКД
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${prop.is_approved ? 'badge-green' : 'badge-yellow'}`}>
                        {prop.is_approved ? 'Одобрен' : 'Чека'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {!prop.is_approved ? (
                          <button
                            onClick={() => approveProperty.mutate({ id: prop.id, isApproved: true })}
                            className="btn btn-primary btn-sm text-xs"
                          >
                            ✓ Одобри
                          </button>
                        ) : (
                          <button
                            onClick={() => approveProperty.mutate({ id: prop.id, isApproved: false })}
                            className="btn btn-secondary btn-sm text-xs"
                          >
                            Одбиј
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm(`Избриши го "${prop.title}"?`)) deleteProperty.mutate(prop.id);
                          }}
                          className="btn btn-danger btn-sm text-xs"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="btn btn-secondary btn-sm disabled:opacity-40">←</button>
          <span className="btn btn-secondary btn-sm">{page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="btn btn-secondary btn-sm disabled:opacity-40">→</button>
        </div>
      )}
    </div>
  );
}
