/**
 * Visor de capítulo
 *
 * Muestra el contenido completo de un capítulo con su narrativa,
 * imágenes adjuntas y metadatos.
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Edit,
  Calendar,
  Clock,
  Tag,
  Link as LinkIcon,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Chapter } from '../../types/emotional.types';
import { Button, Card } from '../common';
import { CHAPTER_TYPE_CONFIGS } from '../../types/emotional.types';

interface ChapterViewerProps {
  chapter: Chapter;
  onClose: () => void;
  onEdit?: () => void;
  showEditButton?: boolean;
}

export const ChapterViewer: React.FC<ChapterViewerProps> = ({
  chapter,
  onClose,
  onEdit,
  showEditButton = true,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const typeConfig = CHAPTER_TYPE_CONFIGS.find((c) => c.type === chapter.type);

  const hasImages = chapter.mediaUrls && chapter.mediaUrls.length > 0;

  const nextImage = () => {
    if (chapter.mediaUrls) {
      setCurrentImageIndex((prev) =>
        prev === chapter.mediaUrls!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (chapter.mediaUrls) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? chapter.mediaUrls!.length - 1 : prev - 1
      );
    }
  };

  // Formatear el contenido (soporte básico de markdown)
  const formatContent = (content: string) => {
    return content
      .split('\n')
      .map((line, index) => {
        // Headers
        if (line.startsWith('# ')) {
          return (
            <h1 key={index} className="text-2xl font-bold text-gray-900 mt-6 mb-3">
              {line.substring(2)}
            </h1>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <h2 key={index} className="text-xl font-semibold text-gray-800 mt-5 mb-2">
              {line.substring(3)}
            </h2>
          );
        }
        if (line.startsWith('### ')) {
          return (
            <h3 key={index} className="text-lg font-medium text-gray-800 mt-4 mb-2">
              {line.substring(4)}
            </h3>
          );
        }
        // Bold text dentro de líneas
        if (line.startsWith('**') && line.endsWith('**')) {
          return (
            <p key={index} className="font-semibold text-gray-800 mb-2">
              {line.slice(2, -2)}
            </p>
          );
        }
        // Líneas vacías
        if (line.trim() === '') {
          return <br key={index} />;
        }
        // Párrafos normales
        return (
          <p key={index} className="text-gray-700 leading-relaxed mb-2">
            {line}
          </p>
        );
      });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b border-gray-100"
          style={{ backgroundColor: typeConfig?.color + '10' }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: typeConfig?.color + '20',
                  color: typeConfig?.color,
                }}
              >
                <span className="text-2xl">
                  {typeConfig?.icon === 'Mail' && '✉️'}
                  {typeConfig?.icon === 'Calendar' && '📅'}
                  {typeConfig?.icon === 'Star' && '⭐'}
                  {typeConfig?.icon === 'Lightbulb' && '💡'}
                  {typeConfig?.icon === 'Users' && '👨‍👩‍👧'}
                  {typeConfig?.icon === 'TrendingUp' && '📈'}
                  {typeConfig?.icon === 'Clock' && '⏰'}
                  {typeConfig?.icon === 'Image' && '🖼️'}
                  {typeConfig?.icon === 'Heart' && '❤️'}
                </span>
              </div>
              <div>
                <p
                  className="text-xs font-medium uppercase tracking-wide"
                  style={{ color: typeConfig?.color }}
                >
                  {typeConfig?.label}
                </p>
                <h2 className="text-xl font-bold text-gray-900">{chapter.title}</h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {showEditButton && onEdit && (
                <Button
                  variant="ghost"
                  onClick={onEdit}
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </Button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Galería de imágenes */}
          {hasImages && (
            <div className="relative bg-gray-100">
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={chapter.mediaUrls![currentImageIndex]}
                  alt={chapter.mediaCaptions?.[currentImageIndex] || 'Imagen del capitulo'}
                  className="w-full h-full object-cover"
                />

                {/* Navegación de imágenes */}
                {chapter.mediaUrls!.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-lg hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-lg hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Indicadores */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {chapter.mediaUrls!.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentImageIndex(i)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            i === currentImageIndex
                              ? 'bg-white'
                              : 'bg-white/50 hover:bg-white/75'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Caption */}
              {chapter.mediaCaptions?.[currentImageIndex] && (
                <p className="px-6 py-3 text-sm text-gray-600 italic bg-gray-50">
                  {chapter.mediaCaptions[currentImageIndex]}
                </p>
              )}
            </div>
          )}

          {/* Contenido principal */}
          <div className="px-6 py-6">
            <div className="prose prose-lg max-w-none">
              {formatContent(chapter.content)}
            </div>
          </div>

          {/* Metadatos */}
          <div className="px-6 pb-6">
            {/* Tags */}
            {chapter.tags && chapter.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Tag className="w-4 h-4 text-gray-400" />
                {chapter.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Años vinculados */}
            {chapter.linkedYears && chapter.linkedYears.length > 0 && (
              <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                <LinkIcon className="w-4 h-4" />
                <span>Vinculado a: {chapter.linkedYears.join(', ')}</span>
              </div>
            )}

            {/* Fechas */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-400 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  Creado:{' '}
                  {(chapter.createdAt instanceof Date
                    ? chapter.createdAt
                    : new Date(chapter.createdAt)
                  ).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>

              {chapter.updatedAt && chapter.updatedAt !== chapter.createdAt && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    Actualizado:{' '}
                    {(chapter.updatedAt instanceof Date
                      ? chapter.updatedAt
                      : new Date(chapter.updatedAt)
                    ).toLocaleDateString('es-CO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1">
                <span>Version {chapter.currentVersion}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer con acción */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="flex justify-end">
            <Button variant="secondary" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
