/**
 * Store para gestionar capítulos (contenido emocional)
 *
 * Maneja el estado de capítulos con sistema de desbloqueo por edad.
 */

import { create } from 'zustand';
import {
  Chapter,
  ChapterType,
  YearlyNarrative,
  UnlockStatus,
} from '../types/emotional.types';
import {
  createChapter,
  getChapters,
  getChapter,
  updateChapter,
  deleteChapter,
  publishChapter,
  reorderChapters,
  saveYearlyNarrative,
  getYearlyNarrative,
  getAllYearlyNarratives,
  getUnlockStatus,
  getUpcomingUnlocks,
} from '../services/firebase/emotionalService';

interface ChapterStoreState {
  // Estado
  chapters: Chapter[];
  yearlyNarratives: YearlyNarrative[];
  selectedChapter: Chapter | null;
  upcomingUnlocks: Chapter[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Acciones - Capítulos
  loadChapters: (userId: string, childBirthDate?: Date) => Promise<void>;
  loadChapter: (userId: string, chapterId: string, childBirthDate?: Date) => Promise<void>;
  createNewChapter: (
    userId: string,
    data: {
      title: string;
      type: ChapterType;
      content: string;
      excerpt?: string;
      mediaUrls?: string[];
      unlockAge?: number;
      lockedTeaser?: string;
      linkedYears?: number[];
      tags?: string[];
    }
  ) => Promise<Chapter>;
  updateExistingChapter: (
    userId: string,
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
    editNote?: string
  ) => Promise<void>;
  deleteExistingChapter: (userId: string, chapterId: string) => Promise<void>;
  publishExistingChapter: (userId: string, chapterId: string) => Promise<void>;
  reorderExistingChapters: (userId: string, chapterIds: string[]) => Promise<void>;

  // Acciones - Narrativas Anuales
  loadYearlyNarratives: (userId: string) => Promise<void>;
  loadYearlyNarrative: (userId: string, year: number) => Promise<YearlyNarrative | null>;
  saveNarrative: (
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
    },
    editNote?: string
  ) => Promise<void>;

  // Acciones - Desbloqueo
  loadUpcomingUnlocks: (userId: string, childBirthDate: Date) => Promise<void>;
  getChapterUnlockStatus: (chapter: Chapter, childBirthDate: Date) => UnlockStatus;

  // Selección
  selectChapter: (chapter: Chapter | null) => void;

  // Utilidades
  clearError: () => void;
  reset: () => void;

  // Filtros
  getChaptersByType: (type: ChapterType) => Chapter[];
  getUnlockedChapters: () => Chapter[];
  getLockedChapters: () => Chapter[];
}

