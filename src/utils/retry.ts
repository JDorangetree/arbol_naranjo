/**
 * Utilidad para reintentos con backoff exponencial
 * Útil para operaciones de red que pueden fallar temporalmente
 */

import { isNetworkError } from './errorMessages';

export interface RetryOptions {
  /** Número máximo de reintentos (default: 3) */
  maxRetries?: number;
  /** Delay inicial en ms (default: 1000) */
  baseDelay?: number;
  /** Delay máximo en ms (default: 10000) */
  maxDelay?: number;
  /** Factor de multiplicación para backoff (default: 2) */
  backoffFactor?: number;
  /** Función para determinar si el error es retryable (default: isNetworkError) */
  isRetryable?: (error: unknown) => boolean;
  /** Callback opcional llamado antes de cada reintento */
  onRetry?: (attempt: number, error: unknown, nextDelay: number) => void;
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'onRetry'>> = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  isRetryable: isNetworkError,
};

/**
 * Calcula el delay para el próximo reintento usando backoff exponencial con jitter
 */
function calculateDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number,
  backoffFactor: number
): number {
  // Backoff exponencial: baseDelay * factor^attempt
  const exponentialDelay = baseDelay * Math.pow(backoffFactor, attempt);

  // Aplicar jitter (±25%) para evitar thundering herd
  const jitter = 0.75 + Math.random() * 0.5;
  const delayWithJitter = exponentialDelay * jitter;

  // No exceder el máximo
  return Math.min(delayWithJitter, maxDelay);
}

/**
 * Espera un número de milisegundos
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Ejecuta una función con reintentos automáticos usando backoff exponencial
 *
 * @example
 * // Uso básico
 * const result = await withRetry(() => fetchData());
 *
 * @example
 * // Con opciones personalizadas
 * const result = await withRetry(
 *   () => fetchData(),
 *   {
 *     maxRetries: 5,
 *     baseDelay: 500,
 *     onRetry: (attempt, error) => console.log(`Reintento ${attempt}`)
 *   }
 * );
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries,
    baseDelay,
    maxDelay,
    backoffFactor,
    isRetryable,
  } = { ...DEFAULT_OPTIONS, ...options };

  const { onRetry } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Si es el último intento o el error no es retryable, propagar
      if (attempt === maxRetries || !isRetryable(error)) {
        throw error;
      }

      // Calcular delay para el próximo intento
      const delay = calculateDelay(attempt, baseDelay, maxDelay, backoffFactor);

      // Notificar del reintento si hay callback
      if (onRetry) {
        onRetry(attempt + 1, error, delay);
      }

      // Esperar antes del próximo intento
      await sleep(delay);
    }
  }

  // No debería llegar aquí, pero por seguridad
  throw lastError;
}

/**
 * Crea una versión con retry de una función async
 * Útil para crear wrappers reutilizables
 *
 * @example
 * const fetchWithRetry = createRetryWrapper(fetchData, { maxRetries: 5 });
 * const result = await fetchWithRetry();
 */
export function createRetryWrapper<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  options: RetryOptions = {}
): (...args: TArgs) => Promise<TResult> {
  return (...args: TArgs) => withRetry(() => fn(...args), options);
}

/**
 * Errores específicos de Firebase que son retryables
 */
export function isFirebaseRetryableError(error: unknown): boolean {
  // Primero verificar errores de red genéricos
  if (isNetworkError(error)) {
    return true;
  }

  // Errores de Firebase que indican problemas temporales
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    const retryableCodes = [
      'unavailable',
      'resource-exhausted',
      'deadline-exceeded',
      'aborted',
      'internal',
      'cancelled',
    ];

    return retryableCodes.some(code => message.includes(code));
  }

  return false;
}

/**
 * Opciones preconfiguradas para operaciones Firebase
 */
export const FIREBASE_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 8000,
  backoffFactor: 2,
  isRetryable: isFirebaseRetryableError,
};

/**
 * Opciones preconfiguradas para APIs externas (Finnhub, exchange rates)
 */
export const API_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 2,
  baseDelay: 500,
  maxDelay: 5000,
  backoffFactor: 2,
  isRetryable: isNetworkError,
};
