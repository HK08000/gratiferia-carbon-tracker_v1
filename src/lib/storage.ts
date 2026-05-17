// Storage utilities for Gratiferia Carbon Tracker
import { Item, Site, AppState, ADEME_FACTORS, getCategoryLabel } from './types';

const STORAGE_KEYS = {
  CURRENT_SITE: 'gratiferia_current_site',
  ITEMS: 'gratiferia_items',
  APP_STATE: 'gratiferia_app_state',
};

// Load data from localStorage with error handling
export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from storage:`, error);
    return defaultValue;
  }
}

// Save data to localStorage with error handling
export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
}

// Generate unique ID for items
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Generate CSV content from items - VERSION AMÉLIORÉE AVEC DÉTAILS
export function generateCSV(items: Item[]): string {
  const lines: string[] = [];
  
  // === EN-TÊTE AVEC INFORMATIONS GÉNÉRALES ===
  lines.push('RAPPORT EMPREINTE CARBONE - GRATIFERIA');
  lines.push(`Généré le: ${new Date().toLocaleString('fr-FR')}`);
  lines.push(`Nombre total d'articles: ${items.length}`);
  lines.push(`Empreinte carbone totale: ${items.reduce((sum, item) => sum + item.carbonValue, 0).toFixed(2)} kg CO2eq`);
  lines.push('');
  
  // === RÉSUMÉ PAR CATÉGORIE ===
  lines.push('RÉSUMÉ PAR CATÉGORIE');
  lines.push('Catégorie;Nombre d\'articles;Quantité totale;Empreinte carbone (kg CO2eq);Pourcentage');
  
  const carbonByCategory: Record<string, { count: number; quantity: number; carbon: number }> = {};
  
  items.forEach(item => {
    if (!carbonByCategory[item.category]) {
      carbonByCategory[item.category] = { count: 0, quantity: 0, carbon: 0 };
    }
    carbonByCategory[item.category].count += 1;
    carbonByCategory[item.category].quantity += item.quantity;
    carbonByCategory[item.category].carbon += item.carbonValue;
  });
  
  const totalCarbon = items.reduce((sum, item) => sum + item.carbonValue, 0);
  
  Object.entries(carbonByCategory).forEach(([category, data]) => {
    const percentage = totalCarbon > 0 ? ((data.carbon / totalCarbon) * 100).toFixed(1) : '0';
    lines.push(`${getCategoryLabel(category)};${data.count};${data.quantity};${data.carbon.toFixed(2)};${percentage}%`);
  });
  
  lines.push(`TOTAL GENERAL;${items.length};;${totalCarbon.toFixed(2)};100%`);
  lines.push('');
  
  // === DÉTAILS DES ARTICLES ===
  lines.push('DÉTAILS DES ARTICLES');
  const headers = [
    'ID',
    'Site',
    'Catégorie',
    'Nom de l\'article',
    'Quantité',
    'Facteur d\'émission (kg CO2eq/unité)',
    'Empreinte carbone totale (kg CO2eq)',
    'Méthode de calcul',
    'Date de capture',
    'Photo'
  ];
  lines.push(headers.join(';'));
  
  items.forEach(item => {
    const emissionFactor = item.quantity > 0 ? (item.carbonValue / item.quantity).toFixed(4) : '0';
    const date = new Date(item.timestamp).toLocaleString('fr-FR');
    const row = [
      item.id,
      item.siteId,
      getCategoryLabel(item.category),
      `"${item.name.replace(/"/g, '""')}"`,
      item.quantity,
      emissionFactor,
      item.carbonValue.toFixed(2),
      `"${item.calculationMethod}"`,
      date,
      item.photoUri ? 'Oui' : 'Non'
    ];
    lines.push(row.join(';'));
  });
  
  lines.push('');
  
  // === MÉTHODOLOGIE ===
  lines.push('MÉTHODOLOGIE DE CALCUL');
  lines.push('Les facteurs d\'émission sont basés sur la base ADEME (Agence de la Transition Écologique)');
  lines.push('');
  lines.push('Facteurs d\'émission utilisés:');
  ADEME_FACTORS.forEach(factor => {
    lines.push(`- ${factor.labelFr}: ${factor.emissionFactor} kg CO2eq par unité`);
  });
  
  return lines.join('\n');
}

// Generate Excel-compatible CSV with BOM for proper UTF-8 encoding
export function generateExcelCSV(items: Item[]): string {
  const csv = generateCSV(items);
  return '\uFEFF' + csv; // BOM pour Excel
}

