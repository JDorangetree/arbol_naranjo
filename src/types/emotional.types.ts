/**
 * Tipos para la Capa Emocional (Capítulos/Cartas)
 *
 * Esta capa contiene el contenido narrativo y emocional:
 * - Cartas para el futuro
 * - Reflexiones anuales
 * - Historias de momentos especiales
 * - Lecciones aprendidas
 *
 * Incluye sistema de desbloqueo por edad y versionado.
 */

/**
 * Capítulo - unidad de contenido narrativo
 */
export interface Chapter {
  id: string;
  userId: string;

  // Identificación
  title: string;
  type: ChapterType;

  // Contenido
  content: string;           // Markdown permitido
  excerpt?: string;          // Resumen corto para previews
  mediaUrls?: string[];      // Fotos/videos adjuntos
  mediaCaptions?: string[];  // Descripciones de los medios

  // Desbloqueo por edad
  unlockAge?: number;        // Edad a la que se desbloquea (null = siempre visible)
  unlockDate?: Date;         // Fecha específica de desbloqueo (alternativa a edad)
  isLocked: boolean;         // Calculado basado en edad actual del niño

  // Teaser para contenido bloqueado
  lockedTeaser?: string;     // "Tengo algo especial que contarte cuando cumplas 10..."

  // Vinculación con otros datos
  linkedTransactionIds?: string[];  // Transacciones relacionadas
  linkedYears?: number[];           // Años relacionados
  linkedChapterIds?: string[];      // Otros capítulos relacionados

  // Orden y organización
  sortOrder: number;         // Para ordenar capítulos
  tags?: string[];           // Tags para filtrar

  // Versionado
  versions: ChapterVersion[];
  currentVersion: number;

  // Metadatos
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;        // Fecha de "publicación" (cuando se marcó como listo)
}

/**
 * Versión histórica de un capítulo
 */
export interface ChapterVersion {
  version: number;
  date: Date;

  // Snapshot del contenido
  title: string;
  content: string;
  excerpt?: string;
  unlockAge?: number;
  lockedTeaser?: string;

  // Por qué se editó
  editNote?: string;
}

/**
 * Tipos de capítulos
 */
export type ChapterType =
  | 'letter'              // Carta personal al niño
  | 'yearly_reflection'   // Reflexión de un año específico
  | 'milestone_story'     // Historia de un momento especial
  | 'lesson_learned'      // Lección aprendida (financiera o de vida)
  | 'family_story'        // Historia familiar
  | 'financial_education' // Explicación educativa sobre finanzas
  | 'future_message'      // Mensaje para un momento específico del futuro
  | 'memory'              // Recuerdo o anécdota
  | 'wish';               // Deseo o esperanza para el futuro

/**
 * Narrativa anual - reflexión de todo un año
 */
export interface YearlyNarrative {
  id: string;
  userId: string;
  year: number;

  // Reflexión del año (escrita por el padre)
  summary: string;              // Resumen general del año
  highlights: string[];         // Momentos destacados
  lessonsLearned: string[];     // Lecciones aprendidas

  // Retrospectiva (NO proyecciones)
  whatWeDecided: string;        // Decisiones que tomamos
  whatWeLearned: string;        // Lo que aprendimos
  challengesFaced?: string;     // Desafíos que enfrentamos
  gratitude?: string;           // Agradecimientos

  // Contexto
  childAgeAtYear: number;       // Edad del niño durante ese año
  familyContext?: string;       // Contexto familiar del año

  // Fotos del año
  yearPhotos?: string[];
  photoCaptions?: string[];

  // Carta especial escrita por el usuario (reemplaza introducción automática)
  specialLetter?: string;

  // Contenido educativo generado por IA (cache)
  aiEducationalContent?: string;
  aiEducationalGeneratedAt?: Date;

  // Versionado
  versions: YearlyNarrativeVersion[];
  currentVersion: number;

  // Metadatos
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Versión histórica de narrativa anual
 */
export interface YearlyNarrativeVersion {
  version: number;
  date: Date;

  summary: string;
  highlights: string[];
  lessonsLearned: string[];
  whatWeDecided: string;
  whatWeLearned: string;
  challengesFaced?: string;
  gratitude?: string;

  editNote?: string;
}

/**
 * Configuración de tipo de capítulo para UI
 */
export interface ChapterTypeConfig {
  type: ChapterType;
  label: string;
  description: string;
  icon: string;
  color: string;
  suggestedUnlockAges?: number[];  // Edades sugeridas para desbloqueo
}

/**
 * Estado de desbloqueo de contenido
 */
export interface UnlockStatus {
  isLocked: boolean;
  unlockAge?: number;
  unlockDate?: Date;
  currentAge: number;
  yearsUntilUnlock?: number;
  daysUntilUnlock?: number;
}

/**
 * Datos para exportación emocional
 */
export interface EmotionalExportData {
  exportDate: Date;
  userId: string;

