import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  onClick,
}) => {
  const Component = hover ? motion.div : 'div';

  const hoverProps = hover
    ? {
        whileHover: { scale: 1.02, y: -4 },
        transition: { duration: 0.2 },
      }
    : {};

  return (
    <Component
      className={clsx(
        'bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-lg dark:shadow-slate-900/50 p-4 sm:p-6 transition-colors',
        hover && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      {...hoverProps}
    >
      {children}
    </Component>
  );
};

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
}) => {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string;
  subvalue?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'default' | 'success' | 'warning' | 'danger';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subvalue,
  icon,
  trend,
  color = 'default',
}) => {
  const colorClasses = {
    default: 'text-gray-900 dark:text-white',
    success: 'text-growth-600 dark:text-growth-400',
    warning: 'text-gold-600 dark:text-gold-400',
    danger: 'text-red-600 dark:text-red-400',
  };

  const trendColors = {
    up: 'text-growth-500 dark:text-growth-400',
    down: 'text-red-500 dark:text-red-400',
    neutral: 'text-gray-500 dark:text-slate-400',
  };

  return (
    <Card className="relative overflow-hidden">
      {icon && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-200 dark:text-slate-700 opacity-50">
          <div className="w-6 h-6 sm:w-8 sm:h-8">{icon}</div>
        </div>
      )}
      <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-slate-400 mb-0.5 sm:mb-1">{label}</p>
      <p className={clsx('text-xl sm:text-2xl font-bold money', colorClasses[color])}>
        {value}
      </p>
      {subvalue && (
        <p
          className={clsx(
            'text-xs sm:text-sm font-medium mt-0.5 sm:mt-1',
            trend ? trendColors[trend] : 'text-gray-500 dark:text-slate-400'
          )}
        >
          {subvalue}
        </p>
      )}
    </Card>
  );
};
