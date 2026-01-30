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

// ============ INVERSIONES ============

export async function createInvestment(
  userId: string,
  etf: ETF,
  units: number,
  pricePerUnit: number
): Promise<Investment> {
  const totalInvested = units * pricePerUnit;

  const investmentData = {
    userId,
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

  const docRef = await addDoc(collection(db, 'investments'), investmentData);

  return {
    id: docRef.id,
    ...investmentData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function getInvestments(userId: string): Promise<Investment[]> {
  // Consulta simple sin orderBy para evitar problemas con índices
  const q = query(
    collection(db, 'investments'),
    where('userId', '==', userId)
  );

  const snapshot = await getDocs(q);

  const investments = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
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
    collection(db, 'investments'),
    where('userId', '==', userId),
    where('etfId', '==', etfId)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  const data = doc.data();

  return {
    id: doc.id,
    userId: data.userId,
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
  investmentId: string,
  updates: Partial<Investment>
): Promise<void> {
  const docRef = doc(db, 'investments', investmentId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function addToInvestment(
  investmentId: string,
  additionalUnits: number,
  pricePerUnit: number
): Promise<void> {
  const docRef = doc(db, 'investments', investmentId);
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

export async function deleteInvestment(investmentId: string): Promise<void> {
  await deleteDoc(doc(db, 'investments', investmentId));
}

// ============ TRANSACCIONES ============

export async function createTransaction(
  transaction: Omit<Transaction, 'id' | 'createdAt'>
): Promise<Transaction> {
  const transactionData = {
    ...transaction,
    date: Timestamp.fromDate(transaction.date),
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, 'transactions'), transactionData);

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
  // Consulta simple sin orderBy para evitar problemas con índices
  const q = query(
    collection(db, 'transactions'),
    where('userId', '==', userId)
  );

  const snapshot = await getDocs(q);

  const transactions = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
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
  investmentId: string
): Promise<Transaction[]> {
  const q = query(
    collection(db, 'transactions'),
    where('investmentId', '==', investmentId),
    orderBy('date', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
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
}
