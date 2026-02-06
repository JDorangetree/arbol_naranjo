/**
 * Servicio de Criptografía
 *
 * Proporciona funciones seguras para hash y verificación de PINs/contraseñas.
 * Usa tweetnacl para operaciones criptográficas.
 */

import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64 } from 'tweetnacl-util';

// Número de iteraciones para key derivation (aumenta la dificultad de fuerza bruta)
const ITERATIONS = 10000;
const SALT_LENGTH = 16;
const HASH_LENGTH = 32;

/**
 * Genera un salt aleatorio
 */
export function generateSalt(): string {
  const salt = nacl.randomBytes(SALT_LENGTH);
  return encodeBase64(salt);
}

/**
 * Deriva una clave a partir de un PIN y salt usando múltiples iteraciones
 * Esto hace que los ataques de fuerza bruta sean más costosos
 */
function deriveKey(pin: string, salt: Uint8Array): Uint8Array {
  // Convertir PIN a bytes
  const encoder = new TextEncoder();
  let data = encoder.encode(pin);

  // Combinar con salt
  const combined = new Uint8Array(data.length + salt.length);
  combined.set(data);
  combined.set(salt, data.length);

  // Aplicar hash múltiples veces (key stretching simple)
  let result = nacl.hash(combined);
  for (let i = 1; i < ITERATIONS; i++) {
    result = nacl.hash(result);
  }

  // Retornar los primeros HASH_LENGTH bytes
  return result.slice(0, HASH_LENGTH);
}

/**
 * Estructura del PIN hasheado almacenado
 */
export interface HashedPin {
  version: number;  // Versión del algoritmo (para migraciones futuras)
  salt: string;     // Salt en base64
  hash: string;     // Hash en base64
}

/**
 * Hashea un PIN de forma segura
 * @param pin - El PIN en texto plano
 * @returns Objeto con salt y hash para almacenar
 */
export function hashPin(pin: string): HashedPin {
  const salt = nacl.randomBytes(SALT_LENGTH);
  const hash = deriveKey(pin, salt);

  return {
    version: 1,
    salt: encodeBase64(salt),
    hash: encodeBase64(hash),
  };
}

/**
 * Verifica un PIN contra un hash almacenado
 * @param pin - El PIN ingresado por el usuario
 * @param stored - El objeto HashedPin almacenado
 * @returns true si el PIN es correcto
 */
export function verifyPin(pin: string, stored: HashedPin): boolean {
  try {
    // Decodificar salt
    const salt = decodeBase64(stored.salt);

    // Derivar clave del PIN ingresado
    const derivedHash = deriveKey(pin, salt);

    // Decodificar hash almacenado
    const storedHash = decodeBase64(stored.hash);

    // Comparación en tiempo constante para prevenir timing attacks
    return nacl.verify(derivedHash, storedHash);
  } catch (error) {
    console.error('Error verificando PIN:', error);
    return false;
  }
}

/**
 * Serializa un HashedPin a string para almacenar
 */
export function serializeHashedPin(hashedPin: HashedPin): string {
  return JSON.stringify(hashedPin);
}

/**
 * Deserializa un string a HashedPin
 * También maneja el formato legacy (base64 simple)
 */
export function deserializeHashedPin(stored: string): HashedPin | null {
  try {
    // Intentar parsear como JSON (formato nuevo)
    const parsed = JSON.parse(stored);
    if (parsed.version && parsed.salt && parsed.hash) {
      return parsed as HashedPin;
    }
  } catch {
    // No es JSON, podría ser formato legacy
  }

  return null;
}

/**
 * Verifica si un string almacenado es formato legacy (base64 simple)
 */
export function isLegacyFormat(stored: string): boolean {
  try {
    // Si es JSON válido con nuestro formato, no es legacy
    const parsed = JSON.parse(stored);
    if (parsed.version && parsed.salt && parsed.hash) {
      return false;
    }
  } catch {
    // No es JSON
  }

  // Intentar decodificar como base64
  try {
    atob(stored);
    return true;
  } catch {
    return false;
  }
}

/**
 * Decodifica PIN en formato legacy (base64)
 * Solo para migración
 */
export function decodeLegacyPin(stored: string): string | null {
  try {
    return atob(stored);
  } catch {
    return null;
  }
}

/**
 * Migra un PIN del formato legacy al nuevo formato hasheado
 * @param legacyStored - El PIN en formato base64
 * @returns El nuevo HashedPin o null si falla
 */
export function migrateLegacyPin(legacyStored: string): HashedPin | null {
  const plainPin = decodeLegacyPin(legacyStored);
  if (!plainPin) return null;

  return hashPin(plainPin);
}
