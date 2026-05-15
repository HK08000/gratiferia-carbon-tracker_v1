import React, { useState } from 'react';

interface HelpGuideProps {
  onClose: () => void;
}

export default function HelpGuide({ onClose }: HelpGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Bienvenue !',
      description: 'Cette application vous aide à calculer l\'empreinte carbone de la gratiferia en photographiant les articles.',
      icon: '👋',
      image: '/imgs/urca-logo.svg'
    },
    {
      title: '1. Sélectionnez votre site',
      description: 'Au démarrage, choisissez le campus où vous travaillez (Croix Rouge, Moulin Blanc, Sciences, etc.) ou créez un site personnalisé.',
      icon: '📍'
    },
    {
      title: '2. Photographiez les articles',
      description: 'Utilisez l\'onglet "Capture" pour prendre une photo de chaque article donate. Cliquez sur la zone image pour activer l\'appareil photo.',
      icon: '📷'
    },
    {
      title: '3. Choisissez la catégorie',
      description: 'Sélectionnez la catégorie correspondant à l\'article (Textile, Meubles, Électronique, etc.). Chaque catégorie a un facteur d\'émission différent.',
      icon: '🏷️'
    },
    {
      title: '4. Indiquez les détails',
      description: 'Donnez un nom à l\'article et sa quantité. L\'empreinte carbone est calculée automatiquement.',
      icon: '✏️'
    },
    {
      title: '5. Enregistrez et continuez',
      description: 'Cliquez sur "Enregistrer" pour sauvegarder l\'article. L\'empreinte carbone évitée s\'ajoute au total.',
      icon: '✅'
    },
    {
      title: '6. Exportez vos données',
      description: 'Utilisez l\'onglet "Export" pour télécharger un fichier CSV ou Excel avec tous les articles capturés.',
      icon: '📊'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 flex flex-col">
      {/* Header with Logo */}
      <div className="bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <img src="/imgs/urca-logo.svg" alt="URCA" className="h-10" />
          <span className="text-sm text-gray-500">Guide d'utilisation</span>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="p-4 max-w-lg mx-auto w-full">
        <div className="flex gap-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`flex-1 h-2 rounded-full transition-colors ${
                index <= currentStep ? 'bg-green-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <div className="text-center text-sm text-gray-500 mt-2">
          Étape {currentStep + 1} sur {steps.length}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          {/* Icon */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">{step.icon}</div>
            {step.image && (
              <img src={step.image} alt="URCA" className="h-16 mx-auto mb-4" />
            )}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
            {step.title}
          </h2>

          {/* Description */}
          <p className="text-gray-600 text-center leading-relaxed">
            {step.description}
          </p>

          {/* Tips box */}
          {currentStep === 2 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-6">
              <p className="text-sm text-yellow-800">
                <strong>💡 Conseil :</strong> Vous pouvez prendre plusieurs photos du même type d'article et indiquer une quantité supérieure pour gagner du temps.
              </p>
            </div>
          )}

          {currentStep === 5 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-6">
              <p className="text-sm text-green-800">
                <strong>🌍 Impact :</strong> Chaque article enregistré représente du CO₂ qui n'a pas été émis pour produire un nouvel objet !
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="p-6 max-w-lg mx-auto w-full">
        <div className="flex gap-4">
          {currentStep > 0 ? (
            <button
              onClick={handlePrevious}
              className="flex-1 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-colors"
            >
              ← Précédent
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-colors"
            >
              Passer
            </button>
          )}

          <button
            onClick={handleNext}
            className="flex-1 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors"
          >
            {currentStep === steps.length - 1 ? 'Commencer !' : 'Suivant →'}
          </button>
        </div>
      </div>
    </div>
  );
}
