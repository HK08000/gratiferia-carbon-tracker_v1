// Storage utilities for Gratiferia Carbon Tracker
import { Item, Site, AppState, ADEME_FACTORS, getCategoryLabel } from './types';

const STORAGE_KEYS = {
  CURRENT_SITE: 'gratiferia_current_site',
  ITEMS: 'gratiferia_items',
  APP_STATE: 'gratiferia_app_state',
};

// === REGISTRE DES SITES (noms lisibles pour l'export) ===
export const SITE_NAMES: Record<string, string> = {
  'iut-rcc-chalons': 'IUT RCC Chalons-en-Champagne',
  'iut-reims': 'IUT Reims',
  'urca-campus': 'URCA Campus',
  'gratiferia-centre': 'Gratiferia Centre-Ville',
  // Ajoutez vos sites ici : 'id-du-site': 'Nom affiché dans Excel',
};

// Fonction pour obtenir le nom lisible d'un site
export function getSiteDisplayName(siteId: string): string {
  return SITE_NAMES[siteId] || siteId;
}

// Load data from localStorage
export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from storage:`, error);
    return defaultValue;
  }
}

// Save data to localStorage
export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// === EXPORT DÉTAILLÉ EXCEL - VERSION AMÉLIORÉE ===
export function generateDetailedExcelExport(items: Item[]): string {
  const lines: string[] = [];
  
  // === EN-TÊTE ===
  lines.push('RAPPORT EMPREINTE CARBONE - GRATIFERIA');
  lines.push(`Généré le: ${new Date().toLocaleString('fr-FR')}`);
  lines.push(`Nombre total d'articles: ${items.length}`);
  lines.push('');
  
  // === RÉSUMÉ PAR CATÉGORIE ===
  lines.push('📊 RÉSUMÉ PAR CATÉGORIE');
  lines.push('');
  
  const statsByCategory: Record<string, { 
    count: number; 
    quantity: number; 
    carbon: number;
    percentage: number;
  }> = {};
  
  let totalCarbon = 0;
  
  items.forEach(item => {
    totalCarbon += item.carbonValue;
    if (!statsByCategory[item.category]) {
      statsByCategory[item.category] = { count: 0, quantity: 0, carbon: 0, percentage: 0 };
    }
    statsByCategory[item.category].count += 1;
    statsByCategory[item.category].quantity += item.quantity;
    statsByCategory[item.category].carbon += item.carbonValue;
  });
  
  Object.values(statsByCategory).forEach(stat => {
    stat.percentage = totalCarbon > 0 ? (stat.carbon / totalCarbon) * 100 : 0;
  });
  
  lines.push('N°;Catégorie;Nombre d\'articles;Quantité totale;Empreinte (kg CO2eq);% du total');
  
  let lineNumber = 1;
  Object.entries(statsByCategory)
    .sort((a, b) => b[1].carbon - a[1].carbon)
    .forEach(([category, stats]) => {
      lines.push(`${lineNumber};${getCategoryLabel(category)};${stats.count};${stats.quantity};${stats.carbon.toFixed(2)};${stats.percentage.toFixed(1)}%`);
      lineNumber++;
    });
  
  lines.push(`;TOTAL GÉNÉRAL;${items.length};;${totalCarbon.toFixed(2)};100%`);
  lines.push('');
  lines.push('');
  
  // === DÉTAILS DES ARTICLES ===
  lines.push('📋 DÉTAILS DES ARTICLES');
  lines.push('');
  
  lines.push('N°;Site;Catégorie;Nom de l\'article;Quantité;Empreinte unitaire (kg CO2eq);Empreinte totale (kg CO2eq);Date;Photo');
  
  const sortedItems = [...items].sort((a, b) => b.timestamp - a.timestamp);
  
  sortedItems.forEach((item, index) => {
    const emissionFactor = item.quantity > 0 ? (item.carbonValue / item.quantity).toFixed(2) : '0';
    const date = new Date(item.timestamp).toLocaleString('fr-FR');
    const hasPhoto = item.photoUri ? 'Oui' : 'Non';
    
    lines.push(`${index + 1};${getSiteDisplayName(item.siteId)};${getCategoryLabel(item.category)};"${item.name.replace(/;/g, ',')}";${item.quantity};${emissionFactor};${item.carbonValue.toFixed(2)};${date};${hasPhoto}`);
  });
  
  lines.push('');
  lines.push('');
  
  // === STATISTIQUES CLÉS ===
  lines.push('📈 STATISTIQUES CLÉS');
  lines.push('');
  lines.push('Indicateur;Valeur');
  lines.push(`Nombre total d'articles;${items.length}`);
  lines.push(`Quantité totale d'objets;${items.reduce((sum, item) => sum + item.quantity, 0)}`);
  lines.push(`Empreinte carbone totale;${totalCarbon.toFixed(2)} kg CO2eq`);
  lines.push(`Empreinte moyenne par article;${(totalCarbon / (items.length || 1)).toFixed(2)} kg CO2eq`);
  lines.push(`Nombre de sites;${new Set(items.map(item => item.siteId)).size}`);
  
  if (items.length > 0) {
    const maxCarbonItem = sortedItems.reduce((max, item) => item.carbonValue > max.carbonValue ? item : max, sortedItems[0]);
    lines.push(`Article le plus impactant;"${maxCarbonItem.name}" (${maxCarbonItem.carbonValue.toFixed(2)} kg CO2eq)`);
  }
  
  lines.push('');
  lines.push('');
  
  // === FACTEURS D'ÉMISSION ===
  lines.push('🌍 FACTEURS D\'ÉMISSION ADEME');
  lines.push('');
  lines.push('Catégorie;Facteur (kg CO2eq/unité)');
  
  ADEME_FACTORS.forEach(factor => {
    lines.push(`${factor.labelFr};${factor.emissionFactor}`);
  });
  
  lines.push('');
  lines.push('');
  
  // === INFORMATIONS ===
  lines.push('ℹ️ INFORMATIONS');
  lines.push('Source: Base Empreinte ADEME (Agence de la Transition Écologique)');
  lines.push('Méthode: Empreinte totale = Quantité × Facteur d\'émission');
  lines.push(`Export généré par Gratiferia Carbon Tracker le ${new Date().toLocaleString('fr-FR')}`);
  
  return '\uFEFF' + lines.join('\n');
}

