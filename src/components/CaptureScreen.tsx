import React, { useState, useRef, useCallback } from 'react';
import { ADEME_FACTORS, CategoryType, getEmissionFactor, getCategoryLabel } from '../lib/types';
import { useApp } from '../hooks/useAppContext';

interface CaptureScreenProps {
  onCaptureComplete: () => void;
}

export default function CaptureScreen({ onCaptureComplete }: CaptureScreenProps) {
  const { addItem, state } = useApp();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [category, setCategory] = useState<CategoryType>('other');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showCamera, setShowCamera] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate estimated carbon value
  const estimatedCarbon = getEmissionFactor(category) * quantity;

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUri(reader.result as string);
        setShowCamera(false);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleTakePhoto = () => {
    fileInputRef.current?.click();
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Veuillez entrer un nom pour l\'article');
      return;
    }
    if (quantity < 1) {
      alert('La quantité doit être au moins 1');
      return;
    }

    addItem(category, name.trim(), quantity, photoUri);
    setShowSuccess(true);

    // Reset form after short delay
    setTimeout(() => {
      setPhotoUri(null);
      setName('');
      setQuantity(1);
      setCategory('other');
      setShowSuccess(false);
      onCaptureComplete();
    }, 1500);
  };

  const handleNewCapture = () => {
    setPhotoUri(null);
    setName('');
    setQuantity(1);
    setCategory('other');
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
          <h2 className="text-2xl font-bold text-green-600 mb-2">Article enregistré !</h2>
          <p className="text-gray-600">
            Économie de CO₂ estimée: <span className="font-bold text-green-600">{estimatedCarbon.toFixed(1)} kg</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-green-500 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Capture d'article</h1>
            <p className="text-sm text-green-100">{state.currentSite?.name}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{estimatedCarbon.toFixed(1)}</div>
            <div className="text-xs text-green-100">kg CO₂eq</div>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-lg mx-auto">
        {/* Photo Section */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-4">
          <div
            className="h-48 bg-gray-200 flex items-center justify-center cursor-pointer"
            onClick={handleTakePhoto}
          >
            {photoUri ? (
              <img src={photoUri} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="font-medium">Cliquez pour ajouter une photo</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />
          {photoUri && (
            <button
              onClick={handleNewCapture}
              className="w-full py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors text-sm"
            >
              Changer la photo
            </button>
          )}
        </div>

        {/* Category Selection */}
        <div className="bg-white rounded-2xl shadow-md p-4 mb-4">
          <h3 className="font-semibold text-gray-800 mb-3">Catégorie</h3>
          <div className="grid grid-cols-2 gap-2">
            {ADEME_FACTORS.map((factor) => (
              <button
                key={factor.category}
                onClick={() => setCategory(factor.category)}
                className={`p-3 rounded-xl border-2 transition-all text-left ${
                  category === factor.category
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="font-medium text-gray-800 text-sm">{factor.labelFr}</div>
                <div className="text-xs text-gray-500">{factor.emissionFactor} kg CO₂eq</div>
              </button>
            ))}
          </div>
        </div>

        {/* Item Details */}
        <div className="bg-white rounded-2xl shadow-md p-4 mb-4">
          <div className="space-y-4">
            <div>
              <label className="block font-semibold text-gray-800 mb-2">Nom de l'article</label>
              <input
                type="text"
                placeholder="Ex: T-shirt bleu taille M"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-800 mb-2">Quantité</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded-full font-bold text-xl transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 p-3 border border-gray-300 rounded-xl text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full font-bold text-xl transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Carbon Summary */}
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Empreinte carbone estimée</p>
              <p className="text-gray-500 text-xs">Méthode: ADEME Base Empreinte</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-600">{estimatedCarbon.toFixed(1)}</p>
              <p className="text-sm text-green-600">kg CO₂eq</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Enregistrer l'article
        </button>
      </div>
    </div>
  );
}
