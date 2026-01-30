import React from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { Investment } from '../../types';
import { formatCurrency, formatUnits } from '../../utils';
import { Card } from '../common';
import { useMarketStore } from '../../store';

interface InvestmentListProps {
  investments: Investment[];
  onSelect?: (investment: Investment) => void;
}

export const InvestmentList: React.FC<InvestmentListProps> = ({
  investments,
  onSelect,
}) => {
  const { getPriceCop } = useMarketStore();

  if (investments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          Aún no tienes inversiones. ¡Haz tu primer aporte!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {investments.map((investment, index) => {
        // Calcular valor actual con precio de mercado
        const marketPrice = getPriceCop(investment.etfId);
        const currentValue = marketPrice > 0
          ? investment.totalUnits * marketPrice
          : investment.currentValue;

        return (
          <InvestmentCard
            key={investment.id}
            investment={investment}
            currentValue={currentValue}
            index={index}
            onClick={() => onSelect?.(investment)}
          />
        );
      })}
    </div>
  );
};

interface InvestmentCardProps {
  investment: Investment;
  currentValue: number;
  index: number;
  onClick?: () => void;
}

// Calcula el tiempo transcurrido desde la primera inversión
const formatTimeSince = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 30) {
    return `${diffDays} día${diffDays !== 1 ? 's' : ''}`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return `${diffMonths} mes${diffMonths !== 1 ? 'es' : ''}`;
  }

  const diffYears = Math.floor(diffMonths / 12);
  const remainingMonths = diffMonths % 12;
  if (remainingMonths === 0) {
    return `${diffYears} año${diffYears !== 1 ? 's' : ''}`;
  }
  return `${diffYears} año${diffYears !== 1 ? 's' : ''} y ${remainingMonths} mes${remainingMonths !== 1 ? 'es' : ''}`;
};

const InvestmentCard: React.FC<InvestmentCardProps> = ({
  investment,
  currentValue,
  index,
  onClick,
}) => {
  const timeSince = formatTimeSince(new Date(investment.createdAt));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        hover={!!onClick}
        onClick={onClick}
        className="!p-4"
      >
        <div className="flex items-center gap-4">
          {/* Ticker badge */}
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <span className="text-sm font-bold text-primary-700">
              {investment.etfTicker}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 truncate">
              {investment.etfName}
            </h4>
            <p className="text-sm text-gray-500">
              {formatUnits(investment.totalUnits)} unidades
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
              <Calendar className="w-3 h-3" />
              <span>Creciendo hace {timeSince}</span>
            </div>
          </div>

          {/* Valores - sin énfasis emocional */}
          <div className="text-right">
            <p className="text-xs text-gray-400">Aportado</p>
            <p className="text-sm text-gray-600 money">
              {formatCurrency(investment.totalInvested)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Hoy vale</p>
            <p className="font-bold text-gray-900 money">
              {formatCurrency(currentValue)}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
