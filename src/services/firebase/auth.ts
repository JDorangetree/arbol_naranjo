import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import { User, defaultUserSettings } from '../../types';

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
}

// Iniciar sesión
export async function loginUser(data: LoginData): Promise<User> {
  const { email, password } = data;

  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;

  // Obtener datos del usuario de Firestore
  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

  if (!userDoc.exists()) {
    throw new Error('Usuario no encontrado en la base de datos');
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
