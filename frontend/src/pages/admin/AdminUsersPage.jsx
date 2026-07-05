import { useAdminUsers } from '../../hooks/useAdmin';
import { PageLoader } from '../../components/common/Loader';
import { format } from 'date-fns';

export default function AdminUsersPage() {
  const { data, isLoading } = useAdminUsers();

  if (isLoading) return <PageLoader />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-ink mb-6">Admin корисници</h1>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Корисник', 'Улога', 'Статус', 'Регистриран'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data?.users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-5 py-4">
                  <p className="font-medium text-ink">{user.first_name} {user.last_name}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </td>
                <td className="px-5 py-4">
                  <span className="badge badge-blue">{user.role}</span>
                </td>
                <td className="px-5 py-4">
                  <span className={`badge ${user.is_active ? 'badge-green' : 'badge-red'}`}>
                    {user.is_active ? 'Активен' : 'Неактивен'}
                  </span>
                </td>
                <td className="px-5 py-4 text-gray-400 text-xs">
                  {format(new Date(user.created_at), 'dd.MM.yyyy')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}