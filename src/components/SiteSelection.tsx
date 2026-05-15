import React, { useState } from 'react';
import { PREDEFINED_SITES, Site } from '../lib/types';
import { useApp } from '../hooks/useAppContext';

interface SiteSelectionProps {
  onSiteSelected: () => void;
}

export default function SiteSelection({ onSiteSelected }: SiteSelectionProps) {
  const { setSite, startSession, state } = useApp();
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customLocation, setCustomLocation] = useState('');

  const handleSiteSelect = (siteId: string) => {
    setSelectedSiteId(siteId);
  };

  const handleStartSession = () => {
    let selectedSite: Site;

    if (showCustom && customName) {
      selectedSite = {
        id: `custom-${Date.now()}`,
        name: customName,
        location: customLocation || 'Personnalisé',
      };
    } else if (selectedSiteId) {
      selectedSite = PREDEFINED_SITES.find(s => s.id === selectedSiteId) || PREDEFINED_SITES[0];
    } else {
      alert('Veuillez sélectionner un site ou créer un site personnalisé');
      return;
    }

    setSite(selectedSite);
    startSession();
    onSiteSelected();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 flex flex-col items-center justify-center p-4">
      {/* URCA Logo and Title */}
      <div className="text-center mb-8">
        <img src="/imgs/urca-logo.svg" alt="URCA" className="h-16 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Gratiferia Carbon</h1>
        <p className="text-gray-600">Université de Reims Champagne Ardenne</p>
      </div>

      {/* Site Selection Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Sélectionnez le site</h2>

        {/* Predefined Sites */}
        <div className="space-y-2 mb-4">
          {PREDEFINED_SITES.map((site) => (
            <button
              key={site.id}
              onClick={() => {
                handleSiteSelect(site.id);
                setShowCustom(false);
              }}
              className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                selectedSiteId === site.id && !showCustom
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  selectedSiteId === site.id && !showCustom ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <div>
                  <div className="font-medium text-gray-800">{site.name}</div>
                  <div className="text-sm text-gray-500">{site.location}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Custom Site Option */}
        <div className="border-t pt-4">
          <button
            onClick={() => {
              setShowCustom(!showCustom);
              setSelectedSiteId('');
            }}
            className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
              showCustom ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-medium text-gray-800">Autre site (personnalisé)</span>
            </div>
          </button>

          {showCustom && (
            <div className="mt-3 space-y-3">
              <input
                type="text"
                placeholder="Nom du site (ex: Halle des Sports)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="text"
                placeholder="Localisation (optionnel)"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          )}
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartSession}
          className="w-full mt-6 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Démarrer la session
        </button>
      </div>

      {/* Info Footer */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Session actuelle: {state.currentSite?.name || 'Aucune'}</p>
        <p className="mt-1">Articles capturés: {state.items.length}</p>
      </div>
    </div>
  );
}
