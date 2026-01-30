/**
 * Hook para gestionar capítulos
 *
 * Proporciona una interfaz simple para trabajar con capítulos
 * incluyendo carga, creación, edición y sistema de desbloqueo.
 */

import { useEffect, useCallback } from 'react';
import { useChapterStore } from '../store/useChapterStore';
import { useAuthStore } from '../store';
import { Chapter, ChapterType, UnlockStatus } from '../types/emotional.types';

interface UseChaptersReturn {
  // Estado
  chapters: Chapter[];
  selectedChapter: Chapter | null;
  upcomingUnlocks: Chapter[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Acciones
  loadChapters: () => Promise<void>;
  createChapter: (data: {
    title: string;
    type: ChapterType;
    content: string;
    excerpt?: string;
    unlockAge?: number;
    lockedTeaser?: string;
    tags?: string[];
  }) => Promise<Chapter | null>;
  updateChapter: (
    chapterId: string,
    updates: Partial<{
      title: string;
      content: string;
      excerpt: string;
      unlockAge: number;
      lockedTeaser: string;
      tags: string[];
    }>,
    editNote?: string
  ) => Promise<void>;
  deleteChapter: (chapterId: string) => Promise<void>;
  publishChapter: (chapterId: string) => Promise<void>;
  selectChapter: (chapter: Chapter | null) => void;

  // Filtros
  getByType: (type: ChapterType) => Chapter[];
  unlockedChapters: Chapter[];
  lockedChapters: Chapter[];

  // Desbloqueo
  getUnlockStatus: (chapter: Chapter) => UnlockStatus | null;

  // Utilidades
  clearError: () => void;
}

export function useChapters(): UseChaptersReturn {
  const { user } = useAuthStore();
  const {
    chapters,
    selectedChapter,
    upcomingUnlocks,
    isLoading,
    isSaving,
    error,
    loadChapters: storeLoadChapters,
    createNewChapter,
    updateExistingChapter,
    deleteExistingChapter,
    publishExistingChapter,
    selectChapter,
    loadUpcomingUnlocks,
    getChapterUnlockStatus,
    getChaptersByType,
    getUnlockedChapters,
    getLockedChapters,
    clearError,
  } = useChapterStore();

  // Obtener fecha de nacimiento del niño
  const childBirthDate = user?.childBirthDate
    ? user.childBirthDate instanceof Date
      ? user.childBirthDate
      : new Date(user.childBirthDate)
    : undefined;

  // Cargar capítulos al montar o cuando cambia el usuario
  const loadChapters = useCallback(async () => {
    if (!user?.id) return;
    await storeLoadChapters(user.id, childBirthDate);
    if (childBirthDate) {
      await loadUpcomingUnlocks(user.id, childBirthDate);
    }
  }, [user?.id, childBirthDate, storeLoadChapters, loadUpcomingUnlocks]);

  // Crear capítulo
  const createChapter = useCallback(
    async (data: {
      title: string;
      type: ChapterType;
      content: string;
      excerpt?: string;
      unlockAge?: number;
      lockedTeaser?: string;
      tags?: string[];
    }): Promise<Chapter | null> => {
      if (!user?.id) return null;
      try {
        return await createNewChapter(user.id, data);
      } catch {
        return null;
      }
    },
    [user?.id, createNewChapter]
  );

  // Actualizar capítulo
  const updateChapter = useCallback(
    async (
      chapterId: string,
      updates: Partial<{
        title: string;
        content: string;
        excerpt: string;
        unlockAge: number;
        lockedTeaser: string;
        tags: string[];
      }>,
      editNote?: string
    ) => {
      if (!user?.id) return;
      await updateExistingChapter(user.id, chapterId, updates, editNote);
    },
    [user?.id, updateExistingChapter]
  );

  // Eliminar capítulo
  const deleteChapter = useCallback(
    async (chapterId: string) => {
      if (!user?.id) return;
      await deleteExistingChapter(user.id, chapterId);
    },
    [user?.id, deleteExistingChapter]
  );

  // Publicar capítulo
  const publishChapter = useCallback(
    async (chapterId: string) => {
      if (!user?.id) return;
      await publishExistingChapter(user.id, chapterId);
    },
    [user?.id, publishExistingChapter]
  );

  // Obtener estado de desbloqueo
  const getUnlockStatus = useCallback(
    (chapter: Chapter): UnlockStatus | null => {
      if (!childBirthDate) return null;
      return getChapterUnlockStatus(chapter, childBirthDate);
    },
    [childBirthDate, getChapterUnlockStatus]
  );

  // Filtrar por tipo
  const getByType = useCallback(
    (type: ChapterType) => getChaptersByType(type),
    [getChaptersByType]
  );

  return {
    // Estado
    chapters,
    selectedChapter,
    upcomingUnlocks,
    isLoading,
    isSaving,
    error,

    // Acciones
    loadChapters,
    createChapter,
    updateChapter,
    deleteChapter,
    publishChapter,
    selectChapter,

    // Filtros
    getByType,
    unlockedChapters: getUnlockedChapters(),
    lockedChapters: getLockedChapters(),

    // Desbloqueo
    getUnlockStatus,

    // Utilidades
    clearError,
  };
}

/**
 * Hook para gestionar narrativas anuales
 */
export function useYearlyNarratives() {
  const { user } = useAuthStore();
  const {
    yearlyNarratives,
    isLoading,
    isSaving,
    error,
    loadYearlyNarratives,
    loadYearlyNarrative,
    saveNarrative,
    clearError,
  } = useChapterStore();

  const childBirthDate = user?.childBirthDate
    ? user.childBirthDate instanceof Date
      ? user.childBirthDate
      : new Date(user.childBirthDate)
    : undefined;

  // Cargar todas las narrativas
  const loadAll = useCallback(async () => {
    if (!user?.id) return;
    await loadYearlyNarratives(user.id);
  }, [user?.id, loadYearlyNarratives]);

  // Cargar narrativa de un año
  const loadYear = useCallback(
    async (year: number) => {
      if (!user?.id) return null;
      return await loadYearlyNarrative(user.id, year);
    },
    [user?.id, loadYearlyNarrative]
  );

  // Calcular edad del niño en un año específico
  const getChildAgeAtYear = useCallback(
    (year: number): number => {
      if (!childBirthDate) return 0;
      return year - childBirthDate.getFullYear();
    },
    [childBirthDate]
  );

  // Guardar narrativa
  const save = useCallback(
    async (
      year: number,
      data: {
        summary: string;
        highlights: string[];
        lessonsLearned: string[];
        whatWeDecided: string;
        whatWeLearned: string;
        challengesFaced?: string;
        gratitude?: string;
      },
      editNote?: string
    ) => {
      if (!user?.id) return;
      const childAgeAtYear = getChildAgeAtYear(year);
      await saveNarrative(user.id, year, { ...data, childAgeAtYear }, editNote);
    },
    [user?.id, getChildAgeAtYear, saveNarrative]
  );

  return {
    narratives: yearlyNarratives,
    isLoading,
    isSaving,
    error,
    loadAll,
    loadYear,
    save,
    getChildAgeAtYear,
    clearError,
  };
}
