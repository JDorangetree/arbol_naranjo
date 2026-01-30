import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Sparkles,
  Calendar,
  TrendingUp,
  Heart,
  Filter,
  ChevronDown,
  Image as ImageIcon,
} from 'lucide-react';
import { useAuthStore } from '../../store';
import { getTransactions } from '../../services/firebase/investments';
import { Transaction } from '../../types';
import { formatCurrency, MILESTONE_CONFIG } from '../../utils';
import { Card } from '../../components/common';

export const Moments: React.FC = () => {
  const { user } = useAuthStore();
  const [moments, setMoments] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadMoments = async () => {
      if (!user) return;

      try {
        const transactions = await getTransactions(user.id);
        // Filtrar solo las transacciones que tienen milestone
        const specialMoments = transactions.filter((t) => t.milestone);
        setMoments(specialMoments);
      } catch (error) {
        console.error('Error cargando momentos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMoments();
  }, [user]);

  const filteredMoments = filterType === 'all'
    ? moments
    : moments.filter((m) => m.milestone === filterType);

  // Agrupar momentos por año
  const momentsByYear = filteredMoments.reduce((acc, moment) => {
    const year = moment.date.getFullYear();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(moment);
    return acc;
  }, {} as Record<number, Transaction[]>);

  const years = Object.keys(momentsByYear).sort((a, b) => Number(b) - Number(a));

  const totalInMoments = filteredMoments.reduce((sum, m) => sum + m.totalAmount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-primary-500" />
            Momentos Especiales
          </h1>
          <p className="text-gray-500 mt-1">
            Los recuerdos que construyen el tesoro de tu hijo
          </p>
        </div>

        {/* Resumen */}
        <Card className="bg-gradient-to-r from-primary-50 to-gold-50 border-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
              <Heart className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{filteredMoments.length} momentos</p>
              <p className="text-xl font-bold text-gray-900 money">
                {formatCurrency(totalInMoments, 'COP')}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <div className="relative">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span>Filtrar por tipo</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-3 z-10 min-w-[200px]"
            >
              <button
                onClick={() => { setFilterType('all'); setShowFilters(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  filterType === 'all' ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50'
                }`}
              >
                Todos los momentos
              </button>
              {Object.entries(MILESTONE_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => { setFilterType(key); setShowFilters(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    filterType === key ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <span>{config.icon}</span>
                  <span>{config.label}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Timeline */}
      {moments.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aún no hay momentos especiales
          </h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            Cuando registres una inversión, marca el momento especial que la acompaña.
            Cada inversión puede ser un recuerdo para el futuro.
          </p>
        </Card>
      ) : filteredMoments.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-gray-500">No hay momentos de este tipo aún</p>
        </Card>
      ) : (
        <div className="space-y-8">
          {years.map((year) => (
            <div key={year}>
              {/* Separador de año */}
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                <span className="text-lg font-bold text-gray-400">{year}</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
              </div>

              {/* Momentos del año */}
              <div className="relative">
                {/* Línea vertical del timeline */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-200 via-gold-200 to-growth-200" />

                <div className="space-y-6">
                  {momentsByYear[Number(year)].map((moment, index) => {
                    const config = moment.milestone ? MILESTONE_CONFIG[moment.milestone] : null;

                    return (
                      <motion.div
                        key={moment.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative pl-16"
                      >
                        {/* Círculo del timeline */}
                        <div
                          className="absolute left-3 w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-md"
                          style={{ backgroundColor: config?.color || '#6B7280' }}
                        >
                          <span className="text-white text-xs">{config?.icon}</span>
                        </div>

                        {/* Tarjeta del momento */}
                        <Card className="hover:shadow-lg transition-shadow">
                          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                            {/* Contenido principal */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span
                                  className="px-3 py-1 rounded-full text-sm font-medium text-white"
                                  style={{ backgroundColor: config?.color || '#6B7280' }}
                                >
                                  {config?.icon} {config?.label || 'Momento especial'}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {format(moment.date, "d 'de' MMMM, yyyy", { locale: es })}
                                </span>
                              </div>

                              {moment.note && (
                                <p className="text-gray-700 bg-gray-50 rounded-lg p-3 mb-3 italic">
                                  "{moment.note}"
                                </p>
                              )}

                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                  <TrendingUp className="w-4 h-4 text-growth-500" />
                                  <span className="font-medium">{moment.etfTicker}</span>
                                </div>
                                <span className="text-gray-400">•</span>
                                <span className="money">{moment.units} unidades</span>
                              </div>
                            </div>

                            {/* Monto */}
                            <div className="text-right">
                              <p className="text-2xl font-bold text-growth-600 money">
                                {formatCurrency(moment.totalAmount, 'COP')}
                              </p>
                              <p className="text-xs text-gray-500">invertido</p>
                            </div>
                          </div>

                          {/* Placeholder para foto futura */}
                          {moment.photo && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <img
                                src={moment.photo}
                                alt="Momento especial"
                                className="rounded-lg max-h-48 object-cover"
                              />
                            </div>
                          )}
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
