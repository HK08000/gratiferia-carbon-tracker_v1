import React, { useState } from 'react';
import { useApp } from '../hooks/useAppContext';

export default function ExportScreen() {
  const { state, getItemsForCurrentSite, generateCSVExport, generateExcelExport } = useApp();
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel'>('csv');
  const [showSuccess, setShowSuccess] = useState(false);

  const items = getItemsForCurrentSite();

  const handleExport = () => {
    if (items.length === 0) {
      alert('Aucun article à exporter. Veuillez d\'abord capturer des articles.');
      return;
    }

    const content = exportFormat === 'excel'
      ? generateExcelExport()
      : generateCSVExport();

    const fileName = `gratiferia_${state.currentSite?.name?.replace(/\s+/g, '_') || 'export'}_${new Date().toISOString().split('T')[0]}.${exportFormat === 'excel' ? 'csv' : 'csv'}`;

    // Create and download file
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleShare = async () => {
    if (items.length === 0) {
      alert('Aucun article à partager. Veuillez d\'abord capturer des articles.');
      return;
    }

    const content = generateCSVExport();

    try {
      await navigator.share({
        title: 'Export Gratiferia',
        text: `Export Gratiferia Carbon - ${state.currentSite?.name} - ${items.length} articles - ${state.items.reduce((sum, i) => sum + i.carbonValue, 0).toFixed(1)} kg CO₂eq`,
        files: [
          new File([content], `gratiferia_export.csv`, { type: 'text/csv' })
        ]
      });
    } catch (error) {
      // Fallback to regular download if sharing fails
      handleExport();
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Export réussi !</h2>
          <p className="text-gray-600">Le fichier a été téléchargé</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-green-500 text-white p-4">
        <h1 className="text-lg font-bold">Exporter les données</h1>
        <p className="text-sm text-green-100">{state.currentSite?.name}</p>
      </div>

      <div className="p-4 max-w-lg mx-auto">
        {/* Summary Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Récapitulatif</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">{items.length}</div>
              <div className="text-sm text-gray-500">Articles</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">
                {items.reduce((sum, i) => sum + i.carbonValue, 0).toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">kg CO₂eq</div>
            </div>
          </div>
        </div>

        {/* Format Selection */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Format d'export</h3>
          <div className="space-y-3">
            <button
              onClick={() => setExportFormat('csv')}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                exportFormat === 'csv'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  exportFormat === 'csv' ? 'border-green-500' : 'border-gray-300'
                }`}>
                  {exportFormat === 'csv' && (
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-800">CSV</div>
                  <div className="text-sm text-gray-500">Compatible avec tous les tableurs</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setExportFormat('excel')}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                exportFormat === 'excel'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  exportFormat === 'excel' ? 'border-green-500' : 'border-gray-300'
                }`}>
                  {exportFormat === 'excel' && (
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-800">Excel (CSV UTF-8)</div>
                  <div className="text-sm text-gray-500">Format compatible Excel avec accents</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Export Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">L'export inclut :</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Nom et catégorie de l'article</li>
                <li>Quantité et empreinte carbone</li>
                <li>Méthode de calcul ADEME</li>
                <li>Date et heure de capture</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleExport}
            className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Télécharger le fichier
          </button>

          <button
            onClick={handleShare}
            className="w-full py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center gap-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Partager
          </button>
        </div>
      </div>
    </div>
  );
}
