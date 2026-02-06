import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useAuthStore, useInvestmentStore, useMarketStore } from '../../store';
import { useIsReadOnly } from '../../store/useAppModeStore';
import { DashboardSummary, RecentActivity, ExchangeRateCard } from '../../components/dashboard';
import { InvestmentList, InvestmentForm } from '../../components/investments';
import {
  Button,
  Card,
  CardHeader,
  Modal,
  Skeleton,
  SkeletonDashboardSummary,
  SkeletonNaranjoEvolutivo,
  SkeletonInvestmentList,
  SkeletonRecentActivity,
} from '../../components/common';
import { NaranjoTree, NaranjoEvolutivo } from '../../components/illustrations';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const isReadOnly = useIsReadOnly();
  const {
    investments,
    isLoading,
    loadInvestments,
    loadTransactions,
    addInvestment,
    getPortfolioSummary,
  } = useInvestmentStore();
  const { fetchPricesIfNeeded } = useMarketStore();

  const [showInvestmentModal, setShowInvestmentModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadInvestments(user.id);
      loadTransactions(user.id); // Cargar todas para conteo correcto
    }
  }, [user, loadInvestments, loadTransactions]);

  // Actualizar precios una vez al día (si hay API key configurada)
  useEffect(() => {
    if (investments.length > 0) {
      fetchPricesIfNeeded();
    }
  }, [investments.length, fetchPricesIfNeeded]);

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
      console.error('Error al registrar inversión:', error);
      // El modal se mantiene abierto para que el usuario pueda reintentar
    }
  };

  // Skeleton loading - muestra la estructura mientras carga
  if (isLoading && investments.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 animate-pulse">
          <div className="flex items-center gap-3 sm:gap-4">
            <Skeleton variant="rounded" width="64px" height="64px" />
            <div>
              <Skeleton width="200px" height="28px" className="mb-2" />
              <Skeleton width="280px" height="16px" />
            </div>
          </div>
          <Skeleton variant="rounded" width="140px" height="40px" className="hidden sm:block" />
        </div>

        {/* Naranjo Evolutivo skeleton */}
        <SkeletonNaranjoEvolutivo />

        {/* Stats skeleton */}
        <SkeletonDashboardSummary />

        {/* Grid skeleton */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <div className="p-4 border-b border-gray-100 dark:border-slate-700">
              <Skeleton width="120px" height="18px" />
            </div>
            <div className="p-4">
              <SkeletonInvestmentList count={2} />
            </div>
          </Card>
          <SkeletonRecentActivity count={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header con bienvenida */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="shrink-0">
            <NaranjoTree size="sm" fruitCount={Math.min(investments.length + 1, 7)} animated={false} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white truncate">
              {isReadOnly ? 'Mi Tesoro' : `El Tesoro de ${user?.childName}`}
            </h1>
            <p className="text-gray-500 dark:text-slate-400 mt-0.5 sm:mt-1 text-sm sm:text-base line-clamp-2">
              {isReadOnly
                ? 'Tu naranjo sigue creciendo, protegido y con paciencia'
                : 'Cultivando un futuro sólido, fruto a fruto'}
            </p>
          </div>
        </div>

        {!isReadOnly && (
          <div className="flex gap-3 shrink-0">
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4 sm:w-5 sm:h-5" />}
              onClick={() => setShowInvestmentModal(true)}
              className="w-full sm:w-auto"
            >
              <span className="sm:inline">Nuevo aporte</span>
            </Button>
          </div>
        )}
      </motion.div>

      {/* Visualización evolutiva del Naranjo y Torre */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <NaranjoEvolutivo
          totalValue={portfolio.currentValue}
          totalInvested={portfolio.totalInvested}
          childName={user?.childName || ''}
        />
      </motion.div>

      {/* Resumen de estadísticas */}
      <DashboardSummary portfolio={portfolio} />

      {/* Tasa de cambio USD/COP */}
      {!isReadOnly && <ExchangeRateCard />}

      {/* Grid de contenido */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Inversiones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader
              title={isReadOnly ? 'Mi naranjo' : 'Mis inversiones'}
              subtitle={`${investments.length} ${investments.length === 1 ? 'fruto' : 'frutos'}`}
              action={
                !isReadOnly && investments.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowInvestmentModal(true)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                )
              }
            />
            {investments.length === 0 ? (
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <NaranjoTree size="md" fruitCount={0} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  ¡Es hora de comenzar a invertir!
                </h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm mb-4">
                  El patrimonio de {user?.childName} está listo para crecer
                </p>
                {!isReadOnly && (
                  <Button
                    variant="primary"
                    onClick={() => setShowInvestmentModal(true)}
                  >
                    Primer aporte
                  </Button>
                )}
              </div>
            ) : (
              <InvestmentList investments={investments} />
            )}
          </Card>
        </motion.div>

        {/* Actividad reciente */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <RecentActivity transactions={portfolio.recentTransactions} />
        </motion.div>
      </div>

      {/* Modal de nueva inversión */}
      <Modal
        isOpen={showInvestmentModal}
        onClose={() => setShowInvestmentModal(false)}
        title="Nueva inversión"
        size="lg"
      >
        <InvestmentForm
          onSubmit={handleAddInvestment}
          onCancel={() => setShowInvestmentModal(false)}
        />
      </Modal>
    </div>
  );
};
