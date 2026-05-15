// Storage utilities for Gratiferia Carbon Tracker
import { Item, Site, AppState } from './types';

const STORAGE_KEYS = {
  CURRENT_SITE: 'gratiferia_current_site',
  ITEMS: 'gratiferia_items',
  APP_STATE: 'gratiferia_app_state',
};

// Get current site from storage
export function getCurrentSite(): Site | null {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_SITE);
  return data ? JSON.parse(data) : null;
}

// Save current site to storage
export function saveCurrentSite(site: Site): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_SITE, JSON.stringify(site));
}

// Get all items from storage
export function getAllItems(): Item[] {
  const data = localStorage.getItem(STORAGE_KEYS.ITEMS);
  return data ? JSON.parse(data) : [];
}

// Save items to storage
export function saveItems(items: Item[]): void {
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
}

// Add a single item to storage
export function addItem(item: Item): void {
  const items = getAllItems();
  items.push(item);
  saveItems(items);
}

// Delete an item from storage
export function deleteItem(itemId: string): void {
  const items = getAllItems();
  const filteredItems = items.filter(item => item.id !== itemId);
  saveItems(filteredItems);
}

// Get items filtered by site
export function getItemsBySite(siteId: string): Item[] {
  const items = getAllItems();
  return items.filter(item => item.siteId === siteId);
}

// Get items filtered by category
export function getItemsByCategory(category: string): Item[] {
  const items = getAllItems();
  return items.filter(item => item.category === category);
}

// Generate CSV content from items
export function generateCSV(items: Item[]): string {
  const headers = [
    'ID',
    'Site',
    'Catégorie',
    'Nom article',
    'Quantité',
    'Empreinte Carbone (kg CO2eq)',
    'Méthode de calcul',
    'Date',
    'Photo'
  ].join(',');

  const rows = items.map(item => {
    const date = new Date(item.timestamp).toLocaleString('fr-FR');
    return [
      item.id,
      item.siteId,
      item.category,
      `"${item.name}"`, // Quote name to handle commas
      item.quantity,
      item.carbonValue.toFixed(2),
      `"${item.calculationMethod}"`,
      date,
      item.photoUri || ''
    ].join(',');
  });

  return [headers, ...rows].join('\n');
}

// Generate Excel-compatible CSV with BOM for proper encoding
export function generateExcelCSV(items: Item[]): string {
  const csv = generateCSV(items);
  // Add BOM for Excel compatibility with French characters
  return '\uFEFF' + csv;
}

// Calculate total carbon footprint
export function calculateTotalCarbon(items: Item[]): number {
  return items.reduce((total, item) => total + item.carbonValue, 0);
}

// Calculate carbon breakdown by category
export function calculateCarbonByCategory(items: Item[]): Record<string, number> {
  const breakdown: Record<string, number> = {};

  items.forEach(item => {
    if (!breakdown[item.category]) {
      breakdown[item.category] = 0;
    }
    breakdown[item.category] += item.carbonValue;
  });

  return breakdown;
}

// Get statistics
export function getStatistics(items: Item[]) {
  const totalItems = items.length;
  const totalCarbon = calculateTotalCarbon(items);
  const carbonByCategory = calculateCarbonByCategory(items);
  const uniqueSites = [...new Set(items.map(item => item.siteId))];

  return {
    totalItems,
    totalCarbon,
    carbonByCategory,
    uniqueSitesCount: uniqueSites.length,
    averageCarbonPerItem: totalItems > 0 ? totalCarbon / totalItems : 0
  };
}

// Clear all storage (for testing/reset)
export function clearStorage(): void {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_SITE);
  localStorage.removeItem(STORAGE_KEYS.ITEMS);
  localStorage.removeItem(STORAGE_KEYS.APP_STATE);
}
