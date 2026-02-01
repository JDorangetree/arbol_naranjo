import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
  AuthError,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import { User, defaultUserSettings } from '../../types';

/**
 * Mensajes de error amigables alineados con la visión del proyecto
 * "El Tesoro de Tomás" - Una historia de acompañamiento, no de control
 */
function getFriendlyErrorMessage(error: AuthError): string {
  const errorMessages: Record<string, string> = {
    // Errores de inicio de sesión
    'auth/invalid-credential': 'El correo o la contraseña no coinciden. Revisa los datos e intenta de nuevo.',
    'auth/user-not-found': 'No encontramos una cuenta con este correo. ¿Quizás aún no te has registrado?',
    'auth/wrong-password': 'La contraseña no es correcta. Tómate tu tiempo y vuelve a intentarlo.',
    'auth/invalid-email': 'El formato del correo no parece correcto. Revísalo con calma.',
    'auth/user-disabled': 'Esta cuenta ha sido desactivada. Si crees que es un error, contáctanos.',

    // Errores de registro
    'auth/email-already-in-use': 'Ya existe una cuenta con este correo. ¿Quizás ya te registraste antes?',
    'auth/weak-password': 'La contraseña necesita ser más fuerte. Intenta con al menos 6 caracteres.',
    'auth/operation-not-allowed': 'Este método de registro no está disponible en este momento.',

    // Errores de red y límites
    'auth/network-request-failed': 'Parece que hay un problema de conexión. Verifica tu internet e intenta de nuevo.',
    'auth/too-many-requests': 'Demasiados intentos. Espera un momento antes de volver a intentar.',
    'auth/internal-error': 'Algo salió mal de nuestro lado. Por favor, intenta de nuevo en un momento.',

    // Errores de sesión
    'auth/requires-recent-login': 'Por seguridad, necesitas volver a iniciar sesión para realizar esta acción.',
    'auth/session-expired': 'Tu sesión ha expirado. Vuelve a iniciar sesión para continuar.',
  };

  return errorMessages[error.code] || 'Algo no salió como esperábamos. Intenta de nuevo.';
}

export interface RegisterData {
  email: string;
  password: string;
  displayName: string;
  childName: string;
  childBirthDate: Date;
}

export interface LoginData {
  email: string;
  password: string;
}

// Registrar un nuevo usuario
export async function registerUser(data: RegisterData): Promise<User> {
  const { email, password, displayName, childName, childBirthDate } = data;

  try {
    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

  // Actualizar perfil con nombre
  await updateProfile(firebaseUser, { displayName });

  // Crear documento de usuario en Firestore
  const userData: Omit<User, 'id'> = {
    email,
    displayName,
    childName,
    childBirthDate,
    createdAt: new Date(),
    settings: defaultUserSettings,
  };

  await setDoc(doc(db, 'users', firebaseUser.uid), {
    ...userData,
    childBirthDate: childBirthDate,
    createdAt: serverTimestamp(),
  });

    return {
      id: firebaseUser.uid,
      ...userData,
    };
  } catch (error) {
    if ((error as AuthError).code) {
      throw new Error(getFriendlyErrorMessage(error as AuthError));
    }
    throw new Error('No pudimos completar el registro. Intenta de nuevo.');
  }
}

// Iniciar sesión
export async function loginUser(data: LoginData): Promise<User> {
  const { email, password } = data;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Obtener datos del usuario de Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

    if (!userDoc.exists()) {
      throw new Error('Encontramos tu cuenta, pero faltan algunos datos. Intenta registrarte de nuevo.');
    }

    const userData = userDoc.data();

    return {
      id: firebaseUser.uid,
      email: userData.email,
      displayName: userData.displayName,
      childName: userData.childName,
      childBirthDate: userData.childBirthDate?.toDate() || new Date(),
      createdAt: userData.createdAt?.toDate() || new Date(),
      settings: userData.settings || defaultUserSettings,
    };
  } catch (error) {
    if ((error as AuthError).code) {
      throw new Error(getFriendlyErrorMessage(error as AuthError));
    }
    // Si ya es un error con mensaje amigable, lo pasamos
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('No pudimos iniciar sesión. Intenta de nuevo.');
  }
}

// Cerrar sesión
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// Obtener usuario actual de Firestore
export async function getCurrentUserData(firebaseUser: FirebaseUser): Promise<User | null> {
  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

  if (!userDoc.exists()) {
    return null;
  }

  const userData = userDoc.data();

  return {
    id: firebaseUser.uid,
    email: userData.email,
    displayName: userData.displayName,
    childName: userData.childName,
    childBirthDate: userData.childBirthDate?.toDate() || new Date(),
    createdAt: userData.createdAt?.toDate() || new Date(),
    settings: userData.settings || defaultUserSettings,
  };
}

// Suscribirse a cambios de autenticación
export function subscribeToAuthChanges(
  callback: (user: FirebaseUser | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}
