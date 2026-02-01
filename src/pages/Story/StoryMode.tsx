/**
 * Página Modo Historia
 *
 * Permite al administrador crear, ver y gestionar los capítulos
 * de la historia del tesoro. Integra el sistema de desbloqueo por edad.
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  AlertCircle,
  Clock,
  Gift,
} from 'lucide-react';
import { useChapters } from '../../hooks/useChapters';
import { useAuthStore } from '../../store';
import { useIsReadOnly } from '../../store/useAppModeStore';
import { ChapterList } from '../../components/chapters/ChapterList';
import { ChapterViewer } from '../../components/chapters/ChapterViewer';
import { ChapterForm, MediaItem } from '../../components/chapters';
import { Card, Button } from '../../components/common';
import { Chapter } from '../../types/emotional.types';

export const StoryMode: React.FC = () => {
  const { user } = useAuthStore();
  const isReadOnly = useIsReadOnly();
  const canEdit = !!user && !isReadOnly;
  const {
    chapters,
    upcomingUnlocks,
    isLoading,
    isSaving,
    error,
    loadChapters,
    createChapter,
    updateChapter,
    deleteChapter,
    selectChapter,
    selectedChapter,
    getUnlockStatus,
    clearError,
  } = useChapters();

  // Estados locales
  const [showViewer, setShowViewer] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Chapter | null>(null);

  // Cargar capítulos al montar
  useEffect(() => {
    loadChapters();
  }, [loadChapters]);

  // Handlers
  const handleView = (chapter: Chapter) => {
    selectChapter(chapter);
    setShowViewer(true);
  };

  const handleEdit = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingChapter(null);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) return;
    await deleteChapter(showDeleteConfirm.id);
    setShowDeleteConfirm(null);
  };

  const handleFormSubmit = async (data: {
    title: string;
    type: Chapter['type'];
    content: string;
    excerpt?: string;
    unlockAge?: number;
    lockedTeaser?: string;
    tags?: string[];
    mediaItems?: MediaItem[];
  }) => {
    const { mediaItems, ...chapterData } = data;

    if (editingChapter) {
      await updateChapter(editingChapter.id, chapterData, mediaItems);
    } else {
      await createChapter(data);
    }
    setShowForm(false);
    setEditingChapter(null);
    // Recargar capítulos para ver las fotos actualizadas
    await loadChapters();
  };

  const handleCloseViewer = () => {
    setShowViewer(false);
    selectChapter(null);
  };

  const handleEditFromViewer = () => {
    if (selectedChapter) {
      setShowViewer(false);
      handleEdit(selectedChapter);
    }
  };

  // Calcular edad actual del hijo
  const getChildAge = () => {
    if (!user?.childBirthDate) return null;
    const birthDate = user.childBirthDate instanceof Date
      ? user.childBirthDate
      : new Date(user.childBirthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  const childAge = getChildAge();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary-500" />
            Modo Historia
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            {isReadOnly
              ? 'Descubre la historia de tu tesoro'
              : 'Escribe la historia del tesoro de tu hijo'}
          </p>
        </div>

        {childAge !== null && (
          <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/30 rounded-xl">
            <Gift className="w-5 h-5 text-primary-500" />
            <span className="text-sm text-primary-700 dark:text-primary-300">
              Tu hijo tiene <strong>{childAge} {childAge === 1 ? 'año' : 'años'}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="p-4 bg-red-50 border-red-200">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-700 flex-1">{error}</p>
                <Button variant="ghost" size="sm" onClick={clearError}>
                  Cerrar
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Próximos desbloqueos */}
      {upcomingUnlocks.length > 0 && (
        <Card className="p-6 bg-gradient-to-r from-primary-50 to-growth-50 dark:from-primary-900/30 dark:to-growth-900/30">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Próximos desbloqueos
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingUnlocks.map((chapter) => {
              const status = getUnlockStatus(chapter);
              return (
                <div
                  key={chapter.id}
                  className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm"
                >
                  <p className="font-medium text-gray-900 dark:text-white mb-1">
                    {chapter.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    Se desbloquea a los {chapter.unlockAge} años
                    {status?.yearsUntilUnlock && status.yearsUntilUnlock > 0 && (
                      <span className="text-primary-500 ml-1">
                        (en {status.yearsUntilUnlock} {status.yearsUntilUnlock === 1 ? 'año' : 'años'})
                      </span>
                    )}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Lista de capítulos */}
      <ChapterList
        chapters={chapters}
        getUnlockStatus={getUnlockStatus}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={(chapter) => setShowDeleteConfirm(chapter)}
        onCreate={handleCreate}
        isLoading={isLoading}
        showActions={canEdit}
      />

      {/* Visor de capítulo */}
      <AnimatePresence>
        {showViewer && selectedChapter && (
          <ChapterViewer
            chapter={selectedChapter}
            onClose={handleCloseViewer}
            onEdit={handleEditFromViewer}
            showEditButton={canEdit}
          />
        )}
      </AnimatePresence>

      {/* Formulario de capítulo */}
      <AnimatePresence>
        {showForm && (
          <ChapterForm
            chapter={editingChapter}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingChapter(null);
            }}
            isSaving={isSaving}
          />
        )}
      </AnimatePresence>

      {/* Confirmación de eliminación */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Eliminar capítulo
              </h3>
              <p className="text-gray-600 dark:text-slate-400 mb-6">
                ¿Estás seguro de que deseas eliminar "{showDeleteConfirm.title}"?
                Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  disabled={isSaving}
                >
                  {isSaving ? 'Eliminando...' : 'Eliminar'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