export const useChapterStore = create<ChapterStoreState>((set, get) => ({
  // Estado inicial
  chapters: [],
  yearlyNarratives: [],
  selectedChapter: null,
  upcomingUnlocks: [],
  isLoading: false,
  isSaving: false,
  error: null,

  // Cargar capítulos
  loadChapters: async (userId: string, childBirthDate?: Date) => {
    set({ isLoading: true, error: null });
    try {
      const chapters = await getChapters(userId, {
        childBirthDate,
        includeContent: true,
      });
      set({ chapters, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cargar capitulos';
      set({ error: message, isLoading: false });
    }
  },

  // Cargar un capítulo específico
  loadChapter: async (userId: string, chapterId: string, childBirthDate?: Date) => {
    set({ isLoading: true, error: null });
    try {
      const chapter = await getChapter(userId, chapterId, childBirthDate);
      set({ selectedChapter: chapter, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cargar capitulo';
      set({ error: message, isLoading: false });
    }
  },

  // Crear nuevo capítulo
  createNewChapter: async (userId, data) => {
    set({ isSaving: true, error: null });
    try {
      const newChapter = await createChapter(userId, data);
      set((state) => ({
        chapters: [...state.chapters, newChapter],
        isSaving: false,
      }));
      return newChapter;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al crear capitulo';
      set({ error: message, isSaving: false });
      throw error;
    }
  },

  // Actualizar capítulo
  updateExistingChapter: async (userId, chapterId, updates, editNote) => {
    set({ isSaving: true, error: null });
    try {
      await updateChapter(userId, chapterId, updates, editNote);
      // Recargar capítulos para obtener datos actualizados
      const { loadChapters } = get();
      await loadChapters(userId);
      set({ isSaving: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar capitulo';
      set({ error: message, isSaving: false });
      throw error;
    }
  },

  // Eliminar capítulo
  deleteExistingChapter: async (userId, chapterId) => {
    set({ isSaving: true, error: null });
    try {
      await deleteChapter(userId, chapterId);
      set((state) => ({
        chapters: state.chapters.filter((ch) => ch.id !== chapterId),
        selectedChapter:
          state.selectedChapter?.id === chapterId ? null : state.selectedChapter,
        isSaving: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar capitulo';
      set({ error: message, isSaving: false });
      throw error;
    }
  },

  // Publicar capítulo
  publishExistingChapter: async (userId, chapterId) => {
    set({ isSaving: true, error: null });
    try {
      await publishChapter(userId, chapterId);
      set((state) => ({
        chapters: state.chapters.map((ch) =>
          ch.id === chapterId ? { ...ch, publishedAt: new Date() } : ch
        ),
        isSaving: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al publicar capitulo';
      set({ error: message, isSaving: false });
      throw error;
    }
  },

  // Reordenar capítulos
  reorderExistingChapters: async (userId, chapterIds) => {
    set({ isSaving: true, error: null });
    try {
      await reorderChapters(userId, chapterIds);
      // Actualizar orden local
      set((state) => ({
        chapters: chapterIds
          .map((id, index) => {
            const chapter = state.chapters.find((ch) => ch.id === id);
            return chapter ? { ...chapter, sortOrder: index } : null;
          })
          .filter(Boolean) as Chapter[],
        isSaving: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al reordenar capitulos';
      set({ error: message, isSaving: false });
      throw error;
    }
  },

  // Cargar narrativas anuales
  loadYearlyNarratives: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const narratives = await getAllYearlyNarratives(userId);
      set({ yearlyNarratives: narratives, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cargar narrativas';
      set({ error: message, isLoading: false });
    }
  },

  // Cargar narrativa de un año
  loadYearlyNarrative: async (userId, year) => {
    try {
      return await getYearlyNarrative(userId, year);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cargar narrativa';
      set({ error: message });
      return null;
    }
  },

  // Guardar narrativa anual
  saveNarrative: async (userId, year, data, editNote) => {
    set({ isSaving: true, error: null });
    try {
      const narrative = await saveYearlyNarrative(userId, year, data, editNote);
      set((state) => ({
        yearlyNarratives: state.yearlyNarratives.some((n) => n.year === year)
          ? state.yearlyNarratives.map((n) => (n.year === year ? narrative : n))
          : [...state.yearlyNarratives, narrative],
        isSaving: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al guardar narrativa';
      set({ error: message, isSaving: false });
      throw error;
    }
  },

  // Cargar próximos desbloqueos
  loadUpcomingUnlocks: async (userId, childBirthDate) => {
    try {
      const unlocks = await getUpcomingUnlocks(userId, childBirthDate, 3);
      set({ upcomingUnlocks: unlocks });
    } catch (error) {
      console.error('Error loading upcoming unlocks:', error);
    }
  },

  // Obtener estado de desbloqueo
  getChapterUnlockStatus: (chapter, childBirthDate) => {
    return getUnlockStatus(chapter, childBirthDate);
  },

  // Seleccionar capítulo
  selectChapter: (chapter) => {
    set({ selectedChapter: chapter });
  },

  // Limpiar error
  clearError: () => {
    set({ error: null });
  },

  // Reset store
  reset: () => {
    set({
      chapters: [],
      yearlyNarratives: [],
      selectedChapter: null,
      upcomingUnlocks: [],
      isLoading: false,
      isSaving: false,
      error: null,
    });
  },

  // Filtrar por tipo
  getChaptersByType: (type) => {
    return get().chapters.filter((ch) => ch.type === type);
  },

  // Obtener desbloqueados
  getUnlockedChapters: () => {
    return get().chapters.filter((ch) => !ch.isLocked);
  },

  // Obtener bloqueados
  getLockedChapters: () => {
    return get().chapters.filter((ch) => ch.isLocked);
  },
}));
