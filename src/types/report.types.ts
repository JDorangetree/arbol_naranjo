/**
 * Tipos para el sistema de reportes anuales con storytelling
 */

import { Transaction, TreeStage, Investment } from './investment.types';

/**
 * Datos principales del reporte anual
 */
export interface AnnualReportData {
  year: number;

  // Datos del niño
  childName: string;
  childBirthDate: Date;
  childAgeAtYear: number;

  // Resumen financiero del año
  summary: YearSummary;

  // Evolución del árbol
  treeGrowth: TreeGrowthData;

  // Momentos especiales del año
  specialMoments: SpecialMomentsData;

  // Desglose por instrumento
  etfBreakdown: ETFYearSummary[];

  // Proyecciones futuras
  projections: Projection[];

  // Narrativa generada (storytelling)
  narrative: ReportNarrative;
}

/**
 * Resumen financiero del año
 */
export interface YearSummary {
  startValue: number;
  endValue: number;
  totalContributed: number;
  totalReturn: number;
  returnPercentage: number;
  contributionCount: number;
  averageContribution: number;
  largestContribution: number;
  largestContributionDate: Date | null;
}

/**
 * Datos de crecimiento del árbol durante el año
 */
export interface TreeGrowthData {
  startStage: TreeStage;
  endStage: TreeStage;
  startProgress: number; // 0-100
  endProgress: number;   // 0-100
  stagesAdvanced: number;
  leavesAtStart: number;
  leavesAtEnd: number;
  leavesGained: number;
  fruitsAtStart: number;
  fruitsAtEnd: number;
  fruitsGained: number;
}

/**
 * Datos de momentos especiales del año
 */
export interface SpecialMomentsData {
  moments: Transaction[];
  totalInMoments: number;
  momentCount: number;
  mostSignificant: Transaction | null;
  byType: Record<string, Transaction[]>;
}

/**
 * Resumen de un ETF durante el año
 */
export interface ETFYearSummary {
  etfId: string;
  etfName: string;
  etfTicker: string;
  etfIcon: string;
  etfColor: string;

  // Unidades
  startUnits: number;
  endUnits: number;
  unitsAdded: number;

  // Valores
  startValue: number;
  endValue: number;
  totalContributed: number;

  // Distribución
  percentageOfPortfolio: number;

  // Transacciones del año
  transactionCount: number;
}

/**
 * Proyección de valor futuro
 */
export interface Projection {
  age: number;
  year: number;
  projectedValue: number;
  label: string; // "Cuando tenga 18 años"
}

/**
 * Narrativa del storytelling
 */
export interface ReportNarrative {
  // Carta de introducción
  introduction: string;

  // Descripción del crecimiento
  growth: string;

  // Descripción de los momentos especiales
  moments: string;

  // Mensaje sobre el futuro
  future: string;

  // Sección educativa
  educational: string;
}

/**
 * Configuración de etapa del árbol para narrativa
 */
export interface TreeStageInfo {
  stage: TreeStage;
  name: string;
  description: string;
  emoji: string;
  minValue: number;
  maxValue: number;
}

/**
 * Metáfora educativa para el storytelling
 */
export interface EducationalMetaphor {
  concept: string;        // "Interés compuesto"
  metaphor: string;       // "La magia del sol"
  explanation: string;    // Explicación adaptada a la edad
  emoji: string;
}

/**
 * Configuración de generación de reporte
 */
export interface ReportConfig {
  includePhotos: boolean;
  language: 'es' | 'en';
  style: 'colorful' | 'minimal' | 'mixed';
  ageAdaptation: 'toddler' | 'child' | 'preteen' | 'teen';
}

/**
 * Estado del hook de reporte
 */
export interface UseAnnualReportState {
  availableYears: number[];
  selectedYear: number;
  reportData: AnnualReportData | null;
  isLoading: boolean;
  isGeneratingPdf: boolean;
  error: string | null;
}

/**
 * Acciones del hook de reporte
 */
export interface UseAnnualReportActions {
  setSelectedYear: (year: number) => void;
  generateReport: () => Promise<void>;
  downloadPDF: () => Promise<void>;
  clearError: () => void;
}

/**
 * Tipo completo del hook
 */
export type UseAnnualReportReturn = UseAnnualReportState & UseAnnualReportActions;
