/**
 * Hook para gestionar la exportación de datos
 *
 * Proporciona una interfaz simple para exportar la bitácora
 * en diferentes formatos (JSON, HTML, ZIP).
 */

import { useState, useCallback } from 'react';
import {
  ExportFormat,
  ExportOptions,
  ExportResult,
  ExportProgress,
} from '../types/app.types';
import { useAuthStore } from '../store';
import { exportToJSON, downloadJSON } from '../services/export/jsonExporter';
import { downloadHTML } from '../services/export/htmlExporter';
import { exportToZIP, isZipSupported } from '../services/export/zipExporter';

interface UseExportReturn {
  // Estado
  isExporting: boolean;
  progress: ExportProgress | null;
  lastResult: ExportResult | null;
  error: string | null;

  // Acciones
  exportData: (format: ExportFormat, options?: Partial<ExportOptions>) => Promise<ExportResult>;
  exportJSON: (options?: Partial<ExportOptions>) => Promise<ExportResult>;
  exportHTML: (options?: Partial<ExportOptions>) => Promise<ExportResult>;
  exportZIP: (options?: Partial<ExportOptions>) => Promise<ExportResult>;
  clearError: () => void;

  // Utilidades
  canExportZIP: boolean;
}

const DEFAULT_OPTIONS: ExportOptions = {
  format: 'json',
  includeFinancial: true,
  includeMetadata: true,
  includeEmotional: true,
  includeMedia: true,
  includeLockedChapters: true,
  preserveVersionHistory: true,
};

