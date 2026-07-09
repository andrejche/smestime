import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import api from '../services/api';
import { Spinner } from '../components/common/Loader';
import logo from '../assets/logo.png';

function FieldError({ error }) {
  if (!error) return null;
  return <p className="text-xs text-red-500 mt-1 ml-1">{error}</p>;
}

const validatePhone = (phone) => /^(\+?389|0)[\s-]?[0-9]{2}[\s-]?[0-9]{3}[\s-]?[0-9]{3}$/.test(phone.replace(/\s/g, ''));
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function OwnerRegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'Името е задолжително';
    if (!form.lastName.trim()) e.lastName = 'Презимето е задолжително';
    if (!form.email.trim()) e.email = 'Е-маилот е задолжителен';
    else if (!validateEmail(form.email)) e.email = 'Внеси валидна е-маил адреса';
    if (!form.phone.trim()) e.phone = 'Телефонот е задолжителен';
    else if (!validatePhone(form.phone)) e.phone = 'Внеси валиден македонски телефон (пр. 071 234 567)';
    if (!form.password) e.password = 'Лозинката е задолжителна';
    else if (form.password.length < 8) e.password = 'Лозинката мора да има најмалку 8 знаци';
    if (!form.confirmPassword) e.confirmPassword = 'Потврди ја лозинката';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Лозинките не се совпаѓаат';
    return e;
  };

  const register = useMutation({
    mutationFn: (data) => api.post('/auth/register', data).then((r) => r.data),
    onSuccess: () => setSubmitted(true),
    onError: (err) => {
      const msg = err.response?.data?.error || 'Грешка при регистрација';
      const field = err.response?.data?.field;
      if (field) setErrors((p) => ({ ...p, [field]: msg }));
      else setErrors({ general: msg });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    register.mutate({ firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone, password: form.password });
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

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <Link to="/"><img src={logo} alt="SmestiMe" className="h-10 w-auto mx-auto mb-6" /></Link>
            <div className="text-5xl mb-4">📧</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Провери го е-маилот!</h1>
            <p className="text-gray-500 text-sm mb-2">
              Испративме линк за потврда на:
            </p>
            <p className="font-semibold text-gray-900 mb-6">{form.email}</p>
            <p className="text-gray-400 text-xs mb-6">Ако не го гледаш, провери го Spam/Junk фолдерот.</p>
            {!resent ? (
              <button onClick={handleResend} disabled={resending} className="text-sm text-brand-600 hover:underline">
                {resending ? 'Испраќање...' : 'Испрати повторно'}
              </button>
            ) : (
              <p className="text-sm text-green-600">✓ Линкот е испратен повторно</p>
            )}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <Link to="/login" className="text-sm text-gray-400 hover:text-gray-600">← Назад кон најава</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="text-center mb-8">
            <Link to="/"><img src={logo} alt="SmestiMe" className="h-10 w-auto mx-auto mb-4" /></Link>
            <h1 className="text-2xl font-bold text-gray-900">Регистрација</h1>
            <p className="text-gray-500 text-sm mt-1">Создај сметка за домаќини</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input type="text" value={form.firstName}
                  onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                  placeholder="Име" className={`input ${errors.firstName ? 'input-error' : ''}`} />
                <FieldError error={errors.firstName} />
              </div>
              <div>
                <input type="text" value={form.lastName}
                  onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                  placeholder="Презиме" className={`input ${errors.lastName ? 'input-error' : ''}`} />
                <FieldError error={errors.lastName} />
              </div>
            </div>
            <div>
              <input type="text" value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="Е-маил" className={`input ${errors.email ? 'input-error' : ''}`} autoComplete="email" />
              <FieldError error={errors.email} />
            </div>
            <div>
              <input type="tel" value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="Телефон (пр. 071 234 567)" className={`input ${errors.phone ? 'input-error' : ''}`} />
              <FieldError error={errors.phone} />
            </div>
            <div>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Лозинка (мин. 8 знаци)" className={`input pr-11 ${errors.password ? 'input-error' : ''}`} />
                <button type="button" onClick={() => setShowPass((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={eyePath} /></svg>
                </button>
              </div>
              <FieldError error={errors.password} />
            </div>
            <div>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form.confirmPassword}
                  onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="Потврди лозинка" className={`input pr-11 ${errors.confirmPassword ? 'input-error' : ''}`} />
                <button type="button" onClick={() => setShowPass((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={eyePath} /></svg>
                </button>
              </div>
              <FieldError error={errors.confirmPassword} />
            </div>
            {errors.general && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{errors.general}</div>
            )}
            <button type="submit" disabled={register.isPending} className="btn-primary w-full py-3 rounded-xl text-sm font-bold">
              {register.isPending ? <Spinner size="sm" /> : 'Регистрирај се'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Веќе имаш сметка?{' '}
            <Link to="/login" className="font-semibold text-gray-900 underline">Најави се</Link>
          </p>
          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <Link to="/" className="text-sm text-gray-400 hover:text-gray-600">← Назад кон сајтот</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
