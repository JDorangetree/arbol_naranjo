/**
 * Tipos para la Capa de Metadatos (Contexto/Razones)
 *
 * Esta capa contiene el CONTEXTO de las decisiones financieras:
 * - Por qué se hizo una inversión
 * - Qué momento especial representa
 * - Fotos asociadas
 *
 * Incluye versionado para mantener historial de cambios.
 */

/**
 * Metadatos de una transacción - el "por qué" detrás del "qué"
 */
export interface TransactionMetadata {
  id: string;
  userId: string;
  transactionId: string;  // Referencia a FinancialTransaction

  // Contexto de la decisión
  reason?: string;           // "Bonus de fin de año", "Ahorro mensual"
  decisionContext?: string;  // "El mercado estaba bajo", "Oportunidad de compra"

  // Momento especial (si aplica)
  milestone?: MilestoneType;
  milestoneNote?: string;    // Descripción del momento

  // Media adjunta
  photoUrl?: string;         // Foto del momento
  photoCaption?: string;     // Descripción de la foto

  // Versionado
  versions: MetadataVersion[];
  currentVersion: number;

  // Metadatos del registro
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Versión histórica de metadatos
 */
export interface MetadataVersion {
  version: number;
  date: Date;

  // Snapshot de los datos en esa versión
  reason?: string;
  decisionContext?: string;
  milestone?: MilestoneType;
  milestoneNote?: string;
  photoUrl?: string;
  photoCaption?: string;

  // Por qué se editó
  editNote?: string;
}

/**
 * Tipos de momentos especiales
 */
export type MilestoneType =
  | 'first_investment'    // Primera inversión
  | 'birthday'            // Cumpleaños
  | 'christmas'           // Navidad
  | 'achievement'         // Logro (primer diente, primeros pasos, etc.)
  | 'family_moment'       // Momento familiar
  | 'monthly'             // Contribución mensual regular
  | 'bonus'               // Bonus o ingreso extra
  | 'gift'                // Regalo de familiares
  | 'special';            // Otro momento especial

/**
 * Configuración de milestone para UI
 */
export interface MilestoneConfig {
  type: MilestoneType;
  label: string;
  description: string;
  icon: string;
  color: string;
}

/**
 * Metadatos para un período (mes/año)
 */
export interface PeriodMetadata {
  id: string;
  userId: string;

  // Período
  year: number;
  month?: number;  // Si es null, aplica a todo el año

  // Contexto del período
  economicContext?: string;    // "Año de pandemia", "Mercado alcista"
  personalContext?: string;    // "Año de muchos viajes", "Año tranquilo"
  financialNotes?: string;     // Notas sobre decisiones financieras del período

  // Versionado
  versions: PeriodMetadataVersion[];
  currentVersion: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface PeriodMetadataVersion {
  version: number;
  date: Date;
  economicContext?: string;
  personalContext?: string;
  financialNotes?: string;
  editNote?: string;
}

/**
 * Datos para exportación de metadatos
 */
export interface MetadataExportData {
  exportDate: Date;
  userId: string;

  transactionMetadata: TransactionMetadata[];
  periodMetadata: PeriodMetadata[];
}

/**
 * Configuraciones predefinidas de milestones
 */
export const MILESTONE_CONFIGS: MilestoneConfig[] = [
  {
    type: 'first_investment',
    label: 'Primera Inversión',
    description: 'El primer paso en construir tu futuro',
    icon: 'Sparkles',
    color: '#FFD700',
  },
  {
    type: 'birthday',
    label: 'Cumpleaños',
    description: 'Regalo de cumpleaños para tu futuro',
    icon: 'Cake',
    color: '#FF69B4',
  },
  {
    type: 'christmas',
    label: 'Navidad',
    description: 'Regalo navideño para tu tesoro',
    icon: 'Gift',
    color: '#228B22',
  },
  {
    type: 'achievement',
    label: 'Logro',
    description: 'Celebrando un momento especial',
    icon: 'Trophy',
    color: '#FFD700',
  },
  {
    type: 'family_moment',
    label: 'Momento Familiar',
    description: 'Un día especial en familia',
    icon: 'Heart',
    color: '#FF6B6B',
  },
  {
    type: 'monthly',
    label: 'Ahorro Mensual',
    description: 'Contribución regular al patrimonio',
    icon: 'Calendar',
    color: '#4ECDC4',
  },
  {
    type: 'bonus',
    label: 'Bonus',
    description: 'Inversión con ingreso extra',
    icon: 'TrendingUp',
    color: '#9B59B6',
  },
  {
    type: 'gift',
    label: 'Regalo',
    description: 'Contribución de familiares o amigos',
    icon: 'Gift',
    color: '#E74C3C',
  },
  {
    type: 'special',
    label: 'Momento Especial',
    description: 'Otro momento importante',
    icon: 'Star',
    color: '#3498DB',
  },
];
