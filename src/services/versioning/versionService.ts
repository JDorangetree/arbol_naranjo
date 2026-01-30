/**
 * Servicio de Versionado
 *
 * Utilidades genéricas para gestionar el versionado de contenido.
 * Proporciona funciones helper para crear, comparar y restaurar versiones.
 */

import { VersionInfo, Versionable } from '../../types/app.types';

// ============================================
// TIPOS
// ============================================

export interface VersionDiff<T> {
  field: keyof T;
  oldValue: any;
  newValue: any;
}

export interface VersionComparison<T> {
  version1: number;
  version2: number;
  differences: VersionDiff<T>[];
  hasChanges: boolean;
}

// ============================================
// FUNCIONES DE VERSIONADO
// ============================================

/**
 * Crea una nueva versión a partir de datos actuales
 */
export function createVersion<T extends VersionInfo>(
  currentVersion: number,
  data: Omit<T, 'version' | 'date'>,
  editNote?: string
): T {
  return {
    ...data,
    version: currentVersion + 1,
    date: new Date(),
    editNote,
  } as T;
}

/**
 * Obtiene la versión más reciente de un array de versiones
 */
export function getLatestVersion<T extends VersionInfo>(versions: T[]): T | null {
  if (versions.length === 0) return null;
  return versions.reduce((latest, current) =>
    current.version > latest.version ? current : latest
  );
}

/**
 * Obtiene una versión específica por número
 */
export function getVersionByNumber<T extends VersionInfo>(
  versions: T[],
  versionNumber: number
): T | null {
  return versions.find(v => v.version === versionNumber) || null;
}

/**
 * Compara dos versiones y devuelve las diferencias
 */
export function compareVersions<T extends Record<string, any>>(
  version1: T,
  version2: T,
  fieldsToCompare: (keyof T)[]
): VersionComparison<T> {
  const differences: VersionDiff<T>[] = [];

  for (const field of fieldsToCompare) {
    const val1 = version1[field];
    const val2 = version2[field];

    if (!isEqual(val1, val2)) {
      differences.push({
        field,
        oldValue: val1,
        newValue: val2,
      });
    }
  }

  return {
    version1: (version1 as any).version || 0,
    version2: (version2 as any).version || 0,
    differences,
    hasChanges: differences.length > 0,
  };
}

/**
 * Determina si se debe crear una nueva versión basándose en cambios
 */
export function shouldCreateVersion<T extends Record<string, any>>(
  currentData: T,
  newData: Partial<T>,
  versionedFields: (keyof T)[]
): boolean {
  for (const field of versionedFields) {
    if (field in newData && !isEqual(currentData[field], newData[field])) {
      return true;
    }
  }
  return false;
}

/**
 * Limita el número de versiones manteniendo las más recientes
 */
export function pruneVersions<T extends VersionInfo>(
  versions: T[],
  maxVersions: number
): T[] {
  if (versions.length <= maxVersions) {
    return versions;
  }

  // Ordenar por versión descendente y mantener las más recientes
  return [...versions]
    .sort((a, b) => b.version - a.version)
    .slice(0, maxVersions);
}

/**
 * Calcula el resumen de cambios entre versiones
 */
export function getVersionChangeSummary<T extends VersionInfo>(
  versions: T[]
): {
  totalVersions: number;
  firstVersion: Date | null;
  lastVersion: Date | null;
  averageTimeBetweenVersions: number | null;
} {
  if (versions.length === 0) {
    return {
      totalVersions: 0,
      firstVersion: null,
      lastVersion: null,
      averageTimeBetweenVersions: null,
    };
  }

  const sortedVersions = [...versions].sort((a, b) => a.version - b.version);
  const firstVersion = sortedVersions[0].date;
  const lastVersion = sortedVersions[sortedVersions.length - 1].date;

  let averageTimeBetweenVersions: number | null = null;
  if (versions.length > 1) {
    const totalTime = lastVersion.getTime() - firstVersion.getTime();
    averageTimeBetweenVersions = totalTime / (versions.length - 1);
  }

  return {
    totalVersions: versions.length,
    firstVersion,
    lastVersion,
    averageTimeBetweenVersions,
  };
}

// ============================================
// FORMATEO Y DISPLAY
// ============================================

/**
 * Formatea una fecha de versión para display
 */
