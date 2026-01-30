/**
 * Servicio de Migración de Datos
 *
 * Migra los datos del modelo antiguo (Transaction con campos mixtos)
 * al nuevo modelo de 3 capas (Financial, Metadata, Emotional).
 *
 * La migración es:
 * - Reversible: Se puede volver al modelo anterior
 * - Incremental: Se puede ejecutar múltiples veces sin duplicar datos
 * - Segura: No elimina datos originales hasta confirmar éxito
 */

import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { Transaction } from '../../types';
import {
  FinancialTransaction,
  FinancialTransactionType,
  Currency,
} from '../../types/financial.types';
import {
  TransactionMetadata,
  MilestoneType,
} from '../../types/metadata.types';

// ============================================
// TIPOS PARA MIGRACIÓN
// ============================================

export interface MigrationResult {
  success: boolean;
  migratedTransactions: number;
  createdFinancialRecords: number;
  createdMetadataRecords: number;
  skippedRecords: number;
  errors: string[];
  warnings: string[];
  duration: number;
}

export interface MigrationStatus {
  isMigrated: boolean;
  lastMigrationDate?: Date;
  version: string;
  originalTransactionCount: number;
  financialTransactionCount: number;
  metadataCount: number;
}

// Versión actual del formato de migración
const MIGRATION_VERSION = '1.0.0';

// ============================================
// FUNCIONES DE MIGRACIÓN
// ============================================

/**
 * Verifica el estado de migración de un usuario
 */
export async function getMigrationStatus(userId: string): Promise<MigrationStatus> {
  // Verificar si existe el documento de estado de migración
  const statusRef = doc(db, 'users', userId, 'migration', 'status');

  try {
    const statusDoc = await getDocs(
      query(collection(db, 'users', userId, 'migration'))
    );

    // Contar registros en cada colección
    const [originalTx, financialTx, metadata] = await Promise.all([
      getDocs(query(collection(db, 'transactions'), where('userId', '==', userId))),
      getDocs(collection(db, 'users', userId, 'financial', 'transactions')),
      getDocs(collection(db, 'users', userId, 'metadata', 'transactionMeta')),
    ]);

    const statusData = statusDoc.docs.find(d => d.id === 'status')?.data();

    return {
      isMigrated: !!statusData?.completedAt,
      lastMigrationDate: statusData?.completedAt?.toDate(),
      version: statusData?.version || '0.0.0',
      originalTransactionCount: originalTx.size,
      financialTransactionCount: financialTx.size,
      metadataCount: metadata.size,
    };
  } catch (error) {
    console.error('Error getting migration status:', error);
    return {
      isMigrated: false,
      version: '0.0.0',
      originalTransactionCount: 0,
      financialTransactionCount: 0,
      metadataCount: 0,
    };
  }
}

/**
 * Migra las transacciones existentes al nuevo modelo de 3 capas
 */
