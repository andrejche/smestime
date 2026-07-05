import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyListings, useDeleteListing, useRenewListing } from '../../hooks/useOwner';
import { PageLoader } from '../../components/common/Loader';

function RenewButton({ listing, onRenew }) {
  const lastUpdated = new Date(listing.updated_at);
  const hoursSince = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60);
  const canRenew = hoursSince >= 24;
  const hoursLeft = Math.ceil(24 - hoursSince);

  return (
    <button
      onClick={() => canRenew && onRenew(listing.id)}
      disabled={!canRenew}
      title={canRenew ? 'Обнови оглас' : `Можеш да обновиш за ${hoursLeft} ${hoursLeft === 1 ? 'час' : 'часа'}`}
      className={`btn-sm rounded-lg text-xs flex items-center gap-1 ${
        canRenew
          ? 'bg-green-500 hover:bg-green-600 text-white'
          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
      }`}
    >
      🔄 {canRenew ? 'Обнови' : `${hoursLeft}ч`}
    </button>
  );
}

export default function OwnerListingsPage() {
  const { data: listings, isLoading } = useMyListings();
  const deleteListing = useDeleteListing();
  const renewListing = useRenewListing();

  if (isLoading) return <PageLoader />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Мои огласи</h1>
        <Link to="/list-property" className="btn-primary rounded-xl px-5 py-2.5 text-sm font-semibold">+ Нов оглас</Link>
      </div>

      {!listings?.length ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🏠</p>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Немаш огласи</h3>
          <p className="text-gray-400 mb-6 text-sm">Додај го твојот прв сместувачки објект</p>
          <Link to="/list-property" className="btn-primary rounded-xl px-6 py-3 text-sm">Додај оглас</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((l) => (
            <div key={l.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-card transition-shadow">
              <div className="flex gap-4">
                {l.primary_image
                  ? <img src={l.primary_image} alt="" className="w-28 h-20 object-cover rounded-xl flex-shrink-0 hidden sm:block" />
                  : <div className="w-28 h-20 bg-gray-100 rounded-xl flex-shrink-0 hidden sm:flex items-center justify-center text-gray-300 text-2xl">🏠</div>
                }
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{l.title}</h3>
                    <span className={`badge flex-shrink-0 ${l.is_approved ? 'badge-green' : 'badge-yellow'}`}>
                      {l.is_approved ? 'Активен' : 'Чека одобрување'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">
                    📍 {l.city} · {l.property_type} · до {l.max_guests} гости · {parseInt(l.price_per_night).toLocaleString()} МКД/ноќ
                  </p>
                  <div className="flex gap-2 flex-wrap items-center">
                    <Link to={`/properties/${l.id}`} className="btn-ghost btn-sm rounded-lg text-xs">👁 Погледни</Link>
                    <Link to={`/owner/listings/${l.id}/edit`} className="btn-outline btn-sm rounded-lg text-xs">✏️ Уреди</Link>
                    <Link to={`/owner/listings/${l.id}/images`} className="btn-outline btn-sm rounded-lg text-xs">📷 Слики</Link>
                    <Link to="/owner/bookings" className="btn-outline btn-sm rounded-lg text-xs">
                      📅 Резервации
                      {parseInt(l.pending_bookings) > 0 && (
                        <span className="ml-1 bg-orange-400 text-white text-xs px-1.5 rounded-full">{l.pending_bookings}</span>
                      )}
                    </Link>
                    <RenewButton listing={l} onRenew={(id) => renewListing.mutate(id)} />
                    <button
                      onClick={() => { if (confirm(`Избриши "${l.title}"?`)) deleteListing.mutate(l.id); }}
                      className="btn-danger btn-sm rounded-lg text-xs"
                    >
                      🗑 Избриши
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
