/**
 * Tests para el servicio de criptografía
 */

import { describe, it, expect } from 'vitest';
import {
  hashPin,
  verifyPin,
  generateSalt,
  serializeHashedPin,
  deserializeHashedPin,
  isLegacyFormat,
  decodeLegacyPin,
  migrateLegacyPin,
} from './crypto';

describe('Crypto Service', () => {
  describe('generateSalt', () => {
    it('genera un salt en formato base64', () => {
      const salt = generateSalt();
      expect(salt).toBeDefined();
      expect(typeof salt).toBe('string');
      expect(salt.length).toBeGreaterThan(0);
    });

    it('genera salts únicos cada vez', () => {
      const salt1 = generateSalt();
      const salt2 = generateSalt();
      expect(salt1).not.toBe(salt2);
    });
  });

  describe('hashPin', () => {
    it('retorna un objeto HashedPin con version, salt y hash', () => {
      const result = hashPin('1234');

      expect(result).toHaveProperty('version', 1);
      expect(result).toHaveProperty('salt');
      expect(result).toHaveProperty('hash');
      expect(typeof result.salt).toBe('string');
      expect(typeof result.hash).toBe('string');
    });

    it('genera hashes diferentes para el mismo PIN (debido al salt)', () => {
      const hash1 = hashPin('1234');
      const hash2 = hashPin('1234');

      expect(hash1.salt).not.toBe(hash2.salt);
      expect(hash1.hash).not.toBe(hash2.hash);
    });

    it('genera hashes diferentes para PINs diferentes', () => {
      const hash1 = hashPin('1234');
      const hash2 = hashPin('5678');

      expect(hash1.hash).not.toBe(hash2.hash);
    });
  });

  describe('verifyPin', () => {
    it('retorna true para el PIN correcto', () => {
      const hashedPin = hashPin('1234');
      const result = verifyPin('1234', hashedPin);

      expect(result).toBe(true);
    });

    it('retorna false para un PIN incorrecto', () => {
      const hashedPin = hashPin('1234');
      const result = verifyPin('5678', hashedPin);

      expect(result).toBe(false);
    });

    it('retorna false para un PIN parcialmente correcto', () => {
      const hashedPin = hashPin('1234');

      expect(verifyPin('123', hashedPin)).toBe(false);
      expect(verifyPin('12345', hashedPin)).toBe(false);
      expect(verifyPin('1235', hashedPin)).toBe(false);
    });

    it('funciona con PINs de diferentes longitudes', () => {
      const shortPin = hashPin('12');
      const longPin = hashPin('123456789');

      expect(verifyPin('12', shortPin)).toBe(true);
      expect(verifyPin('123456789', longPin)).toBe(true);
    });

    it('es case-sensitive para PINs alfanuméricos', () => {
      const hashedPin = hashPin('AbCd');

      expect(verifyPin('AbCd', hashedPin)).toBe(true);
      expect(verifyPin('abcd', hashedPin)).toBe(false);
      expect(verifyPin('ABCD', hashedPin)).toBe(false);
    });
  });

  describe('serializeHashedPin / deserializeHashedPin', () => {
    it('serializa y deserializa correctamente', () => {
      const original = hashPin('1234');
      const serialized = serializeHashedPin(original);
      const deserialized = deserializeHashedPin(serialized);

      expect(deserialized).toEqual(original);
    });

    it('deserialize retorna null para JSON inválido', () => {
      const result = deserializeHashedPin('not-json');
      expect(result).toBeNull();
    });

    it('deserialize retorna null para JSON sin campos requeridos', () => {
      const result = deserializeHashedPin('{"foo": "bar"}');
      expect(result).toBeNull();
    });
  });

  describe('isLegacyFormat', () => {
    it('detecta formato legacy (base64 simple)', () => {
      const legacyPin = btoa('1234'); // "MTIzNA=="
      expect(isLegacyFormat(legacyPin)).toBe(true);
    });

    it('detecta formato nuevo (JSON)', () => {
      const newPin = serializeHashedPin(hashPin('1234'));
      expect(isLegacyFormat(newPin)).toBe(false);
    });

    it('retorna false para strings que no son base64 válido', () => {
      // Caracteres inválidos para base64
      expect(isLegacyFormat('!!!invalid!!!')).toBe(false);
    });
  });

  describe('decodeLegacyPin', () => {
    it('decodifica correctamente un PIN en base64', () => {
      const encoded = btoa('1234');
      const decoded = decodeLegacyPin(encoded);

      expect(decoded).toBe('1234');
    });

    it('retorna null para base64 inválido', () => {
      const result = decodeLegacyPin('!!!invalid!!!');
      expect(result).toBeNull();
    });
  });

  describe('migrateLegacyPin', () => {
    it('migra un PIN legacy al nuevo formato', () => {
      const legacyPin = btoa('1234');
      const migrated = migrateLegacyPin(legacyPin);

      expect(migrated).not.toBeNull();
      expect(migrated).toHaveProperty('version', 1);
      expect(migrated).toHaveProperty('salt');
      expect(migrated).toHaveProperty('hash');

      // Verificar que el PIN migrado funciona
      expect(verifyPin('1234', migrated!)).toBe(true);
      expect(verifyPin('5678', migrated!)).toBe(false);
    });

    it('retorna null para formato inválido', () => {
      const result = migrateLegacyPin('!!!invalid!!!');
      expect(result).toBeNull();
    });
  });

  describe('Seguridad', () => {
    it('el hash no contiene el PIN original', () => {
      const pin = '1234';
      const hashedPin = hashPin(pin);
      const serialized = serializeHashedPin(hashedPin);

      expect(serialized).not.toContain(pin);
      expect(hashedPin.hash).not.toContain(pin);
      expect(hashedPin.salt).not.toContain(pin);
    });

    it('no es posible revertir el hash al PIN original', () => {
      // Este test es más conceptual - verificamos que no hay método de decode
      const hashedPin = hashPin('1234');

      // No existe función para revertir
      expect(typeof (hashedPin as any).decode).toBe('undefined');

      // El hash es diferente del PIN codificado en base64
      expect(hashedPin.hash).not.toBe(btoa('1234'));
    });
  });
});
