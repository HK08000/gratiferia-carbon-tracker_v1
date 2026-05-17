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

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  
  addItem: (item: Omit<Item, 'id' | 'timestamp' | 'carbonValue'>) => void;
  deleteItem: (itemId: string) => void;
  getItemsForCurrentSite: () => Item[];
  
  currentSite: Site | null;
  setCurrentSite: (site: Site) => void;
  
  startSession: (site: Site) => void;
  endSession: () => void;
  
  getStatistics: () => {
    totalItems: number;
    totalCarbon: number;
    averageCarbonPerItem: number;
    byCategory: Record<string, { count: number; carbon: number }>;
  };
  
  generateCSVExport: () => string;
  generateExcelExport: () => string;
  generateDetailedExcelExport: () => string;
  exportToCSV: (filename?: string) => void;
  exportToDetailedExcel: (filename?: string) => void;
  
  clearAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const currentSite = Storage.getCurrentSite();
  
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
  
  const setCurrentSite = useCallback((site: Site) => {
    Storage.setCurrentSite(site);
    dispatch({ type: 'SET_SITE', payload: site });
  }, []);
  
  const startSession = useCallback((site: Site) => {
    Storage.setCurrentSite(site);
    dispatch({ type: 'START_SESSION', payload: site });
  }, []);
  
  const endSession = useCallback(() => {
    dispatch({ type: 'END_SESSION' });
  }, []);
  
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