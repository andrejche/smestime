import { useState } from 'react';
import { differenceInCalendarDays } from 'date-fns';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function BookingWidget({ property }) {
  const { t } = useTranslation();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const nights = checkIn && checkOut ? differenceInCalendarDays(new Date(checkOut), new Date(checkIn)) : 0;
  const totalPrice = nights > 0 ? nights * parseFloat(property.price_per_night) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (nights < 1) return toast.error(t('booking.date_error'));
    if (guests > property.max_guests) return toast.error(`${t('booking.guests_error')} ${property.max_guests}`);

    setLoading(true);
    try {
      await api.post('/bookings', {
        propertyId: property.id,
        checkIn, checkOut, guests,
        guestName: name, guestEmail: email, guestPhone: phone,
        specialRequests: message || undefined,
      });
      setDone(true);
      toast.success(t('booking.success_title'));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="border border-gray-200 rounded-2xl p-6 bg-white text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-lg font-bold text-ink mb-2">{t('booking.success_title')}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">
          {t('booking.success_desc')} <strong>{email}</strong> {t('booking.success_desc2')}
        </p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-card">
      <div className="flex items-baseline gap-1 mb-5">
        <span className="text-2xl font-bold text-ink">{parseInt(property.price_per_night).toLocaleString()} {property.currency || 'МКД'}</span>
        <span className="text-gray-500 text-sm">{t('booking.per_night')}</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="border border-gray-300 rounded-xl overflow-hidden">
          <div className="grid grid-cols-2 divide-x divide-gray-300">
            <div className="p-3">
              <p className="text-xs font-bold text-ink uppercase tracking-wide mb-1">{t('booking.checkin')}</p>
                <input type="date" required value={checkIn}
                  min={new Date().toISOString().split('T')[0]}
                  max="2026-12-31"
                  onChange={(e) => { setCheckIn(e.target.value); if (checkOut && e.target.value >= checkOut) setCheckOut(''); }}
                  className="w-full text-sm text-gray-700 outline-none bg-transparent cursor-pointer" />
            </div>
            <div className="p-3">
              <p className="text-xs font-bold text-ink uppercase tracking-wide mb-1">{t('booking.checkout')}</p>
              <input type="date" required value={checkOut}
                min={checkIn || new Date().toISOString().split('T')[0]}
                max={checkIn ? new Date(new Date(checkIn).setMonth(new Date(checkIn).getMonth() + 3)).toISOString().split('T')[0] : '2026-12-31'}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full text-sm text-gray-700 outline-none bg-transparent cursor-pointer" />
            </div>
          </div>
          <div className="border-t border-gray-300 p-3 flex items-center justify-between">
            <p className="text-xs font-bold text-ink uppercase tracking-wide">{t('booking.guests')}</p>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setGuests(Math.max(1, guests - 1))}
                className="w-7 h-7 rounded-full border border-gray-400 flex items-center justify-center text-gray-600 hover:border-ink disabled:opacity-30 transition-colors"
                disabled={guests <= 1}>−</button>
              <span className="text-sm font-medium w-4 text-center">{guests}</span>
              <button type="button" onClick={() => setGuests(Math.min(property.max_guests, guests + 1))}
                className="w-7 h-7 rounded-full border border-gray-400 flex items-center justify-center text-gray-600 hover:border-ink disabled:opacity-30 transition-colors"
                disabled={guests >= property.max_guests}>+</button>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          <p className="text-xs font-bold text-ink uppercase tracking-wide">{t('booking.contact_info')}</p>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder={t('booking.name_placeholder')} className="input text-sm" />
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('booking.email_placeholder')} className="input text-sm" />
          <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('booking.phone_placeholder')} className="input text-sm" />
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t('booking.message_placeholder')} rows={2} className="input text-sm resize-none" />
        </div>

        {nights > 0 && (
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>{parseInt(property.price_per_night).toLocaleString()} × {nights} {nights === 1 ? t('booking.night') : t('booking.nights')}</span>
              <span>{totalPrice.toLocaleString()} МКД</span>
            </div>
            <div className="flex justify-between font-bold text-ink border-t border-gray-200 pt-2">
              <span>{t('booking.total')}</span>
              <span>{totalPrice.toLocaleString()} МКД</span>
            </div>
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 transition-colors disabled:opacity-50">
          {loading ? t('booking.submitting') : nights < 1 ? t('booking.check_availability') : t('booking.submit')}
        </button>
        <p className="text-center text-xs text-gray-400">{t('booking.no_charge')}</p>
      </form>
    </div>
  );
}
