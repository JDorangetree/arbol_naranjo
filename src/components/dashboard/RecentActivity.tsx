import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDownCircle,
  Gift,
  Sparkles,
} from 'lucide-react';
import { Transaction } from '../../types';
import { formatCurrency, formatRelativeDate, MILESTONE_LABELS } from '../../utils';
import { Card, CardHeader } from '../common';

interface RecentActivityProps {
  transactions: Transaction[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  transactions,
}) => {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader title="Actividad reciente" />
        <div className="text-center py-6">
          <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            Aún no hay actividad. ¡Haz tu primera inversión!
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Actividad reciente"
        subtitle={`${transactions.length} transacciones`}
      />
      <div className="space-y-3">
        {transactions.map((transaction, index) => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            index={index}
          />
        ))}
      </div>
    </Card>
  );
};

interface TransactionItemProps {
  transaction: Transaction;
  index: number;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  index,
}) => {
  const typeConfig = {
    buy: {
      icon: ArrowDownCircle,
      color: 'text-growth-500',
      bgColor: 'bg-growth-100',
      label: 'Compra',
    },
    dividend: {
      icon: Gift,
      color: 'text-gold-500',
      bgColor: 'bg-gold-100',
      label: 'Dividendo',
    },
  };

  const config = typeConfig[transaction.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
    >
      {/* Icono */}
      <div className={`p-2 rounded-xl ${config.bgColor}`}>
        <Icon className={`w-5 h-5 ${config.color}`} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">
            {transaction.etfTicker}
          </span>
          {transaction.milestone && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-600">
              {MILESTONE_LABELS[transaction.milestone]}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500">
          {config.label} · {formatRelativeDate(transaction.createdAt)}
        </p>
      </div>

      {/* Monto */}
      <div className="text-right">
        <p className={`font-semibold money ${
          transaction.type === 'buy' ? 'text-growth-600' : 'text-gold-600'
        }`}>
          +{formatCurrency(transaction.totalAmount)}
        </p>
        {transaction.type === 'buy' && (
          <p className="text-xs text-gray-400">
            {transaction.units} unidades
          </p>
        )}
      </div>
    </motion.div>
  );
};
