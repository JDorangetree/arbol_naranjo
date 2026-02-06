/**
 * Página de Inversiones
 *
 * Vista detallada de todas las inversiones con historial de transacciones.
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  ChevronDown,
  DollarSign,
  PieChart,
  Clock,
  Sparkles,
  Gift,
} from 'lucide-react';
import { useAuthStore, useInvestmentStore } from '../../store';
import { useIsReadOnly } from '../../store/useAppModeStore';
import {
  Card,
  CardHeader,
  Button,
  LoadingSpinner,
  Modal,
  Skeleton,
  SkeletonInvestmentCard,
  SkeletonStatCard,
} from '../../components/common';
import { InvestmentForm } from '../../components/investments';
import { NaranjoTree } from '../../components/illustrations';
import { formatCurrency, formatDate } from '../../utils';
import { Investment, Transaction } from '../../types';
import { getTransactionsByInvestment } from '../../services/firebase/investments';
import { getFriendlyErrorMessage, INVESTMENT_ERRORS } from '../../utils/errorMessages';

// Componente para mostrar una inversión expandible
const InvestmentCard: React.FC<{
  investment: Investment;
  userId: string;
  isReadOnly: boolean;
  onAddDividend: (investment: Investment) => void;
}> = ({ investment, userId, isReadOnly, onAddDividend }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTx, setIsLoadingTx] = useState(false);

  const returnIsPositive = investment.returnAbsolute >= 0;
  const returnPercentage = investment.returnPercentage || 0;

  // Cargar transacciones cuando se expande
  useEffect(() => {
    if (isExpanded && transactions.length === 0) {
      setIsLoadingTx(true);
      getTransactionsByInvestment(userId, investment.id)
        .then(setTransactions)
        .catch(console.error)
        .finally(() => setIsLoadingTx(false));
    }
  }, [isExpanded, investment.id, userId, transactions.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden"
    >
      {/* Header de la inversión */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 sm:p-6 text-left hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Icono del ETF */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50 flex items-center justify-center">
              <span className="text-lg sm:text-xl font-bold text-primary-600 dark:text-primary-400">
                {investment.etfTicker?.charAt(0) || 'E'}
              </span>
            </div>

            {/* Info del ETF */}
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 dark:text-white truncate">
                {investment.etfTicker}
              </h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 truncate">
                {investment.etfName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Valor actual */}
            <div className="text-right hidden sm:block">
              <p className="font-bold text-gray-900 dark:text-white money">
                {formatCurrency(investment.currentValue)}
              </p>
              <div className={`flex items-center justify-end gap-1 text-sm ${
                returnIsPositive ? 'text-growth-500' : 'text-red-500'
              }`}>
                {returnIsPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{returnIsPositive ? '+' : ''}{returnPercentage.toFixed(2)}%</span>
              </div>
            </div>

            {/* Botón expandir */}
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </motion.div>
          </div>
        </div>

        {/* Valor en móvil */}
        <div className="mt-3 sm:hidden">
          <p className="font-bold text-gray-900 dark:text-white money">
            {formatCurrency(investment.currentValue)}
          </p>
          <div className={`flex items-center gap-1 text-sm ${
            returnIsPositive ? 'text-growth-500' : 'text-red-500'
          }`}>
            {returnIsPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{returnIsPositive ? '+' : ''}{returnPercentage.toFixed(2)}%</span>
          </div>
        </div>
      </button>

      {/* Contenido expandido */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-gray-100 dark:border-slate-700">
              {/* Estadísticas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 py-4">
                <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Unidades</p>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {investment.totalUnits.toFixed(4)}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Precio promedio</p>
                  <p className="font-bold text-gray-900 dark:text-white money">
                    {formatCurrency(investment.averagePurchasePrice)}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Total invertido</p>
                  <p className="font-bold text-gray-900 dark:text-white money">
                    {formatCurrency(investment.totalInvested)}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Ganancia/Pérdida</p>
                  <p className={`font-bold money ${
                    returnIsPositive ? 'text-growth-500' : 'text-red-500'
                  }`}>
                    {returnIsPositive ? '+' : ''}{formatCurrency(investment.returnAbsolute)}
                  </p>
                </div>
              </div>

              {/* Botón para registrar dividendo */}
              {!isReadOnly && (
                <div className="mt-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<Gift className="w-4 h-4" />}
                    onClick={() => onAddDividend(investment)}
                  >
                    Registrar dividendo
                  </Button>
                </div>
              )}

              {/* Historial de transacciones */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Historial de aportes y dividendos
                </h4>

                {isLoadingTx ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner size="xs" inline />
                  </div>
                ) : transactions.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-4">
                    No hay transacciones registradas
                  </p>
                ) : (
                  <div className="space-y-2">
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            tx.type === 'buy'
                              ? 'bg-growth-100 dark:bg-growth-900/30'
                              : 'bg-gold-100 dark:bg-gold-900/30'
                          }`}>
                            {tx.type === 'buy' ? (
                              <Plus className="w-4 h-4 text-growth-600 dark:text-growth-400" />
                            ) : (
                              <Gift className="w-4 h-4 text-gold-600 dark:text-gold-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {tx.type === 'buy' ? 'Compra' : 'Dividendo'}
                              {tx.type === 'buy' && ` • ${tx.units.toFixed(4)} unidades`}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">
                              {formatDate(tx.date)}
                              {tx.milestone && (
                                <span className="ml-2 inline-flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-gold-500" />
                                  {tx.milestone}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium money ${
                            tx.type === 'dividend' ? 'text-gold-600 dark:text-gold-400' : 'text-gray-900 dark:text-white'
                          }`}>
                            {tx.type === 'dividend' ? '+' : ''}{formatCurrency(tx.totalAmount)}
                          </p>
                          {tx.type === 'buy' && (
                            <p className="text-xs text-gray-500 dark:text-slate-400">
                              @ {formatCurrency(tx.pricePerUnit)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const Investments: React.FC = () => {
  const { user } = useAuthStore();
  const isReadOnly = useIsReadOnly();
  const {
    investments,
    isLoading,
    loadInvestments,
    loadTransactions,
    addInvestment,
    addDividend,
    getPortfolioSummary,
    getTotalDividends,
  } = useInvestmentStore();

  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [showDividendModal, setShowDividendModal] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [dividendAmount, setDividendAmount] = useState('');
  const [dividendDate, setDividendDate] = useState(new Date().toISOString().split('T')[0]);
  const [dividendNote, setDividendNote] = useState('');
  const [isSubmittingDividend, setIsSubmittingDividend] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadInvestments(user.id);
    }
  }, [user, loadInvestments]);

  const portfolio = getPortfolioSummary();

  const handleAddInvestment = async (data: {
    etf: any;
    units: number;
    pricePerUnit: number;
    date: Date;
    note?: string;
    milestone?: string;
  }) => {
    if (!user) return;

    setSubmitError(null);
    try {
      await addInvestment(
        user.id,
        data.etf,
        data.units,
        data.pricePerUnit,
        data.date,
        data.note,
        data.milestone
      );
      setShowInvestmentModal(false);
    } catch (error) {
      const errorMessage = getFriendlyErrorMessage(error);
      setSubmitError(errorMessage);
      // El modal se mantiene abierto para que el usuario pueda reintentar
    }
  };

  const handleOpenDividendModal = (investment: Investment) => {
    setSelectedInvestment(investment);
    setDividendAmount('');
    setDividendDate(new Date().toISOString().split('T')[0]);
    setDividendNote('');
    setShowDividendModal(true);
  };

  const handleAddDividend = async () => {
    if (!user || !selectedInvestment || !dividendAmount) return;

    const amount = parseFloat(dividendAmount);
    if (isNaN(amount) || amount <= 0) return;

    setIsSubmittingDividend(true);
    try {
      await addDividend(
        user.id,
        selectedInvestment.id,
        {
          id: selectedInvestment.etfId,
          ticker: selectedInvestment.etfTicker,
          name: selectedInvestment.etfName,
        },
        amount,
        new Date(dividendDate),
        dividendNote || undefined
      );
      setShowDividendModal(false);
      // Recargar transacciones para actualizar el historial
      await loadTransactions(user.id);
    } catch (error) {
      console.error('Error al registrar dividendo:', error);
    } finally {
      setIsSubmittingDividend(false);
    }
  };

  // Skeleton loading
  if (isLoading && investments.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-pulse">
          <div>
            <Skeleton width="150px" height="32px" className="mb-2" />
            <Skeleton width="200px" height="16px" />
          </div>
          <Skeleton variant="rounded" width="130px" height="40px" className="hidden sm:block" />
        </div>

        {/* Resumen skeleton */}
        <Card className="bg-gradient-to-br from-primary-50 to-growth-50 dark:from-slate-800 dark:to-slate-700">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <Skeleton width="80px" height="12px" className="mb-2" />
                <Skeleton width="100px" height="24px" />
              </div>
            ))}
          </div>
        </Card>

        {/* Lista skeleton */}
        <div className="space-y-4">
          <SkeletonInvestmentCard />
          <SkeletonInvestmentCard />
          <SkeletonInvestmentCard />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {isReadOnly ? 'Mi Naranjo' : 'Inversiones'}
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            {investments.length === 0
              ? 'Aún no hay frutos en el naranjo'
              : `${investments.length} ${investments.length === 1 ? 'fruto' : 'frutos'} creciendo`}
          </p>
        </div>

        {!isReadOnly && investments.length > 0 && (
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => { setSubmitError(null); setShowInvestmentModal(true); }}
          >
            Nuevo aporte
          </Button>
        )}
      </motion.div>

      {/* Resumen del portafolio */}
      {investments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-primary-50 to-growth-50 dark:from-slate-800 dark:to-slate-700">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              <div>
                <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">Total invertido</span>
                </div>
                <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white money">
                  {formatCurrency(portfolio.totalInvested)}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">Valor actual</span>
                </div>
                <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white money">
                  {formatCurrency(portfolio.currentValue)}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 mb-1">
                  {portfolio.totalReturn >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-growth-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-xs sm:text-sm">Rendimiento</span>
                </div>
                <p className={`text-lg sm:text-xl font-bold money ${
                  portfolio.totalReturn >= 0 ? 'text-growth-500' : 'text-red-500'
                }`}>
                  {portfolio.totalReturn >= 0 ? '+' : ''}{formatCurrency(portfolio.totalReturn)}
                </p>
                <p className={`text-xs sm:text-sm ${
                  portfolio.totalReturn >= 0 ? 'text-growth-500' : 'text-red-500'
                }`}>
                  {portfolio.totalReturn >= 0 ? '+' : ''}{portfolio.totalReturnPercentage.toFixed(2)}%
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 mb-1">
                  <PieChart className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">Diversificación</span>
                </div>
                <p className={`text-lg sm:text-xl font-bold ${
                  portfolio.diversificationScore >= 70
                    ? 'text-growth-500'
                    : portfolio.diversificationScore >= 40
                    ? 'text-gold-500'
                    : 'text-gray-500 dark:text-slate-400'
                }`}>
                  {portfolio.diversificationScore >= 70
                    ? 'Alta'
                    : portfolio.diversificationScore >= 40
                    ? 'Media'
                    : 'Baja'}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Lista de inversiones o estado vacío */}
      {investments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="text-center py-12">
            <div className="flex justify-center mb-6">
              <NaranjoTree size="lg" fruitCount={0} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              El naranjo está listo para crecer
            </h2>
            <p className="text-gray-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
              Cada aporte es una semilla que, con el tiempo, se convertirá en un fruto.
              Comienza a cultivar el patrimonio de {user?.childName}.
            </p>
            {!isReadOnly && (
              <Button
                variant="primary"
                size="lg"
                leftIcon={<Plus className="w-5 h-5" />}
                onClick={() => { setSubmitError(null); setShowInvestmentModal(true); }}
              >
                Primer aporte
              </Button>
            )}
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {portfolio.investments.map((investment, index) => (
            <motion.div
              key={investment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <InvestmentCard
                investment={investment}
                userId={user?.id || ''}
                isReadOnly={isReadOnly}
                onAddDividend={handleOpenDividendModal}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal de nueva inversión */}
      <Modal
        isOpen={showInvestmentModal}
        onClose={() => setShowInvestmentModal(false)}
        title="Nuevo aporte"
        size="lg"
      >
        <InvestmentForm
          onSubmit={handleAddInvestment}
          onCancel={() => setShowInvestmentModal(false)}
          error={submitError}
        />
      </Modal>

      {/* Modal de dividendo */}
      <Modal
        isOpen={showDividendModal}
        onClose={() => setShowDividendModal(false)}
        title="Registrar dividendo"
        size="md"
      >
        <div className="space-y-4">
          {selectedInvestment && (
            <div className="p-3 bg-gold-50 dark:bg-gold-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-gold-600 dark:text-gold-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedInvestment.etfTicker}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    {selectedInvestment.etfName}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Monto del dividendo (COP)
            </label>
            <input
              type="number"
              value={dividendAmount}
              onChange={(e) => setDividendAmount(e.target.value)}
              placeholder="0"
              min="0"
              step="100"
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Fecha de pago
            </label>
            <input
              type="date"
              value={dividendDate}
              onChange={(e) => setDividendDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Nota (opcional)
            </label>
            <textarea
              value={dividendNote}
              onChange={(e) => setDividendNote(e.target.value)}
              placeholder="Ej: Dividendo trimestral Q1 2026"
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowDividendModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              className="flex-1 !bg-gold-500 hover:!bg-gold-600"
              onClick={handleAddDividend}
              isLoading={isSubmittingDividend}
              disabled={!dividendAmount || parseFloat(dividendAmount) <= 0}
            >
              Registrar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
