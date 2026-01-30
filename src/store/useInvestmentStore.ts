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
  clearError: () => void;
  reset: () => void;

  // Selectores computados
  getPortfolioSummary: () => PortfolioSummary;
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
      const message = error instanceof Error ? error.message : 'Error al cargar inversiones';
      set({ error: message, isLoading: false });
    }
  },

  loadTransactions: async (userId: string, limit?: number) => {
    try {
      const transactions = await getTransactions(userId, limit);
      set({ transactions });
    } catch (error) {
      console.error('Error al cargar transacciones:', error);
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
        await addToInvestment(investment.id, units, pricePerUnit);
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
      await get().loadTransactions(userId, 10);

      set({ isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al agregar inversión';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  reset: () => set(initialState),

  getPortfolioSummary: () => {
    const { investments, transactions } = get();
    const { getPriceCop } = useMarketStore.getState();

    const totalInvested = calculateTotalInvested(investments);

    // Calcular valor actual usando precios del mercado
    const currentValue = investments.reduce((total, inv) => {
      // Obtener precio actual del mercado o usar el precio guardado en la inversión
      const marketPrice = getPriceCop(inv.etfId);
      const priceToUse = marketPrice > 0 ? marketPrice : inv.currentPrice;
      return total + (inv.totalUnits * priceToUse);
    }, 0);

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

    return {
      totalInvested,
      currentValue,
      totalReturn,
      totalReturnPercentage,
      monthlyContribution,
      lastContributionDate: lastContribution?.date || null,
      investmentCount: investments.length,
      diversificationScore: calculateDiversificationScore(investments),
      investments,
      recentTransactions: transactions.slice(0, 5),
    };
  },
}));
