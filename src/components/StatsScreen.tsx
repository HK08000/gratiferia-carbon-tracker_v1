import React from 'react';
import { useApp } from '../hooks/useAppContext';
import { getCategoryLabel, ADEME_FACTORS } from '../lib/types';

export default function StatsScreen() {
  const { state, getStatistics, getItemsForCurrentSite } = useApp();
  const items = getItemsForCurrentSite();
  const stats = getStatistics();

  // Get max value for chart scaling
  const maxValue = Math.max(...Object.values(stats.carbonByCategory), 1);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-green-500 text-white p-4">
        <h1 className="text-lg font-bold">Statistiques</h1>
        <p className="text-sm text-green-100">{state.currentSite?.name}</p>
      </div>

      <div className="p-4 max-w-lg mx-auto">
        {/* Main Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Total Items */}
          <div className="bg-white rounded-2xl shadow-md p-4 text-center">
            <div className="text-4xl font-bold text-blue-600">{stats.totalItems}</div>
            <div className="text-sm text-gray-500 mt-1">Articles</div>
          </div>

          {/* Total Carbon */}
          <div className="bg-white rounded-2xl shadow-md p-4 text-center">
            <div className="text-4xl font-bold text-green-600">{stats.totalCarbon.toFixed(1)}</div>
            <div className="text-sm text-gray-500 mt-1">kg CO₂eq</div>
          </div>
        </div>

        {/* Average Carbon */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl shadow-md p-6 text-white text-center mb-6">
          <p className="text-sm opacity-90">Empreinte moyenne par article</p>
          <p className="text-3xl font-bold">{stats.averageCarbonPerItem.toFixed(1)} kg CO₂eq</p>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Répartition par catégorie</h3>

          {items.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Aucune donnée disponible</p>
          ) : (
            <div className="space-y-3">
              {ADEME_FACTORS.filter(factor => stats.carbonByCategory[factor.category] > 0).map((factor) => {
                const value = stats.carbonByCategory[factor.category] || 0;
                const percentage = (value / maxValue) * 100;
                const itemCount = items.filter(item => item.category === factor.category).length;

                return (
                  <div key={factor.category}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-700">{factor.labelFr}</span>
                      <span className="text-sm font-medium text-gray-600">
                        {value.toFixed(1)} kg ({itemCount} articles)
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Environmental Impact */}
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3 text-center">Impact environnemental évité</h3>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              En donnant une seconde vie à ces {stats.totalItems} articles, vous avez permis d'éviter l'émission de :
            </p>
            <p className="text-4xl font-bold text-green-600 my-3">
              {stats.totalCarbon.toFixed(1)}
            </p>
            <p className="text-lg text-green-600">kilogrammes de CO₂</p>
            <p className="text-sm text-gray-500 mt-3">
              Ce qui équivaut à {Math.round(stats.totalCarbon / 0.2)} km parcourus en voiture
            </p>
          </div>
        </div>

        {/* Sites Info */}
        <div className="bg-white rounded-2xl shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Sites actifs</p>
              <p className="text-xl font-semibold text-gray-800">{stats.uniqueSitesCount}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
