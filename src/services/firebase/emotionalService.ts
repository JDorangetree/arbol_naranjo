/**
 * Servicio de Contenido Emocional
 *
 * CRUD para la capa emocional (capítulos/cartas).
 * Maneja contenido narrativo con sistema de desbloqueo por edad.
 * Incluye versionado automático para mantener historial de cambios.
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import {
  Chapter,
  ChapterVersion,
  ChapterType,
  YearlyNarrative,
  YearlyNarrativeVersion,
  UnlockStatus,
} from '../../types/emotional.types';
import { CHAPTER_ERRORS } from '../../utils/errorMessages';
import { withRetry, FIREBASE_RETRY_OPTIONS } from '../../utils/retry';

/**
 * Elimina campos con valor undefined de un objeto
 * Firestore no acepta valores undefined
 */
function removeUndefinedFields<T extends Record<string, any>>(obj: T): T {
  const result: any = {};
  for (const key of Object.keys(obj)) {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  return result;
}

// ============================================
// COLECCIONES
// ============================================

const getChaptersRef = (userId: string) =>
  collection(db, 'users', userId, 'emotional', 'data', 'chapters');

const getYearlyNarrativesRef = (userId: string) =>
  collection(db, 'users', userId, 'emotional', 'data', 'yearlyNarratives');

// ============================================
// CAPÍTULOS
// ============================================

/**
 * Crea un nuevo capítulo
 */
export async function createChapter(
  userId: string,
  data: {
    title: string;
    type: ChapterType;
    content: string;
    excerpt?: string;
    mediaUrls?: string[];
    mediaCaptions?: string[];
    unlockAge?: number;
    unlockDate?: Date;
    lockedTeaser?: string;
    linkedTransactionIds?: string[];
    linkedYears?: number[];
    tags?: string[];
  }
): Promise<Chapter> {
  const ref = getChaptersRef(userId);

  // Obtener el número de capítulos para asignar sortOrder
  const existingChapters = await withRetry(
    () => getDocs(ref),
    FIREBASE_RETRY_OPTIONS
  );
  const sortOrder = existingChapters.size;

  // Crear versión inicial
  const initialVersion: ChapterVersion = {
    version: 1,
    date: new Date(),
    title: data.title,
    content: data.content,
    excerpt: data.excerpt,
    unlockAge: data.unlockAge,
    lockedTeaser: data.lockedTeaser,
  };

  const chapter: Omit<Chapter, 'id'> = {
    userId,
    title: data.title,
    type: data.type,
    content: data.content,
    excerpt: data.excerpt,
    mediaUrls: data.mediaUrls,
    mediaCaptions: data.mediaCaptions,
    unlockAge: data.unlockAge,
    unlockDate: data.unlockDate,
    isLocked: true, // Se calculará en tiempo de lectura
    lockedTeaser: data.lockedTeaser,
    linkedTransactionIds: data.linkedTransactionIds,
    linkedYears: data.linkedYears,
    linkedChapterIds: [],
    sortOrder,
    tags: data.tags,
    versions: [initialVersion],
    currentVersion: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const docData: any = {
    ...chapter,
    versions: chapter.versions.map(v => ({
      ...v,
      date: Timestamp.fromDate(v.date),
    })),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (data.unlockDate) {
    docData.unlockDate = Timestamp.fromDate(data.unlockDate);
  }

  const docRef = await withRetry(
    () => addDoc(ref, docData),
    FIREBASE_RETRY_OPTIONS
  );

  return {
    ...chapter,
    id: docRef.id,
  };
}

/**
 * Obtiene un capítulo por ID
 */
export async function getChapter(
  userId: string,
  chapterId: string,
  childBirthDate?: Date
): Promise<Chapter | null> {
  const ref = doc(getChaptersRef(userId), chapterId);
  const snapshot = await withRetry(
    () => getDoc(ref),
    FIREBASE_RETRY_OPTIONS
  );

  if (!snapshot.exists()) {
    return null;
  }

  const chapter = mapDocToChapter(snapshot);

  // Calcular si está bloqueado
  if (childBirthDate) {
    chapter.isLocked = isChapterLocked(chapter, childBirthDate);
  }

  return chapter;
}

/**
 * Obtiene todos los capítulos de un usuario
 */
export async function getChapters(
  userId: string,
  options?: {
    type?: ChapterType;
    includeContent?: boolean;
    childBirthDate?: Date;
    onlyUnlocked?: boolean;
  }
): Promise<Chapter[]> {
  const ref = getChaptersRef(userId);
  let q = query(ref);

  if (options?.type) {
    q = query(q, where('type', '==', options.type));
  }

  const snapshot = await withRetry(
    () => getDocs(q),
    FIREBASE_RETRY_OPTIONS
  );

  let chapters = snapshot.docs.map(mapDocToChapter);

  // Calcular estado de bloqueo
  if (options?.childBirthDate) {
    chapters = chapters.map(ch => ({
      ...ch,
      isLocked: isChapterLocked(ch, options.childBirthDate!),
    }));
  }

  // Filtrar solo desbloqueados si se solicita
  if (options?.onlyUnlocked) {
    chapters = chapters.filter(ch => !ch.isLocked);
  }

  // Si no se incluye contenido, limpiar contenido de capítulos bloqueados
  if (!options?.includeContent) {
    chapters = chapters.map(ch => {
      if (ch.isLocked) {
        return {
          ...ch,
          content: '', // Ocultar contenido
          mediaUrls: [], // Ocultar media
        };
      }
      return ch;
    });
  }

  // Ordenar por sortOrder
  return chapters.sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Actualiza un capítulo (con versionado)
 */
export async function updateChapter(
  userId: string,
  chapterId: string,
  updates: Partial<{
    title: string;
    content: string;
    excerpt: string;
    mediaUrls: string[];
    mediaCaptions: string[];
    unlockAge: number;
    unlockDate: Date;
    lockedTeaser: string;
    linkedTransactionIds: string[];
    linkedYears: string[];
    linkedChapterIds: string[];
    tags: string[];
    sortOrder: number;
  }>,
  editNote?: string
): Promise<void> {
  const ref = doc(getChaptersRef(userId), chapterId);
  const currentDoc = await withRetry(
    () => getDoc(ref),
    FIREBASE_RETRY_OPTIONS
  );

  if (!currentDoc.exists()) {
    throw new Error(CHAPTER_ERRORS.NOT_FOUND);
  }

  const currentData = mapDocToChapter(currentDoc);
  const newVersion = currentData.currentVersion + 1;

  // Crear nueva versión
  const newVersionRecord: ChapterVersion = {
    version: newVersion,
    date: new Date(),
    title: updates.title ?? currentData.title,
    content: updates.content ?? currentData.content,
    excerpt: updates.excerpt ?? currentData.excerpt,
    unlockAge: updates.unlockAge ?? currentData.unlockAge,
    lockedTeaser: updates.lockedTeaser ?? currentData.lockedTeaser,
    editNote,
  };

  const updatedVersions = [...currentData.versions, newVersionRecord];

  const updateData: any = {
    ...updates,
    versions: updatedVersions.map(v => ({
      ...v,
      date: Timestamp.fromDate(v.date),
    })),
    currentVersion: newVersion,
    updatedAt: serverTimestamp(),
  };

  if (updates.unlockDate) {
    updateData.unlockDate = Timestamp.fromDate(updates.unlockDate);
  }

  await withRetry(
    () => updateDoc(ref, updateData),
    FIREBASE_RETRY_OPTIONS
  );
}

/**
 * Publica un capítulo (marca como listo)
 */
export async function publishChapter(
  userId: string,
  chapterId: string
): Promise<void> {
  const ref = doc(getChaptersRef(userId), chapterId);
  await withRetry(
    () => updateDoc(ref, {
      publishedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
    FIREBASE_RETRY_OPTIONS
  );
}

/**
 * Elimina un capítulo
 */
export async function deleteChapter(
  userId: string,
  chapterId: string
): Promise<void> {
  const ref = doc(getChaptersRef(userId), chapterId);
  await withRetry(
    () => deleteDoc(ref),
    FIREBASE_RETRY_OPTIONS
  );
}

/**
 * Reordena capítulos
 */
export async function reorderChapters(
  userId: string,
  chapterIds: string[]
): Promise<void> {
  const ref = getChaptersRef(userId);

  // Actualizar sortOrder de cada capítulo
  const updates = chapterIds.map((id, index) =>
    updateDoc(doc(ref, id), { sortOrder: index })
  );

  await Promise.all(updates);
}

// ============================================
// NARRATIVAS ANUALES
// ============================================

/**
 * Crea o actualiza una narrativa anual
 */
export async function saveYearlyNarrative(
  userId: string,
  year: number,
  data: {
    summary: string;
    highlights: string[];
    lessonsLearned: string[];
    whatWeDecided: string;
    whatWeLearned: string;
    challengesFaced?: string;
    gratitude?: string;
    childAgeAtYear: number;
    familyContext?: string;
    yearPhotos?: string[];
    photoCaptions?: string[];
    specialLetter?: string;
    aiEducationalContent?: string;
    aiEducationalGeneratedAt?: Date;
  },
  editNote?: string
): Promise<YearlyNarrative> {
  const ref = getYearlyNarrativesRef(userId);

  // Buscar si ya existe
  const q = query(ref, where('year', '==', year));
  const existing = await withRetry(
    () => getDocs(q),
    FIREBASE_RETRY_OPTIONS
  );

  if (!existing.empty) {
    // Actualizar existente con versionado
    const existingDoc = existing.docs[0];
    const existingData = mapDocToYearlyNarrative(existingDoc);

    const newVersion: YearlyNarrativeVersion = {
      version: existingData.currentVersion + 1,
      date: new Date(),
      summary: data.summary,
      highlights: data.highlights,
      lessonsLearned: data.lessonsLearned,
      whatWeDecided: data.whatWeDecided,
      whatWeLearned: data.whatWeLearned,
      challengesFaced: data.challengesFaced,
      gratitude: data.gratitude,
      editNote,
    };

    // Preparar datos para Firestore (convertir Date a Timestamp y eliminar undefined)
    const updateData: any = removeUndefinedFields({
      ...data,
      versions: [...existingData.versions.map(v => removeUndefinedFields({
        ...v,
        date: Timestamp.fromDate(v.date),
      })), removeUndefinedFields({
        ...newVersion,
        date: Timestamp.fromDate(newVersion.date),
      })],
      currentVersion: newVersion.version,
      updatedAt: serverTimestamp(),
    });

    // Convertir aiEducationalGeneratedAt a Timestamp si existe
    if (data.aiEducationalGeneratedAt) {
      updateData.aiEducationalGeneratedAt = Timestamp.fromDate(data.aiEducationalGeneratedAt);
    }

    await withRetry(
      () => updateDoc(existingDoc.ref, updateData),
      FIREBASE_RETRY_OPTIONS
    );

    return {
      ...existingData,
      ...data,
      versions: [...existingData.versions, newVersion],
      currentVersion: newVersion.version,
      updatedAt: new Date(),
    };
  }

  // Crear nuevo
  const initialVersion: YearlyNarrativeVersion = {
    version: 1,
    date: new Date(),
    summary: data.summary,
    highlights: data.highlights,
    lessonsLearned: data.lessonsLearned,
    whatWeDecided: data.whatWeDecided,
    whatWeLearned: data.whatWeLearned,
    challengesFaced: data.challengesFaced,
    gratitude: data.gratitude,
  };

  const narrative: Omit<YearlyNarrative, 'id'> = {
    userId,
    year,
    ...data,
    versions: [initialVersion],
    currentVersion: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Preparar datos para Firestore (convertir Dates a Timestamps y eliminar undefined)
  const firestoreData: any = removeUndefinedFields({
    ...narrative,
    versions: [removeUndefinedFields({
      ...initialVersion,
      date: Timestamp.fromDate(initialVersion.date),
    })],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Convertir aiEducationalGeneratedAt a Timestamp si existe
  if (data.aiEducationalGeneratedAt) {
    firestoreData.aiEducationalGeneratedAt = Timestamp.fromDate(data.aiEducationalGeneratedAt);
  }

  const docRef = await withRetry(
    () => addDoc(ref, firestoreData),
    FIREBASE_RETRY_OPTIONS
  );

  return {
    ...narrative,
    id: docRef.id,
  };
}

/**
 * Obtiene una narrativa anual
 */
export async function getYearlyNarrative(
  userId: string,
  year: number
): Promise<YearlyNarrative | null> {
  const ref = getYearlyNarrativesRef(userId);
  const q = query(ref, where('year', '==', year));
  const snapshot = await withRetry(
    () => getDocs(q),
    FIREBASE_RETRY_OPTIONS
  );

  if (snapshot.empty) {
    return null;
  }

  return mapDocToYearlyNarrative(snapshot.docs[0]);
}

/**
 * Obtiene todas las narrativas anuales
 */
export async function getAllYearlyNarratives(
  userId: string
): Promise<YearlyNarrative[]> {
  const ref = getYearlyNarrativesRef(userId);
  const snapshot = await withRetry(
    () => getDocs(ref),
    FIREBASE_RETRY_OPTIONS
  );

  return snapshot.docs
    .map(mapDocToYearlyNarrative)
    .sort((a, b) => b.year - a.year);
}

// ============================================
// SISTEMA DE DESBLOQUEO
// ============================================

/**
 * Calcula si un capítulo está bloqueado basándose en la fecha de nacimiento
 */
export function isChapterLocked(chapter: Chapter, childBirthDate: Date): boolean {
  // Si no tiene restricción de edad ni fecha, está desbloqueado
  if (!chapter.unlockAge && !chapter.unlockDate) {
    return false;
  }

  const now = new Date();

  // Verificar por fecha específica
  if (chapter.unlockDate) {
    return now < chapter.unlockDate;
  }

  // Verificar por edad
  if (chapter.unlockAge) {
    const childAge = calculateAge(childBirthDate);
    return childAge < chapter.unlockAge;
  }

  return false;
}

/**
 * Obtiene el estado de desbloqueo de un capítulo
 */
export function getUnlockStatus(
  chapter: Chapter,
  childBirthDate: Date
): UnlockStatus {
  const currentAge = calculateAge(childBirthDate);
  const isLocked = isChapterLocked(chapter, childBirthDate);

  const status: UnlockStatus = {
    isLocked,
    unlockAge: chapter.unlockAge,
    unlockDate: chapter.unlockDate,
    currentAge,
  };

  if (isLocked) {
    if (chapter.unlockAge) {
      status.yearsUntilUnlock = chapter.unlockAge - currentAge;
    }
    if (chapter.unlockDate) {
      const now = new Date();
      status.daysUntilUnlock = Math.ceil(
        (chapter.unlockDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
    }
  }

  return status;
}

/**
 * Obtiene capítulos que se desbloquearán pronto
 */
export async function getUpcomingUnlocks(
  userId: string,
  childBirthDate: Date,
  withinYears: number = 2
): Promise<Chapter[]> {
  const chapters = await getChapters(userId, {
    childBirthDate,
    includeContent: false,
  });

  const currentAge = calculateAge(childBirthDate);

  return chapters.filter(ch => {
    if (!ch.isLocked) return false;
    if (ch.unlockAge) {
      return ch.unlockAge <= currentAge + withinYears;
    }
    if (ch.unlockDate) {
      const yearsUntil = (ch.unlockDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 365);
      return yearsUntil <= withinYears;
    }
    return false;
  });
}

// ============================================
// VINCULACIÓN
// ============================================

/**
 * Vincula un capítulo con transacciones
 */
export async function linkChapterToTransactions(
  userId: string,
  chapterId: string,
  transactionIds: string[]
): Promise<void> {
  const ref = doc(getChaptersRef(userId), chapterId);
  await withRetry(
    () => updateDoc(ref, {
      linkedTransactionIds: transactionIds,
      updatedAt: serverTimestamp(),
    }),
    FIREBASE_RETRY_OPTIONS
  );
}

/**
 * Vincula un capítulo con años
 */
export async function linkChapterToYears(
  userId: string,
  chapterId: string,
  years: number[]
): Promise<void> {
  const ref = doc(getChaptersRef(userId), chapterId);
  await withRetry(
    () => updateDoc(ref, {
      linkedYears: years,
      updatedAt: serverTimestamp(),
    }),
    FIREBASE_RETRY_OPTIONS
  );
}

/**
 * Obtiene capítulos vinculados a un año
 */
export async function getChaptersByYear(
  userId: string,
  year: number,
  childBirthDate?: Date
): Promise<Chapter[]> {
  const allChapters = await getChapters(userId, { childBirthDate });
  return allChapters.filter(ch =>
    ch.linkedYears?.includes(year) || ch.type === 'yearly_reflection'
  );
}

// ============================================
// UTILIDADES
// ============================================

function mapDocToChapter(doc: any): Chapter {
  const data = doc.data();
  return {
    id: doc.id,
    userId: data.userId,
    title: data.title,
    type: data.type,
    content: data.content,
    excerpt: data.excerpt,
    mediaUrls: data.mediaUrls || [],
    mediaCaptions: data.mediaCaptions || [],
    unlockAge: data.unlockAge,
    unlockDate: data.unlockDate?.toDate(),
    isLocked: true, // Se recalcula al leer
    lockedTeaser: data.lockedTeaser,
    linkedTransactionIds: data.linkedTransactionIds || [],
    linkedYears: data.linkedYears || [],
    linkedChapterIds: data.linkedChapterIds || [],
    sortOrder: data.sortOrder || 0,
    tags: data.tags || [],
    versions: (data.versions || []).map((v: any) => ({
      ...v,
      date: v.date?.toDate() || new Date(),
    })),
    currentVersion: data.currentVersion || 1,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    publishedAt: data.publishedAt?.toDate(),
  };
}

function mapDocToYearlyNarrative(doc: any): YearlyNarrative {
  const data = doc.data();
  return {
    id: doc.id,
    userId: data.userId,
    year: data.year,
    summary: data.summary,
    highlights: data.highlights || [],
    lessonsLearned: data.lessonsLearned || [],
    whatWeDecided: data.whatWeDecided,
    whatWeLearned: data.whatWeLearned,
    challengesFaced: data.challengesFaced,
    gratitude: data.gratitude,
    childAgeAtYear: data.childAgeAtYear,
    familyContext: data.familyContext,
    yearPhotos: data.yearPhotos || [],
    photoCaptions: data.photoCaptions || [],
    // Campos para carta especial y contenido AI
    specialLetter: data.specialLetter,
    aiEducationalContent: data.aiEducationalContent,
    aiEducationalGeneratedAt: data.aiEducationalGeneratedAt?.toDate(),
    versions: (data.versions || []).map((v: any) => ({
      ...v,
      date: v.date?.toDate() || new Date(),
    })),
    currentVersion: data.currentVersion || 1,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
}

function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}
