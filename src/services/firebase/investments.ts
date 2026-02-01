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
import { Investment, Transaction, ETF } from '../../types';

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

  const docRef = await addDoc(getInvestmentsCollection(userId), investmentData);

  return {
    id: docRef.id,
    userId,
    ...investmentData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function getInvestments(userId: string): Promise<Investment[]> {
  // Consulta directa a la subcolección del usuario
  const investmentsRef = getInvestmentsCollection(userId);
  const snapshot = await getDocs(investmentsRef);

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
  const q = query(
    getInvestmentsCollection(userId),
    where('etfId', '==', etfId)
  );

  const snapshot = await getDocs(q);

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
  const docRef = getInvestmentDoc(userId, investmentId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function addToInvestment(
  userId: string,
  investmentId: string,
  additionalUnits: number,
  pricePerUnit: number
): Promise<void> {
  const docRef = getInvestmentDoc(userId, investmentId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error('Inversión no encontrada');
  }

  const current = docSnap.data();
  const newTotalUnits = current.totalUnits + additionalUnits;
  const newTotalInvested = current.totalInvested + additionalUnits * pricePerUnit;
  const newAveragePrice = newTotalInvested / newTotalUnits;

  await updateDoc(docRef, {
    totalUnits: newTotalUnits,
    totalInvested: newTotalInvested,
    averagePurchasePrice: newAveragePrice,
    currentValue: newTotalUnits * current.currentPrice,
    returnAbsolute: newTotalUnits * current.currentPrice - newTotalInvested,
    returnPercentage:
      ((newTotalUnits * current.currentPrice - newTotalInvested) / newTotalInvested) * 100,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteInvestment(userId: string, investmentId: string): Promise<void> {
  await deleteDoc(getInvestmentDoc(userId, investmentId));
}

// ============ TRANSACCIONES ============

export async function createTransaction(
  transaction: Omit<Transaction, 'id' | 'createdAt'>
): Promise<Transaction> {
  const { userId, ...transactionWithoutUserId } = transaction;

  const transactionData = {
    ...transactionWithoutUserId,
    date: Timestamp.fromDate(transaction.date),
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(getTransactionsCollection(userId), transactionData);

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
  // Consulta directa a la subcolección del usuario
  const transactionsRef = getTransactionsCollection(userId);
  const snapshot = await getDocs(transactionsRef);

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
  const q = query(
    getTransactionsCollection(userId),
    where('investmentId', '==', investmentId)
  );

  const snapshot = await getDocs(q);

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
