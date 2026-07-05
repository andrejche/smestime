import { useState, useEffect } from 'react';
import { useOwnerProfile, useUpdateOwnerProfile } from '../../hooks/useOwner';
import { useAuthStore } from '../../store/auth.store';
import { useLogout } from '../../hooks/useAuth';
import { PageLoader, Spinner } from '../../components/common/Loader';

export default function OwnerProfilePage() {
  const { data: profile, isLoading } = useOwnerProfile();
  const updateProfile = useUpdateOwnerProfile();
  const { updateUser } = useAuthStore();
  const logout = useLogout();
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '' });

  useEffect(() => {
    if (profile) setForm({ firstName: profile.first_name || '', lastName: profile.last_name || '', phone: profile.phone || '' });
  }, [profile]);

  if (isLoading) return <PageLoader />;

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile.mutate(form, {
      onSuccess: (data) => updateUser({ firstName: data.first_name, lastName: data.last_name }),
    });
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Мој профил</h1>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="w-14 h-14 rounded-full bg-brand-500 flex items-center justify-center text-white text-xl font-bold">
            {profile?.first_name?.[0]}{profile?.last_name?.[0]}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{profile?.first_name} {profile?.last_name}</p>
            <p className="text-sm text-gray-500">{profile?.email}</p>
            <span className="badge badge-green mt-1">Домаќин</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Ime</label>
              <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Prezime</label>
              <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="input" />
            </div>
          </div>
          <div>
            <label className="label">Телефон</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+389 70 123 456" className="input" />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={updateProfile.isPending} className="btn-primary rounded-xl px-6 py-2.5 text-sm font-semibold flex items-center gap-2">
              {updateProfile.isPending ? <><Spinner size="sm" /> Зачувување...</> : 'Зачувај'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Сметка</h2>
        <button onClick={() => logout.mutate()} className="btn-danger rounded-xl px-5 py-2.5 text-sm font-semibold w-full">
          ↩ Одјави се
        </button>
      </div>
    </div>
  );
}
