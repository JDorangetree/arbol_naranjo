import { create } from 'zustand';
import { User } from '../types';
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUserData,
  subscribeToAuthChanges,
  RegisterData,
  LoginData,
} from '../services/firebase';
import { setUser, clearUser, captureError, addBreadcrumb } from '../services/logging';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Acciones
  register: (data: RegisterData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  initialize: () => () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });
    addBreadcrumb('Iniciando registro', 'auth');
    try {
      const user = await registerUser(data);
      setUser(user.id, user.email);
      addBreadcrumb('Registro exitoso', 'auth', { userId: user.id });
      set({ user, isLoading: false });
    } catch (error) {
      captureError(error, { component: 'useAuthStore', action: 'register' });
      const message = error instanceof Error ? error.message : 'Error al registrar';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  login: async (data: LoginData) => {
    set({ isLoading: true, error: null });
    addBreadcrumb('Iniciando login', 'auth');
    try {
      const user = await loginUser(data);
      setUser(user.id, user.email);
      addBreadcrumb('Login exitoso', 'auth', { userId: user.id });
      set({ user, isLoading: false });
    } catch (error) {
      captureError(error, { component: 'useAuthStore', action: 'login' });
      const message = error instanceof Error ? error.message : 'Error al iniciar sesión';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    addBreadcrumb('Iniciando logout', 'auth');
    try {
      await logoutUser();
      clearUser();
      addBreadcrumb('Logout exitoso', 'auth');
      set({ user: null, isLoading: false });
    } catch (error) {
      captureError(error, { component: 'useAuthStore', action: 'logout' });
      const message = error instanceof Error ? error.message : 'Error al cerrar sesión';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  initialize: () => {
    // Suscribirse a cambios de autenticación
    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await getCurrentUserData(firebaseUser);
          if (userData) {
            setUser(userData.id, userData.email);
            set({ user: userData, isInitialized: true, isLoading: false });
          } else {
            clearUser();
            set({ user: null, isInitialized: true, isLoading: false });
          }
        } catch (error) {
          captureError(error, { component: 'useAuthStore', action: 'initialize' });
          clearUser();
          set({ user: null, isInitialized: true, isLoading: false });
        }
      } else {
        clearUser();
        set({ user: null, isInitialized: true, isLoading: false });
      }
    });

    return unsubscribe;
  },
}));