export function formatVersionDate(date: Date): string {
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Genera un label para una versión
 */
export function getVersionLabel(version: VersionInfo): string {
  const dateStr = formatVersionDate(version.date);
  const noteStr = version.editNote ? ` - ${version.editNote}` : '';
  return `Versión ${version.version} (${dateStr})${noteStr}`;
}

/**
 * Genera el historial de versiones formateado
 */
export function formatVersionHistory<T extends VersionInfo>(
  versions: T[]
): {
  version: number;
  date: string;
  label: string;
  editNote?: string;
  isLatest: boolean;
}[] {
  const sortedVersions = [...versions].sort((a, b) => b.version - a.version);
  const latestVersion = sortedVersions[0]?.version;

  return sortedVersions.map(v => ({
    version: v.version,
    date: formatVersionDate(v.date),
    label: getVersionLabel(v),
    editNote: v.editNote,
    isLatest: v.version === latestVersion,
  }));
}

// ============================================
// EXPORTACIÓN DE VERSIONES
// ============================================

/**
 * Exporta el historial de versiones a formato legible
 */
export function exportVersionHistory<T extends VersionInfo>(
  versions: T[],
  entityName: string
): string {
  const lines: string[] = [
    `# Historial de Versiones: ${entityName}`,
    '',
    `Total de versiones: ${versions.length}`,
    '',
    '---',
    '',
  ];

  const sortedVersions = [...versions].sort((a, b) => b.version - a.version);

  for (const version of sortedVersions) {
    lines.push(`## Versión ${version.version}`);
    lines.push(`**Fecha:** ${formatVersionDate(version.date)}`);
    if (version.editNote) {
      lines.push(`**Nota de edición:** ${version.editNote}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

// ============================================
// UTILIDADES INTERNAS
// ============================================

/**
 * Comparación profunda de valores
 */
function isEqual(val1: any, val2: any): boolean {
  // Manejo de null/undefined
  if (val1 === val2) return true;
  if (val1 === null || val2 === null) return false;
  if (val1 === undefined || val2 === undefined) return false;

  // Manejo de fechas
  if (val1 instanceof Date && val2 instanceof Date) {
    return val1.getTime() === val2.getTime();
  }

  // Manejo de arrays
  if (Array.isArray(val1) && Array.isArray(val2)) {
    if (val1.length !== val2.length) return false;
    return val1.every((item, index) => isEqual(item, val2[index]));
  }

  // Manejo de objetos
  if (typeof val1 === 'object' && typeof val2 === 'object') {
    const keys1 = Object.keys(val1);
    const keys2 = Object.keys(val2);

    if (keys1.length !== keys2.length) return false;

    return keys1.every(key => isEqual(val1[key], val2[key]));
  }

  return val1 === val2;
}

// ============================================
// VALIDACIÓN
// ============================================

/**
 * Valida que un objeto tenga la estructura de versionado correcta
 */
export function validateVersionable<T>(
  obj: any,
  versionArrayField: string = 'versions'
): obj is Versionable<T> {
  if (!obj || typeof obj !== 'object') return false;
  if (!Array.isArray(obj[versionArrayField])) return false;
  if (typeof obj.currentVersion !== 'number') return false;

  return true;
}

/**
 * Repara datos de versionado si están corruptos
 */
export function repairVersioning<T extends VersionInfo>(
  versions: T[],
  currentVersion: number
): {
  versions: T[];
  currentVersion: number;
  wasRepaired: boolean;
} {
  let wasRepaired = false;

  // Filtrar versiones inválidas
  const validVersions = versions.filter(v => {
    if (typeof v.version !== 'number' || !v.date) {
      wasRepaired = true;
      return false;
    }
    return true;
  });

  // Renumerar si hay gaps
  const sortedVersions = [...validVersions].sort((a, b) => a.version - b.version);
  const renumberedVersions = sortedVersions.map((v, index) => {
    const expectedVersion = index + 1;
    if (v.version !== expectedVersion) {
      wasRepaired = true;
      return { ...v, version: expectedVersion };
    }
    return v;
  });

  // Corregir currentVersion si es necesario
  const maxVersion = renumberedVersions.length > 0
    ? Math.max(...renumberedVersions.map(v => v.version))
    : 0;

  const correctedCurrentVersion = currentVersion === maxVersion
    ? currentVersion
    : maxVersion;

  if (correctedCurrentVersion !== currentVersion) {
    wasRepaired = true;
  }

  return {
    versions: renumberedVersions,
    currentVersion: correctedCurrentVersion,
    wasRepaired,
  };
}
