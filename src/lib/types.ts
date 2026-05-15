// Types for the Gratiferia Carbon Tracker App

export interface Site {
  id: string;
  name: string;
  location: string;
}

export type CategoryType =
  | 'textile'       // Vêtements, chaussures
  | 'furniture'     // Meubles, déco
  | 'electronics'   // Petit électroménager, high-tech
  | 'books'         // Livres, papier
  | 'kitchen'       // Ustensiles, vaisselle
  | 'sports'        // Équipements sportifs
  | 'toys'          // Jouets
  | 'other';       // Autres

export interface CarbonFactor {
  category: CategoryType;
  label: string;
  labelFr: string;
  emissionFactor: number; // kg CO2eq per item
  calculationMethod: string;
  description: string;
}

export interface Item {
  id: string;
  siteId: string;
  photoUri: string | null;
  category: CategoryType;
  name: string;
  quantity: number;
  carbonValue: number; // kg CO2eq
  calculationMethod: string;
  timestamp: number;
  location?: { lat: number; lng: number };
}

export interface AppState {
  currentSite: Site | null;
  items: Item[];
  isSessionActive: boolean;
}

// ADEME Emission Factors Database
export const ADEME_FACTORS: CarbonFactor[] = [
  {
    category: 'textile',
    label: 'Textile',
    labelFr: 'Textile (vêtements, chaussures)',
    emissionFactor: 15, // kg CO2eq average per garment
    calculationMethod: 'ADEME - Impact environnemental du textile',
    description: 'Facteur moyen pour vêtements et accessoires textiles'
  },
  {
    category: 'furniture',
    label: 'Furniture',
    labelFr: 'Meubles (meubles, décoration)',
    emissionFactor: 50, // kg CO2eq average per furniture item
    calculationMethod: 'ADEME - Base Empreinte',
    description: 'Facteur moyen pour mobilier et éléments de décoration'
  },
  {
    category: 'electronics',
    label: 'Electronics',
    labelFr: 'Électronique (high-tech, électroménager)',
    emissionFactor: 30, // kg CO2eq average per electronic item
    calculationMethod: 'ADEME - Base Empreinte',
    description: 'Facteur moyen pour équipements électroniques et électroménager'
  },
  {
    category: 'books',
    label: 'Books',
    labelFr: 'Livres et papier',
    emissionFactor: 2, // kg CO2eq average per book
    calculationMethod: 'ADEME - Impact du papier',
    description: 'Facteur moyen pour livres, magazines et papeterie'
  },
  {
    category: 'kitchen',
    label: 'Kitchen',
    labelFr: 'Cuisine (ustensiles, vaisselle)',
    emissionFactor: 10, // kg CO2eq average per kitchen item
    calculationMethod: 'ADEME - Base Empreinte',
    description: 'Facteur moyen pour ustensiles de cuisine et vaisselle'
  },
  {
    category: 'sports',
    label: 'Sports',
    labelFr: 'Sports (équipements sportifs)',
    emissionFactor: 20, // kg CO2eq average per sports item
    calculationMethod: 'ADEME - Base Empreinte',
    description: 'Facteur moyen pour équipements sportifs'
  },
  {
    category: 'toys',
    label: 'Toys',
    labelFr: 'Jouets',
    emissionFactor: 8, // kg CO2eq average per toy
    calculationMethod: 'ADEME - Impact des jouets',
    description: 'Facteur moyen pour jouets et jeux'
  },
  {
    category: 'other',
    label: 'Other',
    labelFr: 'Autres articles',
    emissionFactor: 5, // kg CO2eq average for uncategorized items
    calculationMethod: 'ADEME - Estimation générique',
    description: 'Facteur estimé pour articles non catégorisés'
  }
];

// Predefined sites for Université de Reims Champagne Ardenne
export const PREDEFINED_SITES: Site[] = [
  { id: 'site-1', name: 'IUT RCC - Châlons', location: 'Châlons-en-Champagne' },
];

// Helper function to get emission factor by category
export function getEmissionFactor(category: CategoryType): number {
  const factor = ADEME_FACTORS.find(f => f.category === category);
  return factor ? factor.emissionFactor : 5; // default to 'other'
}

// Helper function to get category label in French
export function getCategoryLabel(category: CategoryType): string {
  const factor = ADEME_FACTORS.find(f => f.category === category);
  return factor ? factor.labelFr : 'Autre';
}

// Calculate carbon value for an item
export function calculateCarbonValue(category: CategoryType, quantity: number): number {
  const factor = getEmissionFactor(category);
  return factor * quantity;
}
