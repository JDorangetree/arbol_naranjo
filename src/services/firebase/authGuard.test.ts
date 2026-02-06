/**
 * Tests para authGuard - Validación de tokens
 */

import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import {
  getCurrentUser,
  validateAuth,
  validateUserAccess,
  validateAuthAndAccess,
  withAuthValidation,
  isAuthenticated,
  getCurrentUserId,
  AuthError,
} from './authGuard';

// Mock de Firebase auth
vi.mock('./config', () => ({
  auth: {
    currentUser: null,
  },
}));

import { auth } from './config';

describe('AuthGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset auth.currentUser
    (auth as any).currentUser = null;
  });

  describe('getCurrentUser', () => {
    it('lanza error si no hay usuario autenticado', () => {
      expect(() => getCurrentUser()).toThrow(AuthError);
      expect(() => getCurrentUser()).toThrow('Debes iniciar sesión para realizar esta acción');
    });

    it('retorna el usuario si está autenticado', () => {
      const mockUser = { uid: 'user-123', email: 'test@example.com' };
      (auth as any).currentUser = mockUser;

      const user = getCurrentUser();
      expect(user).toBe(mockUser);
    });
  });

  describe('validateAuth', () => {
    it('lanza error si no hay usuario autenticado', async () => {
      await expect(validateAuth()).rejects.toThrow(AuthError);
      await expect(validateAuth()).rejects.toThrow('Debes iniciar sesión para realizar esta acción');
    });

    it('valida el token del usuario autenticado', async () => {
      const mockTokenResult = {
        expirationTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hora
      };

      const mockUser = {
        uid: 'user-123',
        email: 'test@example.com',
        getIdTokenResult: vi.fn().mockResolvedValue(mockTokenResult),
        getIdToken: vi.fn().mockResolvedValue('token'),
      };

      (auth as any).currentUser = mockUser;

      const user = await validateAuth();
      expect(user).toBe(mockUser);
      expect(mockUser.getIdTokenResult).toHaveBeenCalledWith(false);
    });

    it('refresca el token si expira pronto (menos de 5 minutos)', async () => {
      const mockTokenResult = {
        expirationTime: new Date(Date.now() + 2 * 60 * 1000).toISOString(), // 2 minutos
      };

      const mockUser = {
        uid: 'user-123',
        email: 'test@example.com',
        getIdTokenResult: vi.fn().mockResolvedValue(mockTokenResult),
        getIdToken: vi.fn().mockResolvedValue('new-token'),
      };

      (auth as any).currentUser = mockUser;

      await validateAuth();

      // Debería refrescar el token
      expect(mockUser.getIdToken).toHaveBeenCalledWith(true);
    });

    it('no refresca el token si tiene tiempo suficiente', async () => {
      const mockTokenResult = {
        expirationTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
      };

      const mockUser = {
        uid: 'user-123',
        email: 'test@example.com',
        getIdTokenResult: vi.fn().mockResolvedValue(mockTokenResult),
        getIdToken: vi.fn(),
      };

      (auth as any).currentUser = mockUser;

      await validateAuth();

      // No debería refrescar el token
      expect(mockUser.getIdToken).not.toHaveBeenCalled();
    });

    it('lanza error TOKEN_EXPIRED si no puede refrescar el token', async () => {
      const mockUser = {
        uid: 'user-123',
        email: 'test@example.com',
        getIdTokenResult: vi.fn().mockRejectedValue(new Error('Token expired')),
      };

      (auth as any).currentUser = mockUser;

      await expect(validateAuth()).rejects.toThrow('Tu sesión ha expirado');
    });
  });

  describe('validateUserAccess', () => {
    it('lanza error si no hay usuario autenticado', () => {
      expect(() => validateUserAccess('user-123')).toThrow(AuthError);
    });

    it('lanza error si el userId no coincide', () => {
      const mockUser = { uid: 'user-456', email: 'test@example.com' };
      (auth as any).currentUser = mockUser;

      expect(() => validateUserAccess('user-123')).toThrow('No tienes permiso para acceder a estos datos');
    });

    it('no lanza error si el userId coincide', () => {
      const mockUser = { uid: 'user-123', email: 'test@example.com' };
      (auth as any).currentUser = mockUser;

      expect(() => validateUserAccess('user-123')).not.toThrow();
    });
  });

  describe('validateAuthAndAccess', () => {
    it('valida autenticación y acceso juntos', async () => {
      const mockTokenResult = {
        expirationTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      };

      const mockUser = {
        uid: 'user-123',
        email: 'test@example.com',
        getIdTokenResult: vi.fn().mockResolvedValue(mockTokenResult),
        getIdToken: vi.fn(),
      };

      (auth as any).currentUser = mockUser;

      const user = await validateAuthAndAccess('user-123');
      expect(user).toBe(mockUser);
    });

    it('lanza error si el userId no coincide', async () => {
      const mockTokenResult = {
        expirationTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      };

      const mockUser = {
        uid: 'user-123',
        email: 'test@example.com',
        getIdTokenResult: vi.fn().mockResolvedValue(mockTokenResult),
        getIdToken: vi.fn(),
      };

      (auth as any).currentUser = mockUser;

      await expect(validateAuthAndAccess('user-456')).rejects.toThrow(
        'No tienes permiso para acceder a estos datos'
      );
    });
  });

  describe('withAuthValidation', () => {
    it('ejecuta la operación si la validación es exitosa', async () => {
      const mockTokenResult = {
        expirationTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      };

      const mockUser = {
        uid: 'user-123',
        email: 'test@example.com',
        getIdTokenResult: vi.fn().mockResolvedValue(mockTokenResult),
        getIdToken: vi.fn(),
      };

      (auth as any).currentUser = mockUser;

      const mockOperation = vi.fn().mockResolvedValue('result');
      const result = await withAuthValidation('user-123', mockOperation);

      expect(mockOperation).toHaveBeenCalled();
      expect(result).toBe('result');
    });

    it('no ejecuta la operación si la validación falla', async () => {
      const mockOperation = vi.fn().mockResolvedValue('result');

      await expect(withAuthValidation('user-123', mockOperation)).rejects.toThrow();
      expect(mockOperation).not.toHaveBeenCalled();
    });
  });

  describe('isAuthenticated', () => {
    it('retorna false si no hay usuario', () => {
      expect(isAuthenticated()).toBe(false);
    });

    it('retorna true si hay usuario', () => {
      (auth as any).currentUser = { uid: 'user-123' };
      expect(isAuthenticated()).toBe(true);
    });
  });

  describe('getCurrentUserId', () => {
    it('retorna null si no hay usuario', () => {
      expect(getCurrentUserId()).toBeNull();
    });

    it('retorna el uid del usuario autenticado', () => {
      (auth as any).currentUser = { uid: 'user-123' };
      expect(getCurrentUserId()).toBe('user-123');
    });
  });

  describe('AuthError', () => {
    it('tiene nombre y código correctos', () => {
      const error = new AuthError('Test message', 'NOT_AUTHENTICATED');

      expect(error.name).toBe('AuthError');
      expect(error.message).toBe('Test message');
      expect(error.code).toBe('NOT_AUTHENTICATED');
    });

    it('es instancia de Error', () => {
      const error = new AuthError('Test', 'TOKEN_EXPIRED');
      expect(error instanceof Error).toBe(true);
    });
  });
});
