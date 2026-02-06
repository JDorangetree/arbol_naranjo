/**
 * Auth Guard - Validación de tokens en operaciones
 *
 * Proporciona funciones para verificar el estado de autenticación
 * antes de realizar operaciones sensibles en Firebase.
 */

import { auth } from './config';
import { User as FirebaseUser } from 'firebase/auth';

/**
 * Errores personalizados para autenticación
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public code: 'NOT_AUTHENTICATED' | 'TOKEN_EXPIRED' | 'TOKEN_REFRESH_FAILED'
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Obtiene el usuario actual autenticado
 * @throws AuthError si no hay usuario autenticado
 */
export function getCurrentUser(): FirebaseUser {
  const user = auth.currentUser;
  if (!user) {
    throw new AuthError(
      'Debes iniciar sesión para realizar esta acción',
      'NOT_AUTHENTICATED'
    );
  }
  return user;
}

/**
 * Verifica que el usuario esté autenticado y que el token sea válido
 * @returns El usuario autenticado si la validación es exitosa
 * @throws AuthError si hay algún problema con la autenticación
 */
export async function validateAuth(): Promise<FirebaseUser> {
  const user = getCurrentUser();

  try {
    // Forzar refresco del token para verificar que sigue siendo válido
    // El parámetro `true` fuerza el refresco
    const tokenResult = await user.getIdTokenResult(false);

    // Verificar si el token ha expirado
    const expirationTime = new Date(tokenResult.expirationTime).getTime();
    const now = Date.now();

    // Si el token expira en menos de 5 minutos, refrescarlo
    const FIVE_MINUTES = 5 * 60 * 1000;
    if (expirationTime - now < FIVE_MINUTES) {
      await user.getIdToken(true); // Forzar refresco
    }

    return user;
  } catch (error) {
    // Si el token no se puede refrescar, la sesión probablemente expiró
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError(
      'Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.',
      'TOKEN_EXPIRED'
    );
  }
}

/**
 * Verifica que el userId coincida con el usuario autenticado
 * Previene que un usuario acceda a datos de otro usuario
 */
export function validateUserAccess(userId: string): void {
  const currentUser = getCurrentUser();
  if (currentUser.uid !== userId) {
    throw new AuthError(
      'No tienes permiso para acceder a estos datos',
      'NOT_AUTHENTICATED'
    );
  }
}

/**
 * Verifica autenticación y acceso a datos del usuario
 * Combina validateAuth y validateUserAccess en una sola llamada
 */
export async function validateAuthAndAccess(userId: string): Promise<FirebaseUser> {
  const user = await validateAuth();
  validateUserAccess(userId);
  return user;
}

/**
 * Wrapper para operaciones que requieren autenticación
 * Valida el token antes de ejecutar la operación
 */
export async function withAuthValidation<T>(
  userId: string,
  operation: () => Promise<T>
): Promise<T> {
  await validateAuthAndAccess(userId);
  return operation();
}

/**
 * Verifica si el usuario está autenticado sin lanzar errores
 */
export function isAuthenticated(): boolean {
  return auth.currentUser !== null;
}

/**
 * Obtiene el ID del usuario actual o null si no está autenticado
 */
export function getCurrentUserId(): string | null {
  return auth.currentUser?.uid ?? null;
}
