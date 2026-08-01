import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProperty } from '../hooks/useProperties';
import BookingWidget from '../components/booking/BookingWidget';
import ContactWidget from '../components/booking/ContactWidget';
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

function ImageGallery({ images }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="h-64 bg-gray-100 rounded-2xl flex items-center justify-center mb-8">
        <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="mb-8">
      {/* Main image */}
      <div className="relative rounded-2xl overflow-hidden bg-gray-100 mb-3 cursor-zoom-in"
        onClick={() => setLightbox(true)}
        style={{ height: '380px' }}>
        <img
          src={images[active].url}
          alt=""
          className="w-full h-full object-contain bg-gray-900"
        />
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); setActive((a) => (a - 1 + images.length) % images.length); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors">
              ‹
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setActive((a) => (a + 1) % images.length); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors">
              ›
            </button>
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
              {active + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {images.map((img, i) => (
            <button key={img.id} onClick={() => setActive(i)}
              className={`flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${active === i ? 'border-brand-500' : 'border-transparent opacity-70 hover:opacity-100'}`}>
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={() => setLightbox(false)}>
          <button className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300" onClick={() => setLightbox(false)}>✕</button>
          <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-gray-300 px-4"
            onClick={(e) => { e.stopPropagation(); setActive((a) => (a - 1 + images.length) % images.length); }}>‹</button>
          <img src={images[active].url} alt="" className="max-w-full max-h-full object-contain px-16"
            onClick={(e) => e.stopPropagation()} />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-gray-300 px-4"
            onClick={(e) => { e.stopPropagation(); setActive((a) => (a + 1) % images.length); }}>›</button>
          <div className="absolute bottom-4 text-white text-sm opacity-60">{active + 1} / {images.length}</div>
        </div>
      )}
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
      <p className="text-xl font-semibold text-gray-700 mb-4">Огласот не е пронајден</p>
      <Link to="/properties" className="btn-primary rounded-xl px-6 py-3 text-sm font-semibold">← Назад</Link>
    </div>
  );

  const amenities = Array.isArray(property.amenities) ? property.amenities : JSON.parse(property.amenities || '[]');
  const images = property.images || [];
  const isContactOnly = property.booking_type === 'contact';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <p className="text-sm text-gray-500 font-medium">{property.city}, Македонија</p>
        <button className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-gray-900 underline">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Сподели
        </button>
      </div>

      {/* Gallery */}
      <ImageGallery images={images} />

      {/* Content + widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">

          <div className="pb-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {TYPE_LABELS[property.property_type]} — {property.city}
            </h2>
            <p className="text-gray-500 text-sm">
              {property.max_guests} гости · {property.bedrooms} спални · {property.bathrooms} бањи
            </p>
          </div>

          <div className="space-y-4 pb-6 border-b border-gray-200">
            {[
              { icon: '🏠', title: `Домаќин: ${property.owner_name || '—'}`, desc: 'Домаќинот на SmestiMe' },
              { icon: '✨', title: 'Зголемено чистење', desc: 'Домаќинот се обврзува на чистота' },
              { icon: '🗝️', title: `Check-in: ${property.check_in_time}`, desc: `Check-out: ${property.check_out_time}` },
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

          <div className="pb-6 border-b border-gray-200">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{property.description}</p>
          </div>

          {amenities.length > 0 && (
            <div className="pb-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-5">Што нудиме</h2>
              <div className="grid grid-cols-2 gap-3">
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
            <div className="pb-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Правила</h2>
              <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">{property.rules}</p>
            </div>
          )}
        </div>

        {/* Widget */}
        <div className="lg:col-span-1">
          <div className="sticky top-28">
            {isContactOnly
              ? <ContactWidget property={property} />
              : <BookingWidget property={property} />
            }
          </div>
        </div>
      </div>
    </div>
  );
}
