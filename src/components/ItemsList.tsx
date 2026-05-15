import React, { useState } from 'react';
import { useApp } from '../hooks/useAppContext';
import { getCategoryLabel } from '../lib/types';

export default function ItemsList() {
  const { state, deleteItem, getItemsForCurrentSite } = useApp();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const items = getItemsForCurrentSite();

  const filteredItems = filterCategory === 'all'
    ? items
    : items.filter(item => item.category === filterCategory);

  const categories = ['all', ...new Set(items.map(item => item.category))];

  const handleDelete = (itemId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      deleteItem(itemId);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-green-500 text-white p-4">
        <h1 className="text-lg font-bold">Articles capturés</h1>
        <p className="text-sm text-green-100">{state.currentSite?.name}</p>
      </div>

      {/* Filter */}
      <div className="p-4 bg-white border-b">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'Toutes les catégories' : getCategoryLabel(cat as any)}
            </option>
          ))}
        </select>
      </div>

      {/* Items List */}
      <div className="p-4">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-500">Aucun article capturé pour le moment</p>
            <p className="text-sm text-gray-400 mt-2">Commencez par capturer un article</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="flex">
                  {/* Photo Thumbnail */}
                  <div className="w-24 h-24 bg-gray-200 flex-shrink-0">
                    {item.photoUri ? (
                      <img src={item.photoUri} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{item.name}</h3>
                        <p className="text-sm text-gray-500">{getCategoryLabel(item.category)}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(item.timestamp)}</p>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-lg font-bold text-green-600">{item.carbonValue.toFixed(1)}</div>
                        <div className="text-xs text-gray-500">kg CO₂eq</div>
                        {item.quantity > 1 && (
                          <div className="text-xs text-gray-400">x{item.quantity}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-4 bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
