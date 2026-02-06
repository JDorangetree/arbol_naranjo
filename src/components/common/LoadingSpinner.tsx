import React from 'react';

interface LoadingSpinnerProps {
  /** Tamaño del spinner */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Mensaje opcional debajo del spinner */
  message?: string;
  /** Si debe ocupar altura completa de la pantalla */
  fullScreen?: boolean;
  /** Clase CSS adicional para el contenedor */
  className?: string;
  /** Modo inline sin contenedor centrado */
  inline?: boolean;
}

const sizeClasses = {
  xs: 'w-6 h-6 border-2',
  sm: 'w-8 h-8 border-2',
  md: 'w-12 h-12 border-4',
  lg: 'w-16 h-16 border-4',
};

/**
 * Componente de spinner de carga reutilizable
 *
 * @example
 * // Spinner básico
 * <LoadingSpinner />
 *
 * @example
 * // Spinner con mensaje
 * <LoadingSpinner message="Cargando datos..." />
 *
 * @example
 * // Spinner pantalla completa (para App.tsx)
 * <LoadingSpinner size="lg" message="Iniciando aplicación..." fullScreen />
 *
 * @example
 * // Spinner inline pequeño (para loading dentro de cards)
 * <LoadingSpinner size="xs" inline />
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message,
  fullScreen = false,
  className = '',
  inline = false,
}) => {
  // Modo inline: solo el spinner sin contenedor
  if (inline) {
    return (
      <div
        className={`${sizeClasses[size]} border-primary-500 border-t-transparent rounded-full animate-spin ${className}`}
        role="status"
        aria-label={message || 'Cargando'}
      />
    );
  }

  const containerClasses = fullScreen
    ? 'min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-growth-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800'
    : 'flex items-center justify-center min-h-[60vh]';

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="text-center">
        <div
          className={`${sizeClasses[size]} border-primary-500 border-t-transparent rounded-full animate-spin mx-auto ${message ? 'mb-4' : ''}`}
          role="status"
          aria-label={message || 'Cargando'}
        />
        {message && (
          <p className="text-gray-500 dark:text-slate-400">{message}</p>
        )}
      </div>
    </div>
  );
};
