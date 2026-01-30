/**
 * Componente de tarjeta para un capítulo
 *
 * Muestra un resumen del capítulo con su tipo, título y excerpt.
 * Para capítulos bloqueados, muestra el componente LockedChapter.
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Calendar,
  Star,
  Lightbulb,
  Users,
  TrendingUp,
  Clock,
  Image,
  Heart,
  BookOpen,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import { Chapter, UnlockStatus, ChapterType } from '../../types/emotional.types';
import { Card } from '../common';
import { LockedChapter } from './LockedChapter';
import { CHAPTER_TYPE_CONFIGS } from '../../types/emotional.types';

interface ChapterCardProps {
  chapter: Chapter;
  unlockStatus?: UnlockStatus | null;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

// Mapeo de iconos por tipo
const ICON_MAP: Record<ChapterType, React.ReactNode> = {
  letter: <Mail className="w-5 h-5" />,
  yearly_reflection: <Calendar className="w-5 h-5" />,
  milestone_story: <Star className="w-5 h-5" />,
  lesson_learned: <Lightbulb className="w-5 h-5" />,
  family_story: <Users className="w-5 h-5" />,
  financial_education: <TrendingUp className="w-5 h-5" />,
  future_message: <Clock className="w-5 h-5" />,
  memory: <Image className="w-5 h-5" />,
  wish: <Heart className="w-5 h-5" />,
};

export const ChapterCard: React.FC<ChapterCardProps> = ({
  chapter,
  unlockStatus,
  onView,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const typeConfig = CHAPTER_TYPE_CONFIGS.find((c) => c.type === chapter.type);

  // Si está bloqueado, mostrar componente de bloqueado
  if (chapter.isLocked && unlockStatus) {
    return <LockedChapter chapter={chapter} unlockStatus={unlockStatus} onClick={onView} />;
  }

  const icon = ICON_MAP[chapter.type] || <BookOpen className="w-5 h-5" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="relative"
    >
      <Card
        className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={onView}
      >
        {/* Encabezado */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            {/* Icono del tipo */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: typeConfig?.color + '20',
                color: typeConfig?.color,
              }}
            >
              {icon}
            </div>

            <div>
              <p
                className="text-xs font-medium uppercase tracking-wide mb-1"
                style={{ color: typeConfig?.color }}
              >
                {typeConfig?.label || 'Capitulo'}
              </p>
              <h3 className="text-lg font-semibold text-gray-900">
                {chapter.title}
              </h3>
            </div>
          </div>

          {/* Menú de acciones */}
          {showActions && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {showMenu && (
                <>
                  {/* Overlay para cerrar */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                    }}
                  />

                  {/* Menú dropdown */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[140px]"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onView?.();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Ver
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onEdit?.();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onDelete?.();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  </motion.div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Excerpt o preview del contenido */}
        {(chapter.excerpt || chapter.content) && (
          <p className="text-gray-600 text-sm line-clamp-3 mb-4">
            {chapter.excerpt || chapter.content.substring(0, 150) + '...'}
          </p>
        )}

        {/* Tags */}
        {chapter.tags && chapter.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {chapter.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {chapter.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                +{chapter.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer con metadatos */}
        <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-100">
          <span>
            {chapter.createdAt instanceof Date
              ? chapter.createdAt.toLocaleDateString('es-CO', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : new Date(chapter.createdAt).toLocaleDateString('es-CO', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
          </span>

          {chapter.publishedAt && (
            <span className="flex items-center gap-1 text-growth-500">
              <Eye className="w-3 h-3" />
              Publicado
            </span>
          )}

          {chapter.unlockAge && !chapter.isLocked && (
            <span className="text-primary-500">
              Desbloqueado
            </span>
          )}
        </div>

        {/* Borde decorativo */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl"
          style={{ backgroundColor: typeConfig?.color || '#gray' }}
        />
      </Card>
    </motion.div>
  );
};
