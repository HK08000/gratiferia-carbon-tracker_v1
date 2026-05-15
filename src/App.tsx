import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './hooks/useAppContext';
import SiteSelection from './components/SiteSelection';
import CaptureScreen from './components/CaptureScreen';
import ItemsList from './components/ItemsList';
import StatsScreen from './components/StatsScreen';
import ExportScreen from './components/ExportScreen';
import HelpGuide from './components/HelpGuide';
import './App.css';

type TabType = 'capture' | 'items' | 'stats' | 'export';

function TabNavigation() {
  const [activeTab, setActiveTab] = useState<TabType>('capture');
  const [showHelp, setShowHelp] = useState(false);
  const { endSession, getItemsForCurrentSite } = useApp();
  const items = getItemsForCurrentSite();

  const handleEndSession = () => {
    if (confirm('Voulez-vous vraiment terminer cette session ?')) {
      endSession();
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'capture':
        return <CaptureScreen onCaptureComplete={() => {}} />;
      case 'items':
        return <ItemsList />;
      case 'stats':
        return <StatsScreen />;
      case 'export':
        return <ExportScreen />;
      default:
        return <CaptureScreen onCaptureComplete={() => {}} />;
    }
  };

  const tabs: { id: TabType; label: string; icon: JSX.Element; badge?: number }[] = [
    {
      id: 'capture',
      label: 'Capture',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      id: 'items',
      label: 'Articles',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      ),
      badge: items.length,
    },
    {
      id: 'stats',
      label: 'Stats',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: 'export',
      label: 'Export',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      ),
    },
  ];

  if (showHelp) {
    return <HelpGuide onClose={() => setShowHelp(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header with Help Button */}
      <div className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-2 flex items-center justify-between">
          <img src="/imgs/urca-logo.svg" alt="URCA" className="h-8" />
          <button
            onClick={() => setShowHelp(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Aide
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">{renderContent()}</div>

      {/* Bottom Tab Navigation */}
      <div className="bg-white border-t border-gray-200 safe-area-bottom">
        <div className="flex justify-around items-center py-2 px-4 max-w-lg mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center px-4 py-2 rounded-xl transition-all relative ${
                activeTab === tab.id
                  ? 'text-green-600 bg-green-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              <span className="text-xs mt-1 font-medium">{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* End Session Button */}
        <div className="p-4 pt-2 border-t border-gray-100">
          <button
            onClick={handleEndSession}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium rounded-xl transition-colors text-sm"
          >
            Terminer la session
          </button>
        </div>
      </div>
    </div>
  );
}

function MainApp() {
  const { state } = useApp();
  const [showHelp, setShowHelp] = useState(false);
  const [firstVisit, setFirstVisit] = useState(true);

  useEffect(() => {
    // Check if user has seen the guide before
    const hasSeenGuide = localStorage.getItem('gratiferia_guide_seen');
    if (!hasSeenGuide) {
      setShowHelp(true);
    }
  }, []);

  const handleGuideClose = () => {
    localStorage.setItem('gratiferia_guide_seen', 'true');
    setShowHelp(false);
  };

  if (!state.isSessionActive) {
    if (showHelp) {
      return <HelpGuide onClose={handleGuideClose} />;
    }
    return (
      <>
        <SiteSelection onSiteSelected={() => {}} />
        <button
          onClick={() => setShowHelp(true)}
          className="fixed bottom-4 right-4 flex items-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-full shadow-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Guide
        </button>
      </>
    );
  }

  return <TabNavigation />;
}

function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

export default App;
