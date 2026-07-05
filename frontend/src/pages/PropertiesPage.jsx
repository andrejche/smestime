import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PropertyCard from '../components/property/PropertyCard';
import { useProperties } from '../hooks/useProperties';
import { PropertyCardSkeleton } from '../components/common/Loader';

const CITIES_MK = [
  'Охрид','Скопје','Струга','Битола','Тетово','Крушево','Маврово','Гевгелија',
  'Куманово','Кавадарци','Струмица','Штип','Велес','Кичево','Кочани','Дебар',
  'Радовиш','Неготино','Делчево','Виница','Ресен','Берово','Кратово','Пробиштип',
  'Богданци','Македонска Каменица','Валандово','Македонски Брод','Демир Капија',
  'Пехчево','Демир Хисар',
];

const CITIES_LATIN = [
  'Ohrid','Skopje','Struga','Bitola','Tetovo','Krushevo','Mavrovo','Gevgelija',
  'Kumanovo','Kavadarci','Strumica','Shtip','Veles','Kichevo','Kochani','Debar',
  'Radovish','Negotino','Delchevo','Vinica','Resen','Berovo','Kratovo','Probistip',
  'Bogdanci','Makedonska Kamenica','Valandovo','Makedonski Brod','Demir Kapija',
  'Pehchevo','Demir Hisar',
];

export default function PropertiesPage() {
  const { t, i18n } = useTranslation();
  const MACEDONIAN_CITIES = i18n.language === 'mk' ? CITIES_MK : CITIES_LATIN;
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    guests: searchParams.get('guests') || '',
    minPrice: '',
    maxPrice: '',
    propertyType: '',
    sort: 'created_at_desc',
  });
  const [showFilters, setShowFilters] = useState(false);

  const PROPERTY_TYPES = [
    { value: '', label: t('properties.all_types') },
    { value: 'apartment', label: t('properties.apartment') },
    { value: 'house', label: t('properties.house') },
    { value: 'villa', label: t('properties.villa') },
    { value: 'studio', label: t('properties.studio') },
    { value: 'room', label: t('properties.room') },
  ];

  const SORT_OPTIONS = [
    { value: 'created_at_desc', label: t('properties.newest') },
    { value: 'price_asc', label: t('properties.price_asc') },
    { value: 'price_desc', label: t('properties.price_desc') },
    { value: 'rating_desc', label: t('properties.rating') },
  ];

  const queryParams = Object.fromEntries(
    Object.entries({ ...filters, page, limit: 16 }).filter(([_, v]) => v !== '')
  );

  const { data, isLoading, isFetching } = useProperties(queryParams);
  const update = (key, val) => { setFilters((p) => ({ ...p, [key]: val })); setPage(1); };
  const clear = () => {
    setFilters({ city: '', checkIn: '', checkOut: '', guests: '', minPrice: '', maxPrice: '', propertyType: '', sort: 'created_at_desc' });
    setPage(1);
    setSearchParams({});
  };

  return (
    <div>
      {/* Filter bar */}
      <div className="sticky top-[72px] z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">

            {/* City search */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                list="city-list-filter"
                value={filters.city}
                onChange={(e) => update('city', e.target.value)}
                placeholder={t('properties.search_city').replace('🔍 ', '')}
                className="text-sm outline-none bg-transparent w-36 placeholder-gray-400 text-gray-700"
              />
              <datalist id="city-list-filter">
                {MACEDONIAN_CITIES.map((c) => <option key={c} value={c} />)}
              </datalist>
              {filters.city && (
                <button type="button" onClick={() => update('city', '')} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
              )}
            </div>

            <div className="h-5 w-px bg-gray-200 flex-shrink-0" />

            {/* Type pills */}
            {PROPERTY_TYPES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => update('propertyType', value)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all whitespace-nowrap ${
                  filters.propertyType === value
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}

            <div className="h-5 w-px bg-gray-200 flex-shrink-0" />

            {/* Sort */}
            <select
              value={filters.sort}
              onChange={(e) => update('sort', e.target.value)}
              className="flex-shrink-0 border border-gray-200 bg-white rounded-full px-4 py-2 text-sm text-gray-600 focus:outline-none focus:border-gray-400 cursor-pointer"
            >
              {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>

            {/* Filters toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                showFilters ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              {t('properties.filters')}
            </button>

            {/* Clear */}
            {(filters.city || filters.propertyType || filters.minPrice || filters.maxPrice) && (
              <button onClick={clear} className="flex-shrink-0 text-sm font-medium text-red-500 hover:text-red-700 underline whitespace-nowrap">
                {t('properties.clear')}
              </button>
            )}

            {/* Count */}
            {data && (
              <span className="flex-shrink-0 text-sm text-gray-400 ml-auto whitespace-nowrap pl-4">
                {data.pagination.total} {data.pagination.total === 1 ? t('properties.listing_count') : t('properties.listings_count')}
              </span>
            )}
          </div>

          {/* Advanced filters */}
          {showFilters && (
            <div className="border-t border-gray-100 pt-4 pb-3 mt-3 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t('properties.checkin')}</label>
                <input type="date" value={filters.checkIn} onChange={(e) => update('checkIn', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl bg-white outline-none focus:border-gray-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t('properties.checkout')}</label>
                <input type="date" value={filters.checkOut} onChange={(e) => update('checkOut', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl bg-white outline-none focus:border-gray-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t('properties.min_price')}</label>
                <input type="number" value={filters.minPrice} onChange={(e) => update('minPrice', e.target.value)} placeholder="0" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl bg-white outline-none focus:border-gray-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t('properties.max_price')}</label>
                <input type="number" value={filters.maxPrice} onChange={(e) => update('maxPrice', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl bg-white outline-none focus:border-gray-500" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {filters.city && (
          <h1 className="text-2xl font-bold text-ink mb-6">{t('properties.accommodation_in')} {filters.city}</h1>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
          </div>
        ) : data?.properties.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">🏠</p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('properties.no_results')}</h3>
            <p className="text-gray-500 mb-6 text-sm">{t('properties.no_results_desc')}</p>
            <button onClick={clear} className="btn-primary rounded-xl px-6 py-3 text-sm font-semibold">{t('properties.clear_filters')}</button>
          </div>
        ) : (
          <>
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
              {data.properties.map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>

            {data.pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                <button disabled={page === 1} onClick={() => setPage(page - 1)} className="btn-outline btn-sm disabled:opacity-40 rounded-full px-5">{t('properties.prev')}</button>
                <div className="flex gap-1 items-center">
                  {Array.from({ length: data.pagination.pages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === data.pagination.pages || Math.abs(p - page) <= 1)
                    .reduce((acc, p, i, arr) => { if (i > 0 && arr[i-1] !== p - 1) acc.push('...'); acc.push(p); return acc; }, [])
                    .map((p, i) => p === '...'
                      ? <span key={`e${i}`} className="px-2 text-gray-400 text-sm">…</span>
                      : <button key={p} onClick={() => setPage(p)} className={`min-w-[38px] h-9 rounded-full text-sm font-medium transition-colors ${p === page ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>{p}</button>
                    )
                  }
                </div>
                <button disabled={page === data.pagination.pages} onClick={() => setPage(page + 1)} className="btn-outline btn-sm disabled:opacity-40 rounded-full px-5">{t('properties.next')}</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}