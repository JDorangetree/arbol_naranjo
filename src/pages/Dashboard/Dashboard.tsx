import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useAuthStore, useInvestmentStore, useMarketStore } from '../../store';
import { useIsReadOnly } from '../../store/useAppModeStore';
import { DashboardSummary, RecentActivity } from '../../components/dashboard';
import { InvestmentList, InvestmentForm } from '../../components/investments';
import { Button, Card, CardHeader, Modal } from '../../components/common';
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
      loadTransactions(user.id, 10);
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
  };

  if (isLoading && investments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Cargando tu portafolio...</p>
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
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
              {isReadOnly ? 'Mi Tesoro' : `El Tesoro de ${user?.childName}`}
            </h1>
            <p className="text-gray-500 mt-0.5 sm:mt-1 text-sm sm:text-base line-clamp-2">
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
                <h3 className="font-semibold text-gray-900 mb-2">
                  ¡Es hora de comenzar a invertir!
                </h3>
                <p className="text-gray-500 text-sm mb-4">
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
