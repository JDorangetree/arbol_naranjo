/**
 * Servicio de Datos Financieros
 *
 * CRUD para la capa financiera (datos fríos/objetivos).
 * Solo maneja datos duros sin narrativa ni contexto emocional.
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
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';
import {
  FinancialTransaction,
  FinancialSnapshot,
  FinancialHolding,
  ETFReference,
  PortfolioCalculation,
  SnapshotType,
} from '../../types/financial.types';

// ============================================
// COLECCIONES
// ============================================

const getFinancialTransactionsRef = (userId: string) =>
  collection(db, 'users', userId, 'financial', 'data', 'transactions');

const getSnapshotsRef = (userId: string) =>
  collection(db, 'users', userId, 'financial', 'data', 'snapshots');

const getEtfsRef = (userId: string) =>
  collection(db, 'users', userId, 'financial', 'data', 'etfs');

// ============================================
// TRANSACCIONES FINANCIERAS
// ============================================

/**
 * Crea una nueva transacción financiera
 */
export async function createFinancialTransaction(
  userId: string,
  transaction: Omit<FinancialTransaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<FinancialTransaction> {
  const ref = getFinancialTransactionsRef(userId);

  const data = {
    ...transaction,
    userId,
    date: Timestamp.fromDate(transaction.date),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(ref, data);

  return {
    ...transaction,
    id: docRef.id,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Obtiene todas las transacciones financieras de un usuario
 */
export async function getFinancialTransactions(
  userId: string,
  options?: {
    limitCount?: number;
    startDate?: Date;
    endDate?: Date;
    etfTicker?: string;
  }
): Promise<FinancialTransaction[]> {
  const ref = getFinancialTransactionsRef(userId);
  let q = query(ref);

  // Aplicar filtros
  if (options?.etfTicker) {
    q = query(q, where('etfTicker', '==', options.etfTicker));
  }

  const snapshot = await getDocs(q);

  let transactions = snapshot.docs.map((doc) => mapDocToFinancialTransaction(doc));

  // Filtrar por fecha en cliente (para evitar índices compuestos)
  if (options?.startDate) {
    transactions = transactions.filter(t => t.date >= options.startDate!);
  }
  if (options?.endDate) {
    transactions = transactions.filter(t => t.date <= options.endDate!);
  }

  // Ordenar por fecha descendente
  transactions.sort((a, b) => b.date.getTime() - a.date.getTime());

  // Aplicar límite
  if (options?.limitCount) {
    transactions = transactions.slice(0, options.limitCount);
  }

  return transactions;
}

/**
 * Obtiene una transacción financiera por ID
 */
export async function getFinancialTransactionById(
  userId: string,
  transactionId: string
): Promise<FinancialTransaction | null> {
  const ref = doc(getFinancialTransactionsRef(userId), transactionId);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    return null;
  }

  return mapDocToFinancialTransaction(snapshot);
}

/**
 * Actualiza una transacción financiera
 */
export async function updateFinancialTransaction(
  userId: string,
  transactionId: string,
  updates: Partial<Omit<FinancialTransaction, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  const ref = doc(getFinancialTransactionsRef(userId), transactionId);

  const data: any = {
    ...updates,
    updatedAt: serverTimestamp(),
  };

  if (updates.date) {
    data.date = Timestamp.fromDate(updates.date);
  }

  await updateDoc(ref, data);
}

/**
 * Elimina una transacción financiera
 */
export async function deleteFinancialTransaction(
  userId: string,
  transactionId: string
): Promise<void> {
  const ref = doc(getFinancialTransactionsRef(userId), transactionId);
  await deleteDoc(ref);
}

// ============================================
// SNAPSHOTS FINANCIEROS
// ============================================

/**
 * Crea un snapshot del estado financiero actual
 */
export async function createFinancialSnapshot(
  userId: string,
  type: SnapshotType,
  holdings: FinancialHolding[]
): Promise<FinancialSnapshot> {
  const ref = getSnapshotsRef(userId);

  // Calcular totales
  const totalValue = holdings.reduce((sum, h) => sum + h.valueAtDate, 0);
  const totalInvested = holdings.reduce((sum, h) => sum + h.costBasis, 0);
  const totalReturn = totalValue - totalInvested;
  const totalReturnPercentage = totalInvested > 0
    ? (totalReturn / totalInvested) * 100
    : 0;

  const snapshot: Omit<FinancialSnapshot, 'id'> = {
    userId,
    date: new Date(),
    type,
    totalValue,
    totalInvested,
    totalReturn,
    totalReturnPercentage,
    holdings,
    createdAt: new Date(),
  };

  const docRef = await addDoc(ref, {
    ...snapshot,
    date: Timestamp.fromDate(snapshot.date),
    createdAt: serverTimestamp(),
  });

  return {
    ...snapshot,
    id: docRef.id,
  };
}

/**
 * Obtiene los snapshots de un usuario
 */
export async function getFinancialSnapshots(
  userId: string,
  options?: {
    type?: SnapshotType;
    limitCount?: number;
    year?: number;
  }
): Promise<FinancialSnapshot[]> {
  const ref = getSnapshotsRef(userId);
  let q = query(ref);

  if (options?.type) {
    q = query(q, where('type', '==', options.type));
  }

  const snapshot = await getDocs(q);

  let snapshots = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
      date: data.date?.toDate() || new Date(),
      type: data.type,
      totalValue: data.totalValue,
      totalInvested: data.totalInvested,
      totalReturn: data.totalReturn,
      totalReturnPercentage: data.totalReturnPercentage,
      holdings: data.holdings || [],
      createdAt: data.createdAt?.toDate() || new Date(),
    } as FinancialSnapshot;
  });

  // Filtrar por año si se especifica
  if (options?.year) {
    snapshots = snapshots.filter(s => s.date.getFullYear() === options.year);
  }

  // Ordenar por fecha descendente
  snapshots.sort((a, b) => b.date.getTime() - a.date.getTime());

  if (options?.limitCount) {
    snapshots = snapshots.slice(0, options.limitCount);
  }

  return snapshots;
}

