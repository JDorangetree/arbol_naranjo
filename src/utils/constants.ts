import { ETF, TreeStage } from '../types';

// Tasa de cambio USD/COP (actualizar manualmente según el mercado)
export const USD_TO_COP = 4200;

// ETFs disponibles - todos los precios en COP
export const AVAILABLE_ETFS: ETF[] = [
  {
    id: 'icolcap',
    ticker: 'ICOLCAP',
    name: 'iShares COLCAP',
    description: 'ETF que replica el índice COLCAP de la Bolsa de Colombia',
    category: 'colombian_equity',
    currency: 'COP',
    exchange: 'BVC',
    currentPrice: 12500, // Precio en COP
    priceUpdatedAt: new Date(),
    icon: '🇨🇴',
    color: '#FCD116',
    plantType: 'oak',
  },
  {
    id: 'ivv',
    ticker: 'IVV',
    name: 'iShares Core S&P 500',
    description: 'ETF que replica el índice S&P 500 de Estados Unidos',
    category: 'international_equity',
    currency: 'COP',
    exchange: 'NYSE',
    currentPrice: 2268000, // ~$540 USD x 4200
    priceUpdatedAt: new Date(),
    icon: '🇺🇸',
    color: '#3C3B6E',
    plantType: 'bamboo',
  },
  {
    id: 'vti',
    ticker: 'VTI',
    name: 'Vanguard Total Stock Market',
    description: 'ETF del mercado total de acciones de EE.UU.',
    category: 'international_equity',
    currency: 'COP',
    exchange: 'NYSE',
    currentPrice: 1176000, // ~$280 USD x 4200
    priceUpdatedAt: new Date(),
    icon: '📈',
    color: '#8B0000',
    plantType: 'bamboo',
  },
  {
    id: 'vxus',
    ticker: 'VXUS',
    name: 'Vanguard Total International Stock',
    description: 'ETF de acciones internacionales (ex-US)',
    category: 'international_equity',
    currency: 'COP',
    exchange: 'NYSE',
    currentPrice: 260400, // ~$62 USD x 4200
    priceUpdatedAt: new Date(),
    icon: '🌍',
    color: '#228B22',
    plantType: 'bamboo',
  },
  {
    id: 'bnd',
    ticker: 'BND',
    name: 'Vanguard Total Bond Market',
    description: 'ETF de bonos diversificados',
    category: 'bonds',
    currency: 'COP',
    exchange: 'NYSE',
    currentPrice: 302400, // ~$72 USD x 4200
    priceUpdatedAt: new Date(),
    icon: '🛡️',
    color: '#4169E1',
    plantType: 'flower',
  },
  {
    id: 'vym',
    ticker: 'VYM',
    name: 'Vanguard High Dividend Yield',
    description: 'ETF de empresas con altos dividendos',
    category: 'dividend',
    currency: 'COP',
    exchange: 'NYSE',
    currentPrice: 525000, // ~$125 USD x 4200
    priceUpdatedAt: new Date(),
    icon: '💰',
    color: '#DAA520',
    plantType: 'fruit',
  },
];

// Configuración de las etapas del árbol
export const TREE_STAGES: Record<
  TreeStage,
  { minValue: number; maxValue: number; label: string; description: string }
> = {
  seed: {
    minValue: 0,
    maxValue: 100000,
    label: 'Semilla',
    description: 'Tu árbol está apenas comenzando a germinar',
  },
  sprout: {
    minValue: 100000,
    maxValue: 500000,
    label: 'Brote',
    description: 'Las primeras hojas están apareciendo',
  },
  sapling: {
    minValue: 500000,
    maxValue: 2000000,
    label: 'Arbolito',
    description: 'Tu árbol está creciendo fuerte',
  },
  young_tree: {
    minValue: 2000000,
    maxValue: 10000000,
    label: 'Árbol Joven',
    description: 'Ya se pueden ver los primeros frutos',
  },
  mature_tree: {
    minValue: 10000000,
    maxValue: 50000000,
    label: 'Árbol Maduro',
    description: 'Un árbol sólido que da sombra',
  },
  mighty_oak: {
    minValue: 50000000,
    maxValue: Infinity,
    label: 'Roble Majestuoso',
    description: '¡Un tesoro que durará generaciones!',
  },
};

// Tipos de milestone con sus labels, iconos y colores
export const MILESTONE_CONFIG: Record<string, { label: string; icon: string; color: string; description: string }> = {
  first_investment: {
    label: '¡Primera inversión!',
    icon: '🌱',
    color: '#22C55E',
    description: 'El comienzo de un gran tesoro',
  },
  birthday: {
    label: 'Cumpleaños',
    icon: '🎂',
    color: '#EC4899',
    description: 'Regalo de cumpleaños especial',
  },
  christmas: {
    label: 'Navidad',
    icon: '🎄',
    color: '#EF4444',
    description: 'Regalo navideño para el futuro',
  },
  new_year: {
    label: 'Año Nuevo',
    icon: '🎆',
    color: '#F59E0B',
    description: 'Comenzando el año con inversiones',
  },
  first_steps: {
    label: 'Primeros pasos',
    icon: '👣',
    color: '#8B5CF6',
    description: 'Celebrando los primeros pasos',
  },
  first_words: {
    label: 'Primeras palabras',
    icon: '💬',
    color: '#06B6D4',
    description: 'Cuando dijo sus primeras palabras',
  },
  first_day_school: {
    label: 'Primer día de clases',
    icon: '🎒',
    color: '#3B82F6',
    description: 'El comienzo de su educación',
  },
  achievement: {
    label: 'Logro especial',
    icon: '🏆',
    color: '#F59E0B',
    description: 'Un logro digno de celebrar',
  },
  family_trip: {
    label: 'Viaje familiar',
    icon: '✈️',
    color: '#0EA5E9',
    description: 'Recuerdo de un viaje especial',
  },
  monthly: {
    label: 'Ahorro mensual',
    icon: '📅',
    color: '#6B7280',
    description: 'Contribución mensual constante',
  },
  special_moment: {
    label: 'Momento especial',
    icon: '✨',
    color: '#A855F7',
    description: 'Un momento para recordar',
  },
  grandparents_gift: {
    label: 'Regalo de abuelos',
    icon: '👴',
    color: '#F97316',
    description: 'Contribución de los abuelos',
  },
  tooth_fairy: {
    label: 'Ratón Pérez',
    icon: '🦷',
    color: '#E879F9',
    description: 'El ratoncito dejó una inversión',
  },
  good_grades: {
    label: 'Buenas notas',
    icon: '📚',
    color: '#10B981',
    description: 'Premiando el buen desempeño escolar',
  },
};

// Labels simples para compatibilidad
export const MILESTONE_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(MILESTONE_CONFIG).map(([key, value]) => [key, value.label])
);

// Categorías de ETF con sus labels
export const ETF_CATEGORY_LABELS: Record<string, string> = {
  colombian_equity: 'Acciones Colombia',
  international_equity: 'Acciones Internacionales',
  bonds: 'Bonos',
  mixed: 'Mixto',
  commodities: 'Commodities',
  dividend: 'Dividendos',
};

// Tasa de cambio por defecto (exportada también como DEFAULT para compatibilidad)
export const DEFAULT_USD_TO_COP = USD_TO_COP;
