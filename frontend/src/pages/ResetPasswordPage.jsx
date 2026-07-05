import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Spinner } from '../components/common/Loader';
import logo from '../assets/logo.png';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const eyePath = showPass
    ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
    : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z";

  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-500 font-semibold mb-4">Невалиден линк</p>
          <Link to="/forgot-password" className="btn-primary rounded-xl px-6 py-2.5 text-sm font-semibold">
            Побарај нов линк
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Лозинките не се совпаѓаат'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { token, password: form.password });
      setDone(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Грешка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="text-center mb-8">
            <Link to="/">
              <img src={logo} alt="SmestiMe" className="h-10 w-auto mx-auto mb-4" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Нова лозинка</h1>
            <p className="text-gray-500 text-sm mt-1">Внеси нова лозинка за твојата сметка</p>
          </div>

          {done ? (
            <div className="text-center space-y-4">
              <div className="text-4xl">✅</div>
              <p className="text-green-700 font-semibold">Лозинката е успешно променета!</p>
              <p className="text-gray-500 text-sm">Пренасочување кон најава...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Нова лозинка (мин. 8 знаци)"
                  className="input pr-11"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={eyePath} />
                  </svg>
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Потврди лозинка"
                  className="input pr-11"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={eyePath} />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 rounded-xl text-sm font-bold">
                {loading ? <Spinner size="sm" /> : 'Зачувај нова лозинка'}
              </button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <Link to="/login" className="text-sm text-gray-400 hover:text-gray-600">← Назад кон најава</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
