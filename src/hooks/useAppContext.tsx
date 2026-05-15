import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Site, Item, AppState, CategoryType, calculateCarbonValue, PREDEFINED_SITES } from '../lib/types';
import * as Storage from '../lib/storage';

// Action types
type Action =
  | { type: 'SET_SITE'; payload: Site }
  | { type: 'START_SESSION' }
  | { type: 'END_SESSION' }
  | { type: 'ADD_ITEM'; payload: Omit<Item, 'id' | 'timestamp'> }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'LOAD_ITEMS'; payload: Item[] }
  | { type: 'LOAD_SITE'; payload: Site | null };

// Initial state
const initialState: AppState = {
  currentSite: null,
  items: [],
  isSessionActive: false,
};

// Reducer function
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_SITE':
      Storage.saveCurrentSite(action.payload);
      return { ...state, currentSite: action.payload };

    case 'START_SESSION':
      return { ...state, isSessionActive: true };

    case 'END_SESSION':
      return { ...state, isSessionActive: false };

    case 'ADD_ITEM': {
      const newItem: Item = {
        ...action.payload,
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      };
      Storage.addItem(newItem);
      return { ...state, items: [...state.items, newItem] };
    }

    case 'DELETE_ITEM': {
      Storage.deleteItem(action.payload);
      const filteredItems = state.items.filter(item => item.id !== action.payload);
      return { ...state, items: filteredItems };
    }

    case 'LOAD_ITEMS':
      return { ...state, items: action.payload };

    case 'LOAD_SITE':
      return { ...state, currentSite: action.payload };

    default:
      return state;
  }
}

// Context type
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  addItem: (category: CategoryType, name: string, quantity: number, photoUri: string | null) => void;
  deleteItem: (itemId: string) => void;
  setSite: (site: Site) => void;
  startSession: () => void;
  endSession: () => void;
  getItemsForCurrentSite: () => Item[];
  getStatistics: () => ReturnType<typeof Storage.getStatistics>;
  generateCSVExport: () => string;
  generateExcelExport: () => string;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load saved data on mount
  useEffect(() => {
    const savedSite = Storage.getCurrentSite();
    const savedItems = Storage.getAllItems();

    if (savedSite) {
      dispatch({ type: 'LOAD_SITE', payload: savedSite });
    }
    dispatch({ type: 'LOAD_ITEMS', payload: savedItems });
  }, []);

  // Add item action
  const addItem = (category: CategoryType, name: string, quantity: number, photoUri: string | null) => {
    if (!state.currentSite) {
      alert('Veuillez sélectionner un site d\'abord');
      return;
    }

    const carbonValue = calculateCarbonValue(category, quantity);
    const itemData = {
      siteId: state.currentSite.id,
      photoUri,
      category,
      name,
      quantity,
      carbonValue,
      calculationMethod: 'ADEME - Base Empreinte',
    };

    dispatch({ type: 'ADD_ITEM', payload: itemData });
  };

  // Delete item action
  const deleteItem = (itemId: string) => {
    dispatch({ type: 'DELETE_ITEM', payload: itemId });
  };

  // Set site action
  const setSite = (site: Site) => {
    dispatch({ type: 'SET_SITE', payload: site });
  };

  // Start session
  const startSession = () => {
    dispatch({ type: 'START_SESSION' });
  };

  // End session
  const endSession = () => {
    dispatch({ type: 'END_SESSION' });
  };

  // Get items for current site
  const getItemsForCurrentSite = (): Item[] => {
    if (!state.currentSite) return [];
    return state.items.filter(item => item.siteId === state.currentSite!.id);
  };

  // Get statistics
  const getStatistics = () => {
    return Storage.getStatistics(getItemsForCurrentSite());
  };

  // Generate CSV export
  const generateCSVExport = () => {
    return Storage.generateCSV(getItemsForCurrentSite());
  };

  // Generate Excel export
  const generateExcelExport = () => {
    return Storage.generateExcelCSV(getItemsForCurrentSite());
  };

  const value: AppContextType = {
    state,
    dispatch,
    addItem,
    deleteItem,
    setSite,
    startSession,
    endSession,
    getItemsForCurrentSite,
    getStatistics,
    generateCSVExport,
    generateExcelExport,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Custom hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