export function useExport(): UseExportReturn {
  const { user } = useAuthStore();

  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [lastResult, setLastResult] = useState<ExportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getChildInfo = useCallback(() => {
    if (!user) {
      throw new Error('No hay usuario autenticado');
    }

    return {
      name: user.childName || 'Mi Hijo',
      birthDate: user.childBirthDate
        ? (user.childBirthDate instanceof Date
            ? user.childBirthDate
            : new Date(user.childBirthDate))
        : new Date(),
    };
  }, [user]);

  const exportJSON = useCallback(async (
    options?: Partial<ExportOptions>
  ): Promise<ExportResult> => {
    if (!user) {
      const errorResult: ExportResult = {
        success: false,
        format: 'json',
        filename: '',
        size: 0,
        itemCount: { transactions: 0, snapshots: 0, chapters: 0, narratives: 0, mediaFiles: 0 },
        errors: ['No hay usuario autenticado'],
      };
      setLastResult(errorResult);
      setError('No hay usuario autenticado');
      return errorResult;
    }

    setIsExporting(true);
    setError(null);
    setProgress({ stage: 'preparing', progress: 0 });

    try {
      const childInfo = getChildInfo();
      const mergedOptions: ExportOptions = { ...DEFAULT_OPTIONS, ...options, format: 'json' };

      const { data, result } = await exportToJSON(
        user.id,
        childInfo,
        mergedOptions,
        setProgress
      );

      if (result.success) {
        downloadJSON(data);
      }

      setLastResult(result);
      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);

      const errorResult: ExportResult = {
        success: false,
        format: 'json',
        filename: '',
        size: 0,
        itemCount: { transactions: 0, snapshots: 0, chapters: 0, narratives: 0, mediaFiles: 0 },
        errors: [errorMessage],
      };
      setLastResult(errorResult);
      return errorResult;

    } finally {
      setIsExporting(false);
      setProgress(null);
    }
  }, [user, getChildInfo]);

  const exportHTML = useCallback(async (
    options?: Partial<ExportOptions>
  ): Promise<ExportResult> => {
    if (!user) {
      const errorResult: ExportResult = {
        success: false,
        format: 'html',
        filename: '',
        size: 0,
        itemCount: { transactions: 0, snapshots: 0, chapters: 0, narratives: 0, mediaFiles: 0 },
        errors: ['No hay usuario autenticado'],
      };
      setLastResult(errorResult);
      setError('No hay usuario autenticado');
      return errorResult;
    }

    setIsExporting(true);
    setError(null);
    setProgress({ stage: 'preparing', progress: 0 });

    try {
      const childInfo = getChildInfo();
      const mergedOptions: ExportOptions = { ...DEFAULT_OPTIONS, ...options, format: 'html' };

      // Primero obtenemos los datos
      const { data, result } = await exportToJSON(
        user.id,
        childInfo,
        mergedOptions,
        (p) => setProgress({ ...p, progress: p.progress * 0.8 })
      );

      if (result.success) {
        setProgress({ stage: 'generating_html', progress: 90, currentItem: 'Generando HTML...' });
        downloadHTML(data);
      }

      const htmlResult: ExportResult = {
        ...result,
        format: 'html',
        filename: result.filename.replace('.json', '.html'),
      };

      setLastResult(htmlResult);
      return htmlResult;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);

      const errorResult: ExportResult = {
        success: false,
        format: 'html',
        filename: '',
        size: 0,
        itemCount: { transactions: 0, snapshots: 0, chapters: 0, narratives: 0, mediaFiles: 0 },
        errors: [errorMessage],
      };
      setLastResult(errorResult);
      return errorResult;

    } finally {
      setIsExporting(false);
      setProgress(null);
    }
  }, [user, getChildInfo]);

  const exportZIPFn = useCallback(async (
    options?: Partial<ExportOptions>
  ): Promise<ExportResult> => {
    if (!user) {
      const errorResult: ExportResult = {
        success: false,
        format: 'zip',
        filename: '',
        size: 0,
        itemCount: { transactions: 0, snapshots: 0, chapters: 0, narratives: 0, mediaFiles: 0 },
        errors: ['No hay usuario autenticado'],
      };
      setLastResult(errorResult);
      setError('No hay usuario autenticado');
      return errorResult;
    }

    if (!isZipSupported()) {
      const errorResult: ExportResult = {
        success: false,
        format: 'zip',
        filename: '',
        size: 0,
        itemCount: { transactions: 0, snapshots: 0, chapters: 0, narratives: 0, mediaFiles: 0 },
        errors: ['La exportación ZIP no está soportada en este navegador'],
      };
      setLastResult(errorResult);
      setError('La exportación ZIP no está soportada');
      return errorResult;
    }

    setIsExporting(true);
    setError(null);
    setProgress({ stage: 'preparing', progress: 0 });

    try {
      const childInfo = getChildInfo();
      const mergedOptions = {
        includeFinancial: options?.includeFinancial ?? true,
        includeMetadata: options?.includeMetadata ?? true,
        includeEmotional: options?.includeEmotional ?? true,
        includeLockedChapters: options?.includeLockedChapters ?? true,
        preserveVersionHistory: options?.preserveVersionHistory ?? true,
      };

      const result = await exportToZIP(
        user.id,
        childInfo,
        mergedOptions,
        setProgress
      );

      setLastResult(result);
      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);

      const errorResult: ExportResult = {
        success: false,
        format: 'zip',
        filename: '',
        size: 0,
        itemCount: { transactions: 0, snapshots: 0, chapters: 0, narratives: 0, mediaFiles: 0 },
        errors: [errorMessage],
      };
      setLastResult(errorResult);
      return errorResult;

    } finally {
      setIsExporting(false);
      setProgress(null);
    }
  }, [user, getChildInfo]);

  const exportData = useCallback(async (
    format: ExportFormat,
    options?: Partial<ExportOptions>
  ): Promise<ExportResult> => {
    switch (format) {
      case 'json':
        return exportJSON(options);
      case 'html':
        return exportHTML(options);
      case 'zip':
        return exportZIPFn(options);
      default:
        throw new Error(`Formato no soportado: ${format}`);
    }
  }, [exportJSON, exportHTML, exportZIPFn]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isExporting,
    progress,
    lastResult,
    error,
    exportData,
    exportJSON,
    exportHTML,
    exportZIP: exportZIPFn,
    clearError,
    canExportZIP: isZipSupported(),
  };
}