export async function migrateUserData(userId: string): Promise<MigrationResult> {
  const startTime = Date.now();
  const result: MigrationResult = {
    success: false,
    migratedTransactions: 0,
    createdFinancialRecords: 0,
    createdMetadataRecords: 0,
    skippedRecords: 0,
    errors: [],
    warnings: [],
    duration: 0,
  };

  try {
    // 1. Obtener todas las transacciones originales
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      result.warnings.push('No hay transacciones para migrar');
      result.success = true;
      result.duration = Date.now() - startTime;
      return result;
    }

    // 2. Procesar cada transacción
    const batch = writeBatch(db);
    const processedIds = new Set<string>();

    for (const docSnapshot of snapshot.docs) {
      const originalData = docSnapshot.data();
      const originalId = docSnapshot.id;

      // Verificar si ya fue migrada
      if (processedIds.has(originalId)) {
        result.skippedRecords++;
        continue;
      }

      try {
        // Convertir a Transaction tipada
        const transaction = mapDocToTransaction(docSnapshot.id, originalData);

        // 3. Crear registro financiero (solo datos duros)
        const financialRecord = extractFinancialData(transaction, userId);
        const financialRef = doc(
          db,
          'users',
          userId,
          'financial',
          'transactions',
          originalId
        );
        batch.set(financialRef, {
          ...financialRecord,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        result.createdFinancialRecords++;

        // 4. Crear registro de metadatos (si hay contexto)
        if (hasMetadata(transaction)) {
          const metadataRecord = extractMetadata(transaction, userId, originalId);
          const metadataRef = doc(
            db,
            'users',
            userId,
            'metadata',
            'transactionMeta',
            originalId
          );
          batch.set(metadataRef, {
            ...metadataRecord,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          result.createdMetadataRecords++;
        }

        processedIds.add(originalId);
        result.migratedTransactions++;
      } catch (error) {
        result.errors.push(
          `Error migrando transacción ${originalId}: ${error}`
        );
      }
    }

    // 5. Ejecutar el batch
    await batch.commit();

    // 6. Guardar estado de migración
    const statusRef = doc(db, 'users', userId, 'migration', 'status');
    await setDoc(statusRef, {
      version: MIGRATION_VERSION,
      startedAt: Timestamp.fromMillis(startTime),
      completedAt: serverTimestamp(),
      stats: {
        migratedTransactions: result.migratedTransactions,
        createdFinancialRecords: result.createdFinancialRecords,
        createdMetadataRecords: result.createdMetadataRecords,
        skippedRecords: result.skippedRecords,
        errors: result.errors.length,
      },
    });

    result.success = true;
  } catch (error) {
    result.errors.push(`Error general de migración: ${error}`);
  }

  result.duration = Date.now() - startTime;
  return result;
}

/**
 * Verifica la integridad de la migración
 */
export async function verifyMigration(userId: string): Promise<{
  isValid: boolean;
  issues: string[];
}> {
  const issues: string[] = [];

  try {
    // Obtener conteos
    const [originalTx, financialTx] = await Promise.all([
      getDocs(query(collection(db, 'transactions'), where('userId', '==', userId))),
      getDocs(collection(db, 'users', userId, 'financial', 'transactions')),
    ]);

    // Verificar que todas las transacciones originales tienen su correspondiente financiera
    if (originalTx.size !== financialTx.size) {
      issues.push(
        `Discrepancia en conteo: ${originalTx.size} originales vs ${financialTx.size} financieras`
      );
    }

    // Verificar IDs
    const originalIds = new Set(originalTx.docs.map(d => d.id));
    const financialIds = new Set(financialTx.docs.map(d => d.id));

    for (const id of originalIds) {
      if (!financialIds.has(id)) {
        issues.push(`Transacción ${id} no tiene registro financiero`);
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  } catch (error) {
    return {
      isValid: false,
      issues: [`Error verificando migración: ${error}`],
    };
  }
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Mapea un documento de Firestore a Transaction
 */
function mapDocToTransaction(id: string, data: any): Transaction {
  return {
    id,
    userId: data.userId,
    investmentId: data.investmentId,
    etfId: data.etfId,
    etfTicker: data.etfTicker,
    etfName: data.etfName,
    type: data.type,
    units: data.units,
    pricePerUnit: data.pricePerUnit,
    totalAmount: data.totalAmount,
    commission: data.commission || 0,
    date: data.date?.toDate() || new Date(),
    note: data.note,
    milestone: data.milestone,
    photo: data.photo,
    createdAt: data.createdAt?.toDate() || new Date(),
  };
}

/**
 * Extrae los datos financieros puros de una transacción
 */
function extractFinancialData(
  transaction: Transaction,
  userId: string
): Omit<FinancialTransaction, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    userId,
    date: transaction.date,
    type: mapTransactionType(transaction.type),
    etfTicker: transaction.etfTicker,
    units: transaction.units,
    pricePerUnit: transaction.pricePerUnit,
    totalAmount: transaction.totalAmount,
    currency: 'COP' as Currency, // Default, ajustar según necesidad
    fees: transaction.commission || 0,
    metadataId: hasMetadata(transaction) ? transaction.id : undefined,
  };
}

/**
 * Mapea el tipo de transacción al nuevo formato
 */
function mapTransactionType(type: string): FinancialTransactionType {
  const typeMap: Record<string, FinancialTransactionType> = {
    buy: 'buy',
    sell: 'sell',
    dividend: 'dividend',
    split: 'transfer', // Mapear split a transfer
  };
  return typeMap[type] || 'buy';
}

/**
 * Verifica si una transacción tiene metadatos
 */
function hasMetadata(transaction: Transaction): boolean {
  return !!(transaction.note || transaction.milestone || transaction.photo);
}

/**
 * Extrae los metadatos de una transacción
 */
function extractMetadata(
  transaction: Transaction,
  userId: string,
  transactionId: string
): Omit<TransactionMetadata, 'id' | 'createdAt' | 'updatedAt'> {
  const initialVersion = {
    version: 1,
    date: new Date(),
    reason: transaction.note,
    milestone: transaction.milestone as MilestoneType | undefined,
    photoUrl: transaction.photo,
  };

  return {
    userId,
    transactionId,
    reason: transaction.note,
    milestone: transaction.milestone as MilestoneType | undefined,
    photoUrl: transaction.photo,
    versions: [initialVersion],
    currentVersion: 1,
  };
}

// ============================================
// EXPORTACIÓN DE DATOS LEGACY
// ============================================

/**
 * Exporta los datos en formato legacy (para backup antes de migración)
 */
export async function exportLegacyData(userId: string): Promise<{
  transactions: Transaction[];
  exportDate: Date;
}> {
  const q = query(
    collection(db, 'transactions'),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);

  const transactions = snapshot.docs.map(doc =>
    mapDocToTransaction(doc.id, doc.data())
  );

  return {
    transactions,
    exportDate: new Date(),
  };
}

/**
 * Genera un archivo JSON descargable con los datos legacy
 */
export function downloadLegacyBackup(data: { transactions: Transaction[]; exportDate: Date }): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `backup_legacy_${data.exportDate.toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