/**
 * Obtiene el snapshot más reciente
 */
export async function getLatestSnapshot(
  userId: string
): Promise<FinancialSnapshot | null> {
  const snapshots = await getFinancialSnapshots(userId, { limitCount: 1 });
  return snapshots[0] || null;
}

// ============================================
// ETFs DE REFERENCIA
// ============================================

/**
 * Guarda o actualiza un ETF de referencia
 */
export async function saveETFReference(
  userId: string,
  etf: ETFReference
): Promise<void> {
  const ref = doc(getEtfsRef(userId), etf.ticker);
  await updateDoc(ref, {
    ...etf,
    priceUpdatedAt: Timestamp.fromDate(etf.priceUpdatedAt),
  }).catch(() => {
    // Si no existe, crear
    return addDoc(getEtfsRef(userId), {
      ...etf,
      priceUpdatedAt: Timestamp.fromDate(etf.priceUpdatedAt),
    });
  });
}

/**
 * Obtiene todos los ETFs de referencia
 */
export async function getETFReferences(userId: string): Promise<ETFReference[]> {
  const ref = getEtfsRef(userId);
  const snapshot = await getDocs(ref);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ticker: data.ticker,
      name: data.name,
      description: data.description,
      category: data.category,
      currency: data.currency,
      exchange: data.exchange,
      plantType: data.plantType,
      color: data.color,
      icon: data.icon,
      currentPrice: data.currentPrice,
      priceUpdatedAt: data.priceUpdatedAt?.toDate() || new Date(),
    } as ETFReference;
  });
}

/**
 * Actualiza el precio de un ETF
 */
export async function updateETFPrice(
  userId: string,
  ticker: string,
  newPrice: number
): Promise<void> {
  const ref = doc(getEtfsRef(userId), ticker);
  await updateDoc(ref, {
    currentPrice: newPrice,
    priceUpdatedAt: serverTimestamp(),
  });
}

// ============================================
// CÁLCULOS DE PORTAFOLIO
// ============================================

/**
 * Calcula el estado actual del portafolio basándose en transacciones
 */
