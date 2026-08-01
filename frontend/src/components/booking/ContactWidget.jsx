import { useState } from 'react';

export default function ContactWidget({ property }) {
  const [copied, setCopied] = useState(null);

  const copy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm">
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
