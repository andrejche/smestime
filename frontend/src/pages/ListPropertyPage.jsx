import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuthStore } from '../store/auth.store';
import { Spinner } from '../components/common/Loader';

const MACEDONIAN_CITIES = ['Охрид','Скопје','Струга','Битола','Тетово','Крушево','Маврово','Гевгелија','Куманово','Кавадарци','Струмица','Штип','Велес','Кичево','Кочани','Дебар','Радовиш','Неготино','Делчево','Виница','Ресен','Берово','Кратово','Пробиштип','Богданци','Македонска Каменица','Валандово','Македонски Брод','Демир Капија','Пехчево','Демир Хисар'];
const AMENITIES = ['WiFi','Паркинг','Клима','Греење','Кујна','Перална','ТВ','Балкон','Базен','Поглед на езеро','Поглед на планина'];
const PROPERTY_TYPES = [
  { value: 'apartment', label: '🏢 Апартман' },
  { value: 'house', label: '🏡 Куќа' },
  { value: 'villa', label: '🌟 Вила' },
  { value: 'studio', label: '🛋️ Студио' },
  { value: 'room', label: '🛏️ Соба' },
  { value: 'hostel', label: '🏨 Хостел' },
];
const STEPS = ['Основни инфо', 'Локација и цена', 'Слики', 'Сметка'];

function FieldError({ error }) {
  if (!error) return null;
  return <p className="text-xs text-red-500 mt-1 ml-1">{error}</p>;
}

