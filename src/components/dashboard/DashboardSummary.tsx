import React from 'react';
import { motion } from 'framer-motion';
import {
  PiggyBank,
  Clock,
} from 'lucide-react';
import { StatCard } from '../common';
import { PortfolioSummary } from '../../types';
import { formatCurrency } from '../../utils';

interface DashboardSummaryProps {
  portfolio: PortfolioSummary;
}

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({
  portfolio,
}) => {
  // Calcular tiempo transcurrido desde la primera inversión
  const getTimeDescription = (): string => {
    if (!portfolio.recentTransactions.length && !portfolio.lastContributionDate) {
      return '';
    }

    // Buscar la fecha más antigua
    const firstDate = portfolio.lastContributionDate;
    if (!firstDate) return '';

    const now = new Date();
    const diffTime = Math.abs(now.getTime() - firstDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return `${diffDays} días construyendo`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses construyendo`;
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    if (months > 0) return `${years} año${years > 1 ? 's' : ''} y ${months} mes${months > 1 ? 'es' : ''} construyendo`;
    return `${years} año${years > 1 ? 's' : ''} construyendo`;
  };

  const timeDescription = getTimeDescription();

  // Dos métricas: lo aportado y lo que el tiempo ha hecho con ello
  const stats = [
    {
      label: 'Lo que has aportado',
      value: formatCurrency(portfolio.totalInvested),
      icon: <PiggyBank className="w-8 h-8" />,
      color: 'default' as const,
      subvalue: portfolio.investmentCount > 0 ? `${portfolio.investmentCount} decisiones registradas` : undefined,
    },
    {
      label: 'Lo que el tiempo ha construido',
      value: formatCurrency(portfolio.currentValue),
      icon: <Clock className="w-8 h-8" />,
      color: 'default' as const,
      subvalue: timeDescription || undefined,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <StatCard
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            subvalue={stat.subvalue}
          />
        </motion.div>
      ))}
    </div>
  );
};
