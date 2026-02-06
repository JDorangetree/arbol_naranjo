import React from 'react';

/**
 * Componente base de Skeleton para loading states
 *
 * Muestra una "silueta" animada del contenido mientras carga,
 * mejorando la perceived performance y reduciendo CLS.
 */

interface SkeletonProps {
  /** Ancho del skeleton (ej: "100%", "200px", "w-24") */
  width?: string;
  /** Alto del skeleton (ej: "20px", "h-4") */
  height?: string;
  /** Forma del skeleton */
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  /** Clases adicionales de Tailwind */
  className?: string;
  /** Si debe animar (pulse) */
  animate?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  variant = 'text',
  className = '',
  animate = true,
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-slate-700';
  const animateClass = animate ? 'animate-pulse' : '';

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-xl',
  };

  // Si se pasan clases de Tailwind para width/height, usarlas directamente
  const isTailwindWidth = width?.startsWith('w-');
  const isTailwindHeight = height?.startsWith('h-');

  const style: React.CSSProperties = {
    width: isTailwindWidth ? undefined : width,
    height: isTailwindHeight ? undefined : height,
  };

  const sizeClasses = `${isTailwindWidth ? width : ''} ${isTailwindHeight ? height : ''}`;

  return (
    <div
      className={`${baseClasses} ${animateClass} ${variantClasses[variant]} ${sizeClasses} ${className}`}
      style={Object.keys(style).some(k => style[k as keyof typeof style]) ? style : undefined}
      aria-hidden="true"
    />
  );
};

// ============================================
// Skeletons pre-construidos para casos comunes
// ============================================

/**
 * Skeleton para una tarjeta de estadística (StatCard)
 */
export const SkeletonStatCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-xl p-4 ${className}`}>
    <div className="animate-pulse">
      <Skeleton width="60%" height="12px" className="mb-2" />
      <Skeleton width="80%" height="24px" className="mb-1" />
      <Skeleton width="40%" height="12px" />
    </div>
  </div>
);

/**
 * Skeleton para una tarjeta de inversión
 */
export const SkeletonInvestmentCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 ${className}`}>
    <div className="animate-pulse flex items-center gap-4">
      {/* Avatar */}
      <Skeleton variant="circular" width="48px" height="48px" />
      {/* Info */}
      <div className="flex-1 min-w-0">
        <Skeleton width="100px" height="16px" className="mb-2" />
        <Skeleton width="150px" height="12px" />
      </div>
      {/* Valor */}
      <div className="text-right hidden sm:block">
        <Skeleton width="80px" height="18px" className="mb-1 ml-auto" />
        <Skeleton width="50px" height="12px" className="ml-auto" />
      </div>
    </div>
  </div>
);

/**
 * Skeleton para el resumen del Dashboard
 */
export const SkeletonDashboardSummary: React.FC = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
    {[...Array(4)].map((_, i) => (
      <SkeletonStatCard key={i} />
    ))}
  </div>
);

/**
 * Skeleton para lista de inversiones
 */
export const SkeletonInvestmentList: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-4">
    {[...Array(count)].map((_, i) => (
      <SkeletonInvestmentCard key={i} />
    ))}
  </div>
);

/**
 * Skeleton para una transacción en el timeline
 */
export const SkeletonTransaction: React.FC = () => (
  <div className="flex gap-4 animate-pulse">
    <Skeleton variant="circular" width="40px" height="40px" />
    <div className="flex-1">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
        <div className="flex justify-between mb-2">
          <div>
            <Skeleton width="80px" height="16px" className="mb-2" />
            <Skeleton width="120px" height="12px" />
          </div>
          <div className="text-right">
            <Skeleton width="70px" height="16px" className="mb-1 ml-auto" />
            <Skeleton width="50px" height="10px" className="ml-auto" />
          </div>
        </div>
        <Skeleton width="150px" height="12px" />
      </div>
    </div>
  </div>
);

/**
 * Skeleton para el historial (grupo de mes)
 */
export const SkeletonHistoryGroup: React.FC = () => (
  <div className="mb-6">
    {/* Header del mes */}
    <div className="animate-pulse flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl mb-4">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width="48px" height="48px" />
        <div>
          <Skeleton width="120px" height="18px" className="mb-2" />
          <Skeleton width="80px" height="12px" />
        </div>
      </div>
      <div className="text-right">
        <Skeleton width="90px" height="18px" className="mb-1 ml-auto" />
        <Skeleton width="60px" height="10px" className="ml-auto" />
      </div>
    </div>
    {/* Transacciones */}
    <div className="pl-4 space-y-4">
      <SkeletonTransaction />
      <SkeletonTransaction />
    </div>
  </div>
);

/**
 * Skeleton para el NaranjoEvolutivo
 */
export const SkeletonNaranjoEvolutivo: React.FC = () => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 animate-pulse">
    <div className="flex flex-col md:flex-row items-center gap-6">
      {/* Área del árbol */}
      <div className="w-48 h-48 bg-gray-200 dark:bg-slate-700 rounded-xl" />
      {/* Info lateral */}
      <div className="flex-1 w-full">
        <Skeleton width="60%" height="24px" className="mb-4" />
        <Skeleton width="100%" height="16px" className="mb-2" />
        <Skeleton width="80%" height="16px" className="mb-4" />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Skeleton width="60px" height="12px" className="mb-2" />
            <Skeleton width="100px" height="20px" />
          </div>
          <div>
            <Skeleton width="60px" height="12px" className="mb-2" />
            <Skeleton width="80px" height="20px" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Skeleton para actividad reciente
 */
export const SkeletonRecentActivity: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl">
    <div className="p-4 border-b border-gray-100 dark:border-slate-700">
      <Skeleton width="140px" height="18px" />
    </div>
    <div className="p-4 space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 animate-pulse">
          <Skeleton variant="circular" width="32px" height="32px" />
          <div className="flex-1">
            <Skeleton width="100px" height="14px" className="mb-1" />
            <Skeleton width="70px" height="10px" />
          </div>
          <Skeleton width="60px" height="14px" />
        </div>
      ))}
    </div>
  </div>
);
