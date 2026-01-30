/**
 * Exportador JSON
 *
 * Exporta todos los datos del usuario a formato JSON estructurado.
 * Este es el formato base que se usa para otros tipos de exportación.
 */

import {
  FullExportData,
  ExportOptions,
  ExportResult,
  ExportProgress,
  EXPORT_FORMAT_VERSION,
} from '../../types/app.types';
import { FinancialExportData } from '../../types/financial.types';
import { MetadataExportData } from '../../types/metadata.types';
import { EmotionalExportData } from '../../types/emotional.types';
import {
  getFinancialTransactions,
  getFinancialSnapshots,
  getETFReferences,
  calculatePortfolio,
} from '../firebase/financialService';
import {
  getAllTransactionMetadata,
  getAllPeriodMetadata,
} from '../firebase/metadataService';
import {
  getChapters,
  getAllYearlyNarratives,
} from '../firebase/emotionalService';

// ============================================
// TIPOS
// ============================================

export type ProgressCallback = (progress: ExportProgress) => void;

// ============================================
// EXPORTACIÓN PRINCIPAL
// ============================================

/**
 * Exporta todos los datos del usuario a JSON
 */
export async function exportToJSON(
  userId: string,
  childInfo: {
    name: string;
    birthDate: Date;
  },
  options: ExportOptions,
  onProgress?: ProgressCallback
): Promise<{
  data: FullExportData;
  result: ExportResult;
}> {
  const startTime = Date.now();
  const errors: string[] = [];
  const warnings: string[] = [];

  let financialData: FinancialExportData = {
    exportDate: new Date(),
    userId,
    transactions: [],
    snapshots: [],
    etfs: [],
    summary: {
      totalInvested: 0,
      currentValue: 0,
      totalReturn: 0,
      totalReturnPercentage: 0,
      holdings: [],
      transactionCount: 0,
      firstTransactionDate: null,
      lastTransactionDate: null,
    },
  };

  let metadataData: MetadataExportData = {
    exportDate: new Date(),
    userId,
    transactionMetadata: [],
    periodMetadata: [],
  };

  let emotionalData: EmotionalExportData = {
    exportDate: new Date(),
    userId,
    chapters: [],
    yearlyNarratives: [],
    includeLockedContent: options.includeLockedChapters,
  };

  // Exportar datos financieros
  if (options.includeFinancial) {
    onProgress?.({
      stage: 'exporting_financial',
      progress: 10,
      currentItem: 'transacciones financieras',
    });

    try {
      const [transactions, snapshots, etfs, portfolio] = await Promise.all([
        getFinancialTransactions(userId, {
          startDate: options.yearRange?.start
            ? new Date(options.yearRange.start, 0, 1)
            : undefined,
          endDate: options.yearRange?.end
            ? new Date(options.yearRange.end, 11, 31)
            : undefined,
        }),
        getFinancialSnapshots(userId),
        getETFReferences(userId),
        calculatePortfolio(userId),
      ]);

      financialData = {
        exportDate: new Date(),
        userId,
        transactions,
        snapshots,
        etfs,
        summary: portfolio,
      };
    } catch (error) {
      errors.push(`Error exportando datos financieros: ${error}`);
    }
  }

  // Exportar metadatos
  if (options.includeMetadata) {
    onProgress?.({
      stage: 'exporting_metadata',
      progress: 40,
      currentItem: 'metadatos de transacciones',
    });

    try {
      const [transactionMeta, periodMeta] = await Promise.all([
        getAllTransactionMetadata(userId),
        getAllPeriodMetadata(userId),
      ]);

      // Filtrar por rango de años si se especifica
      let filteredTransactionMeta = transactionMeta;
      let filteredPeriodMeta = periodMeta;

      if (options.yearRange) {
        // Filtrar periodo metadata por año
        filteredPeriodMeta = periodMeta.filter(
          (pm) =>
            pm.year >= options.yearRange!.start &&
            pm.year <= options.yearRange!.end
        );
      }

      // Limpiar historial de versiones si no se solicita
      if (!options.preserveVersionHistory) {
        filteredTransactionMeta = filteredTransactionMeta.map((tm) => ({
          ...tm,
          versions: [tm.versions[tm.versions.length - 1]], // Solo la última versión
        }));
        filteredPeriodMeta = filteredPeriodMeta.map((pm) => ({
          ...pm,
          versions: [pm.versions[pm.versions.length - 1]],
        }));
      }

      metadataData = {
        exportDate: new Date(),
        userId,
        transactionMetadata: filteredTransactionMeta,
        periodMetadata: filteredPeriodMeta,
      };
    } catch (error) {
      errors.push(`Error exportando metadatos: ${error}`);
    }
  }

  // Exportar contenido emocional
  if (options.includeEmotional) {
    onProgress?.({
      stage: 'exporting_emotional',
      progress: 70,
      currentItem: 'capitulos y narrativas',
    });

    try {
      const [chapters, narratives] = await Promise.all([
        getChapters(userId, {
          includeContent: true,
          childBirthDate: childInfo.birthDate,
        }),
        getAllYearlyNarratives(userId),
      ]);

      // Filtrar capítulos bloqueados si no se solicitan
      let filteredChapters = chapters;
      if (!options.includeLockedChapters) {
        filteredChapters = chapters.filter((ch) => !ch.isLocked);
        if (chapters.length !== filteredChapters.length) {
          warnings.push(
            `${chapters.length - filteredChapters.length} capitulos bloqueados no fueron incluidos`
          );
        }
      }

      // Filtrar por rango de años
      let filteredNarratives = narratives;
      if (options.yearRange) {
        filteredNarratives = narratives.filter(
          (n) =>
            n.year >= options.yearRange!.start &&
            n.year <= options.yearRange!.end
        );
        filteredChapters = filteredChapters.filter((ch) => {
          if (!ch.linkedYears || ch.linkedYears.length === 0) return true;
          return ch.linkedYears.some(
            (y) =>
              y >= options.yearRange!.start && y <= options.yearRange!.end
          );
        });
      }

      // Limpiar historial de versiones si no se solicita
      if (!options.preserveVersionHistory) {
        filteredChapters = filteredChapters.map((ch) => ({
          ...ch,
          versions: [ch.versions[ch.versions.length - 1]],
        }));
        filteredNarratives = filteredNarratives.map((n) => ({
          ...n,
          versions: [n.versions[n.versions.length - 1]],
        }));
      }

      emotionalData = {
        exportDate: new Date(),
        userId,
        chapters: filteredChapters,
        yearlyNarratives: filteredNarratives,
        includeLockedContent: options.includeLockedChapters,
      };
    } catch (error) {
      errors.push(`Error exportando contenido emocional: ${error}`);
    }
  }

  onProgress?.({
    stage: 'finalizing',
    progress: 90,
    currentItem: 'finalizando exportacion',
  });

  // Calcular edad actual del niño
  const childAge = calculateAge(childInfo.birthDate);

  // Generar checksums simples
  const checksums = {
    financial: generateChecksum(JSON.stringify(financialData)),
    metadata: generateChecksum(JSON.stringify(metadataData)),
    emotional: generateChecksum(JSON.stringify(emotionalData)),
  };

  // Armar datos completos
  const fullData: FullExportData = {
    exportDate: new Date(),
    exportVersion: EXPORT_FORMAT_VERSION,
    appVersion: '1.0.0', // TODO: Obtener de package.json
    childInfo: {
      name: childInfo.name,
      birthDate: childInfo.birthDate,
      ageAtExport: childAge,
    },
    financial: financialData,
    metadata: metadataData,
    emotional: emotionalData,
    checksums,
  };

  // Generar resultado
  const jsonString = JSON.stringify(fullData, dateReplacer, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });

  const result: ExportResult = {
    success: errors.length === 0,
    format: 'json',
    filename: generateFilename(childInfo.name, 'json'),
    size: blob.size,
    itemCount: {
      transactions: financialData.transactions.length,
      snapshots: financialData.snapshots.length,
      chapters: emotionalData.chapters.length,
      narratives: emotionalData.yearlyNarratives.length,
      mediaFiles: countMediaFiles(emotionalData),
    },
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
  };

  onProgress?.({
    stage: 'complete',
    progress: 100,
  });

  return { data: fullData, result };
}