// Generate detailed Excel export with multiple sections
export function generateDetailedExcelExport(items: Item[]): string {
  const lines: string[] = [];
  
  // === SECTION 1: VUE D'ENSEMBLE ===
  lines.push('=== VUE D\'ENSEMBLE ===');
  lines.push('');
  lines.push('Indicateurs clés');
  lines.push(`Date d'export;${new Date().toLocaleString('fr-FR')}`);
  lines.push(`Nombre total d'articles;${items.length}`);
  
  const totalCarbon = items.reduce((sum, item) => sum + item.carbonValue, 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueSites = new Set(items.map(item => item.siteId)).size;
  
  lines.push(`Empreinte carbone totale;${totalCarbon.toFixed(2)} kg CO2eq`);
  lines.push(`Quantité totale d'articles;${totalQuantity}`);
  lines.push(`Nombre de sites;${uniqueSites}`);
  lines.push(`Empreinte moyenne par article;${(totalCarbon / (items.length || 1)).toFixed(2)} kg CO2eq`);
  lines.push(`Empreinte moyenne par unité;${(totalCarbon / (totalQuantity || 1)).toFixed(4)} kg CO2eq`);
  lines.push('');
  
  // === SECTION 2: STATISTIQUES PAR CATÉGORIE ===
  lines.push('=== STATISTIQUES PAR CATÉGORIE ===');
  lines.push('');
  
  const statsByCategory: Record<string, { 
    count: number; 
    quantity: number; 
    carbon: number;
    avgCarbonPerItem: number;
    avgCarbonPerUnit: number;
  }> = {};
  
  items.forEach(item => {
    if (!statsByCategory[item.category]) {
      statsByCategory[item.category] = { count: 0, quantity: 0, carbon: 0, avgCarbonPerItem: 0, avgCarbonPerUnit: 0 };
    }
    statsByCategory[item.category].count += 1;
    statsByCategory[item.category].quantity += item.quantity;
    statsByCategory[item.category].carbon += item.carbonValue;
  });
  
  Object.values(statsByCategory).forEach(stat => {
    stat.avgCarbonPerItem = stat.carbon / (stat.count || 1);
    stat.avgCarbonPerUnit = stat.carbon / (stat.quantity || 1);
  });
  
  lines.push('Catégorie;Articles;Quantité;Total CO2eq;Moyenne/article;Moyenne/unité;% du total');
  
  Object.entries(statsByCategory).forEach(([category, stats]) => {
    const percentage = totalCarbon > 0 ? ((stats.carbon / totalCarbon) * 100).toFixed(1) : '0';
    lines.push(`${getCategoryLabel(category)};${stats.count};${stats.quantity};${stats.carbon.toFixed(2)};${stats.avgCarbonPerItem.toFixed(2)};${stats.avgCarbonPerUnit.toFixed(4)};${percentage}%`);
  });
  
  lines.push('');
  
  // === SECTION 3: DONNÉES COMPLÈTES PAR ARTICLE ===
  lines.push('=== DONNÉES COMPLÈTES PAR ARTICLE ===');
  lines.push('');
  
  const headers = [
    'ID Article',
    'Site',
    'Catégorie',
    'Nom',
    'Quantité',
    'Facteur d\'émission (kg CO2eq/unité)',
    'Empreinte totale (kg CO2eq)',
    'Méthode de calcul',
    'Date',
    'Heure',
    'Photo'
  ];
  lines.push(headers.join(';'));
  
  // Trier par date décroissante
  const sortedItems = [...items].sort((a, b) => b.timestamp - a.timestamp);
  
  sortedItems.forEach(item => {
    const date = new Date(item.timestamp);
    const emissionFactor = item.quantity > 0 ? (item.carbonValue / item.quantity).toFixed(4) : '0';
    const row = [
      item.id,
      item.siteId,
      getCategoryLabel(item.category),
      `"${item.name.replace(/"/g, '""')}"`,
      item.quantity,
      emissionFactor,
      item.carbonValue.toFixed(2),
      `"${item.calculationMethod}"`,
      date.toLocaleDateString('fr-FR'),
      date.toLocaleTimeString('fr-FR'),
      item.photoUri ? 'Oui' : 'Non'
    ];
    lines.push(row.join(';'));
  });
  
  lines.push('');
  
  // === SECTION 4: FACTEURS D'ÉMISSION ADEME ===
  lines.push('=== FACTEURS D\'ÉMISSION ADEME ===');
  lines.push('');
  lines.push('Catégorie;Facteur d\'émission (kg CO2eq/unité);Méthode;Description');
  
  ADEME_FACTORS.forEach(factor => {
    lines.push(`${factor.labelFr};${factor.emissionFactor};${factor.calculationMethod};"${factor.description}"`);
  });
  
  lines.push('');
  
  // === SECTION 5: NOTES MÉTHODOLOGIQUES ===
  lines.push('=== NOTES MÉTHODOLOGIQUES ===');
  lines.push('');
  lines.push('Source: Base Empreinte ADEME (Agence de la Transition Écologique)');
  lines.push('Les facteurs d\'émission représentent l\'empreinte carbone moyenne par type d\'article');
  lines.push('Calcul: Empreinte totale = Quantité × Facteur d\'émission');
  lines.push('');
  lines.push('Pour plus d\'informations: https://base-empreinte.ademe.fr');
  
  return '\uFEFF' + lines.join('\n');
}

// Export functions for external use
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

export function exportToCSV(items: Item[], filename?: string): void {
  const csv = generateExcelCSV(items);
  const name = filename || `gratiferia-export-${new Date().toISOString().split('T')[0]}.csv`;
  downloadFile(csv, name, 'text/csv;charset=utf-8;');
}

export function exportToDetailedExcel(items: Item[], filename?: string): void {
  const csv = generateDetailedExcelExport(items);
  const name = filename || `gratiferia-detailed-${new Date().toISOString().split('T')[0]}.csv`;
  downloadFile(csv, name, 'text/csv;charset=utf-8;');
}

// Storage functions for app state
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