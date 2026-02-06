/**
 * Servicio para obtener y procesar datos del reporte anual
 *
 * NOTA: Las proyecciones futuras han sido eliminadas.
 * El reporte ahora solo muestra retrospectiva (lo que se hizo/decidio/aprendio).
 */

import { Transaction, Investment, AnnualReportData } from '../../types';
import {
  getAvailableYears,
  calculateYearSummary,
  calculateTreeGrowth,
  getSpecialMomentsData,
  calculateETFBreakdown,
  calculateAgeAtYear,
} from '../../utils/reportCalculations';
import { calculateTreeVisualization } from '../../utils/calculations';
import { generateReportNarrative, NarrativeOptions } from './narrativeGenerator';

/**
 * Opciones adicionales para generar el reporte
 */
export interface ReportOptions {
  /** Carta especial escrita por el usuario */
  specialLetter?: string;
  /** Contenido educativo cacheado de Gemini AI */
  cachedAiEducational?: string;
}

/**
 * Genera los datos completos del reporte anual
 * NOTA: Ya no incluye proyecciones futuras
 *
 * @param transactions - Todas las transacciones del usuario
 * @param childName - Nombre del niño
 * @param childBirthDate - Fecha de nacimiento del niño
 * @param year - Año del reporte
 * @param investments - Inversiones actuales (opcional, para valor actual preciso)
 * @param options - Opciones adicionales (carta especial, cache AI)
 */
export async function getAnnualReportData(
  transactions: Transaction[],
  childName: string,
  childBirthDate: Date,
  year: number,
  investments?: Investment[],
  options?: ReportOptions
): Promise<AnnualReportData> {
  // Calcular resumen financiero
  const summary = calculateYearSummary(transactions, year);

  // Calcular crecimiento del árbol
  const treeGrowth = calculateTreeGrowth(transactions, year);

  // Si es el año actual y tenemos inversiones, usar el totalInvested de las inversiones
  // como endValue para garantizar consistencia con el Dashboard
  const currentYear = new Date().getFullYear();
  if (year === currentYear && investments && investments.length > 0) {
    const totalFromInvestments = investments.reduce((sum, inv) => sum + inv.totalInvested, 0);
    // Solo actualizar si hay diferencia significativa (más del 1%)
    if (Math.abs(totalFromInvestments - summary.endValue) > summary.endValue * 0.01) {
      summary.endValue = totalFromInvestments;
      // Recalcular retorno con el valor correcto
      summary.totalReturn = summary.endValue - summary.startValue - summary.totalContributed;
      summary.returnPercentage = summary.startValue > 0
        ? (summary.totalReturn / summary.startValue) * 100
        : 0;

      // Recalcular etapa final del árbol con el valor correcto
      const buyCount = transactions.filter(t => t.type === 'buy').length;
      const endViz = calculateTreeVisualization(totalFromInvestments, buyCount, summary.totalReturn);
      treeGrowth.endStage = endViz.stage;
      treeGrowth.endProgress = endViz.progress;
      treeGrowth.leavesAtEnd = endViz.leaves;
      treeGrowth.fruitsAtEnd = endViz.fruits;
      treeGrowth.leavesGained = endViz.leaves - treeGrowth.leavesAtStart;
      treeGrowth.fruitsGained = Math.max(0, endViz.fruits - treeGrowth.fruitsAtStart);
    }
  }

  // Obtener momentos especiales
  const specialMoments = getSpecialMomentsData(transactions, year);

  // Calcular desglose por ETF
  const etfBreakdown = calculateETFBreakdown(transactions, year);

  // Calcular edad del niño en ese año
  const childAgeAtYear = calculateAgeAtYear(childBirthDate, year);

  // Preparar opciones de narrativa
  const narrativeOptions: NarrativeOptions = {
    specialLetter: options?.specialLetter,
    cachedAiEducational: options?.cachedAiEducational,
  };

  // Generar narrativas (sin proyecciones - solo retrospectiva)
  // Ahora es async porque puede llamar a Gemini AI
  const narrative = await generateReportNarrative(
    childName,
    childAgeAtYear,
    year,
    summary,
    treeGrowth,
    specialMoments,
    narrativeOptions
  );

  return {
    year,
    childName,
    childBirthDate,
    childAgeAtYear,
    summary,
    treeGrowth,
    specialMoments,
    etfBreakdown,
    projections: [], // Vacío - ya no usamos proyecciones
    narrative,
  };
}

/**
 * Obtiene los años disponibles para generar reportes
 */
export function getReportAvailableYears(transactions: Transaction[]): number[] {
  return getAvailableYears(transactions);
}

/**
 * Verifica si hay suficientes datos para generar un reporte
 */
export function hasEnoughDataForReport(
  transactions: Transaction[],
  year: number
): { hasData: boolean; message: string } {
  const yearTransactions = transactions.filter((t) => {
    const date = t.date instanceof Date ? t.date : new Date(t.date);
    return date.getFullYear() === year;
  });

  if (yearTransactions.length === 0) {
    return {
      hasData: false,
      message: `No hay transacciones registradas para el año ${year}. Agrega algunas inversiones para generar el reporte.`,
    };
  }

  return {
    hasData: true,
    message: `Se encontraron ${yearTransactions.length} transacciones para el año ${year}.`,
  };
}
