/**
 * Cálculos específicos para el sistema de reportes anuales
 */

import {
  Transaction,
  Investment,
  TreeStage,
  YearSummary,
  TreeGrowthData,
  SpecialMomentsData,
  ETFYearSummary,
  Projection,
} from '../types';
import {
  getTreeStage,
  getStageProgress,
  calculateTreeVisualization,
  projectFutureValue,
} from './calculations';
import { AVAILABLE_ETFS, TREE_STAGES } from './constants';

/**
 * Filtra transacciones por año
 */
export function filterTransactionsByYear(
  transactions: Transaction[],
  year: number
): Transaction[] {
  return transactions.filter((t) => {
    const transactionDate = t.date instanceof Date ? t.date : new Date(t.date);
    return transactionDate.getFullYear() === year;
  });
}

/**
 * Filtra transacciones antes de una fecha (para calcular valor al inicio del año)
 */
export function filterTransactionsBeforeDate(
  transactions: Transaction[],
  date: Date
): Transaction[] {
  return transactions.filter((t) => {
    const transactionDate = t.date instanceof Date ? t.date : new Date(t.date);
    return transactionDate < date;
  });
}

/**
 * Obtiene los años disponibles en las transacciones
 */
export function getAvailableYears(transactions: Transaction[]): number[] {
  const years = new Set<number>();

  transactions.forEach((t) => {
    const transactionDate = t.date instanceof Date ? t.date : new Date(t.date);
    years.add(transactionDate.getFullYear());
  });

  return Array.from(years).sort((a, b) => b - a); // Orden descendente
}

/**
 * Calcula el valor total de transacciones (solo compras)
 */
export function calculateTransactionsTotal(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'buy')
    .reduce((sum, t) => sum + t.totalAmount, 0);
}

/**
 * Calcula el resumen financiero del año
 */
export function calculateYearSummary(
  allTransactions: Transaction[],
  year: number
): YearSummary {
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31, 23, 59, 59);

  // Transacciones antes del año (para valor inicial)
  const transactionsBeforeYear = filterTransactionsBeforeDate(allTransactions, startOfYear);
  const startValue = calculateTransactionsTotal(transactionsBeforeYear);

  // Transacciones del año
  const yearTransactions = filterTransactionsByYear(allTransactions, year);
  const buyTransactions = yearTransactions.filter((t) => t.type === 'buy');

  const totalContributed = buyTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
  const contributionCount = buyTransactions.length;

  // Valor al final del año
  const transactionsUntilEndOfYear = allTransactions.filter((t) => {
    const transactionDate = t.date instanceof Date ? t.date : new Date(t.date);
    return transactionDate <= endOfYear;
  });
  const endValue = calculateTransactionsTotal(transactionsUntilEndOfYear);

  // Retorno del año
  const totalReturn = endValue - startValue - totalContributed;
  const returnPercentage = startValue > 0 ? (totalReturn / startValue) * 100 : 0;

  // Contribución más grande
  let largestContribution = 0;
  let largestContributionDate: Date | null = null;

  buyTransactions.forEach((t) => {
    if (t.totalAmount > largestContribution) {
      largestContribution = t.totalAmount;
      largestContributionDate = t.date instanceof Date ? t.date : new Date(t.date);
    }
  });

  const averageContribution = contributionCount > 0 ? totalContributed / contributionCount : 0;

  return {
    startValue,
    endValue,
    totalContributed,
    totalReturn,
    returnPercentage,
    contributionCount,
    averageContribution,
    largestContribution,
    largestContributionDate,
  };
}

/**
 * Calcula los datos de crecimiento del árbol durante el año
 */
