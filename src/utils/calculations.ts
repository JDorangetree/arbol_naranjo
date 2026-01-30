import { Investment, TreeStage, TreeVisualization } from '../types';
import { TREE_STAGES, DEFAULT_USD_TO_COP } from './constants';

// Calcular el valor total del portafolio en COP
export function calculateTotalValue(
  investments: Investment[],
  usdToCop: number = DEFAULT_USD_TO_COP
): number {
  return investments.reduce((total, inv) => {
    // Si la inversión está en USD, convertir a COP
    const value = inv.currentValue;
    // Por ahora asumimos que currentValue ya está en la moneda correcta
    // En una implementación real, verificaríamos la moneda del ETF
    return total + value;
  }, 0);
}

// Calcular el total invertido en COP
export function calculateTotalInvested(
  investments: Investment[],
  usdToCop: number = DEFAULT_USD_TO_COP
): number {
  return investments.reduce((total, inv) => {
    return total + inv.totalInvested;
  }, 0);
}

// Calcular retorno total
export function calculateTotalReturn(
  totalValue: number,
  totalInvested: number
): { absolute: number; percentage: number } {
  const absolute = totalValue - totalInvested;
  const percentage = totalInvested > 0 ? (absolute / totalInvested) * 100 : 0;

  return { absolute, percentage };
}

// Determinar la etapa del árbol según el valor
export function getTreeStage(totalValue: number): TreeStage {
  if (totalValue >= TREE_STAGES.mighty_oak.minValue) return 'mighty_oak';
  if (totalValue >= TREE_STAGES.mature_tree.minValue) return 'mature_tree';
  if (totalValue >= TREE_STAGES.young_tree.minValue) return 'young_tree';
  if (totalValue >= TREE_STAGES.sapling.minValue) return 'sapling';
  if (totalValue >= TREE_STAGES.sprout.minValue) return 'sprout';
  return 'seed';
}

// Calcular progreso dentro de la etapa actual
export function getStageProgress(totalValue: number): number {
  const stage = getTreeStage(totalValue);
  const stageConfig = TREE_STAGES[stage];

  if (stageConfig.maxValue === Infinity) {
    // Para la última etapa, calcular un progreso basado en múltiplos
    const excess = totalValue - stageConfig.minValue;
    const milestone = stageConfig.minValue; // Cada vez que se duplica
    return Math.min(100, (excess / milestone) * 100);
  }

  const range = stageConfig.maxValue - stageConfig.minValue;
  const progress = totalValue - stageConfig.minValue;

  return Math.min(100, Math.max(0, (progress / range) * 100));
}

// Obtener la siguiente meta (milestone)
export function getNextMilestone(totalValue: number): number {
  const stage = getTreeStage(totalValue);
  const stageConfig = TREE_STAGES[stage];

  if (stageConfig.maxValue === Infinity) {
    // Para la última etapa, el siguiente milestone es el doble
    return totalValue * 2;
  }

  return stageConfig.maxValue;
}

// Calcular la visualización completa del árbol
export function calculateTreeVisualization(
  totalValue: number,
  transactionCount: number,
  totalReturn: number
): TreeVisualization {
  const stage = getTreeStage(totalValue);
  const progress = getStageProgress(totalValue);
  const nextMilestone = getNextMilestone(totalValue);

  // Hojas basadas en cantidad de transacciones
  const leaves = Math.min(transactionCount * 3, 50);

  // Frutos basados en ganancias (solo si hay retorno positivo)
  const fruits = totalReturn > 0 ? Math.min(Math.floor(totalReturn / 100000), 20) : 0;

  return {
    stage,
    leaves,
    fruits,
    progress,
    nextMilestone,
  };
}

// Calcular score de diversificación (0-100)
export function calculateDiversificationScore(investments: Investment[]): number {
  if (investments.length === 0) return 0;
  if (investments.length === 1) return 20;

  const totalValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);

  // Calcular concentración usando el índice Herfindahl
  const concentrations = investments.map((inv) => {
    const weight = inv.currentValue / totalValue;
    return weight * weight;
  });

  const herfindahl = concentrations.reduce((sum, c) => sum + c, 0);

  // Convertir a score (HHI va de 1/n a 1, queremos 100 a 0)
  const minHerfindahl = 1 / investments.length;
  const maxHerfindahl = 1;

  const normalizedScore =
    1 - (herfindahl - minHerfindahl) / (maxHerfindahl - minHerfindahl);

  // Bonus por cantidad de inversiones diferentes
  const diversityBonus = Math.min(investments.length * 10, 30);

  return Math.min(100, Math.round(normalizedScore * 70 + diversityBonus));
}

// Proyectar valor futuro
export function projectFutureValue(
  currentValue: number,
  monthlyContribution: number,
  years: number,
  annualReturnRate: number = 0.08 // 8% por defecto
): number {
  const monthlyRate = annualReturnRate / 12;
  const months = years * 12;

  // Valor futuro del capital actual
  const futureCurrentValue = currentValue * Math.pow(1 + monthlyRate, months);

  // Valor futuro de las contribuciones mensuales (anualidad)
  const futureContributions =
    monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

  return futureCurrentValue + futureContributions;
}

// Generar proyecciones para diferentes edades
export function generateProjections(
  currentValue: number,
  monthlyContribution: number,
  childBirthDate: Date,
  targetAges: number[] = [6, 12, 18, 21, 25]
): Array<{ age: number; year: number; projectedValue: number }> {
  const today = new Date();
  const birthYear = childBirthDate.getFullYear();
  const currentAge =
    today.getFullYear() -
    birthYear -
    (today < new Date(today.getFullYear(), childBirthDate.getMonth(), childBirthDate.getDate())
      ? 1
      : 0);

  return targetAges
    .filter((age) => age > currentAge)
    .map((age) => {
      const yearsUntil = age - currentAge;
      const year = today.getFullYear() + yearsUntil;
      const projectedValue = projectFutureValue(
        currentValue,
        monthlyContribution,
        yearsUntil
      );

      return { age, year, projectedValue };
    });
}
