import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getAllPrices, ETFPrice, formatLastUpdated } from '../services/marketData/priceService';
import { AVAILABLE_ETFS, USD_TO_COP } from '../utils/constants';
import { useInvestmentStore } from './useInvestmentStore';
import { ALL_INSTRUMENTS } from '../utils/instruments';

// Verifica si la última actualización fue hoy
const isUpdatedToday = (lastUpdated: Date | null): boolean => {
  if (!lastUpdated) return false;
  const today = new Date();
  const updated = new Date(lastUpdated);
  return (
    today.getFullYear() === updated.getFullYear() &&
    today.getMonth() === updated.getMonth() &&
    today.getDate() === updated.getDate()
  );
};

interface MarketState {
  // Precios
  prices: Record<string, ETFPrice>;
  exchangeRate: number;
  lastUpdated: Date | null;

  // Estado de carga
  isLoading: boolean;
  errors: string[];

  // Configuración
  apiKey: string | null;

  // Acciones
  setApiKey: (key: string | null) => void;
  fetchPricesForInvestments: () => Promise<void>;
  fetchPricesIfNeeded: () => Promise<void>;
  updateManualPrice: (etfId: string, price: number) => void;
  getPrice: (etfId: string) => ETFPrice | null;
  getPriceCop: (etfId: string) => number;
  getFormattedLastUpdate: () => string;
  needsUpdate: () => boolean;
}

export const useMarketStore = create<MarketState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      prices: {},
      exchangeRate: USD_TO_COP,
      lastUpdated: null,
      isLoading: false,
      errors: [],
      apiKey: null,

      // Configurar API key
      setApiKey: (key) => {
        set({ apiKey: key });
      },

      // Obtener precios de mercado SOLO para activos con inversiones registradas
      fetchPricesForInvestments: async () => {
        const { apiKey, exchangeRate } = get();

        // Obtener IDs únicos de los ETFs/instrumentos donde hay inversiones
        const investments = useInvestmentStore.getState().investments;
        const investedEtfIds = [...new Set(investments.map(inv => inv.etfId))];

        // Si no hay inversiones, no consultar nada
        if (investedEtfIds.length === 0) {
          set({ isLoading: false, errors: [] });
          return;
        }

        set({ isLoading: true, errors: [] });

        try {
          // Solo obtener precios para los instrumentos con inversiones
          const result = await getAllPrices(investedEtfIds, apiKey, exchangeRate);

          set({
            prices: result.prices,
            exchangeRate: result.exchangeRate,
            lastUpdated: result.lastUpdated,
            errors: result.errors,
            isLoading: false,
          });
        } catch (error) {
          set({
            errors: ['Error al obtener precios del mercado'],
            isLoading: false,
          });
        }
      },

      // Actualizar precio manual
      updateManualPrice: (etfId, price) => {
        const { prices } = get();
        set({
          prices: {
            ...prices,
            [etfId]: {
              etfId,
              priceUsd: null,
              priceCop: price,
              change: 0,
              changePercent: 0,
              lastUpdated: new Date(),
              source: 'manual',
            },
          },
        });
      },

      // Obtener precio de un ETF
      getPrice: (etfId) => {
        const { prices } = get();
        return prices[etfId] || null;
      },

      // Obtener precio en COP (con fallback a constantes o instrumentos)
      getPriceCop: (etfId) => {
        const { prices } = get();
        const price = prices[etfId];

        if (price) {
          return price.priceCop;
        }

        // Fallback 1: Buscar en constantes (ETFs originales)
        const etf = AVAILABLE_ETFS.find(e => e.id === etfId);
        if (etf?.currentPrice) {
          return etf.currentPrice;
        }

        // Fallback 2: Buscar en instrumentos nuevos
        const instrument = ALL_INSTRUMENTS.find(i => i.id === etfId);
        return instrument?.currentPriceCop || 0;
      },

      // Obtener última actualización formateada
      getFormattedLastUpdate: () => {
        const { lastUpdated } = get();
        if (!lastUpdated) return 'Nunca';
        return formatLastUpdated(new Date(lastUpdated));
      },

      // Verifica si necesita actualización (no se ha actualizado hoy)
      needsUpdate: () => {
        const { lastUpdated, apiKey } = get();
        if (!apiKey) return false; // Sin API key no puede actualizar
        return !isUpdatedToday(lastUpdated);
      },

      // Actualiza precios solo si no se han actualizado hoy
      fetchPricesIfNeeded: async () => {
        const { needsUpdate, fetchPricesForInvestments } = get();
        if (needsUpdate()) {
          await fetchPricesForInvestments();
        }
      },
    }),
    {
      name: 'market-storage',
      partialize: (state) => ({
        prices: state.prices,
        exchangeRate: state.exchangeRate,
        lastUpdated: state.lastUpdated,
        apiKey: state.apiKey,
      }),
    }
  )
);
