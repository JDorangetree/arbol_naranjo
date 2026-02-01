/**
 * Componente para cargar fotos en los capítulos de "Mi Historia"
 *
 * Permite arrastrar y soltar imágenes, previsualizarlas,
 * agregar descripciones y reordenarlas.
 */

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  ImagePlus,
  X,
  GripVertical,
  Upload,
  AlertCircle,
  Check,
  Loader2,
} from 'lucide-react';
import { validateImageFile, compressImage } from '../../services/firebase/storageService';

export interface MediaItem {
  id: string;
  file?: File;
  url?: string;
  caption: string;
  isUploading?: boolean;
  uploadProgress?: number;
  isExisting?: boolean;
}

interface MediaUploaderProps {
  items: MediaItem[];
  onChange: (items: MediaItem[]) => void;
  maxItems?: number;
  disabled?: boolean;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  items,
  onChange,
  maxItems = 10,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateId = () => `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    setError(null);
    const fileArray = Array.from(files);
    const remainingSlots = maxItems - items.length;

    if (fileArray.length > remainingSlots) {
      setError(`Solo puedes agregar ${remainingSlots} foto${remainingSlots !== 1 ? 's' : ''} más`);
      return;
    }

    const newItems: MediaItem[] = [];

    for (const file of fileArray) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setError(validation.error || 'Archivo no válido');
        continue;
      }

      // Comprimir imagen si es muy grande
      let processedFile = file;
      if (file.size > 2 * 1024 * 1024) {
        try {
          processedFile = await compressImage(file);
        } catch {
          // Si falla la compresión, usar el original
        }
      }

      // Crear URL de previsualización
      const previewUrl = URL.createObjectURL(processedFile);

      newItems.push({
        id: generateId(),
        file: processedFile,
        url: previewUrl,
        caption: '',
        isUploading: false,
      });
    }

    if (newItems.length > 0) {
      onChange([...items, ...newItems]);
    }
  }, [items, maxItems, onChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [disabled, handleFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    // Limpiar el input para permitir seleccionar el mismo archivo
    e.target.value = '';
  }, [handleFiles]);

  const handleRemoveItem = useCallback((id: string) => {
    const item = items.find(i => i.id === id);
    // Revocar URL de previsualización si no es una imagen existente
    if (item?.url && item.file) {
      URL.revokeObjectURL(item.url);
    }
    onChange(items.filter(i => i.id !== id));
  }, [items, onChange]);

  const handleCaptionChange = useCallback((id: string, caption: string) => {
    onChange(items.map(item =>
      item.id === id ? { ...item, caption } : item
    ));
  }, [items, onChange]);

  const handleReorder = useCallback((newOrder: MediaItem[]) => {
    onChange(newOrder);
  }, [onChange]);

  const canAddMore = items.length < maxItems;

  return (
    <div className="space-y-4">
      {/* Área de drop */}
      {canAddMore && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`
            relative border-2 border-dashed rounded-xl p-6 text-center transition-all
            ${isDragging
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-300 dark:border-slate-600 hover:border-primary-400 dark:hover:border-primary-500'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,.heic,.heif"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
          />

          <div className="flex flex-col items-center gap-2">
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center
              ${isDragging
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
              }
            `}>
              {isDragging ? (
                <Upload className="w-6 h-6" />
              ) : (
                <ImagePlus className="w-6 h-6" />
              )}
            </div>

            <div>
              <p className="font-medium text-gray-700 dark:text-slate-300">
                {isDragging ? 'Suelta las fotos aquí' : 'Arrastra fotos o haz clic'}
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                JPG, PNG, WEBP, GIF o HEIC (iPhone) • Máximo 10MB por foto
              </p>
            </div>

            <p className="text-xs text-gray-400 dark:text-slate-500">
              {items.length} de {maxItems} fotos
            </p>
          </div>
        </motion.div>
      )}

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-3 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg text-sm"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto p-1 hover:bg-primary-100 dark:hover:bg-primary-800/50 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de imágenes */}
      {items.length > 0 && (
        <Reorder.Group
          axis="y"
          values={items}
          onReorder={handleReorder}
          className="space-y-3"
        >
          {items.map((item) => (
            <MediaItemCard
              key={item.id}
              item={item}
              onRemove={() => handleRemoveItem(item.id)}
              onCaptionChange={(caption) => handleCaptionChange(item.id, caption)}
              disabled={disabled}
            />
          ))}
        </Reorder.Group>
      )}
    </div>
  );
};

interface MediaItemCardProps {
  item: MediaItem;
  onRemove: () => void;
  onCaptionChange: (caption: string) => void;
  disabled: boolean;
}

const MediaItemCard: React.FC<MediaItemCardProps> = ({
  item,
  onRemove,
  onCaptionChange,
  disabled,
}) => {
  return (
    <Reorder.Item
      value={item}
      dragListener={!disabled}
      className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm"
    >
      <div className="flex gap-3 p-3">
        {/* Handle para arrastrar */}
        <div className="flex-shrink-0 flex items-center">
          <GripVertical className="w-5 h-5 text-gray-400 dark:text-slate-500 cursor-grab active:cursor-grabbing" />
        </div>

        {/* Imagen de previsualización */}
        <div className="flex-shrink-0 relative">
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-700">
            {item.url ? (
              <img
                src={item.url}
                alt={item.caption || 'Foto'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImagePlus className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Indicador de estado */}
          {item.isUploading && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}

          {item.isExisting && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-growth-500 rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        {/* Campo de descripción */}
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={item.caption}
            onChange={(e) => onCaptionChange(e.target.value)}
            placeholder="Describe este momento..."
            disabled={disabled || item.isUploading}
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
          />
          <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
            {item.file
              ? `${(item.file.size / 1024 / 1024).toFixed(1)} MB`
              : 'Guardada'}
          </p>
        </div>

        {/* Botón eliminar */}
        <button
          onClick={onRemove}
          disabled={disabled || item.isUploading}
          className="flex-shrink-0 p-2 text-gray-400 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          title="Eliminar foto"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Barra de progreso */}
      {item.isUploading && item.uploadProgress !== undefined && (
        <div className="h-1 bg-gray-200 dark:bg-slate-700">
          <motion.div
            className="h-full bg-primary-500"
            initial={{ width: 0 }}
            animate={{ width: `${item.uploadProgress}%` }}
          />
        </div>
      )}
    </Reorder.Item>
  );
};
