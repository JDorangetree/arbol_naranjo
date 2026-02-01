/**
 * Lista de capítulos
 *
 * Muestra los capítulos organizados, con opción de filtrar
 * por tipo y estado de bloqueo.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Filter, Lock, Unlock, Plus } from 'lucide-react';
import { Chapter, ChapterType, UnlockStatus } from '../../types/emotional.types';
import { ChapterCard } from './ChapterCard';
import { Button } from '../common';
import { CHAPTER_TYPE_CONFIGS } from '../../types/emotional.types';

interface ChapterListProps {
  chapters: Chapter[];
  getUnlockStatus: (chapter: Chapter) => UnlockStatus | null;
  onView: (chapter: Chapter) => void;
  onEdit: (chapter: Chapter) => void;
  onDelete: (chapter: Chapter) => void;
  onCreate: () => void;
  isLoading?: boolean;
  showActions?: boolean;
}

type FilterOption = 'all' | 'unlocked' | 'locked' | ChapterType;

export const ChapterList: React.FC<ChapterListProps> = ({
  chapters,
  getUnlockStatus,
  onView,
  onEdit,
  onDelete,
  onCreate,
  isLoading = false,
  showActions = true,
}) => {
  const [filter, setFilter] = useState<FilterOption>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Aplicar filtros
  const filteredChapters = chapters.filter((chapter) => {
    switch (filter) {
      case 'all':
        return true;
      case 'unlocked':
        return !chapter.isLocked;
      case 'locked':
        return chapter.isLocked;
      default:
        return chapter.type === filter;
    }
  });

  // Contar por categoría
  const counts = {
    all: chapters.length,
    unlocked: chapters.filter((c) => !c.isLocked).length,
    locked: chapters.filter((c) => c.isLocked).length,
  };

  // Tipos únicos presentes
  const presentTypes = [...new Set(chapters.map((c) => c.type))];

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 dark:text-slate-400">Cargando capitulos...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header con filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary-500" />
            Capitulos ({counts.all})
          </h2>

          {/* Toggle filtros en móvil */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Botón crear */}
        {showActions && (
          <Button onClick={onCreate} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nuevo Capitulo
          </Button>
        )}
      </div>

      {/* Filtros */}
      <AnimatePresence>
        {(showFilters || true) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="flex flex-wrap gap-2">
              {/* Filtros principales */}
              <FilterButton
                active={filter === 'all'}
                onClick={() => setFilter('all')}
                count={counts.all}
              >
                Todos
              </FilterButton>

              <FilterButton
                active={filter === 'unlocked'}
                onClick={() => setFilter('unlocked')}
                count={counts.unlocked}
                icon={<Unlock className="w-3 h-3" />}
              >
                Desbloqueados
              </FilterButton>

              <FilterButton
                active={filter === 'locked'}
                onClick={() => setFilter('locked')}
                count={counts.locked}
                icon={<Lock className="w-3 h-3" />}
              >
                Bloqueados
              </FilterButton>

              {/* Separador */}
              <div className="w-px h-6 bg-gray-200 dark:bg-slate-700 mx-2 self-center hidden sm:block" />

              {/* Filtros por tipo */}
              {presentTypes.map((type) => {
                const config = CHAPTER_TYPE_CONFIGS.find((c) => c.type === type);
                const count = chapters.filter((c) => c.type === type).length;
                return (
                  <FilterButton
                    key={type}
                    active={filter === type}
                    onClick={() => setFilter(type)}
                    count={count}
                    color={config?.color}
                  >
                    {config?.label || type}
                  </FilterButton>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de capítulos */}
      {filteredChapters.length === 0 ? (
        <EmptyState filter={filter} onCreate={onCreate} showActions={showActions} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredChapters.map((chapter) => (
              <motion.div
                key={chapter.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <ChapterCard
                  chapter={chapter}
                  unlockStatus={getUnlockStatus(chapter)}
                  onView={() => onView(chapter)}
                  onEdit={() => onEdit(chapter)}
                  onDelete={() => onDelete(chapter)}
                  showActions={showActions}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

// Componente de botón de filtro
interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
  icon?: React.ReactNode;
  color?: string;
}

const FilterButton: React.FC<FilterButtonProps> = ({
  active,
  onClick,
  children,
  count,
  icon,
  color,
}) => (
  <button
    onClick={onClick}
    className={`
      px-3 py-1.5 rounded-full text-sm font-medium transition-all
      flex items-center gap-1.5
      ${
        active
          ? 'bg-primary-500 text-white shadow-sm'
          : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
      }
    `}
    style={
      active && color
        ? { backgroundColor: color }
        : undefined
    }
  >
    {icon}
    <span>{children}</span>
    {count !== undefined && (
      <span
        className={`
          px-1.5 py-0.5 rounded-full text-xs
          ${active ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-slate-600 text-gray-500 dark:text-slate-400'}
        `}
      >
        {count}
      </span>
    )}
  </button>
);

// Estado vacío
interface EmptyStateProps {
  filter: FilterOption;
  onCreate: () => void;
  showActions: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ filter, onCreate, showActions }) => {
  const getMessage = () => {
    switch (filter) {
      case 'locked':
        return {
          title: 'No hay capitulos bloqueados',
          description: 'Todos tus capitulos estan disponibles para leer.',
        };
      case 'unlocked':
        return {
          title: 'No hay capitulos desbloqueados',
          description: 'Los capitulos se desbloquean cuando tu hijo alcanza la edad indicada.',
        };
      case 'all':
        return {
          title: 'No hay capitulos todavia',
          description: 'Comienza a escribir la historia del tesoro de tu hijo.',
        };
      default:
        const config = CHAPTER_TYPE_CONFIGS.find((c) => c.type === filter);
        return {
          title: `No hay ${config?.label?.toLowerCase() || 'capitulos'} todavia`,
          description: `Crea tu primer ${config?.label?.toLowerCase() || 'capitulo'} para empezar.`,
        };
    }
  };

  const { title, description } = getMessage();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-12 bg-gray-50 dark:bg-slate-800 rounded-xl"
    >
      <BookOpen className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-700 dark:text-slate-300 mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-slate-400 mb-6 max-w-md mx-auto">{description}</p>
      {showActions && filter !== 'locked' && (
        <Button onClick={onCreate} className="flex items-center gap-2 mx-auto">
          <Plus className="w-4 h-4" />
          Crear Capitulo
        </Button>
      )}
    </motion.div>
  );
};