// === EXPORT CSV SIMPLE ===
export function generateCSV(items: Item[]): string {
  const lines: string[] = [];
  
  lines.push('N°;Site;Catégorie;Nom;Quantité;Empreinte totale (kg CO2eq);Date');
  
  items.forEach((item, index) => {
    const date = new Date(item.timestamp).toLocaleString('fr-FR');
    lines.push(`${index + 1};${getSiteDisplayName(item.siteId)};${getCategoryLabel(item.category)};"${item.name.replace(/;/g, ',')}";${item.quantity};${item.carbonValue.toFixed(2)};${date}`);
  });
  
  return '\uFEFF' + lines.join('\n');
}

export function generateExcelCSV(items: Item[]): string {
  return generateCSV(items);
}

// Download helper
export function downloadFile(content: string, filename: string, mimeType: string = 'text/csv'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export functions
export function exportToCSV(items: Item[], filename?: string): void {
  const csv = generateExcelCSV(items);
  const name = filename || `gratiferia-export-${new Date().toISOString().split('T')[0]}.csv`;
  downloadFile(csv, name, 'text/csv;charset=utf-8;');
}

export function exportToDetailedExcel(items: Item[], filename?: string): void {
  const csv = generateDetailedExcelExport(items);
  const name = filename || `gratiferia-detaille-${new Date().toISOString().split('T')[0]}.csv`;
  downloadFile(csv, name, 'text/csv;charset=utf-8;');
}

// Storage functions
export function getCurrentSite(): Site | null {
  return loadFromStorage<Site | null>(STORAGE_KEYS.CURRENT_SITE, null);
}

export function setCurrentSite(site: Site): void {
  saveToStorage(STORAGE_KEYS.CURRENT_SITE, site);
}

export function getAllItems(): Item[] {
  return loadFromStorage<Item[]>(STORAGE_KEYS.ITEMS, []);
}

export function saveItems(items: Item[]): void {
  saveToStorage(STORAGE_KEYS.ITEMS, items);
}

export function addItem(item: Item): void {
  const items = getAllItems();
  items.push(item);
  saveItems(items);
}

export function deleteItem(itemId: string): void {
  const items = getAllItems().filter(item => item.id !== itemId);
  saveItems(items);
}

export function getItemsBySite(siteId: string): Item[] {
  return getAllItems().filter(item => item.siteId === siteId);
}

export function getAppState(): AppState {
  return loadFromStorage<AppState>(STORAGE_KEYS.APP_STATE, {
    isCapturing: false,
    currentSession: null,
    settings: {
      language: 'fr',
      currency: 'EUR',
      carbonUnit: 'kg',
    }
  });
}

export function saveAppState(state: AppState): void {
  saveToStorage(STORAGE_KEYS.APP_STATE, state);
}

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_SITE);
  localStorage.removeItem(STORAGE_KEYS.ITEMS);
  localStorage.removeItem(STORAGE_KEYS.APP_STATE);
}