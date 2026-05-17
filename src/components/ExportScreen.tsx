import { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Download, FileText, FileSpreadsheet, ChevronLeft } from 'lucide-react';

export default function ExportScreen({ onBack }: { onBack: () => void }) {
  const { generateCSVExport, generateDetailedExcelExport, exportToCSV, exportToDetailedExcel, getItemsForCurrentSite } = useAppContext();
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'detailed'>('detailed');
  const [exported, setExported] = useState(false);
  
  const items = getItemsForCurrentSite();
  
  const handleExport = () => {
    if (items.length === 0) {
      alert('Aucun article à exporter. Veuillez d\'abord capturer des articles.');
      return;
    }
    
    if (exportFormat === 'csv') {
      exportToCSV(`gratiferia-export-${new Date().toISOString().split('T')[0]}.csv`);
    } else if (exportFormat === 'detailed') {
      exportToDetailedExcel(`gratiferia-detaille-${new Date().toISOString().split('T')[0]}.csv`);
    }
    
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };
  
  const getPreview = () => {
    if (items.length === 0) return 'Aucune donnée à afficher';
    
    const totalCarbon = items.reduce((sum, item) => sum + item.carbonValue, 0);
    const byCategory: Record<string, number> = {};
    
    items.forEach(item => {
      byCategory[item.category] = (byCategory[item.category] || 0) + item.carbonValue;
    });
    
    return (
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Articles:</span>
          <span className="font-medium">{items.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Empreinte totale:</span>
          <span className="font-medium text-green-600">{totalCarbon.toFixed(2)} kg CO2eq</span>
        </div>
        <div className="pt-2 border-t">
          <div className="text-gray-600 mb-2">Par catégorie:</div>
          {Object.entries(byCategory).map(([category, carbon]) => (
            <div key={category} className="flex justify-between text-xs">
              <span>{category}:</span>
              <span>{carbon.toFixed(2)} kg</span>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center gap-4 p-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Exporter les données</h1>
        </div>
      </div>
      
      <div className="p-4 space-y-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">Format d'export</h2>
          
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
                  {exportFormat === 'csv' && <div className="w-3 h-3 rounded-full bg-green-500"/>}
                </div>
                <div>
                  <div className="font-medium text-gray-800 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    CSV Simple
                  </div>
                  <div className="text-sm text-gray-500">Export basique pour tableurs</div>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => setExportFormat('detailed')}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                exportFormat === 'detailed'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  exportFormat === 'detailed' ? 'border-green-500' : 'border-gray-300'
                }`}>
                  {exportFormat === 'detailed' && <div className="w-3 h-3 rounded-full bg-green-500"/>}
                </div>
                <div>
                  <div className="font-medium text-gray-800 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    Excel Détaillé <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Recommandé</span>
                  </div>
                  <div className="text-sm text-gray-500">Avec statistiques, méthodologie ADEME et détails de calcul</div>
                </div>
              </div>
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">Aperçu des données</h2>
          {getPreview()}
        </div>
        
        {exportFormat === 'detailed' && (
          <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
            <h3 className="font-medium text-green-800 mb-3">📋 Ce fichier inclut :</h3>
            <ul className="space-y-2 text-sm text-green-700">
              <li>✓ Résumé par catégorie avec totaux et pourcentages</li>
              <li>✓ Détail complet de chaque article (numéroté 1, 2, 3...)</li>
              <li>✓ Nom du site lisible (ex: IUT RCC Chalons)</li>
              <li>✓ Statistiques clés (moyennes, article le plus impactant)</li>
              <li>✓ Tableau des facteurs d'émission ADEME</li>
              <li>✓ Encodage UTF-8 compatible Excel français</li>
            </ul>
          </div>
        )}
        
        <button
          onClick={handleExport}
          disabled={items.length === 0}
          className={`w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all ${
            items.length === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
          }`}
        >
          <Download className="w-5 h-5" />
          {exported ? '✓ Exporté !' : `Exporter ${items.length} article(s)`}
        </button>
        
        {exported && (
          <div className="bg-green-100 border border-green-300 rounded-xl p-4 text-center text-green-800 animate-pulse">
            ✓ Fichier téléchargé avec succès !
          </div>
        )}
        
        <div className="text-center text-xs text-gray-500">
          Les fichiers CSV s'ouvrent dans Excel, LibreOffice ou Google Sheets.
          <br />
          Pour Excel : utilisez "Données → À partir d'un fichier texte" si l'affichage n'est pas optimal.
        </div>
      </div>
    </div>
  );
}