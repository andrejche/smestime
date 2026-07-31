import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropertyCard from '../components/property/PropertyCard';
import { useProperties } from '../hooks/useProperties';
import { PropertyCardSkeleton } from '../components/common/Loader';

import imgOhrid from '../assets/cities/ohrid.jpg';
import imgSkopje from '../assets/cities/skopje.jpg';
import imgMavrovo from '../assets/cities/mavrovo.jpg';
import imgBitola from '../assets/cities/bitola.jpg';
import imgStruga from '../assets/cities/struga.jpg';
import imgKrushevo from '../assets/cities/krushevo.jpg';
import imgHostCta from '../assets/host-cta.jpg';

const CITIES_MK = ['Охрид','Скопје','Струга','Битола','Прилеп','Тетово','Крушево','Маврово','Гевгелија','Куманово','Кавадарци','Струмица','Штип','Велес','Кичево','Кочани','Дебар','Радовиш','Неготино','Делчево','Виница','Ресен','Берово','Кратово','Пробиштип','Богданци','Македонска Каменица','Валандово','Македонски Брод','Демир Капија','Пехчево','Демир Хисар'];
const CITIES_LATIN = ['Ohrid','Skopje','Struga','Bitola','Tetovo','Krushevo','Mavrovo','Gevgelija','Kumanovo','Kavadarci','Strumica','Shtip','Veles','Kichevo','Kochani','Debar','Radovish','Negotino','Delchevo','Vinica','Resen','Berovo','Kratovo','Probistip','Bogdanci','Makedonska Kamenica','Valandovo','Makedonski Brod','Demir Kapija','Pehchevo','Demir Hisar'];

const TOP_CITIES_MK = [
  { name: 'Охрид', latin: 'Охрид', img: imgOhrid },
  { name: 'Скопје', latin: 'Скопје', img: imgSkopje },
  { name: 'Маврово', latin: 'Маврово', img: imgMavrovo },
  { name: 'Битола', latin: 'Битола', img: imgBitola },
  { name: 'Струга', latin: 'Струга', img: imgStruga },
  { name: 'Крушево', latin: 'Крушево', img: imgKrushevo },
];
const TOP_CITIES_LATIN = [
  { name: 'Ohrid', latin: 'Ohrid', img: imgOhrid },
  { name: 'Skopje', latin: 'Skopje', img: imgSkopje },
  { name: 'Mavrovo', latin: 'Mavrovo', img: imgMavrovo },
  { name: 'Bitola', latin: 'Bitola', img: imgBitola },
  { name: 'Struga', latin: 'Struga', img: imgStruga },
  { name: 'Krushevo', latin: 'Krushevo', img: imgKrushevo },
];

function SearchBar() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const MACEDONIAN_CITIES = i18n.language === 'mk' ? CITIES_MK : CITIES_LATIN;
  const [city, setCity] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-xl mx-auto">
      <div className="bg-white rounded-2xl shadow-modal p-2 flex items-center gap-2">
        <div className="flex items-center gap-3 flex-1 px-4 py-2">
          <svg className="w-5 h-5 text-brand-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <input
            list="city-list"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={t('home.search_where_placeholder')}
            className="w-full text-base text-ink placeholder-gray-400 outline-none bg-transparent font-medium"
          />
          <datalist id="city-list">
            {MACEDONIAN_CITIES.map((c) => <option key={c} value={c} />)}
          </datalist>
        </div>
        <button type="submit" className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3 rounded-xl transition-colors flex items-center gap-2 text-sm flex-shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {t('home.search_button')}
        </button>
      </div>
    </form>
  );
}

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const MACEDONIAN_CITIES = i18n.language === 'mk' ? CITIES_MK : CITIES_LATIN;
  const TOP_CITIES = i18n.language === 'mk' ? TOP_CITIES_MK : TOP_CITIES_LATIN;

  // Only load 8 featured listings
  const { data: featuredData, isLoading } = useProperties({ limit: 8, sort: 'rating_desc' });

  return (
    <div>
      {/* Hero */}
      <div className="bg-gray-50 border-b border-gray-200 py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-ink mb-3 leading-tight">
            {t('home.hero_title')}
          </h1>
          <p className="text-gray-500 text-lg mb-10">
            {t('home.hero_subtitle')}
          </p>
          <SearchBar />
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Popular cities — local images, no network requests */}
        <h2 className="text-2xl font-bold text-ink mb-6">{t('home.popular_destinations')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {TOP_CITIES.map(({ name, img }) => (
            <Link key={name} to={`/properties?city=${encodeURIComponent(name)}`} className="group">
              <div className="aspect-square rounded-2xl overflow-hidden mb-2 bg-gray-100">
                <img
                  src={img}
                  alt={name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="font-semibold text-ink text-sm">{name}</p>
            </Link>
          ))}
        </div>

        {/* All cities — no images, just text pills, instant */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-12">
          <h3 className="font-bold text-ink mb-4">{t('home.all_cities')}</h3>
          <div className="flex flex-wrap gap-2">
            {MACEDONIAN_CITIES.map((city) => (
              <Link
                key={city}
                to={`/properties?city=${encodeURIComponent(city)}`}
                className="px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-600 hover:border-brand-500 hover:text-brand-600 hover:bg-brand-50 transition-all"
              >
                {city}
              </Link>
            ))}
          </div>
        </div>

        {/* Featured listings */}
        <h2 className="text-2xl font-bold text-ink mb-6">{t('home.featured_listings')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <PropertyCardSkeleton key={i} />)
            : featuredData?.properties.map((p) => <PropertyCard key={p.id} property={p} />)
          }
        </div>

        {featuredData?.properties?.length > 0 && (
          <div className="text-center mt-10">
            <Link to="/properties" className="btn-outline rounded-full px-8 py-3 text-sm font-semibold">
              {t('home.view_all')}
            </Link>
          </div>
        )}
      </section>

      {/* Host CTA */}
      <section className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-ink mb-4">{t('home.host_title')}</h2>
            <p className="text-gray-500 text-lg mb-6 leading-relaxed">{t('home.host_desc')}</p>
            <Link to="/list-property" className="btn-primary rounded-xl px-8 py-3 text-base font-semibold inline-flex">
              {t('home.host_button')}
            </Link>
          </div>
          <div className="rounded-3xl overflow-hidden aspect-video">
            <img src={imgHostCta} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>
    </div>
  );
}