  chapters: Chapter[];
  yearlyNarratives: YearlyNarrative[];

  // Incluir contenido bloqueado en exportación (para backup)
  includeLockedContent: boolean;
}

/**
 * Configuraciones predefinidas de tipos de capítulos
 */
export const CHAPTER_TYPE_CONFIGS: ChapterTypeConfig[] = [
  {
    type: 'letter',
    label: 'Carta Personal',
    description: 'Una carta escrita con amor para tu hijo',
    icon: 'Mail',
    color: '#FF6B6B',
    suggestedUnlockAges: [6, 10, 15, 18, 21],
  },
  {
    type: 'yearly_reflection',
    label: 'Reflexión Anual',
    description: 'Lo que vivimos y aprendimos este año',
    icon: 'Calendar',
    color: '#4ECDC4',
  },
  {
    type: 'milestone_story',
    label: 'Historia de un Momento',
    description: 'La historia detrás de un momento especial',
    icon: 'Star',
    color: '#FFD93D',
  },
  {
    type: 'lesson_learned',
    label: 'Lección Aprendida',
    description: 'Algo importante que quiero enseñarte',
    icon: 'Lightbulb',
    color: '#6BCB77',
    suggestedUnlockAges: [10, 15, 18],
  },
  {
    type: 'family_story',
    label: 'Historia Familiar',
    description: 'Una historia de nuestra familia',
    icon: 'Users',
    color: '#9B59B6',
  },
  {
    type: 'financial_education',
    label: 'Educación Financiera',
    description: 'Explicación sobre inversiones y dinero',
    icon: 'TrendingUp',
    color: '#3498DB',
    suggestedUnlockAges: [8, 12, 16, 18],
  },
  {
    type: 'future_message',
    label: 'Mensaje al Futuro',
    description: 'Un mensaje para un momento específico',
    icon: 'Clock',
    color: '#E67E22',
    suggestedUnlockAges: [18, 21, 25, 30],
  },
  {
    type: 'memory',
    label: 'Recuerdo',
    description: 'Una anécdota o recuerdo especial',
    icon: 'Image',
    color: '#1ABC9C',
  },
  {
    type: 'wish',
    label: 'Deseo',
    description: 'Mis esperanzas y deseos para ti',
    icon: 'Heart',
    color: '#E74C3C',
    suggestedUnlockAges: [18, 21],
  },
];

/**
 * Plantillas de contenido sugerido para capítulos
 */
export const CHAPTER_TEMPLATES: Record<ChapterType, string> = {
  letter: `Querido/a [nombre],

Hoy quiero contarte algo especial...

[Tu mensaje aquí]

Con todo mi amor,
[Tu nombre]`,

  yearly_reflection: `# El Año [año]

## Lo que vivimos
[Describe los momentos más importantes del año]

## Lo que aprendimos
[Lecciones del año]

## Decisiones que tomamos
[Decisiones financieras y de vida]

## Agradecimientos
[Por qué estamos agradecidos]`,

  milestone_story: `# [Título del momento]

**Fecha:** [fecha]

## La historia
[Cuenta la historia de este momento especial]

## Por qué es importante
[Explica la importancia de este momento]

## Lo que significa para tu futuro
[Conecta con el patrimonio]`,

  lesson_learned: `# [Título de la lección]

## La situación
[Describe el contexto]

## Lo que aprendimos
[La lección principal]

## Cómo aplicarlo
[Consejos prácticos]`,

  family_story: `# [Título de la historia]

## Nuestra familia
[Contexto familiar]

## La historia
[Cuenta la historia]

## Por qué quiero que la conozcas
[Significado para el niño]`,

  financial_education: `# [Concepto financiero]

## ¿Qué es?
[Explicación simple]

## ¿Por qué importa?
[Relevancia para su vida]

## Ejemplo con tu tesoro
[Ejemplo usando sus inversiones]

## Para recordar
[Puntos clave]`,

  future_message: `# Para cuando tengas [edad] años

Querido/a [nombre],

Si estás leyendo esto, significa que...

[Tu mensaje]

Espero que...

Con amor desde el pasado,
[Tu nombre]`,

  memory: `# [Título del recuerdo]

**Fecha:** [fecha aproximada]

## El recuerdo
[Describe el recuerdo]

## Por qué lo guardo
[Por qué es especial]`,

  wish: `# Mis deseos para ti

Querido/a [nombre],

Cuando pienso en tu futuro, deseo que...

[Tus deseos]

Siempre estaré apoyándote.`,
};
