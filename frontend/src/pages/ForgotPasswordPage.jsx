import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Spinner } from '../components/common/Loader';
import logo from '../assets/logo.png';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setResult(res.data);
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
            <h1 className="text-2xl font-bold text-gray-900">Заборавена лозинка</h1>
            <p className="text-gray-500 text-sm mt-1">Внеси го твојот е-маил</p>
          </div>

          {!result ? (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Е-маил"
                className="input"
                autoComplete="email"
              />

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 rounded-xl text-sm font-bold">
                {loading ? <Spinner size="sm" /> : 'Испрати линк'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
                ✓ {result.message}
              </div>

              {/* DEV MODE — show reset link directly */}
              {result.resetLink && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
                  <p className="font-semibold text-amber-800 mb-2">🔧 DEV режим — линк за ресетирање:</p>
                  <a
                    href={result.resetLink}
                    className="text-brand-600 underline break-all text-xs"
                  >
                    {result.resetLink}
                  </a>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <Link to="/login" className="text-sm text-gray-400 hover:text-gray-600">← Назад кон најава</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