export function calculateTreeGrowth(
  allTransactions: Transaction[],
  year: number
): TreeGrowthData {
  const startOfYear = new Date(year, 0, 1);

  // Calcular valor y transacciones al inicio del año
  const transactionsBeforeYear = filterTransactionsBeforeDate(allTransactions, startOfYear);
  const startValue = calculateTransactionsTotal(transactionsBeforeYear);
  const startTransactionCount = transactionsBeforeYear.filter((t) => t.type === 'buy').length;

  // Calcular valor y transacciones al final del año
  const endOfYear = new Date(year, 11, 31, 23, 59, 59);
  const transactionsUntilEnd = allTransactions.filter((t) => {
    const transactionDate = t.date instanceof Date ? t.date : new Date(t.date);
    return transactionDate <= endOfYear;
  });
  const endValue = calculateTransactionsTotal(transactionsUntilEnd);
  const endTransactionCount = transactionsUntilEnd.filter((t) => t.type === 'buy').length;

  // Calcular visualización al inicio y final
  const startReturn = 0; // Simplificado - en realidad necesitaríamos precios históricos
  const endReturn = endValue - calculateTransactionsTotal(transactionsUntilEnd.filter(t => t.type === 'buy'));

  const startViz = calculateTreeVisualization(startValue, startTransactionCount, startReturn);
  const endViz = calculateTreeVisualization(endValue, endTransactionCount, endReturn);

  // Calcular etapas avanzadas
  const stageOrder: TreeStage[] = ['seed', 'sprout', 'sapling', 'young_tree', 'mature_tree', 'mighty_oak'];
  const startStageIndex = stageOrder.indexOf(startViz.stage);
  const endStageIndex = stageOrder.indexOf(endViz.stage);
  const stagesAdvanced = Math.max(0, endStageIndex - startStageIndex);

  return {
    startStage: startViz.stage,
    endStage: endViz.stage,
    startProgress: startViz.progress,
    endProgress: endViz.progress,
    stagesAdvanced,
    leavesAtStart: startViz.leaves,
    leavesAtEnd: endViz.leaves,
    leavesGained: endViz.leaves - startViz.leaves,
    fruitsAtStart: startViz.fruits,
    fruitsAtEnd: endViz.fruits,
    fruitsGained: Math.max(0, endViz.fruits - startViz.fruits),
  };
}

/**
 * Obtiene los datos de momentos especiales del año
 */
export function getSpecialMomentsData(
  transactions: Transaction[],
  year: number
): SpecialMomentsData {
  const yearTransactions = filterTransactionsByYear(transactions, year);
  const moments = yearTransactions.filter((t) => t.milestone);

  // Agrupar por tipo de milestone
  const byType: Record<string, Transaction[]> = {};
  moments.forEach((m) => {
    if (m.milestone) {
      if (!byType[m.milestone]) {
        byType[m.milestone] = [];
      }
      byType[m.milestone].push(m);
    }
  });

  // Encontrar el más significativo (mayor monto)
  let mostSignificant: Transaction | null = null;
  moments.forEach((m) => {
    if (!mostSignificant || m.totalAmount > mostSignificant.totalAmount) {
      mostSignificant = m;
    }
  });

  const totalInMoments = moments.reduce((sum, m) => sum + m.totalAmount, 0);

  return {
    moments,
    totalInMoments,
    momentCount: moments.length,
    mostSignificant,
    byType,
  };
}

/**
 * Calcula el desglose por ETF del año
 */
