import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { captureError, addBreadcrumb } from '../../services/logging';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'section' | 'component';
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { level = 'page' } = this.props;

    // Agregar breadcrumb del stack de componentes
    addBreadcrumb(
      'Error capturado por ErrorBoundary',
      'error',
      { componentStack: errorInfo.componentStack },
      'error'
    );

    // Enviar error a Sentry con contexto
    captureError(error, {
      component: 'ErrorBoundary',
      action: 'componentDidCatch',
      level,
      componentStack: errorInfo.componentStack,
    });

    // Callback opcional para reportar errores adicionales
    this.props.onError?.(error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Si hay un fallback personalizado, usarlo
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { level = 'page' } = this.props;

      // UI de error según el nivel
      if (level === 'component') {
        return <ComponentErrorFallback onRetry={this.handleRetry} />;
      }

      if (level === 'section') {
        return <SectionErrorFallback onRetry={this.handleRetry} />;
      }

      // Nivel página (default)
      return (
        <PageErrorFallback
          onReload={this.handleReload}
          onGoHome={this.handleGoHome}
          error={this.state.error}
        />
      );
    }

    return this.props.children;
  }
}

// ============ Fallback UIs ============

interface PageErrorFallbackProps {
  onReload: () => void;
  onGoHome: () => void;
  error: Error | null;
}

const PageErrorFallback: React.FC<PageErrorFallbackProps> = ({
  onReload,
  onGoHome,
  error,
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-4">
    <div className="max-w-md w-full text-center">
      {/* Icono */}
      <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>

      {/* Título */}
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Algo salió mal
      </h1>

      {/* Descripción */}
      <p className="text-gray-600 dark:text-slate-400 mb-6">
        Hubo un problema inesperado. No te preocupes, tus datos están seguros.
        Puedes intentar recargar la página o volver al inicio.
      </p>

      {/* Botones */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onReload}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Recargar página
        </button>
        <button
          onClick={onGoHome}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 font-medium rounded-xl transition-colors"
        >
          <Home className="w-4 h-4" />
          Ir al inicio
        </button>
      </div>

      {/* Detalles técnicos (solo en desarrollo) */}
      {import.meta.env.DEV && error && (
        <details className="mt-8 text-left">
          <summary className="text-sm text-gray-500 dark:text-slate-500 cursor-pointer hover:text-gray-700 dark:hover:text-slate-300">
            Detalles técnicos
          </summary>
          <pre className="mt-2 p-3 bg-gray-100 dark:bg-slate-800 rounded-lg text-xs text-red-600 dark:text-red-400 overflow-auto max-h-40">
            {error.message}
            {'\n\n'}
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  </div>
);

interface SectionErrorFallbackProps {
  onRetry: () => void;
}

const SectionErrorFallback: React.FC<SectionErrorFallbackProps> = ({ onRetry }) => (
  <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-6 text-center">
    <div className="mx-auto w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
      <AlertTriangle className="w-6 h-6 text-amber-500" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      No pudimos cargar esta sección
    </h3>
    <p className="text-gray-600 dark:text-slate-400 text-sm mb-4">
      Hubo un problema al mostrar este contenido.
    </p>
    <button
      onClick={onRetry}
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
    >
      <RefreshCw className="w-3.5 h-3.5" />
      Reintentar
    </button>
  </div>
);

interface ComponentErrorFallbackProps {
  onRetry: () => void;
}

const ComponentErrorFallback: React.FC<ComponentErrorFallbackProps> = ({ onRetry }) => (
  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
      <AlertTriangle className="w-4 h-4" />
      <span className="text-sm font-medium">Error al cargar</span>
      <button
        onClick={onRetry}
        className="ml-auto text-sm underline hover:no-underline"
      >
        Reintentar
      </button>
    </div>
  </div>
);

// ============ HOC para facilitar uso ============

export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: Omit<ErrorBoundaryProps, 'children'>
) {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const ComponentWithErrorBoundary = (props: P) => (
    <ErrorBoundary {...options}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;

  return ComponentWithErrorBoundary;
}

export default ErrorBoundary;
