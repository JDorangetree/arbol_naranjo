/**
 * Editor de Carta Especial para el Reporte Anual
 *
 * Permite al usuario escribir una carta personalizada que reemplaza
 * la introducción automática en el PDF del reporte.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Edit3, X, FileText, Sparkles } from 'lucide-react';
import { Button, Card } from '../common';

interface SpecialLetterEditorProps {
  /** Valor inicial de la carta (si existe) */
  initialValue?: string;
  /** Nombre del niño para personalizar el placeholder */
  childName: string;
  /** Año del reporte */
  year: number;
  /** Callback cuando se guarda la carta */
  onSave: (letter: string) => Promise<void>;
  /** Deshabilitar edición */
  disabled?: boolean;
}

export const SpecialLetterEditor: React.FC<SpecialLetterEditorProps> = ({
  initialValue,
  childName,
  year,
  onSave,
  disabled,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [letter, setLetter] = useState(initialValue || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sincronizar con valor inicial cuando cambia
  useEffect(() => {
    setLetter(initialValue || '');
  }, [initialValue]);

  const defaultPlaceholder = `Querido ${childName},

Este año ${year} fue muy especial para nosotros...

[Escribe tu carta especial aquí. Puedes contar lo que vivieron juntos, los momentos importantes del año, tus sentimientos y deseos para el futuro de ${childName}.]

Con todo mi amor,
Tu familia`;

  const handleSave = async () => {
    if (!letter.trim()) {
      setError('La carta no puede estar vacía');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(letter);
      setIsEditing(false);
    } catch (err) {
      setError('Error al guardar la carta. Por favor intenta de nuevo.');
      console.error('Error guardando carta especial:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setLetter(initialValue || '');
    setIsEditing(false);
    setError(null);
  };

  // Vista cuando ya existe una carta
  if (!isEditing && initialValue) {
    return (
      <Card className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-800/50 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h4 className="font-semibold text-amber-800 dark:text-amber-300">
                Tu Carta Especial
              </h4>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Esta carta aparecerá en el PDF
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            disabled={disabled}
            className="text-amber-700 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-200"
          >
            <Edit3 className="w-4 h-4 mr-1" />
            Editar
          </Button>
        </div>
        <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-4 border border-amber-100 dark:border-amber-800">
          <p className="text-amber-900 dark:text-amber-100 whitespace-pre-line text-sm leading-relaxed">
            {initialValue.length > 300 ? `${initialValue.substring(0, 300)}...` : initialValue}
          </p>
        </div>
      </Card>
    );
  }

  // Vista de edición o creación
  return (
    <Card className="p-5">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-800/50 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {initialValue ? 'Editar Carta Especial' : 'Escribe tu Carta Especial'}
            </h4>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Reemplaza la introducción automática del PDF
            </p>
          </div>
        </div>
        {isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={isSaving}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <textarea
        value={letter}
        onChange={(e) => {
          setLetter(e.target.value);
          setError(null);
        }}
        placeholder={defaultPlaceholder}
        className="w-full h-56 p-4 border border-gray-200 dark:border-slate-700 rounded-xl resize-none
                   bg-white dark:bg-slate-800 text-gray-900 dark:text-white
                   placeholder:text-gray-400 dark:placeholder:text-slate-500
                   focus:ring-2 focus:ring-primary-500 focus:border-transparent
                   transition-all duration-200"
        disabled={disabled || isSaving}
      />

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-red-500 mt-2"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mt-4">
        <p className="text-xs text-gray-500 dark:text-slate-400">
          {letter.length} caracteres
        </p>
        <div className="flex gap-2">
          {initialValue && (
            <Button
              variant="ghost"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancelar
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={disabled || isSaving || !letter.trim()}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              'Guardando...'
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar Carta
              </>
            )}
          </Button>
        </div>
      </div>

      {!initialValue && (
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-3 text-center">
          Si no escribes una carta, se usará una introducción generada automáticamente
        </p>
      )}
    </Card>
  );
};