/**
 * Descarga los datos como archivo JSON
 */
export function downloadJSON(
  data: FullExportData,
  filename?: string
): void {
  const jsonString = JSON.stringify(data, dateReplacer, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename || generateFilename(data.childInfo.name, 'json');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Importa datos desde JSON (para restaurar backup)
 */
export function parseExportJSON(jsonString: string): {
  data: FullExportData | null;
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  try {
    const parsed = JSON.parse(jsonString, dateReviver);

    // Validar estructura básica
    if (!parsed.exportVersion) {
      errors.push('Falta version de exportacion');
    }
    if (!parsed.childInfo) {
      errors.push('Falta informacion del nino');
    }
    if (!parsed.financial && !parsed.metadata && !parsed.emotional) {
      errors.push('No hay datos para importar');
    }

    // Verificar checksums
    if (parsed.checksums) {
      const financialCheck = generateChecksum(JSON.stringify(parsed.financial));
      const metadataCheck = generateChecksum(JSON.stringify(parsed.metadata));
      const emotionalCheck = generateChecksum(JSON.stringify(parsed.emotional));

      if (financialCheck !== parsed.checksums.financial) {
        errors.push('Checksum de datos financieros no coincide (posible corrupcion)');
      }
      if (metadataCheck !== parsed.checksums.metadata) {
        errors.push('Checksum de metadatos no coincide (posible corrupcion)');
      }
      if (emotionalCheck !== parsed.checksums.emotional) {
        errors.push('Checksum de datos emocionales no coincide (posible corrupcion)');
      }
    }

    return {
      data: errors.length === 0 ? parsed : null,
      isValid: errors.length === 0,
      errors,
    };
  } catch (error) {
    return {
      data: null,
      isValid: false,
      errors: [`Error parseando JSON: ${error}`],
    };
  }
}

// ============================================
// UTILIDADES
// ============================================

function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return Math.max(0, age);
}

function generateFilename(childName: string, extension: string): string {
  const safeName = childName.replace(/[^a-zA-Z0-9]/g, '_');
  const date = new Date().toISOString().split('T')[0];
  return `El_Tesoro_de_${safeName}_${date}.${extension}`;
}

function generateChecksum(str: string): string {
  // Checksum simple basado en hash
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

function countMediaFiles(emotionalData: EmotionalExportData): number {
  let count = 0;

  for (const chapter of emotionalData.chapters) {
    count += chapter.mediaUrls?.length || 0;
  }

  for (const narrative of emotionalData.yearlyNarratives) {
    count += narrative.yearPhotos?.length || 0;
  }

  return count;
}

// Replacer para serializar fechas
function dateReplacer(key: string, value: any): any {
  if (value instanceof Date) {
    return { __type: 'Date', value: value.toISOString() };
  }
  return value;
}

// Reviver para deserializar fechas
function dateReviver(key: string, value: any): any {
  if (value && typeof value === 'object' && value.__type === 'Date') {
    return new Date(value.value);
  }
  return value;
}
