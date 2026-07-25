import { useAdminUsers, useToggleUserActive } from '../../hooks/useAdmin';
import { PageLoader } from '../../components/common/Loader';

export default function AdminUsersPage() {
  const { data: users, isLoading } = useAdminUsers();
  const toggleUser = useToggleUserActive();

  if (isLoading) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Корисници</h1>
        <span className="text-sm text-gray-400">{users?.length || 0} вкупно</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {!users?.length ? (
          <div className="text-center py-16 text-gray-400">Нема корисници</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-sm flex-shrink-0">
                  {u.first_name?.[0]}{u.last_name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900 text-sm">{u.first_name} {u.last_name}</p>
                    <span className={`badge ${u.role === 'admin' ? 'badge-blue' : 'badge-gray'}`}>{u.role}</span>
                    {!u.is_active && <span className="badge badge-red">Деактивиран</span>}
                    {!u.email_verified && <span className="badge badge-yellow">Непотврден</span>}
                  </div>
                  <p className="text-xs text-gray-400">{u.email} · {u.phone || '—'}</p>
                  <p className="text-xs text-gray-300">{new Date(u.created_at).toLocaleDateString('mk-MK')}</p>
                </div>
                {u.role !== 'admin' && (
                  <button onClick={() => toggleUser.mutate(u.id)}
                    className={`btn-sm rounded-lg text-xs px-3 py-1.5 ${u.is_active ? 'btn-outline' : 'btn-primary'}`}>
                    {u.is_active ? 'Деактивирај' : 'Активирај'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
