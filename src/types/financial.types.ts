/**
 * Tipos para la Capa Financiera (Datos Fríos/Objetivos)
 *
 * Esta capa contiene SOLO datos duros financieros, sin narrativa ni contexto emocional.
 * Son los datos que se exportan para auditoría o análisis.
 */

/**
 * Transacción financiera pura - sin campos narrativos
 */
export interface FinancialTransaction {
  id: string;
  userId: string;

  // Datos de la transacción
  date: Date;
  type: FinancialTransactionType;
  etfTicker: string;
  units: number;
  pricePerUnit: number;
  totalAmount: number;

  // Información monetaria
  currency: Currency;
  exchangeRate?: number;  // Tasa de cambio si la moneda es diferente a COP
  fees?: number;          // Comisiones

  // Metadatos del registro
  createdAt: Date;
  updatedAt: Date;

  // Referencia a metadatos (opcional, para vincular con capa 2)
  metadataId?: string;
}

export type FinancialTransactionType = 'buy' | 'sell' | 'dividend' | 'transfer' | 'split';

export type Currency = 'COP' | 'USD';

/**
 * Snapshot financiero - foto del estado en un momento dado
 * Útil para reportes y para evitar recalcular todo el historial
 */
export interface FinancialSnapshot {
  id: string;
  userId: string;

  // Fecha del snapshot
  date: Date;
  type: SnapshotType;

  // Totales
  totalValue: number;
  totalInvested: number;
  totalReturn: number;
  totalReturnPercentage: number;

  // Desglose por ETF
  holdings: FinancialHolding[];

  // Metadatos del registro
  createdAt: Date;
}

export type SnapshotType = 'monthly' | 'yearly' | 'manual';

export interface FinancialHolding {
  etfTicker: string;
  etfName: string;
  units: number;
  pricePerUnit: number;
  valueAtDate: number;
  costBasis: number;        // Lo que se pagó
  unrealizedGain: number;   // Ganancia no realizada
  percentageOfPortfolio: number;
}

/**
 * Referencia de ETF - datos del instrumento
 */
export interface ETFReference {
  ticker: string;
  name: string;
  description?: string;
  category: ETFCategory;
  currency: Currency;
  exchange?: string;

  // Para visualización
  plantType: PlantType;
  color?: string;
  icon?: string;

  // Precio actual (se actualiza manualmente)
  currentPrice: number;
  priceUpdatedAt: Date;
}

export type ETFCategory =
  | 'equity_co'      // Renta variable Colombia
  | 'equity_intl'    // Renta variable internacional
  | 'bonds'          // Bonos
  | 'mixed'          // Mixto
  | 'commodities'    // Materias primas
  | 'dividend';      // Enfoque en dividendos

export type PlantType =
  | 'oak'       // Renta variable - crece grande pero lento
  | 'bamboo'    // Crecimiento rápido
  | 'fruit'     // Dividendos
  | 'flower'    // Bonos - estable y bonito
  | 'cactus';   // Commodities - resistente

/**
 * Resumen del portafolio calculado
 */
export interface PortfolioCalculation {
  totalInvested: number;
  currentValue: number;
  totalReturn: number;
  totalReturnPercentage: number;

  holdings: {
    etfTicker: string;
    etfName: string;
    units: number;
    averageCost: number;
    currentPrice: number;
    currentValue: number;
    returnPercentage: number;
  }[];

  // Métricas
  transactionCount: number;
  firstTransactionDate: Date | null;
  lastTransactionDate: Date | null;
}

/**
 * Datos para exportación financiera
 */
export interface FinancialExportData {
  exportDate: Date;
  userId: string;

  transactions: FinancialTransaction[];
  snapshots: FinancialSnapshot[];
  etfs: ETFReference[];

  summary: PortfolioCalculation;
}
