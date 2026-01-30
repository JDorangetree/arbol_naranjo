/**
 * Formulario para crear/editar capítulos
 *
 * Permite crear y editar capítulos con soporte para:
 * - Diferentes tipos de contenido
 * - Edad de desbloqueo
 * - Tags
 * - Plantillas de contenido
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Save,
  BookOpen,
  Lock,
  Tag,
  FileText,
  Sparkles,
} from 'lucide-react';
import { Button, Card, Input } from '../common';
import {
  Chapter,
  ChapterType,
  CHAPTER_TYPE_CONFIGS,
  CHAPTER_TEMPLATES,
} from '../../types/emotional.types';

interface ChapterFormProps {
  chapter?: Chapter | null;
  onSubmit: (data: {
    title: string;
    type: ChapterType;
    content: string;
    excerpt?: string;
    unlockAge?: number;
    lockedTeaser?: string;
    tags?: string[];
  }) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

export const ChapterForm: React.FC<ChapterFormProps> = ({
  chapter,
  onSubmit,
  onCancel,
  isSaving = false,
}) => {
  const isEditing = !!chapter;

  // Form state
  const [title, setTitle] = useState(chapter?.title || '');
  const [type, setType] = useState<ChapterType>(chapter?.type || 'letter');
  const [content, setContent] = useState(chapter?.content || '');
  const [excerpt, setExcerpt] = useState(chapter?.excerpt || '');
  const [unlockAge, setUnlockAge] = useState<number | undefined>(chapter?.unlockAge);
  const [lockedTeaser, setLockedTeaser] = useState(chapter?.lockedTeaser || '');
  const [tagsInput, setTagsInput] = useState(chapter?.tags?.join(', ') || '');
  const [showTemplateHint, setShowTemplateHint] = useState(false);

  // Obtener config del tipo actual
  const typeConfig = CHAPTER_TYPE_CONFIGS.find((c) => c.type === type);

  // Actualizar contenido cuando cambia el tipo (solo si está vacío)
  useEffect(() => {
    if (!isEditing && !content) {
      setShowTemplateHint(true);
    }
  }, [type, isEditing, content]);

  // Aplicar plantilla
  const applyTemplate = () => {
    setContent(CHAPTER_TEMPLATES[type] || '');
    setShowTemplateHint(false);
  };

  // Parsear tags del input
  const parseTags = (input: string): string[] => {
    return input
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await onSubmit({
      title,
      type,
      content,
      excerpt: excerpt || undefined,
      unlockAge,
      lockedTeaser: lockedTeaser || undefined,
      tags: parseTags(tagsInput),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary-500" />
              {isEditing ? 'Editar Capítulo' : 'Nuevo Capítulo'}
            </h2>
            <button
              type="button"
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form body */}
          <div className="px-6 py-6 space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto">
            {/* Tipo de capítulo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de contenido
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CHAPTER_TYPE_CONFIGS.map((config) => (
                  <button
                    key={config.type}
                    type="button"
                    onClick={() => setType(config.type)}
                    className={`
                      p-3 rounded-xl text-left transition-all border-2
                      ${type === config.type
                        ? 'border-current shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                    style={{
                      borderColor: type === config.type ? config.color : undefined,
                      backgroundColor: type === config.type ? config.color + '10' : undefined,
                    }}
                  >
                    <p
                      className="font-medium text-sm"
                      style={{ color: type === config.type ? config.color : '#374151' }}
                    >
                      {config.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                      {config.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título del capítulo"
                required
              />
            </div>

            {/* Contenido */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Contenido
                </label>
                {showTemplateHint && !content && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={applyTemplate}
                    className="flex items-center gap-1 text-primary-500"
                  >
                    <Sparkles className="w-4 h-4" />
                    Usar plantilla
                  </Button>
                )}
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escribe el contenido de tu capítulo... (Puedes usar Markdown)"
                className="w-full h-64 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Puedes usar Markdown: **negrita**, # títulos, - listas
              </p>
            </div>

            {/* Extracto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Extracto (opcional)
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Un breve resumen para mostrar en la lista de capítulos..."
                className="w-full h-20 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              />
            </div>

            {/* Configuración de desbloqueo */}
            <Card className="p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-gray-500" />
                <h3 className="font-medium text-gray-900">Desbloqueo por edad</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    ¿A qué edad podrá leer este capítulo?
                  </label>
                  <div className="flex items-center gap-3">
                    <select
                      value={unlockAge || ''}
                      onChange={(e) =>
                        setUnlockAge(e.target.value ? Number(e.target.value) : undefined)
                      }
                      className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Siempre visible</option>
                      <option value="6">6 años</option>
                      <option value="8">8 años</option>
                      <option value="10">10 años</option>
                      <option value="12">12 años</option>
                      <option value="15">15 años</option>
                      <option value="18">18 años</option>
                      <option value="21">21 años</option>
                      <option value="25">25 años</option>
                      <option value="30">30 años</option>
                    </select>

                    {/* Edades sugeridas */}
                    {typeConfig?.suggestedUnlockAges && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">Sugerido:</span>
                        {typeConfig.suggestedUnlockAges.map((age) => (
                          <button
                            key={age}
                            type="button"
                            onClick={() => setUnlockAge(age)}
                            className={`
                              px-2 py-1 text-xs rounded-full transition-colors
                              ${unlockAge === age
                                ? 'bg-primary-500 text-white'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                              }
                            `}
                          >
                            {age}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Teaser para contenido bloqueado */}
                {unlockAge && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      Mensaje mientras está bloqueado (opcional)
                    </label>
                    <Input
                      value={lockedTeaser}
                      onChange={(e) => setLockedTeaser(e.target.value)}
                      placeholder={`"Tengo algo especial que contarte cuando cumplas ${unlockAge}..."`}
                    />
                  </div>
                )}
              </div>
            </Card>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Etiquetas (opcional)
              </label>
              <Input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="familia, amor, inversión, educación (separadas por coma)"
              />
              {tagsInput && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {parseTags(tagsInput).map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSaving || !title || !content}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear capítulo'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
