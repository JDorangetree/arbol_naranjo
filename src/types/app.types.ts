/**
 * Tipos para la Aplicación (Modos, Exportación, Configuración)
 *
 * Define los modos de la aplicación, formatos de exportación,
 * y tipos auxiliares para la funcionalidad general.
 */

import { FinancialExportData } from './financial.types';
import { MetadataExportData } from './metadata.types';
import { EmotionalExportData } from './emotional.types';

// ============================================
// MODOS DE LA APLICACIÓN
// ============================================

/**
 * Modo de la aplicación
 * - parent: Modo completo con edición
 * - child_readonly: Modo lectura para el niño (sin edición, contenido filtrado por edad)
 */
export type AppMode = 'parent' | 'child_readonly';

/**
 * Estado del modo de aplicación
 */
export interface AppModeState {
  mode: AppMode;
  childCurrentAge: number;     // Edad actual del niño (para filtrar contenido)
  lastModeChange: Date;

  // Configuración del modo hijo
  childModeSettings?: {
    showFinancialDetails: boolean;  // Mostrar montos exactos o solo visualización
    allowedSections: string[];      // Secciones permitidas
  };
}

// ============================================
// EXPORTACIÓN
// ============================================

/**
 * Formato de exportación
 */
export type ExportFormat = 'json' | 'html' | 'zip' | 'pdf';

/**
 * Opciones de exportación
 */
export interface ExportOptions {
  format: ExportFormat;

  // Qué incluir
  includeFinancial: boolean;
  includeMetadata: boolean;
  includeEmotional: boolean;
  includeMedia: boolean;          // Fotos/videos

  // Para contenido emocional
  includeLockedChapters: boolean; // Incluir capítulos bloqueados (para backup)
  preserveVersionHistory: boolean; // Incluir historial de versiones

  // Filtros opcionales
  yearRange?: {
    start: number;
    end: number;
  };
}

/**
 * Datos completos de exportación
 */
export interface FullExportData {
  exportDate: Date;
  exportVersion: string;         // Versión del formato de exportación
  appVersion: string;            // Versión de la app

  // Información del niño
  childInfo: {
    name: string;
    birthDate: Date;
    ageAtExport: number;
  };

  // Datos por capa
  financial: FinancialExportData;
  metadata: MetadataExportData;
  emotional: EmotionalExportData;

  // Checksums para verificar integridad
  checksums: {
    financial: string;
    metadata: string;
    emotional: string;
  };
}

/**
 * Resultado de exportación
 */
export interface ExportResult {
  success: boolean;
  format: ExportFormat;
  filename: string;
  size: number;          // Bytes
  itemCount: {
    transactions: number;
    snapshots: number;
    chapters: number;
    narratives: number;
    mediaFiles: number;
  };
  errors?: string[];
  warnings?: string[];
}

/**
 * Progreso de exportación
 */
export interface ExportProgress {
  stage: ExportStage;
  progress: number;      // 0-100
  currentItem?: string;
  totalItems?: number;
  completedItems?: number;
}

export type ExportStage =
  | 'preparing'
  | 'exporting_financial'
  | 'exporting_metadata'
  | 'exporting_emotional'
  | 'exporting_media'
  | 'generating_html'
  | 'creating_archive'
  | 'finalizing'
  | 'complete'
  | 'error';

// ============================================
// VERSIONADO
// ============================================

/**
 * Información de versión genérica
 */
export interface VersionInfo {
  version: number;
  date: Date;
  editNote?: string;
  editedBy?: string;
}

/**
 * Elemento versionable (interfaz base)
 */
export interface Versionable<T> {
  versions: T[];
  currentVersion: number;
}

// ============================================
// NAVEGACIÓN Y UI
// ============================================

/**
 * Sección de la aplicación
 */
export type AppSection =
  | 'dashboard'
  | 'investments'
  | 'history'
  | 'chapters'
  | 'reports'
  | 'export'
  | 'settings'
  | 'story_mode';

/**
 * Configuración de navegación por modo
 */
export interface NavigationConfig {
  section: AppSection;
  label: string;
  icon: string;
  path: string;
  availableInModes: AppMode[];
  requiresAuth: boolean;
}

/**
 * Notificación de la app
 */
export interface AppNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

// ============================================
// CONFIGURACIÓN DEL USUARIO
// ============================================

/**
 * Preferencias del usuario
 */
export interface UserPreferences {
  // Visualización
  preferredVisualization: 'tree' | 'piggybank' | 'garden';
  showAmountsInDashboard: boolean;
  currency: 'COP' | 'USD';

  // Notificaciones
  enableReminders: boolean;
  reminderFrequency: 'weekly' | 'monthly' | 'never';

  // Exportación
  autoBackupEnabled: boolean;
  autoBackupFrequency: 'weekly' | 'monthly';
  lastAutoBackup?: Date;

  // Modo hijo
  childModePin?: string;  // PIN para salir del modo hijo
}

// ============================================
// CONSTANTES
// ============================================

/**
 * Configuración de navegación predefinida
 */
export const NAVIGATION_CONFIG: NavigationConfig[] = [
  {
    section: 'dashboard',
    label: 'Inicio',
    icon: 'Home',
    path: '/',
    availableInModes: ['parent', 'child_readonly'],
    requiresAuth: true,
  },
  {
    section: 'investments',
    label: 'Inversiones',
    icon: 'TrendingUp',
    path: '/investments',
    availableInModes: ['parent'],
    requiresAuth: true,
  },
  {
    section: 'history',
    label: 'Historial',
    icon: 'Clock',
    path: '/history',
    availableInModes: ['parent', 'child_readonly'],
    requiresAuth: true,
  },
  {
    section: 'chapters',
    label: 'Capítulos',
    icon: 'BookOpen',
    path: '/chapters',
    availableInModes: ['parent', 'child_readonly'],
    requiresAuth: true,
  },
  {
    section: 'reports',
    label: 'Reportes',
    icon: 'FileText',
    path: '/reports',
    availableInModes: ['parent'],
    requiresAuth: true,
  },
  {
    section: 'export',
    label: 'Exportar',
    icon: 'Download',
    path: '/export',
    availableInModes: ['parent'],
    requiresAuth: true,
  },
  {
    section: 'story_mode',
    label: 'Mi Historia',
    icon: 'Book',
    path: '/story',
    availableInModes: ['child_readonly'],
    requiresAuth: true,
  },
  {
    section: 'settings',
    label: 'Configuración',
    icon: 'Settings',
    path: '/settings',
    availableInModes: ['parent'],
    requiresAuth: true,
  },
];

/**
 * Versión actual del formato de exportación
 */
export const EXPORT_FORMAT_VERSION = '1.0.0';