export async function calculatePortfolio(
  userId: string
): Promise<PortfolioCalculation> {
  const transactions = await getFinancialTransactions(userId);
  const etfs = await getETFReferences(userId);

  // Agrupar por ETF
  const holdingsMap = new Map<string, {
    units: number;
    totalCost: number;
    etfName: string;
  }>();

  for (const tx of transactions) {
    const current = holdingsMap.get(tx.etfTicker) || {
      units: 0,
      totalCost: 0,
      etfName: '',
    };

    if (tx.type === 'buy') {
      current.units += tx.units;
      current.totalCost += tx.totalAmount + (tx.fees || 0);
    } else if (tx.type === 'sell') {
      const avgCost = current.totalCost / current.units;
      current.units -= tx.units;
      current.totalCost -= avgCost * tx.units;
    } else if (tx.type === 'dividend') {
      // Los dividendos no afectan unidades ni costo base
    }

    // Obtener nombre del ETF
    const etf = etfs.find(e => e.ticker === tx.etfTicker);
    current.etfName = etf?.name || tx.etfTicker;

    holdingsMap.set(tx.etfTicker, current);
  }

  // Calcular valores actuales
  const holdings = Array.from(holdingsMap.entries())
    .filter(([_, data]) => data.units > 0)
    .map(([ticker, data]) => {
      const etf = etfs.find(e => e.ticker === ticker);
      const currentPrice = etf?.currentPrice || 0;
      const currentValue = data.units * currentPrice;
      const avgCost = data.totalCost / data.units;

      return {
        etfTicker: ticker,
        etfName: data.etfName,
        units: data.units,
        averageCost: avgCost,
        currentPrice,
        currentValue,
        returnPercentage: avgCost > 0
          ? ((currentPrice - avgCost) / avgCost) * 100
          : 0,
      };
    });

  const totalInvested = holdings.reduce((sum, h) => sum + (h.units * h.averageCost), 0);
  const currentValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);

  // Encontrar fechas de primera y última transacción
  const sortedTx = [...transactions].sort((a, b) => a.date.getTime() - b.date.getTime());

  return {
    totalInvested,
    currentValue,
    totalReturn: currentValue - totalInvested,
    totalReturnPercentage: totalInvested > 0
      ? ((currentValue - totalInvested) / totalInvested) * 100
      : 0,
    holdings,
    transactionCount: transactions.length,
    firstTransactionDate: sortedTx[0]?.date || null,
    lastTransactionDate: sortedTx[sortedTx.length - 1]?.date || null,
  };
}

// ============================================
// UTILIDADES
// ============================================

function mapDocToFinancialTransaction(doc: any): FinancialTransaction {
  const data = doc.data();
  return {
    id: doc.id,
    userId: data.userId,
    date: data.date?.toDate() || new Date(),
    type: data.type,
    etfTicker: data.etfTicker,
    units: data.units,
    pricePerUnit: data.pricePerUnit,
    totalAmount: data.totalAmount,
    currency: data.currency || 'COP',
    exchangeRate: data.exchangeRate,
    fees: data.fees,
    metadataId: data.metadataId,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
}

/**
 * Genera snapshot mensual automático
 * Llamar al final de cada mes o manualmente
 */
export async function generateMonthlySnapshot(userId: string): Promise<FinancialSnapshot> {
  const portfolio = await calculatePortfolio(userId);
  const etfs = await getETFReferences(userId);

  const holdings: FinancialHolding[] = portfolio.holdings.map(h => {
    const etf = etfs.find(e => e.ticker === h.etfTicker);
    return {
      etfTicker: h.etfTicker,
      etfName: h.etfName,
      units: h.units,
      pricePerUnit: h.currentPrice,
      valueAtDate: h.currentValue,
      costBasis: h.units * h.averageCost,
      unrealizedGain: h.currentValue - (h.units * h.averageCost),
      percentageOfPortfolio: portfolio.currentValue > 0
        ? (h.currentValue / portfolio.currentValue) * 100
        : 0,
    };
  });

  return createFinancialSnapshot(userId, 'monthly', holdings);
}
