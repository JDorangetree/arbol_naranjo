/**
 * Store para el Tema de la Aplicación
 *
 * Gestiona el modo oscuro/claro de la aplicación.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeStoreState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: 'light' | 'dark') {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Actualizar meta tag theme-color para la barra del navegador
  const themeColor = theme === 'dark' ? '#0F172A' : '#16a34a';
  const metaThemeColor = document.querySelector('meta[name="theme-color"]:not([media])');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', themeColor);
  }
}

export const useThemeStore = create<ThemeStoreState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      resolvedTheme: 'light',

      setTheme: (theme: Theme) => {
        const resolved = theme === 'system' ? getSystemTheme() : theme;
        applyTheme(resolved);
        set({ theme, resolvedTheme: resolved });
      },

      toggleTheme: () => {
        const current = get().resolvedTheme;
        const newTheme = current === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
        set({ theme: newTheme, resolvedTheme: newTheme });
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          const resolved = state.theme === 'system' ? getSystemTheme() : state.theme;
          applyTheme(resolved);
          // Usar setState para asegurar que el componente se re-renderice
          setTimeout(() => {
            useThemeStore.setState({ resolvedTheme: resolved });
          }, 0);
        }
      },
    }
  )
);

// Aplicar tema inicial inmediatamente
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('theme-storage');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      const theme = parsed.state?.theme || 'system';
      const resolved = theme === 'system' ? getSystemTheme() : theme;
      applyTheme(resolved);
    } catch {
      applyTheme(getSystemTheme());
    }
  } else {
    applyTheme(getSystemTheme());
  }
}

// Escuchar cambios en el tema del sistema
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const state = useThemeStore.getState();
    if (state.theme === 'system') {
      const newTheme = e.matches ? 'dark' : 'light';
      applyTheme(newTheme);
      useThemeStore.setState({ resolvedTheme: newTheme });
    }
  });
}

// Hooks auxiliares
export function useTheme() {
  return useThemeStore((state) => state.theme);
}

export function useResolvedTheme() {
  return useThemeStore((state) => state.resolvedTheme);
}

export function useIsDarkMode() {
  return useThemeStore((state) => state.resolvedTheme === 'dark');
}
