import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProperty } from '../hooks/useProperties';
import BookingWidget from '../components/booking/BookingWidget';
import { PageLoader } from '../components/common/Loader';

const AMENITY_ICONS = {
  'WiFi': '📶', 'Клима': '❄️', 'Паркинг': '🅿️', 'Кујна': '🍳',
  'Базен': '🏊', 'Поглед на езеро': '🌊', 'Греење': '🔆',
  'Поглед на планина': '⛰️', 'Перална': '🫧', 'ТВ': '📺', 'Балкон': '🌇',
};

const TYPE_LABELS = {
  apartment: 'Апартман', house: 'Куќа', room: 'Соба',
  villa: 'Вила', studio: 'Студио', hostel: 'Хостел',
};

function Stars({ value }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <svg key={s} className={`w-4 h-4 ${s <= Math.round(value) ? 'fill-gray-900' : 'fill-gray-200'}`} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  );
}

function ContactWidget({ property }) {
  const [copied, setCopied] = useState(null);

  const copy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-card">
      <div className="flex items-baseline gap-1 mb-5">
        <span className="text-2xl font-bold text-gray-900">{parseInt(property.price_per_night).toLocaleString()} МКД</span>
        <span className="text-gray-500 text-sm">/ ноќ</span>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 mb-5">
        <p className="text-sm font-semibold text-gray-700 mb-1">За резервации контактирај го домаќинот:</p>
        <p className="text-xs text-gray-500">Огласот не поддржува онлајн резервации.</p>
      </div>

      <div className="space-y-3">
        {property.owner_phone && (
          <a href={`tel:${property.owner_phone}`}
            className="flex items-center gap-3 w-full bg-brand-500 hover:bg-brand-600 text-white rounded-xl px-4 py-3.5 transition-colors">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <div className="flex-1 text-left">
              <p className="text-xs font-medium opacity-80">Телефон</p>
              <p className="font-semibold text-sm">{property.owner_phone}</p>
            </div>
            <button type="button" onClick={(e) => { e.preventDefault(); copy(property.owner_phone, 'phone'); }}
              className="text-white/70 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0">
              {copied === 'phone' ? '✓' : '📋'}
            </button>
          </a>
        )}

        {property.owner_email && (
          <a href={`mailto:${property.owner_email}`}
            className="flex items-center gap-3 w-full border-2 border-gray-200 hover:border-brand-400 text-gray-700 rounded-xl px-4 py-3.5 transition-colors">
            <svg className="w-5 h-5 flex-shrink-0 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <div className="flex-1 text-left">
              <p className="text-xs font-medium text-gray-400">E-mail</p>
              <p className="font-semibold text-sm truncate">{property.owner_email}</p>
            </div>
            <button type="button" onClick={(e) => { e.preventDefault(); copy(property.owner_email, 'email'); }}
              className="text-gray-400 hover:text-gray-600 text-xs px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0">
              {copied === 'email' ? '✓' : '📋'}
            </button>
          </a>
        )}

        {property.owner_name && (
          <div className="flex items-center gap-3 text-sm text-gray-500 pt-1">
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-sm flex-shrink-0">
              {property.owner_name[0]}
            </div>
            <span>{property.owner_name}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PropertyDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { data: property, isLoading, error } = useProperty(id);

  if (isLoading) return <PageLoader />;
  if (error || !property) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <p className="text-xl font-semibold text-gray-700 mb-4">{t('property_detail.not_found')}</p>
      <Link to="/properties" className="btn-primary rounded-xl px-6 py-3 text-sm font-semibold">{t('property_detail.back')}</Link>
    </div>
  );

  const amenities = Array.isArray(property.amenities) ? property.amenities : JSON.parse(property.amenities || '[]');
  const images = property.images || [];
  const isContactOnly = property.booking_type === 'contact';

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3 text-sm text-gray-700">
          {parseFloat(property.rating_avg) > 0 && (
            <div className="flex items-center gap-1.5">
              <Stars value={property.rating_avg} />
              <span className="font-semibold">{parseFloat(property.rating_avg).toFixed(1)}</span>
              <span className="text-gray-400">·</span>
              <span className="underline font-medium">{property.review_count} {t('property_detail.reviews')}</span>
            </div>
          )}
          <span className="text-gray-400">·</span>
          <span className="font-medium">{property.city}, Македонија</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-gray-900 underline">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            {t('property_detail.share')}
          </button>
        </div>
      </div>

      {/* Photo grid */}
      <div className="mb-10">
        {images.length === 0 ? (
          <div className="h-64 bg-gray-100 rounded-2xl flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        ) : images.length === 1 ? (
          <div className="rounded-2xl overflow-hidden bg-gray-100 max-h-[420px] flex items-center justify-center">
            <img src={images[0].url} alt="" className="w-full max-h-[420px] object-contain" />
          </div>
        ) : images.length === 2 ? (
          <div className="grid grid-cols-2 gap-3 h-[340px]">
            {images.slice(0, 2).map((img) => (
              <div key={img.id} className="rounded-2xl overflow-hidden bg-gray-100">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {/* Main large image */}
            <div className="col-span-2 md:col-span-2 rounded-2xl overflow-hidden bg-gray-100 h-[280px] md:h-[340px]">
              <img src={images[0].url} alt="" className="w-full h-full object-cover" />
            </div>
            {/* Side images */}
            <div className="hidden md:flex flex-col gap-3">
              {images.slice(1, 3).map((img, i) => (
                <div key={img.id} className="relative rounded-2xl overflow-hidden bg-gray-100 flex-1">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  {i === 1 && images.length > 3 && (
                    <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
                      <span className="text-white font-semibold text-base">+{images.length - 3} слики</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* Mobile: small thumbnails below */}
            <div className="col-span-2 flex gap-3 md:hidden overflow-x-auto">
              {images.slice(1, 4).map((img, i) => (
                <div key={img.id} className="relative rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 w-28 h-20">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  {i === 2 && images.length > 4 && (
                    <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">+{images.length - 4}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content + widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-10">

          <div className="pb-8 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {TYPE_LABELS[property.property_type]} — {property.city}
            </h2>
            <p className="text-gray-500 text-sm">
              {property.max_guests} {t('property_detail.guests')} · {property.bedrooms} {t('property_detail.bedrooms')} · {property.bathrooms} {t('property_detail.bathrooms')}
            </p>
          </div>

          <div className="space-y-5 pb-8 border-b border-gray-200">
            {[
              { icon: '🏠', title: `${t('property_detail.host')}: ${property.owner_name || '—'}`, desc: t('property_detail.host_label') },
              { icon: '✨', title: t('property_detail.enhanced_cleaning'), desc: t('property_detail.cleaning_desc') },
              { icon: '🗝️', title: `${t('property_detail.checkin_time')}: ${property.check_in_time}`, desc: `${t('property_detail.checkout_time')}: ${property.check_out_time}` },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <span className="text-2xl mt-0.5">{icon}</span>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{title}</p>
                  <p className="text-gray-500 text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pb-8 border-b border-gray-200">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{property.description}</p>
          </div>

          {amenities.length > 0 && (
            <div className="pb-8 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t('property_detail.what_offers')}</h2>
              <div className="grid grid-cols-2 gap-4">
                {amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-3 text-gray-700">
                    <span className="text-xl">{AMENITY_ICONS[amenity] || '✓'}</span>
                    <span className="text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {property.rules && (
            <div className="pb-8 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t('property_detail.house_rules')}</h2>
              <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">{property.rules}</p>
            </div>
          )}

          {property.reviews?.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {parseFloat(property.rating_avg).toFixed(1)} · {property.review_count} {t('property_detail.reviews')}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {property.reviews.map((review) => (
                  <div key={review.id}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
                        {review.guest_name?.[0] || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{review.guest_name}</p>
                        <p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString('mk-MK', { month: 'long', year: 'numeric' })}</p>
                      </div>
                    </div>
                    {review.comment && <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Booking widget or contact widget */}
        <div className="lg:col-span-1">
          <div className="sticky top-28">
            {isContactOnly ? (
              <ContactWidget property={property} />
            ) : (
              <BookingWidget property={property} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