export function calculateETFBreakdown(
  allTransactions: Transaction[],
  year: number
): ETFYearSummary[] {
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31, 23, 59, 59);

  // Obtener todos los ETFs únicos
  const etfIds = new Set<string>();
  allTransactions.forEach((t) => etfIds.add(t.etfId));

  const breakdowns: ETFYearSummary[] = [];
  let totalEndValue = 0;

  etfIds.forEach((etfId) => {
    const etfTransactions = allTransactions.filter((t) => t.etfId === etfId);

    // Transacciones antes del año
    const beforeYear = etfTransactions.filter((t) => {
      const date = t.date instanceof Date ? t.date : new Date(t.date);
      return date < startOfYear;
    });

    // Transacciones del año
    const duringYear = etfTransactions.filter((t) => {
      const date = t.date instanceof Date ? t.date : new Date(t.date);
      return date >= startOfYear && date <= endOfYear;
    });

    // Transacciones hasta fin de año
    const untilEnd = etfTransactions.filter((t) => {
      const date = t.date instanceof Date ? t.date : new Date(t.date);
      return date <= endOfYear;
    });

    // Calcular unidades
    const calculateUnits = (txs: Transaction[]) =>
      txs.reduce((sum, t) => {
        if (t.type === 'buy') return sum + t.units;
        if (t.type === 'sell') return sum - t.units;
        return sum;
      }, 0);

    const startUnits = calculateUnits(beforeYear);
    const endUnits = calculateUnits(untilEnd);
    const unitsAdded = endUnits - startUnits;

    // Calcular valores (simplificado - usando precio promedio de compras)
    const calculateValue = (txs: Transaction[]) =>
      txs.filter((t) => t.type === 'buy').reduce((sum, t) => sum + t.totalAmount, 0);

    const startValue = calculateValue(beforeYear);
    const endValue = calculateValue(untilEnd);
    const totalContributed = calculateValue(duringYear);

    totalEndValue += endValue;

    // Obtener info del ETF
    const etfInfo = AVAILABLE_ETFS.find((e) => e.id === etfId);
    const firstTransaction = etfTransactions[0];

    breakdowns.push({
      etfId,
      etfName: etfInfo?.name || firstTransaction?.etfName || etfId,
      etfTicker: etfInfo?.ticker || firstTransaction?.etfTicker || etfId.toUpperCase(),
      etfIcon: etfInfo?.icon || '📊',
      etfColor: etfInfo?.color || '#6B7280',
      startUnits,
      endUnits,
      unitsAdded,
      startValue,
      endValue,
      totalContributed,
      percentageOfPortfolio: 0, // Se calcula después
      transactionCount: duringYear.length,
    });
  });

  // Calcular porcentajes
  breakdowns.forEach((b) => {
    b.percentageOfPortfolio = totalEndValue > 0 ? (b.endValue / totalEndValue) * 100 : 0;
  });

  // Ordenar por valor descendente
  return breakdowns.sort((a, b) => b.endValue - a.endValue);
}

/**
 * Genera proyecciones para el reporte
 */
export function generateReportProjections(
  currentValue: number,
  monthlyContribution: number,
  childBirthDate: Date,
  year: number
): Projection[] {
  const targetAges = [6, 12, 18, 21, 25];
  const birthYear = childBirthDate.getFullYear();
  const currentAge = year - birthYear;

  const projections: Projection[] = [];

  targetAges.forEach((age) => {
    if (age > currentAge) {
      const yearsUntil = age - currentAge;
      const projectedYear = year + yearsUntil;
      const projectedValue = projectFutureValue(currentValue, monthlyContribution, yearsUntil);

      let label = '';
      switch (age) {
        case 6:
          label = 'Cuando entre al colegio grande';
          break;
        case 12:
          label = 'Cuando sea preadolescente';
          break;
        case 18:
          label = 'Cuando sea mayor de edad';
          break;
        case 21:
          label = 'Cuando termine la universidad';
          break;
        case 25:
          label = 'Cuando sea un adulto joven';
          break;
        default:
          label = `A los ${age} años`;
      }

      projections.push({
        age,
        year: projectedYear,
        projectedValue,
        label,
      });
    }
  });

  return projections;
}

/**
 * Calcula la edad del niño en un año específico
 */
export function calculateAgeAtYear(birthDate: Date, year: number): number {
  const birthYear = birthDate.getFullYear();
  return year - birthYear;
}

/**
 * Obtiene el nombre descriptivo de una etapa del árbol
 */
export function getTreeStageName(stage: TreeStage): string {
  const names: Record<TreeStage, string> = {
    seed: 'Semillita',
    sprout: 'Brotecito',
    sapling: 'Arbolito',
    young_tree: 'Árbol Joven',
    mature_tree: 'Árbol Maduro',
    mighty_oak: 'Roble Majestuoso',
  };
  return names[stage];
}

/**
 * Obtiene el emoji de una etapa del árbol
 */
export function getTreeStageEmoji(stage: TreeStage): string {
  const emojis: Record<TreeStage, string> = {
    seed: '🌱',
    sprout: '🌿',
    sapling: '🌳',
    young_tree: '🌲',
    mature_tree: '🌴',
    mighty_oak: '🏔️',
  };
  return emojis[stage];
}
