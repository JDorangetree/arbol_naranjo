/**
 * Tarjeta que muestra la tasa de cambio USD/COP
 */

import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, RefreshCw, Clock } from 'lucide-react';
import { useMarketStore } from '../../store';
import { Card } from '../common';

// Formatea la fecha mostrando hora exacta
const formatExactTime = (date: Date | null): string => {
  if (!date) return 'Nunca';
  const d = new Date(date);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();

  const timeStr = d.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isToday) {
    return `Hoy ${timeStr}`;
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return `Ayer ${timeStr}`;
  }

  return d.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
  }) + ` ${timeStr}`;
};

export const ExchangeRateCard: React.FC = () => {
  const {
    exchangeRate,
    lastUpdated,
    isLoading,
    errors,
    refreshExchangeRate,
  } = useMarketStore();

  const hasErrors = errors.length > 0;

  // Formatear la tasa de cambio
  const formattedRate = new Intl.NumberFormat('es-CO', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(exchangeRate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <Card className="p-4">
        <div className="flex items-center justify-between">
          {/* Info de la tasa */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-trust-100 dark:bg-trust-900/30">
              <DollarSign className="w-5 h-5 text-trust-600 dark:text-trust-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Tasa de cambio USD/COP
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                $1 USD = ${formattedRate} COP
              </p>
            </div>
          </div>

          {/* Estado y acciones */}
          <div className="flex items-center gap-2">
            {/* Indicador de estado */}
            <div className="text-right">
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                <Clock className="w-3 h-3" />
                <span>{formatExactTime(lastUpdated)}</span>
              </div>

              {hasErrors && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">
                  {errors[0]}
                </p>
              )}
            </div>

            {/* Botón de actualizar - siempre visible */}
            <button
              onClick={() => refreshExchangeRate()}
              disabled={isLoading}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              title="Actualizar tasa de cambio"
            >
              <RefreshCw className={`w-4 h-4 text-gray-500 dark:text-slate-400 ${
                isLoading ? 'animate-spin' : ''
              }`} />
            </button>
          </div>
        </div>

        {/* Fuente de datos */}
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
          <p className="text-xs text-gray-400 dark:text-slate-500">
            Fuente: <span className="font-medium">ExchangeRate-API</span> ·
            Actualización automática diaria a las 6:00 AM
          </p>
        </div>
      </Card>
    </motion.div>
  );
};
