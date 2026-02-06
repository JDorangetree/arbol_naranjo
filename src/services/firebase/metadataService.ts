/**
 * Servicio de Metadatos
 *
 * CRUD para la capa de metadatos (contexto/razones).
 * Maneja el "por qué" detrás de cada decisión financiera.
 * Incluye versionado automático para mantener historial de cambios.
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import {
  TransactionMetadata,
  MetadataVersion,
  PeriodMetadata,
  PeriodMetadataVersion,
  MilestoneType,
} from '../../types/metadata.types';
import { METADATA_ERRORS } from '../../utils/errorMessages';
import { withRetry, FIREBASE_RETRY_OPTIONS } from '../../utils/retry';

// ============================================
// COLECCIONES
// ============================================

const getTransactionMetaRef = (userId: string) =>
  collection(db, 'users', userId, 'metadata', 'data', 'transactionMeta');

const getPeriodMetaRef = (userId: string) =>
  collection(db, 'users', userId, 'metadata', 'data', 'periodMeta');

// ============================================
// METADATOS DE TRANSACCIONES
// ============================================

/**
 * Crea metadatos para una transacción
 */
export async function createTransactionMetadata(
  userId: string,
  transactionId: string,
  data: {
    reason?: string;
    decisionContext?: string;
    milestone?: MilestoneType;
    milestoneNote?: string;
    photoUrl?: string;
    photoCaption?: string;
  }
): Promise<TransactionMetadata> {
  const ref = getTransactionMetaRef(userId);

  // Crear versión inicial
  const initialVersion: MetadataVersion = {
    version: 1,
    date: new Date(),
    reason: data.reason,
    decisionContext: data.decisionContext,
    milestone: data.milestone,
    milestoneNote: data.milestoneNote,
    photoUrl: data.photoUrl,
    photoCaption: data.photoCaption,
  };

  const metadata: Omit<TransactionMetadata, 'id'> = {
    userId,
    transactionId,
    reason: data.reason,
    decisionContext: data.decisionContext,
    milestone: data.milestone,
    milestoneNote: data.milestoneNote,
    photoUrl: data.photoUrl,
    photoCaption: data.photoCaption,
    versions: [initialVersion],
    currentVersion: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const docRef = await withRetry(
    () => addDoc(ref, {
      ...metadata,
      versions: metadata.versions.map(v => ({
        ...v,
        date: Timestamp.fromDate(v.date),
      })),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
    FIREBASE_RETRY_OPTIONS
  );

  return {
    ...metadata,
    id: docRef.id,
  };
}

/**
 * Obtiene los metadatos de una transacción
 */
export async function getTransactionMetadata(
  userId: string,
  transactionId: string
): Promise<TransactionMetadata | null> {
  const ref = getTransactionMetaRef(userId);
  const q = query(ref, where('transactionId', '==', transactionId));
  const snapshot = await withRetry(
    () => getDocs(q),
    FIREBASE_RETRY_OPTIONS
  );

  if (snapshot.empty) {
    return null;
  }

  return mapDocToTransactionMetadata(snapshot.docs[0]);
}

/**
 * Obtiene todos los metadatos de transacciones
 */
export async function getAllTransactionMetadata(
  userId: string,
  options?: {
    milestone?: MilestoneType;
    hasPhoto?: boolean;
  }
): Promise<TransactionMetadata[]> {
  const ref = getTransactionMetaRef(userId);
  let q = query(ref);

  if (options?.milestone) {
    q = query(q, where('milestone', '==', options.milestone));
  }

  const snapshot = await withRetry(
    () => getDocs(q),
    FIREBASE_RETRY_OPTIONS
  );

  let results = snapshot.docs.map(mapDocToTransactionMetadata);

  // Filtrar por foto en cliente
  if (options?.hasPhoto !== undefined) {
    results = results.filter(m =>
      options.hasPhoto ? !!m.photoUrl : !m.photoUrl
    );
  }

  return results;
}

/**
 * Actualiza los metadatos de una transacción (con versionado)
 */
export async function updateTransactionMetadata(
  userId: string,
  metadataId: string,
  updates: {
    reason?: string;
    decisionContext?: string;
    milestone?: MilestoneType;
    milestoneNote?: string;
    photoUrl?: string;
    photoCaption?: string;
  },
  editNote?: string
): Promise<void> {
  const ref = doc(getTransactionMetaRef(userId), metadataId);
  const currentDoc = await withRetry(
    () => getDoc(ref),
    FIREBASE_RETRY_OPTIONS
  );

  if (!currentDoc.exists()) {
    throw new Error(METADATA_ERRORS.NOT_FOUND);
  }

  const currentData = mapDocToTransactionMetadata(currentDoc);
  const newVersion = currentData.currentVersion + 1;

  // Crear nueva versión con los datos actualizados
  const newVersionRecord: MetadataVersion = {
    version: newVersion,
    date: new Date(),
    reason: updates.reason ?? currentData.reason,
    decisionContext: updates.decisionContext ?? currentData.decisionContext,
    milestone: updates.milestone ?? currentData.milestone,
    milestoneNote: updates.milestoneNote ?? currentData.milestoneNote,
    photoUrl: updates.photoUrl ?? currentData.photoUrl,
    photoCaption: updates.photoCaption ?? currentData.photoCaption,
    editNote,
  };

  // Agregar nueva versión al array
  const updatedVersions = [...currentData.versions, newVersionRecord];

  await withRetry(
    () => updateDoc(ref, {
      ...updates,
      versions: updatedVersions.map(v => ({
        ...v,
        date: Timestamp.fromDate(v.date),
      })),
      currentVersion: newVersion,
      updatedAt: serverTimestamp(),
    }),
    FIREBASE_RETRY_OPTIONS
  );
}

/**
 * Obtiene el historial de versiones de un metadata
 */
export async function getMetadataVersionHistory(
  userId: string,
  metadataId: string
): Promise<MetadataVersion[]> {
  const ref = doc(getTransactionMetaRef(userId), metadataId);
  const snapshot = await withRetry(
    () => getDoc(ref),
    FIREBASE_RETRY_OPTIONS
  );

  if (!snapshot.exists()) {
    return [];
  }

  const data = mapDocToTransactionMetadata(snapshot);
  return data.versions.sort((a, b) => b.version - a.version);
}

/**
 * Restaura una versión anterior de metadata
 */
export async function restoreMetadataVersion(
  userId: string,
  metadataId: string,
  versionNumber: number
): Promise<void> {
  const ref = doc(getTransactionMetaRef(userId), metadataId);
  const currentDoc = await withRetry(
    () => getDoc(ref),
    FIREBASE_RETRY_OPTIONS
  );

  if (!currentDoc.exists()) {
    throw new Error(METADATA_ERRORS.NOT_FOUND);
  }

  const currentData = mapDocToTransactionMetadata(currentDoc);
  const versionToRestore = currentData.versions.find(v => v.version === versionNumber);

  if (!versionToRestore) {
    throw new Error(METADATA_ERRORS.VERSION_NOT_FOUND);
  }

  // Crear nueva versión que es copia de la versión a restaurar
  await updateTransactionMetadata(
    userId,
    metadataId,
    {
      reason: versionToRestore.reason,
      decisionContext: versionToRestore.decisionContext,
      milestone: versionToRestore.milestone,
      milestoneNote: versionToRestore.milestoneNote,
      photoUrl: versionToRestore.photoUrl,
      photoCaption: versionToRestore.photoCaption,
    },
    `Restaurado desde version ${versionNumber}`
  );
}

/**
 * Elimina metadatos de una transacción
 */
export async function deleteTransactionMetadata(
  userId: string,
  metadataId: string
): Promise<void> {
  const ref = doc(getTransactionMetaRef(userId), metadataId);
  await withRetry(
    () => deleteDoc(ref),
    FIREBASE_RETRY_OPTIONS
  );
}

// ============================================
// METADATOS DE PERÍODOS
// ============================================

/**
 * Crea o actualiza metadatos de un período (mes/año)
 */
export async function savePeriodMetadata(
  userId: string,
  year: number,
  month: number | null,
  data: {
    economicContext?: string;
    personalContext?: string;
    financialNotes?: string;
  },
  editNote?: string
): Promise<PeriodMetadata> {
  const ref = getPeriodMetaRef(userId);

  // Buscar si ya existe
  let q = query(ref, where('year', '==', year));
  if (month !== null) {
    q = query(q, where('month', '==', month));
  }

  const existing = await withRetry(
    () => getDocs(q),
    FIREBASE_RETRY_OPTIONS
  );

  if (!existing.empty) {
    // Actualizar existente con versionado
    const existingDoc = existing.docs[0];
    const existingData = mapDocToPeriodMetadata(existingDoc);

    const newVersion: PeriodMetadataVersion = {
      version: existingData.currentVersion + 1,
      date: new Date(),
      economicContext: data.economicContext ?? existingData.economicContext,
      personalContext: data.personalContext ?? existingData.personalContext,
      financialNotes: data.financialNotes ?? existingData.financialNotes,
      editNote,
    };

    await withRetry(
      () => updateDoc(existingDoc.ref, {
        ...data,
        versions: [...existingData.versions, {
          ...newVersion,
          date: Timestamp.fromDate(newVersion.date),
        }],
        currentVersion: newVersion.version,
        updatedAt: serverTimestamp(),
      }),
      FIREBASE_RETRY_OPTIONS
    );

    return {
      ...existingData,
      ...data,
      versions: [...existingData.versions, newVersion],
      currentVersion: newVersion.version,
      updatedAt: new Date(),
    };
  }

  // Crear nuevo
  const initialVersion: PeriodMetadataVersion = {
    version: 1,
    date: new Date(),
    ...data,
  };

  const newPeriodMeta: Omit<PeriodMetadata, 'id'> = {
    userId,
    year,
    month: month ?? undefined,
    ...data,
    versions: [initialVersion],
    currentVersion: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const docRef = await withRetry(
    () => addDoc(ref, {
      ...newPeriodMeta,
      versions: [{
        ...initialVersion,
        date: Timestamp.fromDate(initialVersion.date),
      }],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
    FIREBASE_RETRY_OPTIONS
  );

  return {
    ...newPeriodMeta,
    id: docRef.id,
  };
}

/**
 * Obtiene metadatos de un período
 */
export async function getPeriodMetadata(
  userId: string,
  year: number,
  month?: number
): Promise<PeriodMetadata | null> {
  const ref = getPeriodMetaRef(userId);

  let q = query(ref, where('year', '==', year));
  if (month !== undefined) {
    q = query(q, where('month', '==', month));
  }

  const snapshot = await withRetry(
    () => getDocs(q),
    FIREBASE_RETRY_OPTIONS
  );

  if (snapshot.empty) {
    return null;
  }

  return mapDocToPeriodMetadata(snapshot.docs[0]);
}

/**
 * Obtiene todos los metadatos de períodos de un usuario
 */
export async function getAllPeriodMetadata(userId: string): Promise<PeriodMetadata[]> {
  const ref = getPeriodMetaRef(userId);
  const snapshot = await withRetry(
    () => getDocs(ref),
    FIREBASE_RETRY_OPTIONS
  );

  return snapshot.docs
    .map(mapDocToPeriodMetadata)
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return (b.month || 0) - (a.month || 0);
    });
}

// ============================================
// BÚSQUEDA Y FILTROS
// ============================================

/**
 * Busca transacciones por milestone
 */
export async function getTransactionsByMilestone(
  userId: string,
  milestone: MilestoneType
): Promise<TransactionMetadata[]> {
  return getAllTransactionMetadata(userId, { milestone });
}

/**
 * Obtiene todas las transacciones con fotos
 */
export async function getTransactionsWithPhotos(
  userId: string
): Promise<TransactionMetadata[]> {
  return getAllTransactionMetadata(userId, { hasPhoto: true });
}

/**
 * Obtiene estadísticas de milestones
 */
export async function getMilestoneStats(
  userId: string
): Promise<Record<MilestoneType, number>> {
  const allMeta = await getAllTransactionMetadata(userId);

  const stats: Record<string, number> = {};

  for (const meta of allMeta) {
    if (meta.milestone) {
      stats[meta.milestone] = (stats[meta.milestone] || 0) + 1;
    }
  }

  return stats as Record<MilestoneType, number>;
}

// ============================================
// UTILIDADES
// ============================================

function mapDocToTransactionMetadata(doc: any): TransactionMetadata {
  const data = doc.data();
  return {
    id: doc.id,
    userId: data.userId,
    transactionId: data.transactionId,
    reason: data.reason,
    decisionContext: data.decisionContext,
    milestone: data.milestone,
    milestoneNote: data.milestoneNote,
    photoUrl: data.photoUrl,
    photoCaption: data.photoCaption,
    versions: (data.versions || []).map((v: any) => ({
      ...v,
      date: v.date?.toDate() || new Date(),
    })),
    currentVersion: data.currentVersion || 1,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
}

function mapDocToPeriodMetadata(doc: any): PeriodMetadata {
  const data = doc.data();
  return {
    id: doc.id,
    userId: data.userId,
    year: data.year,
    month: data.month,
    economicContext: data.economicContext,
    personalContext: data.personalContext,
    financialNotes: data.financialNotes,
    versions: (data.versions || []).map((v: any) => ({
      ...v,
      date: v.date?.toDate() || new Date(),
    })),
    currentVersion: data.currentVersion || 1,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
}
