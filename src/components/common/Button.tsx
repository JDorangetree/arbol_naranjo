import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed touch-action-manipulation select-none active:scale-[0.98]';

  const variants = {
    primary:
      'bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white focus:ring-primary-500 shadow-lg shadow-primary-500/25 dark:shadow-primary-500/10',
    secondary:
      'bg-gray-100 hover:bg-gray-200 active:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 dark:active:bg-slate-500 text-gray-800 dark:text-slate-200 focus:ring-gray-500 dark:focus:ring-slate-500',
    success:
      'bg-growth-500 hover:bg-growth-600 active:bg-growth-700 text-white focus:ring-growth-500 shadow-lg shadow-growth-500/25 dark:shadow-growth-500/10',
    danger:
      'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white focus:ring-red-500',
    ghost:
      'bg-transparent hover:bg-gray-100 active:bg-gray-200 dark:hover:bg-slate-800 dark:active:bg-slate-700 text-gray-700 dark:text-slate-300 focus:ring-gray-500 dark:focus:ring-slate-500',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm gap-1.5 min-h-[36px]',
    md: 'px-4 py-2.5 text-base gap-2 min-h-[44px]',
    lg: 'px-6 py-3 text-lg gap-2.5 min-h-[52px]',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...(props as any)}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </motion.button>
  );
};
