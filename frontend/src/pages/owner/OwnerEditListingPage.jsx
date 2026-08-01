import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMyListing, useUpdateListing } from '../../hooks/useOwner';
import { PageLoader, Spinner } from '../../components/common/Loader';

const CITIES = ['Охрид','Скопје','Струга','Битола','Тетово','Крушево','Маврово','Гевгелија','Куманово','Кавадарци','Струмица','Штип','Велес','Кичево','Кочани','Дебар','Радовиш','Неготино','Делчево','Виница','Ресен','Берово','Кратово','Пробиштип','Богданци','Македонска Каменица','Валандово','Македонски Брод','Демир Капија','Пехчево','Демир Хисар'];
const AMENITIES = ['WiFi','Паркинг','Клима','Греење','Кујна','Перална','ТВ','Балкон','Базен','Поглед на езеро','Поглед на планина'];
const TYPES = [
  { value: 'apartment', label: '🏢 Апартман' },
  { value: 'house', label: '🏡 Куќа' },
  { value: 'villa', label: '🌟 Вила' },
  { value: 'studio', label: '🛋️ Студио' },
  { value: 'room', label: '🛏️ Соба' },
  { value: 'hostel', label: '🏨 Хостел' },
  { value: 'office', label: '💼 Деловен простор' },
  { value: 'shop', label: '🏪 Дуќан' },
  { value: 'other', label: '📦 Друго' },
];

