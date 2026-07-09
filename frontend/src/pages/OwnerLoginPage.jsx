import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLogin } from '../hooks/useAuth';
import { Spinner } from '../components/common/Loader';
import logo from '../assets/logo.png';
import api from '../services/api';

export default function LoginPage() {
  const login = useLogin();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [unverified, setUnverified] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setUnverified(false);
    login.mutate(form, {
      onError: (err) => {
        if (err.response?.data?.emailVerificationRequired) {
          setUnverified(true);
        }
      },
    });
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email: form.email });
      setResent(true);
    } catch {}
    setResending(false);
  };

  const eyePath = showPass
    ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
    : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="text-center mb-8">
            <Link to="/"><img src={logo} alt="SmestiMe" className="h-10 w-auto mx-auto mb-4" /></Link>
            <h1 className="text-2xl font-bold text-gray-900">Најава</h1>
            <p className="text-gray-500 text-sm mt-1">Најавете се на вашиот профил</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Е-маил" className="input" autoComplete="email" />

            <div className="relative">
              <input type={showPass ? 'text' : 'password'} required value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Лозинка" className="input pr-11" autoComplete="current-password" />
              <button type="button" onClick={() => setShowPass((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={eyePath} />
                </svg>
              </button>
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-xs text-gray-400 hover:text-gray-600">Заборавена лозинка?</Link>
            </div>

            {unverified && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <p className="text-sm text-amber-800 font-semibold mb-1">📧 Е-маилот не е потврден</p>
                <p className="text-xs text-amber-700 mb-2">Провери го твојот inbox за линкот за потврда.</p>
                {!resent ? (
                  <button type="button" onClick={handleResend} disabled={resending} className="text-xs text-brand-600 hover:underline font-semibold">
                    {resending ? 'Испраќање...' : 'Испрати линк повторно'}
                  </button>
                ) : (
                  <p className="text-xs text-green-600 font-semibold">✓ Линкот е испратен</p>
                )}
              </div>
            )}

            {login.error && !unverified && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {login.error.response?.data?.error || 'Невалидни податоци'}
              </div>
            )}

            <button type="submit" disabled={login.isPending} className="btn-primary w-full py-3 rounded-xl text-sm font-bold">
              {login.isPending ? <Spinner size="sm" /> : 'Најави се'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Немаш сметка?{' '}
            <Link to="/owner/register" className="font-semibold text-gray-900 underline">Регистрирај се</Link>
          </p>
          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <Link to="/" className="text-sm text-gray-400 hover:text-gray-600">← Назад кон сајтот</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
