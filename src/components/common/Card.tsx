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
        'bg-white rounded-2xl shadow-lg p-6',
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
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
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
    default: 'text-gray-900',
    success: 'text-growth-600',
    warning: 'text-gold-600',
    danger: 'text-red-600',
  };

  const trendColors = {
    up: 'text-growth-500',
    down: 'text-red-500',
    neutral: 'text-gray-500',
  };

  return (
    <Card className="relative overflow-hidden">
      {icon && (
        <div className="absolute top-4 right-4 text-gray-200 opacity-50">
          {icon}
        </div>
      )}
      <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
      <p className={clsx('text-2xl font-bold money', colorClasses[color])}>
        {value}
      </p>
      {subvalue && (
        <p
          className={clsx(
            'text-sm font-medium mt-1',
            trend ? trendColors[trend] : 'text-gray-500'
          )}
        >
          {subvalue}
        </p>
      )}
    </Card>
  );
};
