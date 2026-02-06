/**
 * Tests para useInvestmentStore
 */

import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { useInvestmentStore } from './useInvestmentStore';
import { useMarketStore } from './useMarketStore';
import {
  createMockInvestment,
  createMockTransaction,
  createMockETF,
} from '../test/test-utils';

// Mock de Firebase services
vi.mock('../services/firebase', () => ({
  getInvestments: vi.fn(),
  getTransactions: vi.fn(),
  createInvestment: vi.fn(),
  getInvestmentByEtf: vi.fn(),
  addToInvestment: vi.fn(),
  createTransaction: vi.fn(),
}));

// Mock de useMarketStore
vi.mock('./useMarketStore', () => ({
  useMarketStore: {
    getState: vi.fn(() => ({
      getPriceCop: vi.fn(() => 0),
    })),
  },
}));

// Importar mocks después de mockear
import {
  getInvestments,
  getTransactions,
  createInvestment,
  getInvestmentByEtf,
  addToInvestment,
  createTransaction,
} from '../services/firebase';

describe('useInvestmentStore', () => {
  beforeEach(() => {
    // Resetear store
    useInvestmentStore.setState({
      investments: [],
      transactions: [],
      isLoading: false,
      error: null,
    });

    // Resetear mocks
    vi.clearAllMocks();
  });

  describe('Estado inicial', () => {
    it('tiene estado inicial correcto', () => {
      const state = useInvestmentStore.getState();

      expect(state.investments).toEqual([]);
      expect(state.transactions).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('loadInvestments', () => {
    it('carga inversiones exitosamente', async () => {
      const mockInvestments = [
        createMockInvestment({ id: '1', etfTicker: 'NU' }),
        createMockInvestment({ id: '2', etfTicker: 'SPY' }),
      ];

      (getInvestments as Mock).mockResolvedValue(mockInvestments);

      await useInvestmentStore.getState().loadInvestments('user-123');

      const state = useInvestmentStore.getState();
      expect(state.investments).toEqual(mockInvestments);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('setea isLoading durante la carga', async () => {
      (getInvestments as Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
      );

      const loadPromise = useInvestmentStore.getState().loadInvestments('user-123');

      // Verificar que isLoading es true durante la carga
      expect(useInvestmentStore.getState().isLoading).toBe(true);

      await loadPromise;

      expect(useInvestmentStore.getState().isLoading).toBe(false);
    });

    it('maneja errores correctamente', async () => {
      (getInvestments as Mock).mockRejectedValue(new Error('Network error'));

      await useInvestmentStore.getState().loadInvestments('user-123');

      const state = useInvestmentStore.getState();
      expect(state.investments).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Network error');
    });

    it('maneja errores no-Error correctamente', async () => {
      (getInvestments as Mock).mockRejectedValue('Unknown error');

      await useInvestmentStore.getState().loadInvestments('user-123');

      const state = useInvestmentStore.getState();
      expect(state.error).toBe('Error al cargar inversiones');
    });
  });

  describe('loadTransactions', () => {
    it('carga transacciones exitosamente', async () => {
      const mockTransactions = [
        createMockTransaction({ id: '1' }),
        createMockTransaction({ id: '2' }),
      ];

      (getTransactions as Mock).mockResolvedValue(mockTransactions);

      await useInvestmentStore.getState().loadTransactions('user-123');

      const state = useInvestmentStore.getState();
      expect(state.transactions).toEqual(mockTransactions);
    });

    it('pasa el límite a getTransactions', async () => {
      (getTransactions as Mock).mockResolvedValue([]);

      await useInvestmentStore.getState().loadTransactions('user-123', 10);

      expect(getTransactions).toHaveBeenCalledWith('user-123', 10);
    });

    it('maneja errores silenciosamente', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      (getTransactions as Mock).mockRejectedValue(new Error('Error'));

      await useInvestmentStore.getState().loadTransactions('user-123');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('addInvestment', () => {
    const mockETF = createMockETF();
    const userId = 'user-123';
    const units = 10;
    const pricePerUnit = 30000;
    const date = new Date();

    it('crea nueva inversión si no existe', async () => {
      const newInvestment = createMockInvestment({ id: 'new-inv' });

      (getInvestmentByEtf as Mock).mockResolvedValue(null);
      (createInvestment as Mock).mockResolvedValue(newInvestment);
      (createTransaction as Mock).mockResolvedValue({});
      (getInvestments as Mock).mockResolvedValue([newInvestment]);
      (getTransactions as Mock).mockResolvedValue([]);

      await useInvestmentStore.getState().addInvestment(
        userId,
        mockETF,
        units,
        pricePerUnit,
        date
      );

      expect(createInvestment).toHaveBeenCalledWith(userId, mockETF, units, pricePerUnit);
      expect(addToInvestment).not.toHaveBeenCalled();
    });

    it('agrega a inversión existente', async () => {
      const existingInvestment = createMockInvestment({ id: 'existing-inv' });

      (getInvestmentByEtf as Mock).mockResolvedValue(existingInvestment);
      (addToInvestment as Mock).mockResolvedValue(undefined);
      (createTransaction as Mock).mockResolvedValue({});
      (getInvestments as Mock).mockResolvedValue([existingInvestment]);
      (getTransactions as Mock).mockResolvedValue([]);

      await useInvestmentStore.getState().addInvestment(
        userId,
        mockETF,
        units,
        pricePerUnit,
        date
      );

      expect(addToInvestment).toHaveBeenCalledWith(
        userId,
        existingInvestment.id,
        units,
        pricePerUnit
      );
      expect(createInvestment).not.toHaveBeenCalled();
    });

    it('crea transacción con datos correctos', async () => {
      const newInvestment = createMockInvestment({ id: 'new-inv' });
      const note = 'Test note';
      const milestone = 'birthday';

      (getInvestmentByEtf as Mock).mockResolvedValue(null);
      (createInvestment as Mock).mockResolvedValue(newInvestment);
      (createTransaction as Mock).mockResolvedValue({});
      (getInvestments as Mock).mockResolvedValue([]);
      (getTransactions as Mock).mockResolvedValue([]);

      await useInvestmentStore.getState().addInvestment(
        userId,
        mockETF,
        units,
        pricePerUnit,
        date,
        note,
        milestone
      );

      expect(createTransaction).toHaveBeenCalledWith({
        userId,
        investmentId: newInvestment.id,
        etfId: mockETF.id,
        etfTicker: mockETF.ticker,
        etfName: mockETF.name,
        type: 'buy',
        units,
        pricePerUnit,
        totalAmount: units * pricePerUnit,
        commission: 0,
        date,
        note,
        milestone,
      });
    });

    it('recarga datos después de agregar', async () => {
      const newInvestment = createMockInvestment({ id: 'new-inv' });

      (getInvestmentByEtf as Mock).mockResolvedValue(null);
      (createInvestment as Mock).mockResolvedValue(newInvestment);
      (createTransaction as Mock).mockResolvedValue({});
      (getInvestments as Mock).mockResolvedValue([]);
      (getTransactions as Mock).mockResolvedValue([]);

      await useInvestmentStore.getState().addInvestment(
        userId,
        mockETF,
        units,
        pricePerUnit,
        date
      );

      expect(getInvestments).toHaveBeenCalledWith(userId);
      // getTransactions se llama con userId y opcionalmente un límite
      expect(getTransactions).toHaveBeenCalledWith(userId, undefined);
    });

    it('maneja errores y los propaga', async () => {
      (getInvestmentByEtf as Mock).mockRejectedValue(new Error('Database error'));

      await expect(
        useInvestmentStore.getState().addInvestment(
          userId,
          mockETF,
          units,
          pricePerUnit,
          date
        )
      ).rejects.toThrow('Database error');

      const state = useInvestmentStore.getState();
      expect(state.error).toBe('Database error');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('clearError', () => {
    it('limpia el error', () => {
      useInvestmentStore.setState({ error: 'Some error' });

      useInvestmentStore.getState().clearError();

      expect(useInvestmentStore.getState().error).toBeNull();
    });
  });

  describe('reset', () => {
    it('resetea al estado inicial', () => {
      useInvestmentStore.setState({
        investments: [createMockInvestment()],
        transactions: [createMockTransaction()],
        isLoading: true,
        error: 'Some error',
      });

      useInvestmentStore.getState().reset();

      const state = useInvestmentStore.getState();
      expect(state.investments).toEqual([]);
      expect(state.transactions).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('getPortfolioSummary', () => {
    beforeEach(() => {
      // Mock de useMarketStore para retornar precios
      (useMarketStore.getState as Mock).mockReturnValue({
        getPriceCop: vi.fn((etfId: string) => {
          if (etfId === 'nu-holdings') return 32000;
          return 0;
        }),
      });
    });

    it('calcula totalInvested correctamente', () => {
      useInvestmentStore.setState({
        investments: [
          createMockInvestment({ totalInvested: 1000000 }),
          createMockInvestment({ totalInvested: 500000 }),
        ],
        transactions: [],
      });

      const summary = useInvestmentStore.getState().getPortfolioSummary();

      expect(summary.totalInvested).toBe(1500000);
    });

    it('calcula currentValue usando precios del mercado', () => {
      useInvestmentStore.setState({
        investments: [
          createMockInvestment({
            etfId: 'nu-holdings',
            totalUnits: 100,
            currentPrice: 30000,
          }),
        ],
        transactions: [],
      });

      const summary = useInvestmentStore.getState().getPortfolioSummary();

      // 100 unidades * 32000 (precio del mercado)
      expect(summary.currentValue).toBe(3200000);
    });

    it('usa precio guardado si no hay precio de mercado', () => {
      (useMarketStore.getState as Mock).mockReturnValue({
        getPriceCop: vi.fn(() => 0),
      });

      useInvestmentStore.setState({
        investments: [
          createMockInvestment({
            etfId: 'other-etf',
            totalUnits: 100,
            currentPrice: 25000,
          }),
        ],
        transactions: [],
      });

      const summary = useInvestmentStore.getState().getPortfolioSummary();

      // 100 unidades * 25000 (precio guardado)
      expect(summary.currentValue).toBe(2500000);
    });

    it('cuenta transacciones de tipo buy correctamente', () => {
      useInvestmentStore.setState({
        investments: [],
        transactions: [
          createMockTransaction({ type: 'buy' }),
          createMockTransaction({ type: 'buy' }),
          createMockTransaction({ type: 'sell' }),
          createMockTransaction({ type: 'dividend' }),
        ],
      });

      const summary = useInvestmentStore.getState().getPortfolioSummary();

      expect(summary.transactionCount).toBe(2);
    });

    it('calcula monthlyContribution solo del último mes', () => {
      const now = new Date();
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      lastMonth.setDate(lastMonth.getDate() + 1); // Dentro del mes

      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

      useInvestmentStore.setState({
        investments: [],
        transactions: [
          createMockTransaction({ type: 'buy', date: now, totalAmount: 100000 }),
          createMockTransaction({ type: 'buy', date: lastMonth, totalAmount: 200000 }),
          createMockTransaction({ type: 'buy', date: twoMonthsAgo, totalAmount: 500000 }),
        ],
      });

      const summary = useInvestmentStore.getState().getPortfolioSummary();

      // Solo las del último mes
      expect(summary.monthlyContribution).toBe(300000);
    });

    it('retorna las últimas 5 transacciones en recentTransactions', () => {
      const transactions = Array.from({ length: 10 }, (_, i) =>
        createMockTransaction({ id: `tx-${i}` })
      );

      useInvestmentStore.setState({
        investments: [],
        transactions,
      });

      const summary = useInvestmentStore.getState().getPortfolioSummary();

      expect(summary.recentTransactions).toHaveLength(5);
      expect(summary.recentTransactions[0].id).toBe('tx-0');
    });

    it('retorna lastContributionDate de la primera compra', () => {
      const firstBuyDate = new Date('2024-01-15');
      const secondBuyDate = new Date('2024-02-20');

      useInvestmentStore.setState({
        investments: [],
        transactions: [
          createMockTransaction({ type: 'buy', date: firstBuyDate }),
          createMockTransaction({ type: 'buy', date: secondBuyDate }),
          createMockTransaction({ type: 'sell', date: new Date() }),
        ],
      });

      const summary = useInvestmentStore.getState().getPortfolioSummary();

      expect(summary.lastContributionDate).toEqual(firstBuyDate);
    });

    it('retorna null para lastContributionDate si no hay compras', () => {
      useInvestmentStore.setState({
        investments: [],
        transactions: [
          createMockTransaction({ type: 'sell' }),
          createMockTransaction({ type: 'dividend' }),
        ],
      });

      const summary = useInvestmentStore.getState().getPortfolioSummary();

      expect(summary.lastContributionDate).toBeNull();
    });
  });
});
