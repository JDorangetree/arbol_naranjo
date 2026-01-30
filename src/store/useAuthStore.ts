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
    try {
      const user = await registerUser(data);
      set({ user, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al registrar';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  login: async (data: LoginData) => {
    set({ isLoading: true, error: null });
    try {
      const user = await loginUser(data);
      set({ user, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al iniciar sesión';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await logoutUser();
      set({ user: null, isLoading: false });
    } catch (error) {
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
          set({ user: userData, isInitialized: true, isLoading: false });
        } catch (error) {
          console.error('Error al obtener datos del usuario:', error);
          set({ user: null, isInitialized: true, isLoading: false });
        }
      } else {
        set({ user: null, isInitialized: true, isLoading: false });
      }
    });

    return unsubscribe;
  },
}));
