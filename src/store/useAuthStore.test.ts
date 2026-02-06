/**
 * Tests para useAuthStore
 */

import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { useAuthStore } from './useAuthStore';
import { createMockUser } from '../test/test-utils';

// Mock de Firebase services
vi.mock('../services/firebase', () => ({
  registerUser: vi.fn(),
  loginUser: vi.fn(),
  logoutUser: vi.fn(),
  getCurrentUserData: vi.fn(),
  subscribeToAuthChanges: vi.fn(),
}));

// Importar mocks después de mockear
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUserData,
  subscribeToAuthChanges,
} from '../services/firebase';

describe('useAuthStore', () => {
  beforeEach(() => {
    // Resetear store
    useAuthStore.setState({
      user: null,
      isLoading: false,
      isInitialized: false,
      error: null,
    });

    // Resetear mocks
    vi.clearAllMocks();
  });

  describe('Estado inicial', () => {
    it('tiene estado inicial correcto', () => {
      const state = useAuthStore.getState();

      expect(state.user).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.isInitialized).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('register', () => {
    const registerData = {
      email: 'test@example.com',
      password: 'password123',
      displayName: 'Test User',
      childName: 'Tomás',
      childBirthDate: new Date('2020-01-15'),
    };

    it('registra usuario exitosamente', async () => {
      const mockUser = createMockUser();
      (registerUser as Mock).mockResolvedValue(mockUser);

      await useAuthStore.getState().register(registerData);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(registerUser).toHaveBeenCalledWith(registerData);
    });

    it('setea isLoading durante el registro', async () => {
      (registerUser as Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(createMockUser()), 100))
      );

      const registerPromise = useAuthStore.getState().register(registerData);

      // Verificar que isLoading es true durante el registro
      expect(useAuthStore.getState().isLoading).toBe(true);

      await registerPromise;

      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('maneja errores correctamente', async () => {
      (registerUser as Mock).mockRejectedValue(new Error('Email already exists'));

      await expect(
        useAuthStore.getState().register(registerData)
      ).rejects.toThrow('Email already exists');

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Email already exists');
    });

    it('maneja errores no-Error correctamente', async () => {
      (registerUser as Mock).mockRejectedValue('Unknown error');

      await expect(
        useAuthStore.getState().register(registerData)
      ).rejects.toBe('Unknown error');

      const state = useAuthStore.getState();
      expect(state.error).toBe('Error al registrar');
    });

    it('limpia el error al iniciar nuevo registro', async () => {
      // Primero establecer un error
      useAuthStore.setState({ error: 'Previous error' });

      const mockUser = createMockUser();
      (registerUser as Mock).mockResolvedValue(mockUser);

      await useAuthStore.getState().register(registerData);

      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  describe('login', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('inicia sesión exitosamente', async () => {
      const mockUser = createMockUser();
      (loginUser as Mock).mockResolvedValue(mockUser);

      await useAuthStore.getState().login(loginData);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(loginUser).toHaveBeenCalledWith(loginData);
    });

    it('setea isLoading durante el login', async () => {
      (loginUser as Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(createMockUser()), 100))
      );

      const loginPromise = useAuthStore.getState().login(loginData);

      expect(useAuthStore.getState().isLoading).toBe(true);

      await loginPromise;

      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('maneja errores de credenciales incorrectas', async () => {
      (loginUser as Mock).mockRejectedValue(new Error('Invalid credentials'));

      await expect(
        useAuthStore.getState().login(loginData)
      ).rejects.toThrow('Invalid credentials');

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Invalid credentials');
    });

    it('maneja errores no-Error correctamente', async () => {
      (loginUser as Mock).mockRejectedValue('Unknown error');

      await expect(
        useAuthStore.getState().login(loginData)
      ).rejects.toBe('Unknown error');

      const state = useAuthStore.getState();
      expect(state.error).toBe('Error al iniciar sesión');
    });
  });

  describe('logout', () => {
    it('cierra sesión exitosamente', async () => {
      // Primero establecer un usuario
      useAuthStore.setState({ user: createMockUser() });

      (logoutUser as Mock).mockResolvedValue(undefined);

      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(logoutUser).toHaveBeenCalled();
    });

    it('setea isLoading durante el logout', async () => {
      useAuthStore.setState({ user: createMockUser() });

      (logoutUser as Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const logoutPromise = useAuthStore.getState().logout();

      expect(useAuthStore.getState().isLoading).toBe(true);

      await logoutPromise;

      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('maneja errores correctamente', async () => {
      useAuthStore.setState({ user: createMockUser() });

      (logoutUser as Mock).mockRejectedValue(new Error('Network error'));

      await expect(
        useAuthStore.getState().logout()
      ).rejects.toThrow('Network error');

      const state = useAuthStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Network error');
    });

    it('maneja errores no-Error correctamente', async () => {
      useAuthStore.setState({ user: createMockUser() });

      (logoutUser as Mock).mockRejectedValue('Unknown error');

      await expect(
        useAuthStore.getState().logout()
      ).rejects.toBe('Unknown error');

      const state = useAuthStore.getState();
      expect(state.error).toBe('Error al cerrar sesión');
    });
  });

  describe('clearError', () => {
    it('limpia el error', () => {
      useAuthStore.setState({ error: 'Some error' });

      useAuthStore.getState().clearError();

      expect(useAuthStore.getState().error).toBeNull();
    });

    it('no afecta otros estados', () => {
      const mockUser = createMockUser();
      useAuthStore.setState({
        user: mockUser,
        isLoading: true,
        isInitialized: true,
        error: 'Some error',
      });

      useAuthStore.getState().clearError();

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isLoading).toBe(true);
      expect(state.isInitialized).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('initialize', () => {
    it('suscribe a cambios de autenticación y retorna unsubscribe', () => {
      const mockUnsubscribe = vi.fn();
      (subscribeToAuthChanges as Mock).mockReturnValue(mockUnsubscribe);

      const unsubscribe = useAuthStore.getState().initialize();

      expect(subscribeToAuthChanges).toHaveBeenCalled();
      expect(unsubscribe).toBe(mockUnsubscribe);
    });

    it('actualiza el estado cuando hay usuario autenticado', async () => {
      const mockUser = createMockUser();
      const mockFirebaseUser = { uid: 'firebase-uid', email: 'test@example.com' };

      (subscribeToAuthChanges as Mock).mockImplementation((callback) => {
        // Simular llamada inmediata del callback
        callback(mockFirebaseUser);
        return vi.fn();
      });

      (getCurrentUserData as Mock).mockResolvedValue(mockUser);

      useAuthStore.getState().initialize();

      // Esperar a que se resuelva la promesa
      await vi.waitFor(() => {
        expect(useAuthStore.getState().isInitialized).toBe(true);
      });

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isInitialized).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('actualiza el estado cuando no hay usuario autenticado', async () => {
      (subscribeToAuthChanges as Mock).mockImplementation((callback) => {
        callback(null);
        return vi.fn();
      });

      useAuthStore.getState().initialize();

      await vi.waitFor(() => {
        expect(useAuthStore.getState().isInitialized).toBe(true);
      });

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isInitialized).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('maneja errores al obtener datos del usuario', async () => {
      const mockFirebaseUser = { uid: 'firebase-uid', email: 'test@example.com' };
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      (subscribeToAuthChanges as Mock).mockImplementation((callback) => {
        callback(mockFirebaseUser);
        return vi.fn();
      });

      (getCurrentUserData as Mock).mockRejectedValue(new Error('Database error'));

      useAuthStore.getState().initialize();

      await vi.waitFor(() => {
        expect(useAuthStore.getState().isInitialized).toBe(true);
      });

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isInitialized).toBe(true);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Flujos de usuario', () => {
    it('registro completo: register -> obtener usuario', async () => {
      const registerData = {
        email: 'new@example.com',
        password: 'password123',
        displayName: 'New User',
        childName: 'Tomás',
        childBirthDate: new Date('2020-01-15'),
      };

      const mockUser = createMockUser({
        email: 'new@example.com',
        childName: 'Tomás',
      });

      (registerUser as Mock).mockResolvedValue(mockUser);

      await useAuthStore.getState().register(registerData);

      expect(useAuthStore.getState().user?.email).toBe('new@example.com');
      expect(useAuthStore.getState().user?.childName).toBe('Tomás');
    });

    it('login y logout completo', async () => {
      const mockUser = createMockUser();

      // Login
      (loginUser as Mock).mockResolvedValue(mockUser);
      await useAuthStore.getState().login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(useAuthStore.getState().user).not.toBeNull();

      // Logout
      (logoutUser as Mock).mockResolvedValue(undefined);
      await useAuthStore.getState().logout();

      expect(useAuthStore.getState().user).toBeNull();
    });

    it('intento de login fallido y retry exitoso', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Primer intento fallido
      (loginUser as Mock).mockRejectedValueOnce(new Error('Wrong password'));

      await expect(
        useAuthStore.getState().login(loginData)
      ).rejects.toThrow('Wrong password');

      expect(useAuthStore.getState().error).toBe('Wrong password');

      // Limpiar error
      useAuthStore.getState().clearError();
      expect(useAuthStore.getState().error).toBeNull();

      // Segundo intento exitoso
      const mockUser = createMockUser();
      (loginUser as Mock).mockResolvedValue(mockUser);

      await useAuthStore.getState().login(loginData);

      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().error).toBeNull();
    });
  });
});
