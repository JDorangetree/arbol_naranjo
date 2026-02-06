import { create } from 'zustand';
import { Investment, Transaction, PortfolioSummary, ETF } from '../types';
import {
  getInvestments,
  createInvestment,
  getInvestmentByEtf,
  addToInvestment,
  createTransaction,
  getTransactions,
} from '../services/firebase';
import {
  calculateTotalInvested,
  calculateTotalReturn,
  calculateDiversificationScore,
} from '../utils';
import { useMarketStore } from './useMarketStore';
import { captureError, addBreadcrumb } from '../services/logging';

interface InvestmentState {
  investments: Investment[];
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;

  // Acciones
  loadInvestments: (userId: string) => Promise<void>;
  loadTransactions: (userId: string, limit?: number) => Promise<void>;
  addInvestment: (
    userId: string,
    etf: ETF,
    units: number,
    pricePerUnit: number,
    date: Date,
    note?: string,
    milestone?: string
  ) => Promise<void>;
  addDividend: (
    userId: string,
    investmentId: string,
    etf: { id: string; ticker: string; name: string },
    amount: number,
    date: Date,
    note?: string
  ) => Promise<void>;
  clearError: () => void;
  reset: () => void;

  // Selectores computados
  getPortfolioSummary: () => PortfolioSummary;
  getTotalDividends: () => number;
}

const initialState = {
  investments: [],
  transactions: [],
  isLoading: false,
  error: null,
};

export const useInvestmentStore = create<InvestmentState>((set, get) => ({
  ...initialState,

  loadInvestments: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const investments = await getInvestments(userId);
      set({ investments, isLoading: false });
    } catch (error) {
      captureError(error, { component: 'useInvestmentStore', action: 'loadInvestments' });
      const message = error instanceof Error ? error.message : 'Error al cargar inversiones';
      set({ error: message, isLoading: false });
    }
  },

  loadTransactions: async (userId: string, limit?: number) => {
    try {
      const transactions = await getTransactions(userId, limit);
      set({ transactions });
    } catch (error) {
      captureError(error, { component: 'useInvestmentStore', action: 'loadTransactions' });
    }
  },

  addInvestment: async (
    userId: string,
    etf: ETF,
    units: number,
    pricePerUnit: number,
    date: Date,
    note?: string,
    milestone?: string
  ) => {
    set({ isLoading: true, error: null });
    try {
      // Verificar si ya existe una inversión en este ETF
      let investment = await getInvestmentByEtf(userId, etf.id);
      let investmentId: string;

      if (investment) {
        // Agregar a la inversión existente
        await addToInvestment(userId, investment.id, units, pricePerUnit);
        investmentId = investment.id;
      } else {
        // Crear nueva inversión
        const newInvestment = await createInvestment(userId, etf, units, pricePerUnit);
        investmentId = newInvestment.id;
      }

      // Crear la transacción
      await createTransaction({
        userId,
        investmentId,
        etfId: etf.id,
        etfTicker: etf.ticker,
        etfName: etf.name,
        type: 'buy',
        units,
        pricePerUnit,
        totalAmount: units * pricePerUnit,
        commission: 0,
        date,
        note,
        milestone: milestone as any,
      });

      // Recargar datos
      await get().loadInvestments(userId);
      await get().loadTransactions(userId);

      addBreadcrumb('Inversión agregada', 'investment', { etfId: etf.id, units });
      set({ isLoading: false });
    } catch (error) {
      captureError(error, { component: 'useInvestmentStore', action: 'addInvestment', etfId: etf.id });
      const message = error instanceof Error ? error.message : 'Error al agregar inversión';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  addDividend: async (
    userId: string,
    investmentId: string,
    etf: { id: string; ticker: string; name: string },
    amount: number,
    date: Date,
    note?: string
  ) => {
    set({ isLoading: true, error: null });
    try {
      // Crear la transacción de dividendo
      await createTransaction({
        userId,
        investmentId,
        etfId: etf.id,
        etfTicker: etf.ticker,
        etfName: etf.name,
        type: 'dividend',
        units: 0, // Los dividendos no agregan unidades
        pricePerUnit: 0,
        totalAmount: amount,
        commission: 0,
        date,
        note,
      });

      // Recargar transacciones
      await get().loadTransactions(userId);

      addBreadcrumb('Dividendo registrado', 'investment', { etfId: etf.id, amount });
      set({ isLoading: false });
    } catch (error) {
      captureError(error, { component: 'useInvestmentStore', action: 'addDividend', etfId: etf.id });
      const message = error instanceof Error ? error.message : 'Error al registrar dividendo';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  reset: () => set(initialState),

  getTotalDividends: () => {
    const { transactions } = get();
    return transactions
      .filter((t) => t.type === 'dividend')
      .reduce((sum, t) => sum + t.totalAmount, 0);
  },

  getPortfolioSummary: () => {
    const { investments, transactions } = get();
    const { getPriceCop } = useMarketStore.getState();

    // Actualizar cada inversión con precios de mercado
    const updatedInvestments = investments.map((inv) => {
      const marketPrice = getPriceCop(inv.etfId);
      const priceToUse = marketPrice > 0 ? marketPrice : inv.currentPrice;
      const updatedCurrentValue = inv.totalUnits * priceToUse;
      const updatedReturnAbsolute = updatedCurrentValue - inv.totalInvested;
      const updatedReturnPercentage = inv.totalInvested > 0
        ? (updatedReturnAbsolute / inv.totalInvested) * 100
        : 0;

      return {
        ...inv,
        currentPrice: priceToUse,
        currentValue: updatedCurrentValue,
        returnAbsolute: updatedReturnAbsolute,
        returnPercentage: updatedReturnPercentage,
      };
    });

    const totalInvested = calculateTotalInvested(updatedInvestments);
    const currentValue = updatedInvestments.reduce((total, inv) => total + inv.currentValue, 0);

    const { absolute: totalReturn, percentage: totalReturnPercentage } =
      calculateTotalReturn(currentValue, totalInvested);

    // Calcular contribución del último mes
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const recentTransactions = transactions.filter(
      (t) => t.type === 'buy' && t.date >= oneMonthAgo
    );
    const monthlyContribution = recentTransactions.reduce(
      (sum, t) => sum + t.totalAmount,
      0
    );

    const lastContribution = transactions.find((t) => t.type === 'buy');

    // Contar transacciones de tipo 'buy' (aportes)
    const buyTransactions = transactions.filter((t) => t.type === 'buy');

    return {
      totalInvested,
      currentValue,
      totalReturn,
      totalReturnPercentage,
      monthlyContribution,
      lastContributionDate: lastContribution?.date || null,
      investmentCount: updatedInvestments.length,
      transactionCount: buyTransactions.length,
      diversificationScore: calculateDiversificationScore(updatedInvestments),
      investments: updatedInvestments,
      recentTransactions: transactions.slice(0, 5),
    };
  },
}));
