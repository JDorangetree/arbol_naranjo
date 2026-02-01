/**
 * Componente para mostrar un capítulo bloqueado
 *
 * Muestra un teaser del contenido con información sobre
 * cuándo se desbloqueará (por edad o fecha).
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Clock, Gift, Calendar } from 'lucide-react';
import { Chapter, UnlockStatus } from '../../types/emotional.types';
import { Card } from '../common';
import { CHAPTER_TYPE_CONFIGS } from '../../types/emotional.types';

interface LockedChapterProps {
  chapter: Chapter;
  unlockStatus: UnlockStatus;
  onClick?: () => void;
}

export const LockedChapter: React.FC<LockedChapterProps> = ({
  chapter,
  unlockStatus,
  onClick,
}) => {
  const typeConfig = CHAPTER_TYPE_CONFIGS.find((c) => c.type === chapter.type);

  const getUnlockMessage = (): string => {
    if (unlockStatus.yearsUntilUnlock !== undefined) {
      if (unlockStatus.yearsUntilUnlock <= 1) {
        return 'Se desbloqueara pronto...';
      }
      return `Se desbloqueara en ${unlockStatus.yearsUntilUnlock} años`;
    }
    if (unlockStatus.daysUntilUnlock !== undefined) {
      if (unlockStatus.daysUntilUnlock <= 30) {
        return 'Se desbloqueara muy pronto...';
      }
      const months = Math.ceil(unlockStatus.daysUntilUnlock / 30);
      return `Se desbloqueara en ${months} meses`;
    }
    return 'Contenido bloqueado';
  };

  const getUnlockIcon = () => {
    if (unlockStatus.yearsUntilUnlock !== undefined && unlockStatus.yearsUntilUnlock <= 2) {
      return <Gift className="w-5 h-5" />;
    }
    if (unlockStatus.daysUntilUnlock !== undefined && unlockStatus.daysUntilUnlock <= 60) {
      return <Clock className="w-5 h-5" />;
    }
    return <Lock className="w-5 h-5" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: onClick ? 1.02 : 1 }}
      onClick={onClick}
      className={onClick ? 'cursor-pointer' : ''}
    >
      <Card className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 border-gray-200 dark:border-slate-700">
        {/* Overlay con patrón */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                currentColor 10px,
                currentColor 11px
              )`,
            }}
          />
        </div>

        <div className="relative p-6">
          {/* Encabezado */}
          <div className="flex items-start gap-4 mb-4">
            {/* Icono del tipo */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center opacity-50"
              style={{ backgroundColor: typeConfig?.color + '20' }}
            >
              <Lock className="w-6 h-6 text-gray-400 dark:text-slate-500" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 text-gray-400 dark:text-slate-500 text-sm mb-1">
                {getUnlockIcon()}
                <span>{getUnlockMessage()}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-500 dark:text-slate-400">
                {chapter.title}
              </h3>
              <p className="text-sm text-gray-400 dark:text-slate-500">
                {typeConfig?.label || 'Capitulo'}
              </p>
            </div>
          </div>

          {/* Teaser */}
          {chapter.lockedTeaser ? (
            <div className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-4 border border-gray-200 dark:border-slate-600">
              <p className="text-gray-500 dark:text-slate-400 italic">
                "{chapter.lockedTeaser}"
              </p>
            </div>
          ) : (
            <div className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-4 border border-gray-200 dark:border-slate-600 text-center">
              <p className="text-gray-400 dark:text-slate-500">
                Hay algo especial esperandote...
              </p>
            </div>
          )}

          {/* Info de desbloqueo */}
          <div className="mt-4 flex items-center justify-between text-sm">
            {unlockStatus.unlockAge && (
              <div className="flex items-center gap-2 text-gray-400 dark:text-slate-500">
                <Calendar className="w-4 h-4" />
                <span>
                  Se desbloquea a los {unlockStatus.unlockAge} años
                </span>
              </div>
            )}
            {unlockStatus.unlockDate && (
              <div className="flex items-center gap-2 text-gray-400 dark:text-slate-500">
                <Calendar className="w-4 h-4" />
                <span>
                  Se desbloquea el{' '}
                  {unlockStatus.unlockDate.toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Borde decorativo inferior */}
        <div
          className="h-1 opacity-30"
          style={{ backgroundColor: typeConfig?.color || '#gray' }}
        />
      </Card>
    </motion.div>
  );
};