export default function OwnerEditListingPage() {
  const { id } = useParams();
  const { data: existing, isLoading } = useMyListing(id);
  const updateListing = useUpdateListing(id);

  const [form, setForm] = useState({
    title: '', description: '', propertyType: 'apartment',
    city: '', address: '', pricePerNight: '',
    maxGuests: 2, bedrooms: 1, bathrooms: 1,
    amenities: [], rules: '', checkInTime: '14:00', checkOutTime: '11:00',
    bookingType: 'online', promoSocial: false,
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const toggleAmenity = (a) => set('amenities',
    form.amenities.includes(a) ? form.amenities.filter((x) => x !== a) : [...form.amenities, a]
  );

  useEffect(() => {
    if (existing) {
      const amenities = Array.isArray(existing.amenities) ? existing.amenities : JSON.parse(existing.amenities || '[]');
      setForm({
        title: existing.title || '',
        description: existing.description || '',
        propertyType: existing.property_type || 'apartment',
        city: existing.city || '',
        address: existing.address || '',
        pricePerNight: existing.price_per_night || '',
        maxGuests: existing.max_guests || 2,
        bedrooms: existing.bedrooms || 1,
        bathrooms: existing.bathrooms || 1,
        amenities,
        rules: existing.rules || '',
        checkInTime: existing.check_in_time || '14:00',
        checkOutTime: existing.check_out_time || '11:00',
        bookingType: existing.booking_type || 'online',
        promoSocial: existing.promo_social || false,
      });
    }
  }, [existing]);

  if (isLoading) return <PageLoader />;

  const handleSubmit = (e) => {
    e.preventDefault();
    updateListing.mutate({
      ...form,
      pricePerNight: parseFloat(form.pricePerNight),
      maxGuests: parseInt(form.maxGuests),
      bedrooms: parseInt(form.bedrooms),
      bathrooms: parseInt(form.bathrooms),
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/owner/listings" className="text-gray-400 hover:text-gray-600 text-sm">← Назад</Link>
        <h1 className="text-2xl font-bold text-gray-900">Уреди оглас</h1>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
        ⚠️ По уредувањето, огласот ќе чека повторно одобрување.
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Type */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Тип на сместување</h2>
          <div className="grid grid-cols-3 gap-2">
            {TYPES.map(({ value, label }) => (
              <button key={value} type="button" onClick={() => set('propertyType', value)}
                className={`p-3 rounded-xl border text-sm font-medium transition-all ${form.propertyType === value ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 hover:border-gray-400'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Basic info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Основни информации</h2>
          <input type="text" required value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Наслов" className="input" maxLength={100} />
          <textarea required value={form.description} onChange={(e) => set('description', e.target.value)} rows={4} placeholder="Опис" className="input resize-none" />
          <div className="grid grid-cols-3 gap-3">
            <div><p className="text-xs text-gray-500 mb-1">Гости (макс)</p><input type="number" min="1" max="50" value={form.maxGuests} onChange={(e) => set('maxGuests', e.target.value)} className="input" /></div>
            <div><p className="text-xs text-gray-500 mb-1">Спални</p><input type="number" min="0" max="20" value={form.bedrooms} onChange={(e) => set('bedrooms', e.target.value)} className="input" /></div>
            <div><p className="text-xs text-gray-500 mb-1">Бањи</p><input type="number" min="0" max="10" value={form.bathrooms} onChange={(e) => set('bathrooms', e.target.value)} className="input" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><p className="text-xs text-gray-500 mb-1">Check-in</p><input type="time" value={form.checkInTime} onChange={(e) => set('checkInTime', e.target.value)} className="input" /></div>
            <div><p className="text-xs text-gray-500 mb-1">Check-out</p><input type="time" value={form.checkOutTime} onChange={(e) => set('checkOutTime', e.target.value)} className="input" /></div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Локација и цена</h2>
          <select value={form.city} onChange={(e) => set('city', e.target.value)} className="input">
            <option value="" disabled>Избери град</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="text" required value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Адреса" className="input" />
          <div className="relative">
            <input type="number" required min="0" value={form.pricePerNight} onChange={(e) => set('pricePerNight', e.target.value)} placeholder="Цена по ноќ" className="input pr-14" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">МКД</span>
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Погодности</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {AMENITIES.map((a) => (
              <label key={a} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all">
                <input type="checkbox" checked={form.amenities.includes(a)} onChange={() => toggleAmenity(a)} className="w-4 h-4 accent-brand-500" />
                <span className="text-sm text-gray-700">{a}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Rules */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Правила (опционално)</h2>
          <textarea value={form.rules} onChange={(e) => set('rules', e.target.value)} placeholder="пр. Забрането пушење..." rows={3} className="input resize-none" />
        </div>

        {/* Booking type */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-2">Начин на резервирање</h2>
          <p className="text-sm text-gray-500 mb-4">Избери како гостите ќе ги праќаат резервациите.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button type="button" onClick={() => set('bookingType', 'online')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${form.bookingType === 'online' ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-400'}`}>
              <div className="text-2xl mb-2">📅</div>
              <p className="font-semibold text-gray-900 text-sm">Онлајн резервација</p>
              <p className="text-xs text-gray-500 mt-1">Гостите пополнуваат форма. Ти добиваш барање и го потврдуваш.</p>
              {form.bookingType === 'online' && <span className="inline-block mt-2 text-xs font-bold text-brand-600">✓ Избрано</span>}
            </button>
            <button type="button" onClick={() => set('bookingType', 'contact')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${form.bookingType === 'contact' ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-400'}`}>
              <div className="text-2xl mb-2">📞</div>
              <p className="font-semibold text-gray-900 text-sm">Контакт резервација</p>
              <p className="text-xs text-gray-500 mt-1">Гостите гледаат само твој телефон и е-маил.</p>
              {form.bookingType === 'contact' && <span className="inline-block mt-2 text-xs font-bold text-brand-600">✓ Избрано</span>}
            </button>
          </div>
        </div>

        {/* Promo social */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={form.promoSocial} onChange={(e) => set('promoSocial', e.target.checked)}
              className="w-5 h-5 accent-brand-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-900 text-sm">Бесплатна промоција на социјални мрежи</p>
              <p className="text-xs text-gray-500 mt-1">Сакам мојот оглас да биде бесплатно промовиран на социјалните мрежи како Instagram, TikTok и друго.</p>
            </div>
          </label>
        </div>

        <div className="flex gap-3 justify-end pb-4">
          <Link to="/owner/listings" className="btn-outline rounded-xl px-6 py-2.5 text-sm font-semibold">Откажи</Link>
          <button type="submit" disabled={updateListing.isPending} className="btn-primary rounded-xl px-8 py-2.5 text-sm font-semibold flex items-center gap-2">
            {updateListing.isPending ? <><Spinner size="sm" /> Зачувување...</> : 'Зачувај промени'}
          </button>
        </div>
      </form>
    </div>
  );
}
