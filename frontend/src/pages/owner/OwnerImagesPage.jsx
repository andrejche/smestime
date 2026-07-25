import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMyListing, useUploadListingImages, useDeleteListingImage } from '../../hooks/useOwner';
import { PageLoader, Spinner } from '../../components/common/Loader';

export default function OwnerImagesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: listing, isLoading } = useMyListing(id);
  const uploadImages = useUploadListingImages(id);
  const deleteImage = useDeleteListingImage(id);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showSocial, setShowSocial] = useState(false);

  const handleFiles = async (files) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/')).slice(0, 20);
    if (!arr.length) return;
    setUploading(true);
    uploadImages.mutate(arr, { onSettled: () => setUploading(false) });
  };

  if (isLoading) return <PageLoader />;
  const images = listing?.images || [];
  const socialImages = images.filter((img) => img.social_url);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/owner/listings" className="text-gray-400 hover:text-gray-600 text-sm">← Назад</Link>
        <h1 className="text-2xl font-bold text-gray-900">Слики — {listing?.title}</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Прикачи нови слики</h2>
        <div
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onClick={() => !uploading && document.getElementById('img-input').click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
            uploading ? 'border-brand-400 bg-brand-50 cursor-wait'
            : dragging ? 'border-brand-400 bg-brand-50 cursor-copy'
            : 'border-gray-300 hover:border-brand-400 hover:bg-gray-50 cursor-pointer'
          }`}
        >
          {uploading ? (
            <>
              <div className="flex justify-center mb-3"><Spinner size="lg" /></div>
              <p className="text-sm font-semibold text-brand-600">Прикачување и генерирање слики...</p>
              <p className="text-xs text-gray-400 mt-1">Ве молиме почекајте</p>
            </>
          ) : (
            <>
              <div className="text-4xl mb-3">📷</div>
              <p className="text-sm font-semibold text-gray-600">Влечи слики или кликни за избор</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP · макс. 10MB · до 20 слики</p>
              <p className="text-xs text-brand-500 font-medium mt-2">✨ Автоматски се генерираат слики за социјални мрежи</p>
            </>
          )}
          <input id="img-input" type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        </div>
      </div>

      {images.length > 0 && (
        <div className="flex rounded-xl border border-gray-200 p-1 mb-4 bg-white">
          <button onClick={() => setShowSocial(false)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${!showSocial ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-800'}`}>
            🖼 Нормални ({images.length})
          </button>
          <button onClick={() => setShowSocial(true)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${showSocial ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-800'}`}>
            📣 Социјални мрежи ({socialImages.length})
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">{showSocial ? 'Слики за социјални мрежи' : 'Прикачени слики'}</h2>
          <span className="text-sm text-gray-400">{showSocial ? socialImages.length : images.length}/20</span>
        </div>

        {showSocial ? (
          socialImages.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-4xl mb-3">📣</p>
              <p className="text-gray-400 text-sm">Нема генерирани слики за социјални мрежи</p>
              <p className="text-gray-400 text-xs mt-1">Прикачи слики горе за да се генерираат автоматски</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-xl p-3">
                💡 Овие слики се готови за споделување на Instagram, TikTok и Facebook. Содржат лого, цена и телефон.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {socialImages.map((img) => (
                  <div key={img.id} className="rounded-xl overflow-hidden border border-gray-100">
                    <img src={img.social_url} alt="" className="w-full aspect-square object-cover" />
                    <div className="p-3">
                      <a href={img.social_url} download
                        className="btn-primary btn-sm rounded-lg text-xs w-full text-center block py-2">
                        ⬇ Преземи
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ) : (
          images.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-4xl mb-3">🖼️</p>
              <p className="text-gray-400 text-sm">Немаш прикачено слики</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {images.map((img) => (
                <div key={img.id} className="relative group aspect-video rounded-xl overflow-hidden bg-gray-100">
                  <img src={img.url} alt="" loading="lazy" className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
                  {img.is_primary && <span className="absolute top-2 left-2 bg-brand-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">Насловна</span>}
                  {img.social_url && <span className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">📣</span>}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                    <button onClick={() => { if (confirm('Избриши ја оваа слика?')) deleteImage.mutate(img.id); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium">
                      🗑 Избриши
                    </button>
                  </div>
                </div>
              ))}
              {images.length < 20 && (
                <div onClick={() => !uploading && document.getElementById('img-input').click()}
                  className="aspect-video rounded-xl border-2 border-dashed border-gray-200 hover:border-brand-400 hover:bg-brand-50 flex flex-col items-center justify-center cursor-pointer transition-all">
                  <span className="text-2xl mb-1">+</span>
                  <span className="text-xs text-gray-400">Додај уште</span>
                </div>
              )}
            </div>
          )
        )}
      </div>

      <div className="flex justify-between mt-6">
        <Link to="/owner/listings" className="btn-outline rounded-xl px-5 py-2.5 text-sm font-semibold">← Кон огласи</Link>
        <button onClick={() => navigate('/owner/listings')} className="btn-primary rounded-xl px-5 py-2.5 text-sm font-semibold">Готово ✓</button>
      </div>
    </div>
  );
}
