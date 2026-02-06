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
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { validateAuthAndAccess } from './authGuard';
import { Investment, Transaction, ETF } from '../../types';
import { INVESTMENT_ERRORS } from '../../utils/errorMessages';
import { withRetry, FIREBASE_RETRY_OPTIONS } from '../../utils/retry';

// ============ HELPERS ============

// Obtener referencia a la colección de inversiones del usuario
const getInvestmentsCollection = (userId: string) =>
  collection(db, 'users', userId, 'investments');

// Obtener referencia a la colección de transacciones del usuario
const getTransactionsCollection = (userId: string) =>
  collection(db, 'users', userId, 'transactions');

// Obtener referencia a un documento de inversión específico
const getInvestmentDoc = (userId: string, investmentId: string) =>
  doc(db, 'users', userId, 'investments', investmentId);

// ============ INVERSIONES ============

export async function createInvestment(
  userId: string,
  etf: ETF,
  units: number,
  pricePerUnit: number
): Promise<Investment> {
  // Validar autenticación antes de crear inversión
  await validateAuthAndAccess(userId);

  const totalInvested = units * pricePerUnit;

  const investmentData = {
    etfId: etf.id,
    etfName: etf.name,
    etfTicker: etf.ticker,
    totalUnits: units,
    averagePurchasePrice: pricePerUnit,
    currentPrice: pricePerUnit,
    totalInvested,
    currentValue: totalInvested,
    returnPercentage: 0,
    returnAbsolute: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await withRetry(
    () => addDoc(getInvestmentsCollection(userId), investmentData),
    FIREBASE_RETRY_OPTIONS
  );

  return {
    id: docRef.id,
    userId,
    ...investmentData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function getInvestments(userId: string): Promise<Investment[]> {
  // Validar autenticación antes de leer inversiones
  await validateAuthAndAccess(userId);

  // Consulta directa a la subcolección del usuario
  const investmentsRef = getInvestmentsCollection(userId);
  const snapshot = await withRetry(
    () => getDocs(investmentsRef),
    FIREBASE_RETRY_OPTIONS
  );

  const investments = snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      userId,
      etfId: data.etfId,
      etfName: data.etfName,
      etfTicker: data.etfTicker,
      totalUnits: data.totalUnits,
      averagePurchasePrice: data.averagePurchasePrice,
      currentPrice: data.currentPrice,
      totalInvested: data.totalInvested,
      currentValue: data.currentValue,
      returnPercentage: data.returnPercentage,
      returnAbsolute: data.returnAbsolute,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  });

  // Ordenar en el cliente
  return investments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getInvestmentByEtf(
  userId: string,
  etfId: string
): Promise<Investment | null> {
  // Validar autenticación
  await validateAuthAndAccess(userId);

  const q = query(
    getInvestmentsCollection(userId),
    where('etfId', '==', etfId)
  );

  const snapshot = await withRetry(
    () => getDocs(q),
    FIREBASE_RETRY_OPTIONS
  );

  if (snapshot.empty) {
    return null;
  }

  const docSnap = snapshot.docs[0];
  const data = docSnap.data();

  return {
    id: docSnap.id,
    userId,
    etfId: data.etfId,
    etfName: data.etfName,
    etfTicker: data.etfTicker,
    totalUnits: data.totalUnits,
    averagePurchasePrice: data.averagePurchasePrice,
    currentPrice: data.currentPrice,
    totalInvested: data.totalInvested,
    currentValue: data.currentValue,
    returnPercentage: data.returnPercentage,
    returnAbsolute: data.returnAbsolute,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
}

export async function updateInvestment(
  userId: string,
  investmentId: string,
  updates: Partial<Investment>
): Promise<void> {
  // Validar autenticación antes de actualizar
  await validateAuthAndAccess(userId);

  const docRef = getInvestmentDoc(userId, investmentId);
  await withRetry(
    () => updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    }),
    FIREBASE_RETRY_OPTIONS
  );
}

export async function addToInvestment(
  userId: string,
  investmentId: string,
  additionalUnits: number,
  pricePerUnit: number
): Promise<void> {
  // Validar autenticación antes de agregar a inversión
  await validateAuthAndAccess(userId);

  const docRef = getInvestmentDoc(userId, investmentId);
  const docSnap = await withRetry(
    () => getDoc(docRef),
    FIREBASE_RETRY_OPTIONS
  );

  if (!docSnap.exists()) {
    throw new Error(INVESTMENT_ERRORS.NOT_FOUND);
  }

  const current = docSnap.data();
  const newTotalUnits = current.totalUnits + additionalUnits;
  const newTotalInvested = current.totalInvested + additionalUnits * pricePerUnit;
  const newAveragePrice = newTotalInvested / newTotalUnits;

  await withRetry(
    () => updateDoc(docRef, {
      totalUnits: newTotalUnits,
      totalInvested: newTotalInvested,
      averagePurchasePrice: newAveragePrice,
      currentValue: newTotalUnits * current.currentPrice,
      returnAbsolute: newTotalUnits * current.currentPrice - newTotalInvested,
      returnPercentage:
        ((newTotalUnits * current.currentPrice - newTotalInvested) / newTotalInvested) * 100,
      updatedAt: serverTimestamp(),
    }),
    FIREBASE_RETRY_OPTIONS
  );
}

export async function deleteInvestment(userId: string, investmentId: string): Promise<void> {
  // Validar autenticación antes de eliminar
  await validateAuthAndAccess(userId);

  await withRetry(
    () => deleteDoc(getInvestmentDoc(userId, investmentId)),
    FIREBASE_RETRY_OPTIONS
  );
}

// ============ TRANSACCIONES ============

export async function createTransaction(
  transaction: Omit<Transaction, 'id' | 'createdAt'>
): Promise<Transaction> {
  const { userId, ...transactionWithoutUserId } = transaction;

  // Validar autenticación antes de crear transacción
  await validateAuthAndAccess(userId);

  // Construir objeto base sin campos opcionales undefined
  const transactionData: Record<string, any> = {
    investmentId: transactionWithoutUserId.investmentId,
    etfId: transactionWithoutUserId.etfId,
    etfTicker: transactionWithoutUserId.etfTicker,
    etfName: transactionWithoutUserId.etfName,
    type: transactionWithoutUserId.type,
    units: transactionWithoutUserId.units,
    pricePerUnit: transactionWithoutUserId.pricePerUnit,
    totalAmount: transactionWithoutUserId.totalAmount,
    commission: transactionWithoutUserId.commission,
    date: Timestamp.fromDate(transaction.date),
    createdAt: serverTimestamp(),
  };

  // Solo agregar campos opcionales si tienen valor
  if (transactionWithoutUserId.note) {
    transactionData.note = transactionWithoutUserId.note;
  }
  if (transactionWithoutUserId.milestone) {
    transactionData.milestone = transactionWithoutUserId.milestone;
  }
  if (transactionWithoutUserId.photo) {
    transactionData.photo = transactionWithoutUserId.photo;
  }

  const docRef = await withRetry(
    () => addDoc(getTransactionsCollection(userId), transactionData),
    FIREBASE_RETRY_OPTIONS
  );

  return {
    ...transaction,
    id: docRef.id,
    createdAt: new Date(),
  };
}

export async function getTransactions(
  userId: string,
  limitCount?: number
): Promise<Transaction[]> {
  // Validar autenticación
  await validateAuthAndAccess(userId);

  // Consulta directa a la subcolección del usuario
  const transactionsRef = getTransactionsCollection(userId);
  const snapshot = await withRetry(
    () => getDocs(transactionsRef),
    FIREBASE_RETRY_OPTIONS
  );

  const transactions = snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      userId,
      investmentId: data.investmentId,
      etfId: data.etfId,
      etfTicker: data.etfTicker,
      etfName: data.etfName,
      type: data.type,
      units: data.units,
      pricePerUnit: data.pricePerUnit,
      totalAmount: data.totalAmount,
      commission: data.commission,
      date: data.date?.toDate() || new Date(),
      note: data.note,
      milestone: data.milestone,
      photo: data.photo,
      createdAt: data.createdAt?.toDate() || new Date(),
    };
  });

  // Ordenar en el cliente por fecha descendente
  const sorted = transactions.sort((a, b) => b.date.getTime() - a.date.getTime());

  return limitCount ? sorted.slice(0, limitCount) : sorted;
}

export async function getTransactionsByInvestment(
  userId: string,
  investmentId: string
): Promise<Transaction[]> {
  // Validar autenticación
  await validateAuthAndAccess(userId);

  const q = query(
    getTransactionsCollection(userId),
    where('investmentId', '==', investmentId)
  );

  const snapshot = await withRetry(
    () => getDocs(q),
    FIREBASE_RETRY_OPTIONS
  );

  const transactions = snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      userId,
      investmentId: data.investmentId,
      etfId: data.etfId,
      etfTicker: data.etfTicker,
      etfName: data.etfName,
      type: data.type,
      units: data.units,
      pricePerUnit: data.pricePerUnit,
      totalAmount: data.totalAmount,
      commission: data.commission,
      date: data.date?.toDate() || new Date(),
      note: data.note,
      milestone: data.milestone,
      photo: data.photo,
      createdAt: data.createdAt?.toDate() || new Date(),
    };
  });

  // Ordenar por fecha descendente
  return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
}
