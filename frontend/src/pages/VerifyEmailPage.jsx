import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import api from '../services/api';
import { Spinner } from '../components/common/Loader';
import logo from '../assets/logo.png';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) { setStatus('error'); setError('Невалиден линк'); return; }
    api.post('/auth/verify-email', { token })
      .then((res) => {
        if (res.data.user && res.data.accessToken) {
          setAuth(res.data.user, res.data.accessToken);
        }
        setStatus('success');
        setTimeout(() => navigate('/owner'), 2000);
      })
      .catch((err) => {
        const msg = err.response?.data?.error || 'Грешка при потврда';
        // If already verified, treat as success
        if (msg.includes('искористен') || msg.includes('веќе')) {
          setStatus('already_verified');
        } else {
          setStatus('error');
          setError(msg);
        }
      });
  }, [token]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <Link to="/">
            <img src={logo} alt="SmestiMe" className="h-10 w-auto mx-auto mb-6" />
          </Link>

          {status === 'loading' && (
            <>
              <Spinner size="lg" />
              <p className="text-gray-500 mt-4">Потврдување на е-маил...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="text-5xl mb-4">✅</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Е-маилот е потврден!</h1>
              <p className="text-gray-500 text-sm mb-6">Пренасочување кон контролна табла...</p>
              <Spinner size="md" />
            </>
          )}

          {status === 'already_verified' && (
            <>
              <div className="text-5xl mb-4">✅</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Сметката е активна!</h1>
              <p className="text-gray-500 text-sm mb-6">Е-маилот е веќе потврден. Можеш да се најавиш.</p>
              <Link to="/login" className="btn-primary rounded-xl px-6 py-3 text-sm font-bold w-full block">
                Најави се →
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="text-5xl mb-4">❌</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Грешка</h1>
              <p className="text-red-500 text-sm mb-6">{error}</p>
              <Link to="/login" className="btn-primary rounded-xl px-6 py-3 text-sm font-bold w-full block">
                Најави се
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};