const validatePhone = (phone) => /^(\+?389|0)[\s-]?[0-9]{2}[\s-]?[0-9]{3}[\s-]?[0-9]{3}$/.test(phone.replace(/\s/g, ''));
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function ListPropertyPage() {
  const { isAuthenticated, user, setAuth } = useAuthStore();

  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [form, setForm] = useState({
    title: '', description: '', propertyType: 'apartment',
    city: '', address: '', pricePerNight: '',
    maxGuests: 2, bedrooms: 1, bathrooms: 1,
    amenities: [], bookingType: 'online', promoSocial: false,
  });

  const [accountMode, setAccountMode] = useState('register');
  const [accountForm, setAccountForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [accountErrors, setAccountErrors] = useState({});
  const [showPass, setShowPass] = useState(false);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const toggleAmenity = (a) => setField('amenities',
    form.amenities.includes(a) ? form.amenities.filter((x) => x !== a) : [...form.amenities, a]
  );

  const handleFiles = (files) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/')).slice(0, 20);
    setSelectedFiles(arr);
    setPreviews([]);
    arr.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (e) => setPreviews((p) => [...p, e.target.result]);
      reader.readAsDataURL(f);
    });
  };

  const stepLabels = isAuthenticated ? ['Основни инфо', 'Локација и цена', 'Слики'] : STEPS;

  const canProceed = () => {
    if (step === 0) return form.title && form.description && form.propertyType;
    if (step === 1) return form.city && form.address && form.pricePerNight > 0;
    return true;
  };

  const validateAccount = () => {
    const e = {};
    if (accountMode === 'register') {
      if (!accountForm.firstName.trim()) e.firstName = 'Името е задолжително';
      if (!accountForm.lastName.trim()) e.lastName = 'Презимето е задолжително';
      if (!accountForm.email.trim()) e.email = 'Е-маилот е задолжителен';
      else if (!validateEmail(accountForm.email)) e.email = 'Внеси валидна е-маил адреса';
      if (!accountForm.phone.trim()) e.phone = 'Телефонот е задолжителен';
      else if (!validatePhone(accountForm.phone)) e.phone = 'Внеси валиден македонски телефон (пр. 071 234 567)';
      if (!accountForm.password) e.password = 'Лозинката е задолжителна';
      else if (accountForm.password.length < 8) e.password = 'Лозинката мора да има најмалку 8 знаци';
      if (!accountForm.confirmPassword) e.confirmPassword = 'Потврди ја лозинката';
      else if (accountForm.password !== accountForm.confirmPassword) e.confirmPassword = 'Лозинките не се совпаѓаат';
    } else {
      if (!accountForm.email.trim()) e.email = 'Е-маилот е задолжителен';
      else if (!validateEmail(accountForm.email)) e.email = 'Внеси валидна е-маил адреса';
      if (!accountForm.password) e.password = 'Лозинката е задолжителна';
    }
    return e;
  };

  const handleAccountSubmit = async () => {
    const errs = validateAccount();
    if (Object.keys(errs).length > 0) { setAccountErrors(errs); return false; }
    setAccountErrors({});
    try {
      if (accountMode === 'register') {
        const res = await api.post('/auth/register', {
          firstName: accountForm.firstName,
          lastName: accountForm.lastName,
          email: accountForm.email,
          phone: accountForm.phone,
          password: accountForm.password,
          skipVerification: true,
        });
        setAuth(res.data.user, res.data.accessToken);
      } else {
        const res = await api.post('/auth/login', { email: accountForm.email, password: accountForm.password });
        setAuth(res.data.user, res.data.accessToken);
      }
      return true;
    } catch (err) {
      const msg = err.response?.data?.error || 'Грешка';
      const field = err.response?.data?.field;
      if (field) setAccountErrors((p) => ({ ...p, [field]: msg }));
      else setAccountErrors({ general: msg });
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      const ok = await handleAccountSubmit();
      if (!ok) return;
    }
    setLoading(true);
    try {
      const res = await api.post('/owner/listings', {
        title: form.title, description: form.description, propertyType: form.propertyType,
        city: form.city, address: form.address, pricePerNight: parseFloat(form.pricePerNight),
        maxGuests: parseInt(form.maxGuests), bedrooms: parseInt(form.bedrooms), bathrooms: parseInt(form.bathrooms),
        amenities: form.amenities, bookingType: form.bookingType, promoSocial: form.promoSocial,
      });
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach((f) => formData.append('images', f));
        await api.post(`/owner/listings/${res.data.id}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка при поднесување');
    } finally { setLoading(false); }
  };

  const eyePath = showPass
    ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
    : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z";

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">⏳</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Огласот е поднесен!</h1>
          <p className="text-gray-500 leading-relaxed mb-6">Твојот оглас е во преглед и ќе биде одобрен во рок од 24 часа.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/owner" className="btn-primary rounded-xl px-6 py-3 font-semibold">Кон контролна табла →</Link>
            <Link to="/" className="btn-outline rounded-xl px-6 py-3 font-semibold">Почетна</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Додај оглас</h1>
        <p className="text-gray-500 text-sm">Пополни ги информациите за твојот простор</p>
      </div>

      <div className="flex items-center gap-2 mb-8">
        {stepLabels.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${i < step ? 'bg-brand-500 text-white' : i === step ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-gray-900' : 'text-gray-400'}`}>{s}</span>
            {i < stepLabels.length - 1 && <div className={`flex-1 h-px ${i < step ? 'bg-brand-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">

        {/* Step 0 */}
        {step === 0 && (
          <>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Тип на сместување</p>
              <div className="grid grid-cols-3 gap-2">
                {PROPERTY_TYPES.map(({ value, label }) => (
                  <button key={value} type="button" onClick={() => setField('propertyType', value)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${form.propertyType === value ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 hover:border-gray-400'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <input type="text" value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="Наслов на огласот" className="input" maxLength={100} />
            <textarea value={form.description} onChange={(e) => setField('description', e.target.value)} placeholder="Опис на просторот..." rows={4} className="input resize-none" />
            <div className="grid grid-cols-3 gap-3">
              <div><p className="text-xs text-gray-500 mb-1">Гости (макс)</p><input type="number" min="1" max="50" value={form.maxGuests} onChange={(e) => setField('maxGuests', e.target.value)} className="input" /></div>
              <div><p className="text-xs text-gray-500 mb-1">Спални</p><input type="number" min="0" max="20" value={form.bedrooms} onChange={(e) => setField('bedrooms', e.target.value)} className="input" /></div>
              <div><p className="text-xs text-gray-500 mb-1">Бањи</p><input type="number" min="0" max="10" value={form.bathrooms} onChange={(e) => setField('bathrooms', e.target.value)} className="input" /></div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Погодности</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AMENITIES.map((a) => (
                  <label key={a} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all">
                    <input type="checkbox" checked={form.amenities.includes(a)} onChange={() => toggleAmenity(a)} className="w-4 h-4 accent-brand-500" />
                    <span className="text-sm text-gray-700">{a}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Начин на резервирање</p>
              <p className="text-xs text-gray-500 mb-3">Избери kako гостите ќе ги праќаат резервациите.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button type="button" onClick={() => setField('bookingType', 'online')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${form.bookingType === 'online' ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-400'}`}>
                  <div className="text-2xl mb-2">📅</div>
                  <p className="font-semibold text-gray-900 text-sm">Онлајн резервација</p>
                  <p className="text-xs text-gray-500 mt-1">Гостите пополнуваат форма. Ти добиваш барање и го потврдуваш.</p>
                  {form.bookingType === 'online' && <span className="inline-block mt-2 text-xs font-bold text-brand-600">✓ Избрано</span>}
                </button>
                <button type="button" onClick={() => setField('bookingType', 'contact')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${form.bookingType === 'contact' ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-400'}`}>
                  <div className="text-2xl mb-2">📞</div>
                  <p className="font-semibold text-gray-900 text-sm">Контакт резервација</p>
                  <p className="text-xs text-gray-500 mt-1">Гостите гледаат само твој телефон и е-маил.</p>
                  {form.bookingType === 'contact' && <span className="inline-block mt-2 text-xs font-bold text-brand-600">✓ Избрано</span>}
                </button>
              </div>
            </div>
            {/* Promo social checkbox */}
            <div className="border border-gray-200 rounded-xl p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={form.promoSocial} onChange={(e) => setField('promoSocial', e.target.checked)}
                  className="w-5 h-5 accent-brand-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Бесплатна промоција на социјални мрежи</p>
                  <p className="text-xs text-gray-500 mt-1">Сакам мојот оглас да биде бесплатно промовиран на социјалните мрежи како Instagram, TikTok и друго.</p>
                </div>
              </label>
            </div>
          </>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <>
            <select value={form.city} onChange={(e) => setField('city', e.target.value)} className="input">
              <option value="" disabled>Избери град</option>
              {MACEDONIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <div>
              <input type="text" value={form.address} onChange={(e) => setField('address', e.target.value)} placeholder="Адреса" className="input" />
              <p className="text-xs text-gray-400 mt-1">Точната адреса е видлива само по потврдена резервација</p>
            </div>
            <div className="relative">
              <input type="number" value={form.pricePerNight} onChange={(e) => setField('pricePerNight', e.target.value)} placeholder="Цена по ноќ" min="0" className="input pr-16" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">МКД</span>
            </div>
          </>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <>
            <div onClick={() => document.getElementById('img-input').click()}
              className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-all">
              <div className="text-4xl mb-3">📷</div>
              <p className="text-sm font-semibold text-gray-600">Кликни за да додадеш слики</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP · макс. 10MB · до 20 слики</p>
              <input id="img-input" type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
            </div>
            {previews.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">{previews.length} слики избрани</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {previews.map((src, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      {i === 0 && <span className="absolute bottom-1 left-1 bg-brand-500 text-white text-xs px-1.5 py-0.5 rounded-md font-medium">Насловна</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Step 3 — Account */}
        {step === 3 && !isAuthenticated && (
          <>
            <div>
              <h2 className="font-bold text-gray-900 text-lg mb-1">Создај сметка</h2>
              <p className="text-gray-500 text-sm mb-4">Потребна е сметка за да го управуваш твојот оглас.</p>
            </div>
            <div className="flex rounded-xl border border-gray-200 p-1">
              {[{ value: 'register', label: 'Нова сметка' }, { value: 'login', label: 'Веќе имам сметка' }].map(({ value, label }) => (
                <button key={value} type="button" onClick={() => { setAccountMode(value); setAccountErrors({}); }}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${accountMode === value ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-800'}`}>
                  {label}
                </button>
              ))}
            </div>
            {accountMode === 'register' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input type="text" value={accountForm.firstName} onChange={(e) => setAccountForm((p) => ({ ...p, firstName: e.target.value }))} placeholder="Име" className={`input ${accountErrors.firstName ? 'input-error' : ''}`} />
                    <FieldError error={accountErrors.firstName} />
                  </div>
                  <div>
                    <input type="text" value={accountForm.lastName} onChange={(e) => setAccountForm((p) => ({ ...p, lastName: e.target.value }))} placeholder="Презиме" className={`input ${accountErrors.lastName ? 'input-error' : ''}`} />
                    <FieldError error={accountErrors.lastName} />
                  </div>
                </div>
                <div>
                  <input type="text" value={accountForm.email} onChange={(e) => setAccountForm((p) => ({ ...p, email: e.target.value }))} placeholder="Е-маил" className={`input ${accountErrors.email ? 'input-error' : ''}`} />
                  <FieldError error={accountErrors.email} />
                </div>
                <div>
                  <input type="tel" value={accountForm.phone} onChange={(e) => setAccountForm((p) => ({ ...p, phone: e.target.value }))} placeholder="Телефон (пр. 071 234 567)" className={`input ${accountErrors.phone ? 'input-error' : ''}`} />
                  <FieldError error={accountErrors.phone} />
                </div>
                <div>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} value={accountForm.password} onChange={(e) => setAccountForm((p) => ({ ...p, password: e.target.value }))} placeholder="Лозинка (мин. 8 знаци)" className={`input pr-11 ${accountErrors.password ? 'input-error' : ''}`} />
                    <button type="button" onClick={() => setShowPass((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={eyePath} /></svg>
                    </button>
                  </div>
                  <FieldError error={accountErrors.password} />
                </div>
                <div>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} value={accountForm.confirmPassword} onChange={(e) => setAccountForm((p) => ({ ...p, confirmPassword: e.target.value }))} placeholder="Потврди лозинка" className={`input pr-11 ${accountErrors.confirmPassword ? 'input-error' : ''}`} />
                    <button type="button" onClick={() => setShowPass((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={eyePath} /></svg>
                    </button>
                  </div>
                  <FieldError error={accountErrors.confirmPassword} />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <input type="text" value={accountForm.email} onChange={(e) => setAccountForm((p) => ({ ...p, email: e.target.value }))} placeholder="Е-маил" className={`input ${accountErrors.email ? 'input-error' : ''}`} />
                  <FieldError error={accountErrors.email} />
                </div>
                <div>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} value={accountForm.password} onChange={(e) => setAccountForm((p) => ({ ...p, password: e.target.value }))} placeholder="Лозинка" className={`input pr-11 ${accountErrors.password ? 'input-error' : ''}`} />
                    <button type="button" onClick={() => setShowPass((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={eyePath} /></svg>
                    </button>
                  </div>
                  <FieldError error={accountErrors.password} />
                </div>
              </div>
            )}
            {accountErrors.general && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{accountErrors.general}</div>}
          </>
        )}

        {step === 3 && isAuthenticated && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
            ✓ Најавен/а си како <strong>{user?.firstName} {user?.lastName}</strong>. Огласот ќе биде поврзан со твојата сметка.
          </div>
        )}

        <div className="flex justify-between pt-4 border-t border-gray-100">
          <button type="button" onClick={() => setStep((p) => p - 1)} disabled={step === 0} className="btn-outline rounded-xl px-6 py-2.5 text-sm font-semibold disabled:opacity-0">
            ← Назад
          </button>
          {step < (isAuthenticated ? 2 : 3) ? (
            <button type="button" onClick={() => setStep((p) => p + 1)} disabled={!canProceed()} className="btn-primary rounded-xl px-8 py-2.5 text-sm font-semibold disabled:opacity-50">
              Следно →
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={loading} className="btn-primary rounded-xl px-8 py-2.5 text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
              {loading ? <><Spinner size="sm" /> Поднесување...</> : 'Поднеси оглас'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
