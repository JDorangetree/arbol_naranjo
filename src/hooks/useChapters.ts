/**
 * Hook para gestionar capítulos
 *
 * Proporciona una interfaz simple para trabajar con capítulos
 * incluyendo carga, creación, edición y sistema de desbloqueo.
 */

import { useCallback } from 'react';
import { useChapterStore } from '../store/useChapterStore';
import { useAuthStore } from '../store';
import { Chapter, ChapterType, UnlockStatus } from '../types/emotional.types';
import { uploadChapterImage } from '../services/firebase/storageService';
import type { MediaItem } from '../components/chapters/MediaUploader';

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
    mediaItems?: MediaItem[];
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
      mediaUrls: string[];
      mediaCaptions: string[];
    }>,
    mediaItems?: MediaItem[],
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

  // Crear capítulo con soporte para fotos
  const createChapter = useCallback(
    async (data: {
      title: string;
      type: ChapterType;
      content: string;
      excerpt?: string;
      unlockAge?: number;
      lockedTeaser?: string;
      tags?: string[];
      mediaItems?: MediaItem[];
    }): Promise<Chapter | null> => {
      if (!user?.id) return null;
      try {
        // Primero crear el capítulo sin fotos para obtener el ID
        const { mediaItems, ...chapterData } = data;
        const newChapter = await createNewChapter(user.id, chapterData);

        // Si hay fotos, subirlas y actualizar el capítulo
        if (mediaItems && mediaItems.length > 0) {
          const mediaUrls: string[] = [];
          const mediaCaptions: string[] = [];

          for (const item of mediaItems) {
            if (item.file) {
              // Subir archivo nuevo
              const result = await uploadChapterImage(
                user.id,
                newChapter.id,
                item.file
              );
              mediaUrls.push(result.url);
              mediaCaptions.push(item.caption);
            } else if (item.url && item.isExisting) {
              // Mantener URL existente
              mediaUrls.push(item.url);
              mediaCaptions.push(item.caption);
            }
          }

          // Actualizar el capítulo con las URLs de las fotos
          if (mediaUrls.length > 0) {
            await updateExistingChapter(
              user.id,
              newChapter.id,
              { mediaUrls, mediaCaptions } as Record<string, unknown>
            );
          }
        }

        return newChapter;
      } catch {
        return null;
      }
    },
    [user?.id, createNewChapter, updateExistingChapter]
  );

  // Actualizar capítulo con soporte para fotos
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
        mediaUrls: string[];
        mediaCaptions: string[];
      }>,
      mediaItems?: MediaItem[],
      editNote?: string
    ) => {
      if (!user?.id) return;

      // Si hay mediaItems, procesar las fotos
      if (mediaItems && mediaItems.length > 0) {
        const mediaUrls: string[] = [];
        const mediaCaptions: string[] = [];

        for (const item of mediaItems) {
          if (item.file) {
            // Subir archivo nuevo
            const result = await uploadChapterImage(
              user.id,
              chapterId,
              item.file
            );
            mediaUrls.push(result.url);
            mediaCaptions.push(item.caption);
          } else if (item.url) {
            // Mantener URL existente
            mediaUrls.push(item.url);
            mediaCaptions.push(item.caption);
          }
        }

        // Agregar URLs al update
        updates.mediaUrls = mediaUrls;
        updates.mediaCaptions = mediaCaptions;
      } else if (mediaItems && mediaItems.length === 0) {
        // Si se eliminaron todas las fotos
        updates.mediaUrls = [];
        updates.mediaCaptions = [];
      }

      await updateExistingChapter(user.id, chapterId, updates as Record<string, unknown>, editNote);
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
