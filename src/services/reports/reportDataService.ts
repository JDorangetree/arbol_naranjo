/**
 * Servicio para obtener y procesar datos del reporte anual
 *
 * NOTA: Las proyecciones futuras han sido eliminadas.
 * El reporte ahora solo muestra retrospectiva (lo que se hizo/decidio/aprendio).
 */

import { Transaction, AnnualReportData } from '../../types';
import {
  getAvailableYears,
  calculateYearSummary,
  calculateTreeGrowth,
  getSpecialMomentsData,
  calculateETFBreakdown,
  calculateAgeAtYear,
} from '../../utils/reportCalculations';
import { generateReportNarrative } from './narrativeGenerator';

/**
 * Genera los datos completos del reporte anual
 * NOTA: Ya no incluye proyecciones futuras
 */
export async function getAnnualReportData(
  transactions: Transaction[],
  childName: string,
  childBirthDate: Date,
  year: number
): Promise<AnnualReportData> {
  // Calcular resumen financiero
  const summary = calculateYearSummary(transactions, year);

  // Calcular crecimiento del árbol
  const treeGrowth = calculateTreeGrowth(transactions, year);

  // Obtener momentos especiales
  const specialMoments = getSpecialMomentsData(transactions, year);

  // Calcular desglose por ETF
  const etfBreakdown = calculateETFBreakdown(transactions, year);

  // Calcular edad del niño en ese año
  const childAgeAtYear = calculateAgeAtYear(childBirthDate, year);

  // Generar narrativas (sin proyecciones - solo retrospectiva)
  const narrative = generateReportNarrative(
    childName,
    childAgeAtYear,
    year,
    summary,
    treeGrowth,
    specialMoments
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
