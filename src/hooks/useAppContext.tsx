import { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';
import { 
  Item, 
  Site, 
  AppState, 
  AppAction, 
  appReducer, 
  initialState,
  ADEME_FACTORS,
  getCategoryLabel,
  calculateCarbonFootprint 
} from '../lib/types';
import * as Storage from '../lib/storage';

// Context type definition
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  
  // Item management
  addItem: (item: Omit<Item, 'id' | 'timestamp' | 'carbonValue'>) => void;
  deleteItem: (itemId: string) => void;
  getItemsForCurrentSite: () => Item[];
  
  // Site management
  currentSite: Site | null;
  setCurrentSite: (site: Site) => void;
  
  // Session management
  startSession: (site: Site) => void;
  endSession: () => void;
  
  // Statistics
  getStatistics: () => {
    totalItems: number;
    totalCarbon: number;
    averageCarbonPerItem: number;
    byCategory: Record<string, { count: number; carbon: number }>;
  };
  
  // Export functions
  generateCSVExport: () => string;
  generateExcelExport: () => string;
  generateDetailedExcelExport: () => string;
  exportToCSV: (filename?: string) => void;
  exportToDetailedExcel: (filename?: string) => void;
  
  // Utility
  clearAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Load initial state from storage
  const currentSite = Storage.getCurrentSite();
  
  // Item management
  const addItem = useCallback((itemData: Omit<Item, 'id' | 'timestamp' | 'carbonValue'>) => {
    const carbonValue = calculateCarbonFootprint(itemData.category, itemData.quantity);
    const newItem: Item = {
      ...itemData,
      id: Storage.generateId(),
      timestamp: Date.now(),
      carbonValue,
    };
    Storage.addItem(newItem);
    dispatch({ type: 'ADD_ITEM', payload: newItem });
  }, []);
  
  const deleteItem = useCallback((itemId: string) => {
    Storage.deleteItem(itemId);
    dispatch({ type: 'DELETE_ITEM', payload: itemId });
  }, []);
  
  const getItemsForCurrentSite = useCallback((): Item[] => {
    if (!currentSite) return [];
    return Storage.getItemsBySite(currentSite.id);
  }, [currentSite]);
  
  // Site management
  const setCurrentSite = useCallback((site: Site) => {
    Storage.setCurrentSite(site);
    dispatch({ type: 'SET_SITE', payload: site });
  }, []);
  
  // Session management
  const startSession = useCallback((site: Site) => {
    Storage.setCurrentSite(site);
    dispatch({ type: 'START_SESSION', payload: site });
  }, []);
  
  const endSession = useCallback(() => {
    dispatch({ type: 'END_SESSION' });
  }, []);
  
  // Statistics
  const getStatistics = useCallback(() => {
    const items = getItemsForCurrentSite();
    const totalItems = items.length;
    const totalCarbon = items.reduce((sum, item) => sum + item.carbonValue, 0);
    const averageCarbonPerItem = totalItems > 0 ? totalCarbon / totalItems : 0;
    
    const byCategory: Record<string, { count: number; carbon: number }> = {};
    items.forEach(item => {
      if (!byCategory[item.category]) {
        byCategory[item.category] = { count: 0, carbon: 0 };
      }
      byCategory[item.category].count += 1;
      byCategory[item.category].carbon += item.carbonValue;
    });
    
    return { totalItems, totalCarbon, averageCarbonPerItem, byCategory };
  }, [getItemsForCurrentSite]);
  
  // Export functions
  const generateCSVExport = useCallback(() => {
    return Storage.generateExcelCSV(getItemsForCurrentSite());
  }, [getItemsForCurrentSite]);
  
  const generateExcelExport = useCallback(() => {
    return Storage.generateExcelCSV(getItemsForCurrentSite());
  }, [getItemsForCurrentSite]);
  
  const generateDetailedExcelExport = useCallback(() => {
    return Storage.generateDetailedExcelExport(getItemsForCurrentSite());
  }, [getItemsForCurrentSite]);
  
  const exportToCSV = useCallback((filename?: string) => {
    Storage.exportToCSV(getItemsForCurrentSite(), filename);
  }, [getItemsForCurrentSite]);
  
  const exportToDetailedExcel = useCallback((filename?: string) => {
    Storage.exportToDetailedExcel(getItemsForCurrentSite(), filename);
  }, [getItemsForCurrentSite]);
  
  // Utility
  const clearAllData = useCallback(() => {
    Storage.clearAllData();
    dispatch({ type: 'CLEAR_ALL' });
  }, []);
  
  const value: AppContextType = {
    state,
    dispatch,
    addItem,
    deleteItem,
    getItemsForCurrentSite,
    currentSite,
    setCurrentSite,
    startSession,
    endSession,
    getStatistics,
    generateCSVExport,
    generateExcelExport,
    generateDetailedExcelExport,
    exportToCSV,
    exportToDetailedExcel,
    clearAllData,
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}