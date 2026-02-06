/**
 * Integration tests para el servicio de autenticación
 * Tests de registerUser, loginUser, logoutUser, getCurrentUserData, subscribeToAuthChanges
 */

import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUserData,
  subscribeToAuthChanges,
  RegisterData,
  LoginData,
} from './auth';
import { defaultUserSettings } from '../../types';

// Mock de Firebase Auth
vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

// Mock de Firebase Firestore
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  serverTimestamp: vi.fn(() => ({ _serverTimestamp: true })),
}));

// Mock de config
vi.mock('./config', () => ({
  auth: {},
  db: {},
}));

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // REGISTER USER TESTS
  // ============================================
  describe('registerUser', () => {
    const validRegisterData: RegisterData = {
      email: 'padre@ejemplo.com',
      password: 'contraseña123',
      displayName: 'Juan Pérez',
      childName: 'Tomás',
      childBirthDate: new Date('2020-05-15'),
    };

    it('registra un nuevo usuario exitosamente', async () => {
      const mockFirebaseUser = {
        uid: 'user-123',
        email: 'padre@ejemplo.com',
      };

      (createUserWithEmailAndPassword as Mock).mockResolvedValue({
        user: mockFirebaseUser,
      });
      (updateProfile as Mock).mockResolvedValue(undefined);
      (doc as Mock).mockReturnValue({ id: 'user-123' });
      (setDoc as Mock).mockResolvedValue(undefined);

      const result = await registerUser(validRegisterData);

      // Verifica que se creó el usuario en Firebase Auth
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        validRegisterData.email,
        validRegisterData.password
      );

      // Verifica que se actualizó el perfil
      expect(updateProfile).toHaveBeenCalledWith(mockFirebaseUser, {
        displayName: validRegisterData.displayName,
      });

      // Verifica que se guardó en Firestore
      expect(setDoc).toHaveBeenCalled();

      // Verifica el resultado
      expect(result).toMatchObject({
        id: 'user-123',
        email: validRegisterData.email,
        displayName: validRegisterData.displayName,
        childName: validRegisterData.childName,
        settings: defaultUserSettings,
      });
    });

    it('lanza error amigable cuando el email ya está en uso', async () => {
      const authError = { code: 'auth/email-already-in-use' };
      (createUserWithEmailAndPassword as Mock).mockRejectedValue(authError);

      await expect(registerUser(validRegisterData)).rejects.toThrow(
        'Ya existe una cuenta con este correo'
      );
    });

    it('lanza error amigable cuando la contraseña es débil', async () => {
      const authError = { code: 'auth/weak-password' };
      (createUserWithEmailAndPassword as Mock).mockRejectedValue(authError);

      await expect(registerUser(validRegisterData)).rejects.toThrow(
        'La contraseña necesita ser más fuerte'
      );
    });

    it('lanza error amigable cuando hay error de red', async () => {
      const authError = { code: 'auth/network-request-failed' };
      (createUserWithEmailAndPassword as Mock).mockRejectedValue(authError);

      await expect(registerUser(validRegisterData)).rejects.toThrow(
        'Parece que hay un problema de conexión'
      );
    });

    it('lanza error genérico cuando el error no tiene código', async () => {
      (createUserWithEmailAndPassword as Mock).mockRejectedValue(new Error('Unknown'));

      await expect(registerUser(validRegisterData)).rejects.toThrow(
        'No pudimos completar el registro'
      );
    });

    it('incluye settings por defecto en el usuario creado', async () => {
      const mockFirebaseUser = { uid: 'user-123', email: 'test@test.com' };

      (createUserWithEmailAndPassword as Mock).mockResolvedValue({
        user: mockFirebaseUser,
      });
      (updateProfile as Mock).mockResolvedValue(undefined);
      (doc as Mock).mockReturnValue({ id: 'user-123' });
      (setDoc as Mock).mockResolvedValue(undefined);

      const result = await registerUser(validRegisterData);

      expect(result.settings).toEqual(defaultUserSettings);
      expect(result.settings.currency).toBe('COP');
      expect(result.settings.theme).toBe('light');
    });
  });

  // ============================================
  // LOGIN USER TESTS
  // ============================================
  describe('loginUser', () => {
    const validLoginData: LoginData = {
      email: 'padre@ejemplo.com',
      password: 'contraseña123',
    };

    it('inicia sesión exitosamente', async () => {
      const mockFirebaseUser = {
        uid: 'user-123',
        email: 'padre@ejemplo.com',
      };

      const mockUserData = {
        email: 'padre@ejemplo.com',
        displayName: 'Juan Pérez',
        childName: 'Tomás',
        childBirthDate: { toDate: () => new Date('2020-05-15') },
        createdAt: { toDate: () => new Date('2024-01-01') },
        settings: defaultUserSettings,
      };

      (signInWithEmailAndPassword as Mock).mockResolvedValue({
        user: mockFirebaseUser,
      });
      (doc as Mock).mockReturnValue({ id: 'user-123' });
      (getDoc as Mock).mockResolvedValue({
        exists: () => true,
        data: () => mockUserData,
      });

      const result = await loginUser(validLoginData);

      // Verifica que se autenticó en Firebase
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        validLoginData.email,
        validLoginData.password
      );

      // Verifica el resultado
      expect(result).toMatchObject({
        id: 'user-123',
        email: 'padre@ejemplo.com',
        displayName: 'Juan Pérez',
        childName: 'Tomás',
      });
    });

    it('lanza error amigable cuando las credenciales son inválidas', async () => {
      const authError = { code: 'auth/invalid-credential' };
      (signInWithEmailAndPassword as Mock).mockRejectedValue(authError);

      await expect(loginUser(validLoginData)).rejects.toThrow(
        'El correo o la contraseña no coinciden'
      );
    });

    it('lanza error amigable cuando el usuario no existe', async () => {
      const authError = { code: 'auth/user-not-found' };
      (signInWithEmailAndPassword as Mock).mockRejectedValue(authError);

      await expect(loginUser(validLoginData)).rejects.toThrow(
        'No encontramos una cuenta con este correo'
      );
    });

    it('lanza error amigable cuando la contraseña es incorrecta', async () => {
      const authError = { code: 'auth/wrong-password' };
      (signInWithEmailAndPassword as Mock).mockRejectedValue(authError);

      await expect(loginUser(validLoginData)).rejects.toThrow(
        'La contraseña no es correcta'
      );
    });

    it('lanza error amigable cuando hay demasiados intentos', async () => {
      const authError = { code: 'auth/too-many-requests' };
      (signInWithEmailAndPassword as Mock).mockRejectedValue(authError);

      await expect(loginUser(validLoginData)).rejects.toThrow(
        'Demasiados intentos'
      );
    });

    it('lanza error cuando el documento del usuario no existe', async () => {
      const mockFirebaseUser = { uid: 'user-123' };

      (signInWithEmailAndPassword as Mock).mockResolvedValue({
        user: mockFirebaseUser,
      });
      (doc as Mock).mockReturnValue({ id: 'user-123' });
      (getDoc as Mock).mockResolvedValue({
        exists: () => false,
      });

      await expect(loginUser(validLoginData)).rejects.toThrow(
        'Encontramos tu cuenta, pero faltan algunos datos'
      );
    });

    it('usa settings por defecto si no hay settings guardados', async () => {
      const mockFirebaseUser = { uid: 'user-123' };

      const mockUserData = {
        email: 'padre@ejemplo.com',
        displayName: 'Juan',
        childName: 'Tomás',
        childBirthDate: { toDate: () => new Date() },
        createdAt: { toDate: () => new Date() },
        // Sin settings
      };

      (signInWithEmailAndPassword as Mock).mockResolvedValue({
        user: mockFirebaseUser,
      });
      (doc as Mock).mockReturnValue({ id: 'user-123' });
      (getDoc as Mock).mockResolvedValue({
        exists: () => true,
        data: () => mockUserData,
      });

      const result = await loginUser(validLoginData);

      expect(result.settings).toEqual(defaultUserSettings);
    });

    it('maneja fechas faltantes con valores por defecto', async () => {
      const mockFirebaseUser = { uid: 'user-123' };

      const mockUserData = {
        email: 'padre@ejemplo.com',
        displayName: 'Juan',
        childName: 'Tomás',
        // Sin fechas
      };

      (signInWithEmailAndPassword as Mock).mockResolvedValue({
        user: mockFirebaseUser,
      });
      (doc as Mock).mockReturnValue({ id: 'user-123' });
      (getDoc as Mock).mockResolvedValue({
        exists: () => true,
        data: () => mockUserData,
      });

      const result = await loginUser(validLoginData);

      expect(result.childBirthDate).toBeInstanceOf(Date);
      expect(result.createdAt).toBeInstanceOf(Date);
    });
  });

  // ============================================
  // LOGOUT USER TESTS
  // ============================================
  describe('logoutUser', () => {
    it('cierra la sesión correctamente', async () => {
      (signOut as Mock).mockResolvedValue(undefined);

      await logoutUser();

      expect(signOut).toHaveBeenCalled();
    });

    it('propaga errores de signOut', async () => {
      (signOut as Mock).mockRejectedValue(new Error('Signout failed'));

      await expect(logoutUser()).rejects.toThrow('Signout failed');
    });
  });

  // ============================================
  // GET CURRENT USER DATA TESTS
  // ============================================
  describe('getCurrentUserData', () => {
    it('retorna datos del usuario desde Firestore', async () => {
      const mockFirebaseUser = { uid: 'user-123' };

      const mockUserData = {
        email: 'padre@ejemplo.com',
        displayName: 'Juan Pérez',
        childName: 'Tomás',
        childBirthDate: { toDate: () => new Date('2020-05-15') },
        createdAt: { toDate: () => new Date('2024-01-01') },
        settings: { ...defaultUserSettings, theme: 'dark' },
      };

      (doc as Mock).mockReturnValue({ id: 'user-123' });
      (getDoc as Mock).mockResolvedValue({
        exists: () => true,
        data: () => mockUserData,
      });

      const result = await getCurrentUserData(mockFirebaseUser as any);

      expect(result).toMatchObject({
        id: 'user-123',
        email: 'padre@ejemplo.com',
        displayName: 'Juan Pérez',
        childName: 'Tomás',
      });
      expect(result?.settings.theme).toBe('dark');
    });

    it('retorna null si el documento no existe', async () => {
      const mockFirebaseUser = { uid: 'user-123' };

      (doc as Mock).mockReturnValue({ id: 'user-123' });
      (getDoc as Mock).mockResolvedValue({
        exists: () => false,
      });

      const result = await getCurrentUserData(mockFirebaseUser as any);

      expect(result).toBeNull();
    });

    it('usa valores por defecto para fechas y settings faltantes', async () => {
      const mockFirebaseUser = { uid: 'user-123' };

      const mockUserData = {
        email: 'padre@ejemplo.com',
        displayName: 'Juan',
        childName: 'Tomás',
        // Sin fechas ni settings
      };

      (doc as Mock).mockReturnValue({ id: 'user-123' });
      (getDoc as Mock).mockResolvedValue({
        exists: () => true,
        data: () => mockUserData,
      });

      const result = await getCurrentUserData(mockFirebaseUser as any);

      expect(result?.childBirthDate).toBeInstanceOf(Date);
      expect(result?.createdAt).toBeInstanceOf(Date);
      expect(result?.settings).toEqual(defaultUserSettings);
    });
  });

  // ============================================
  // SUBSCRIBE TO AUTH CHANGES TESTS
  // ============================================
  describe('subscribeToAuthChanges', () => {
    it('llama a onAuthStateChanged con el callback', () => {
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();

      (onAuthStateChanged as Mock).mockReturnValue(mockUnsubscribe);

      const unsubscribe = subscribeToAuthChanges(mockCallback);

      expect(onAuthStateChanged).toHaveBeenCalledWith(
        expect.anything(),
        mockCallback
      );
      expect(unsubscribe).toBe(mockUnsubscribe);
    });

    it('retorna función de unsubscribe', () => {
      const mockUnsubscribe = vi.fn();
      (onAuthStateChanged as Mock).mockReturnValue(mockUnsubscribe);

      const unsubscribe = subscribeToAuthChanges(() => {});

      expect(typeof unsubscribe).toBe('function');
    });
  });

  // ============================================
  // FLUJO COMPLETO DE AUTENTICACIÓN
  // ============================================
  describe('Flujo completo', () => {
    it('register -> logout -> login mantiene datos consistentes', async () => {
      const registerData: RegisterData = {
        email: 'nuevo@ejemplo.com',
        password: 'password123',
        displayName: 'Nuevo Usuario',
        childName: 'María',
        childBirthDate: new Date('2021-03-10'),
      };

      const mockFirebaseUser = {
        uid: 'new-user-id',
        email: registerData.email,
      };

      // 1. REGISTRO
      (createUserWithEmailAndPassword as Mock).mockResolvedValue({
        user: mockFirebaseUser,
      });
      (updateProfile as Mock).mockResolvedValue(undefined);
      (doc as Mock).mockReturnValue({ id: mockFirebaseUser.uid });
      (setDoc as Mock).mockResolvedValue(undefined);

      const registeredUser = await registerUser(registerData);
      expect(registeredUser.childName).toBe('María');
      expect(registeredUser.displayName).toBe('Nuevo Usuario');

      // 2. LOGOUT
      (signOut as Mock).mockResolvedValue(undefined);
      await logoutUser();
      expect(signOut).toHaveBeenCalled();

      // 3. LOGIN (con los mismos datos)
      const mockStoredData = {
        email: registerData.email,
        displayName: registerData.displayName,
        childName: registerData.childName,
        childBirthDate: { toDate: () => registerData.childBirthDate },
        createdAt: { toDate: () => new Date() },
        settings: defaultUserSettings,
      };

      (signInWithEmailAndPassword as Mock).mockResolvedValue({
        user: mockFirebaseUser,
      });
      (getDoc as Mock).mockResolvedValue({
        exists: () => true,
        data: () => mockStoredData,
      });

      const loggedInUser = await loginUser({
        email: registerData.email,
        password: registerData.password,
      });

      // Los datos deben ser consistentes
      expect(loggedInUser.id).toBe(registeredUser.id);
      expect(loggedInUser.childName).toBe(registeredUser.childName);
      expect(loggedInUser.displayName).toBe(registeredUser.displayName);
    });
  });

  // ============================================
  // TESTS DE MENSAJES DE ERROR
  // ============================================
  describe('Mensajes de error amigables', () => {
    const testCases = [
      { code: 'auth/invalid-email', contains: 'formato del correo' },
      { code: 'auth/user-disabled', contains: 'cuenta ha sido desactivada' },
      { code: 'auth/operation-not-allowed', contains: 'método de registro no está disponible' },
      { code: 'auth/internal-error', contains: 'Algo salió mal' },
      { code: 'auth/requires-recent-login', contains: 'volver a iniciar sesión' },
      { code: 'auth/session-expired', contains: 'sesión ha expirado' },
    ];

    testCases.forEach(({ code, contains }) => {
      it(`muestra mensaje amigable para ${code}`, async () => {
        const authError = { code };
        (createUserWithEmailAndPassword as Mock).mockRejectedValue(authError);

        await expect(
          registerUser({
            email: 'test@test.com',
            password: 'password',
            displayName: 'Test',
            childName: 'Child',
            childBirthDate: new Date(),
          })
        ).rejects.toThrow(contains);
      });
    });

    it('muestra mensaje genérico para códigos de error desconocidos', async () => {
      const authError = { code: 'auth/unknown-error-xyz' };
      (createUserWithEmailAndPassword as Mock).mockRejectedValue(authError);

      await expect(
        registerUser({
          email: 'test@test.com',
          password: 'password',
          displayName: 'Test',
          childName: 'Child',
          childBirthDate: new Date(),
        })
      ).rejects.toThrow('Algo no salió como esperábamos');
    });
  });
});
