/**
 * Store para el Modo de Aplicación
 *
 * Gestiona el modo de la aplicación (padre vs hijo) y la configuración
 * relacionada con el acceso y visualización de contenido.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppMode, AppModeState } from '../types/app.types';
import {
  hashPin,
  verifyPin as verifyCryptoPin,
  serializeHashedPin,
  deserializeHashedPin,
  isLegacyFormat,
  migrateLegacyPin,
  HashedPin,
} from '../services/crypto';

interface AppModeStoreState extends AppModeState {
  // Estado adicional
  isChildModeUnlocked: boolean;  // Si el modo hijo fue desbloqueado con PIN

  // Acciones
  setMode: (mode: AppMode) => void;
  toggleMode: () => void;
  updateChildAge: (birthDate: Date) => void;
  setChildModeSettings: (settings: AppModeState['childModeSettings']) => void;

  // PIN para modo hijo
  setChildModePin: (pin: string) => void;
  verifyPin: (pin: string) => boolean;
  unlockChildMode: (pin: string) => boolean;
  lockChildMode: () => void;

  // Utilidades
  canEdit: () => boolean;
  canViewSection: (section: string) => boolean;
  getVisibleAge: () => number;
}

// Calcular edad a partir de fecha de nacimiento
function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return Math.max(0, age);
}

// PIN por defecto (el usuario puede cambiarlo)
const DEFAULT_PIN = '1234';

export const useAppModeStore = create<AppModeStoreState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      mode: 'parent' as AppMode,
      childCurrentAge: 0,
      lastModeChange: new Date(),
      childModeSettings: {
        showFinancialDetails: false,
        allowedSections: ['dashboard', 'history', 'chapters', 'story_mode'],
      },
      isChildModeUnlocked: false,

      // Cambiar modo
      setMode: (mode: AppMode) => {
        set({
          mode,
          lastModeChange: new Date(),
          // Si cambia a modo padre, desbloquear automáticamente
          isChildModeUnlocked: mode === 'parent' ? false : get().isChildModeUnlocked,
        });
      },

      // Alternar entre modos
      toggleMode: () => {
        const currentMode = get().mode;
        const newMode = currentMode === 'parent' ? 'child_readonly' : 'parent';

        // Si va a modo padre desde hijo, verificar PIN
        if (currentMode === 'child_readonly' && newMode === 'parent') {
          // No cambiar automáticamente, requiere PIN
          return;
        }

        set({
          mode: newMode,
          lastModeChange: new Date(),
        });
      },

      // Actualizar edad del niño
      updateChildAge: (birthDate: Date) => {
        const age = calculateAge(birthDate);
        set({ childCurrentAge: age });
      },

      // Configurar ajustes del modo hijo
      setChildModeSettings: (settings) => {
        set({ childModeSettings: settings });
      },

      // Establecer PIN para modo hijo
      setChildModePin: (pin: string) => {
        // Hashear el PIN de forma segura antes de almacenar
        const hashedPin = hashPin(pin);
        localStorage.setItem('childModePin', serializeHashedPin(hashedPin));
      },

      // Verificar PIN
      verifyPin: (pin: string) => {
        const storedPin = localStorage.getItem('childModePin');

        // Si no hay PIN almacenado, usar el default
        if (!storedPin) {
          return pin === DEFAULT_PIN;
        }

        // Verificar si es formato legacy (base64 simple)
        if (isLegacyFormat(storedPin)) {
          // Migrar automáticamente al nuevo formato
          const migratedPin = migrateLegacyPin(storedPin);
          if (migratedPin) {
            // Guardar en nuevo formato
            localStorage.setItem('childModePin', serializeHashedPin(migratedPin));
            // Verificar con el nuevo formato
            return verifyCryptoPin(pin, migratedPin);
          }
          // Si la migración falla, usar default
          return pin === DEFAULT_PIN;
        }

        // Formato nuevo: deserializar y verificar
        const hashedPin = deserializeHashedPin(storedPin);
        if (!hashedPin) {
          return pin === DEFAULT_PIN;
        }

        return verifyCryptoPin(pin, hashedPin);
      },

      // Desbloquear modo hijo (para volver a modo padre)
      unlockChildMode: (pin: string) => {
        if (get().verifyPin(pin)) {
          set({
            mode: 'parent',
            isChildModeUnlocked: true,
            lastModeChange: new Date(),
          });
          return true;
        }
        return false;
      },

      // Bloquear en modo hijo
      lockChildMode: () => {
        set({
          mode: 'child_readonly',
          isChildModeUnlocked: false,
          lastModeChange: new Date(),
        });
      },

      // Verificar si puede editar
      canEdit: () => {
        return get().mode === 'parent';
      },

      // Verificar si puede ver una sección
      canViewSection: (section: string) => {
        const state = get();

        if (state.mode === 'parent') {
          return true;
        }

        // En modo hijo, verificar secciones permitidas
        return state.childModeSettings?.allowedSections.includes(section) ?? false;
      },

      // Obtener edad visible (para filtrar contenido)
      getVisibleAge: () => {
        return get().childCurrentAge;
      },
    }),
    {
      name: 'app-mode-storage',
      // Solo persistir algunos campos
      partialize: (state) => ({
        mode: state.mode,
        childCurrentAge: state.childCurrentAge,
        childModeSettings: state.childModeSettings,
      }),
    }
  )
);

// ============================================
// HOOKS AUXILIARES
// ============================================

/**
 * Hook para verificar si estamos en modo lectura
 */
export function useIsReadOnly(): boolean {
  return useAppModeStore((state) => state.mode === 'child_readonly');
}

/**
 * Hook para obtener el modo actual
 */
export function useAppMode(): AppMode {
  return useAppModeStore((state) => state.mode);
}

/**
 * Hook para verificar permisos de edición
 */
export function useCanEdit(): boolean {
  return useAppModeStore((state) => state.canEdit());
}

/**
 * Hook para obtener la edad del niño
 */
export function useChildAge(): number {
  return useAppModeStore((state) => state.childCurrentAge);
}
