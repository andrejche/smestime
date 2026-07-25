import { useState } from 'react';
import { useAdminProperties } from '../../hooks/useAdmin';
import api from '../../services/api';
import { PageLoader } from '../../components/common/Loader';

export default function AdminSocialImagesPage() {
  const { data, isLoading } = useAdminProperties({ limit: 100 });
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);

  const promoProperties = data?.properties?.filter((p) => p.promo_social) || [];

  const loadImages = async (property) => {
    setSelectedProperty(property);
    setLoadingImages(true);
    try {
      const res = await api.get(`/admin/properties/${property.id}/images`);
      setImages(res.data.filter((img) => img.social_url));
    } catch {
      setImages([]);
    } finally {
      setLoadingImages(false);
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">📣 Слики за социјални мрежи</h1>
        <p className="text-gray-500 text-sm mt-1">Огласи кои бараат промоција на социјалните мрежи</p>
      </div>

      {promoProperties.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
          <p className="text-4xl mb-4">📣</p>
          <p className="text-gray-400">Нема огласи кои бараат промоција</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Property list */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-3">Огласи ({promoProperties.length})</h2>
            {promoProperties.map((p) => (
              <button key={p.id} onClick={() => loadImages(p)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedProperty?.id === p.id ? 'border-brand-500 bg-brand-50' : 'border-gray-200 bg-white hover:border-gray-400'
                }`}>
                <div className="flex gap-3 items-center">
                  {p.primary_image
                    ? <img src={p.primary_image} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                    : <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-300">🏠</div>
                  }
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{p.title}</p>
                    <p className="text-xs text-gray-400">{p.city} · {p.owner_name}</p>
                    <p className="text-xs text-gray-400">{p.owner_phone}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Social images */}
          <div className="lg:col-span-2">
            {!selectedProperty ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center h-full flex flex-col items-center justify-center">
                <p className="text-4xl mb-4">👈</p>
                <p className="text-gray-400">Избери оглас за да ги видиш сликите</p>
              </div>
            ) : loadingImages ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
                <p className="text-gray-400">Вчитување...</p>
              </div>
            ) : images.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
                <p className="text-4xl mb-4">🖼️</p>
                <p className="text-gray-400">Нема генерирани слики за социјални мрежи</p>
                <p className="text-xs text-gray-400 mt-1">Сопственикот треба прво да прикачи слики</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{selectedProperty.title}</h3>
                  <p className="text-sm text-gray-500">{selectedProperty.owner_name} · {selectedProperty.owner_phone} · {selectedProperty.owner_email}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {images.map((img) => (
                    <div key={img.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                      <img src={img.social_url} alt="" className="w-full aspect-square object-cover" />
                      <div className="p-3">
                        <a href={img.social_url} download target="_blank" rel="noreferrer"
                          className="btn-primary rounded-xl text-sm font-semibold w-full text-center block py-2.5">
                          ⬇ Преземи
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
