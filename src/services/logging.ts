/**
 * Servicio de Logging Centralizado
 *
 * Usa Sentry para capturar errores en producción.
 * En desarrollo, solo usa console.
 *
 * Configuración:
 * - VITE_SENTRY_DSN: DSN de Sentry (requerido en producción)
 * - VITE_SENTRY_ENVIRONMENT: Ambiente (development, staging, production)
 */

import * as Sentry from '@sentry/react';

// Tipos
export interface LogContext {
  userId?: string;
  component?: string;
  action?: string;
  [key: string]: unknown;
}

export type LogLevel = 'debug' | 'info' | 'warning' | 'error' | 'fatal';

// Configuración
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const ENVIRONMENT = import.meta.env.MODE;
const IS_PRODUCTION = ENVIRONMENT === 'production';
const IS_SENTRY_ENABLED = !!SENTRY_DSN;

/**
 * Inicializa Sentry (llamar en main.tsx)
 */
export function initLogging(): void {
  if (!IS_SENTRY_ENABLED) {
    if (IS_PRODUCTION) {
      console.warn(
        '[Logging] VITE_SENTRY_DSN no configurado. Los errores no se enviarán a Sentry.'
      );
    }
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    // Solo enviar errores en producción
    enabled: IS_PRODUCTION,
    // Configuración de performance (opcional)
    tracesSampleRate: IS_PRODUCTION ? 0.1 : 0, // 10% en producción
    // Filtrar errores comunes que no necesitan seguimiento
    beforeSend(event, hint) {
      const error = hint.originalException;

      // Ignorar errores de extensiones del navegador
      if (
        error instanceof Error &&
        (error.message.includes('extension') ||
        error.stack?.includes('chrome-extension'))
      ) {
        return null;
      }

      // Ignorar errores de ResizeObserver (comunes pero no críticos)
      if (
        error instanceof Error &&
        error.message.includes('ResizeObserver')
      ) {
        return null;
      }

      return event;
    },
    // Integrations
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        // Solo capturar replay en errores
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Replay solo cuando hay error
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: IS_PRODUCTION ? 1.0 : 0,
  });

  console.info('[Logging] Sentry inicializado correctamente');
}

/**
 * Establece el usuario actual para el contexto de los errores
 */
export function setUser(userId: string, email?: string, extra?: Record<string, unknown>): void {
  if (IS_SENTRY_ENABLED) {
    Sentry.setUser({
      id: userId,
      email,
      ...extra,
    });
  }
}

/**
 * Limpia el usuario (en logout)
 */
export function clearUser(): void {
  if (IS_SENTRY_ENABLED) {
    Sentry.setUser(null);
  }
}

/**
 * Agrega contexto adicional a los errores
 */
export function setContext(name: string, context: Record<string, unknown>): void {
  if (IS_SENTRY_ENABLED) {
    Sentry.setContext(name, context);
  }
}

/**
 * Captura un error con contexto opcional
 */
export function captureError(
  error: Error | unknown,
  context?: LogContext
): string | undefined {
  // Siempre log a consola en desarrollo
  if (!IS_PRODUCTION) {
    console.error('[Error]', error, context);
  }

  if (!IS_SENTRY_ENABLED) {
    return undefined;
  }

  // Convertir a Error si no lo es
  const errorObj = error instanceof Error ? error : new Error(String(error));

  // Capturar con contexto
  return Sentry.captureException(errorObj, {
    extra: context,
    tags: {
      component: context?.component,
      action: context?.action,
    },
  });
}

/**
 * Captura un mensaje (no un error)
 */
export function captureMessage(
  message: string,
  level: LogLevel = 'info',
  context?: LogContext
): string | undefined {
  // Log a consola
  const consoleMethod = level === 'error' || level === 'fatal' ? 'error' :
                        level === 'warning' ? 'warn' :
                        level === 'debug' ? 'debug' : 'info';
  console[consoleMethod](`[${level.toUpperCase()}]`, message, context);

  if (!IS_SENTRY_ENABLED || !IS_PRODUCTION) {
    return undefined;
  }

  // Mapear niveles
  const sentryLevel = level === 'fatal' ? 'fatal' :
                      level === 'error' ? 'error' :
                      level === 'warning' ? 'warning' :
                      level === 'debug' ? 'debug' : 'info';

  return Sentry.captureMessage(message, {
    level: sentryLevel,
    extra: context,
    tags: {
      component: context?.component,
      action: context?.action,
    },
  });
}

/**
 * Agrega un breadcrumb (rastro de navegación)
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, unknown>,
  level: 'debug' | 'info' | 'warning' | 'error' = 'info'
): void {
  if (IS_SENTRY_ENABLED) {
    Sentry.addBreadcrumb({
      message,
      category,
      data,
      level,
    });
  }
}

/**
 * Wrapper para operaciones que pueden fallar
 * Captura el error y lo reporta, luego lo re-lanza
 */
export async function withErrorCapture<T>(
  operation: () => Promise<T>,
  context: LogContext
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    captureError(error, context);
    throw error;
  }
}

/**
 * Crea un logger con contexto predefinido
 * Útil para componentes o servicios específicos
 */
export function createLogger(defaultContext: LogContext) {
  return {
    debug: (message: string, context?: LogContext) =>
      captureMessage(message, 'debug', { ...defaultContext, ...context }),

    info: (message: string, context?: LogContext) =>
      captureMessage(message, 'info', { ...defaultContext, ...context }),

    warn: (message: string, context?: LogContext) =>
      captureMessage(message, 'warning', { ...defaultContext, ...context }),

    error: (error: Error | unknown, context?: LogContext) =>
      captureError(error, { ...defaultContext, ...context }),

    breadcrumb: (message: string, data?: Record<string, unknown>) =>
      addBreadcrumb(message, defaultContext.component || 'app', data),
  };
}

// Logger por defecto para uso general
export const logger = createLogger({ component: 'app' });

// Re-exportar ErrorBoundary de Sentry para uso directo
export { Sentry };
