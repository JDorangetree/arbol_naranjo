import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  withRetry,
  createRetryWrapper,
  isFirebaseRetryableError,
  FIREBASE_RETRY_OPTIONS,
  API_RETRY_OPTIONS,
} from './retry';

describe('retry utility', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('withRetry', () => {
    it('should return result on first success', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const promise = withRetry(fn);
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce('success');

      const promise = withRetry(fn, {
        maxRetries: 3,
        baseDelay: 100,
        isRetryable: () => true,
      });

      // Advance through retries
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should throw after max retries exceeded', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Persistent error'));

      const promise = withRetry(fn, {
        maxRetries: 2,
        baseDelay: 100,
        isRetryable: () => true,
      });

      // Catch the rejection to avoid unhandled rejection
      promise.catch(() => {});

      await vi.runAllTimersAsync();

      await expect(promise).rejects.toThrow('Persistent error');
      expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
    });

    it('should not retry non-retryable errors', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Auth error'));

      const promise = withRetry(fn, {
        maxRetries: 3,
        isRetryable: () => false,
      });

      await expect(promise).rejects.toThrow('Auth error');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should call onRetry callback before each retry', async () => {
      const onRetry = vi.fn();
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockRejectedValueOnce(new Error('Error 2'))
        .mockResolvedValueOnce('success');

      const promise = withRetry(fn, {
        maxRetries: 3,
        baseDelay: 100,
        isRetryable: () => true,
        onRetry,
      });

      await vi.runAllTimersAsync();
      await promise;

      expect(onRetry).toHaveBeenCalledTimes(2);
      expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error), expect.any(Number));
      expect(onRetry).toHaveBeenCalledWith(2, expect.any(Error), expect.any(Number));
    });

    it('should respect maxDelay option', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Error'))
        .mockResolvedValueOnce('success');

      const onRetry = vi.fn();

      const promise = withRetry(fn, {
        maxRetries: 1,
        baseDelay: 10000,
        maxDelay: 100,
        isRetryable: () => true,
        onRetry,
      });

      await vi.runAllTimersAsync();
      await promise;

      // Check that delay was capped
      const [, , delay] = onRetry.mock.calls[0];
      expect(delay).toBeLessThanOrEqual(100);
    });

    it('should use default options when none provided', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const promise = withRetry(fn);
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe('success');
    });
  });

  describe('createRetryWrapper', () => {
    it('should create a wrapped function that retries', async () => {
      const originalFn = vi.fn()
        .mockRejectedValueOnce(new Error('Error'))
        .mockResolvedValueOnce('result');

      const wrappedFn = createRetryWrapper(originalFn, {
        maxRetries: 2,
        baseDelay: 100,
        isRetryable: () => true,
      });

      const promise = wrappedFn('arg1', 'arg2');
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe('result');
      expect(originalFn).toHaveBeenCalledWith('arg1', 'arg2');
      expect(originalFn).toHaveBeenCalledTimes(2);
    });

    it('should pass arguments correctly', async () => {
      const originalFn = vi.fn().mockResolvedValue('done');

      const wrappedFn = createRetryWrapper(originalFn);

      const promise = wrappedFn(1, 'two', { three: 3 });
      await vi.runAllTimersAsync();
      await promise;

      expect(originalFn).toHaveBeenCalledWith(1, 'two', { three: 3 });
    });
  });

  describe('isFirebaseRetryableError', () => {
    it('should return true for network errors', () => {
      expect(isFirebaseRetryableError(new Error('Failed to fetch'))).toBe(true);
      expect(isFirebaseRetryableError(new Error('Network error'))).toBe(true);
      expect(isFirebaseRetryableError(new Error('ECONNRESET'))).toBe(true);
      expect(isFirebaseRetryableError(new Error('ETIMEDOUT'))).toBe(true);
    });

    it('should return true for Firebase unavailable errors', () => {
      expect(isFirebaseRetryableError(new Error('service unavailable'))).toBe(true);
      expect(isFirebaseRetryableError(new Error('UNAVAILABLE'))).toBe(true);
    });

    it('should return true for resource exhausted errors', () => {
      expect(isFirebaseRetryableError(new Error('resource-exhausted'))).toBe(true);
    });

    it('should return true for deadline exceeded errors', () => {
      expect(isFirebaseRetryableError(new Error('deadline-exceeded'))).toBe(true);
    });

    it('should return true for internal errors', () => {
      expect(isFirebaseRetryableError(new Error('internal error'))).toBe(true);
    });

    it('should return false for auth errors', () => {
      expect(isFirebaseRetryableError(new Error('permission-denied'))).toBe(false);
      expect(isFirebaseRetryableError(new Error('unauthenticated'))).toBe(false);
    });

    it('should return false for not found errors', () => {
      expect(isFirebaseRetryableError(new Error('not-found'))).toBe(false);
    });

    it('should return false for non-error values', () => {
      expect(isFirebaseRetryableError('string')).toBe(false);
      expect(isFirebaseRetryableError(null)).toBe(false);
      expect(isFirebaseRetryableError(undefined)).toBe(false);
    });
  });

  describe('preset options', () => {
    it('FIREBASE_RETRY_OPTIONS should have correct defaults', () => {
      expect(FIREBASE_RETRY_OPTIONS.maxRetries).toBe(3);
      expect(FIREBASE_RETRY_OPTIONS.baseDelay).toBe(1000);
      expect(FIREBASE_RETRY_OPTIONS.maxDelay).toBe(8000);
      expect(FIREBASE_RETRY_OPTIONS.isRetryable).toBe(isFirebaseRetryableError);
    });

    it('API_RETRY_OPTIONS should have correct defaults', () => {
      expect(API_RETRY_OPTIONS.maxRetries).toBe(2);
      expect(API_RETRY_OPTIONS.baseDelay).toBe(500);
      expect(API_RETRY_OPTIONS.maxDelay).toBe(5000);
    });
  });

  describe('backoff calculation', () => {
    it('should use exponential backoff with jitter', async () => {
      const delays: number[] = [];
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockRejectedValueOnce(new Error('Error 2'))
        .mockRejectedValueOnce(new Error('Error 3'))
        .mockResolvedValueOnce('success');

      const promise = withRetry(fn, {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        backoffFactor: 2,
        isRetryable: () => true,
        onRetry: (_, __, delay) => delays.push(delay),
      });

      await vi.runAllTimersAsync();
      await promise;

      // First retry: base * 2^0 = 1000 (with jitter: 750-1250)
      expect(delays[0]).toBeGreaterThanOrEqual(750);
      expect(delays[0]).toBeLessThanOrEqual(1250);

      // Second retry: base * 2^1 = 2000 (with jitter: 1500-2500)
      expect(delays[1]).toBeGreaterThanOrEqual(1500);
      expect(delays[1]).toBeLessThanOrEqual(2500);

      // Third retry: base * 2^2 = 4000 (with jitter: 3000-5000)
      expect(delays[2]).toBeGreaterThanOrEqual(3000);
      expect(delays[2]).toBeLessThanOrEqual(5000);
    });
  });
});
