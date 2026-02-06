import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getAllPrices, ETFPrice, formatLastUpdated } from '../services/marketData/priceService';
import { getUsdCopRate } from '../services/marketData/finnhub';
import { AVAILABLE_ETFS, USD_TO_COP } from '../utils/constants';
import { useInvestmentStore } from './useInvestmentStore';
import { ALL_INSTRUMENTS } from '../utils/instruments';

// Hora de actualización automática (6:00 AM hora local)
const AUTO_UPDATE_HOUR = 6;

// Verifica si la última actualización fue después de la hora de actualización de hoy
const isUpdatedAfterTodayUpdateTime = (lastUpdated: Date | null): boolean => {
  if (!lastUpdated) return false;

  const now = new Date();
  const updated = new Date(lastUpdated);

  // Crear la fecha de hoy a las 6:00 AM
  const todayUpdateTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    AUTO_UPDATE_HOUR,
    0,
    0
  );

  // Si aún no son las 6:00 AM de hoy, usar las 6:00 AM de ayer
  if (now < todayUpdateTime) {
    todayUpdateTime.setDate(todayUpdateTime.getDate() - 1);
  }

  // La actualización es válida si ocurrió después de la hora de actualización
  return updated >= todayUpdateTime;
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
  fetchPricesForInstruments: (instrumentIds: string[]) => Promise<void>;
  fetchPricesIfNeeded: () => Promise<void>;
  refreshExchangeRate: () => Promise<void>;
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

      // Obtener precios para instrumentos específicos (usado en configuración)
      fetchPricesForInstruments: async (instrumentIds: string[]) => {
        const { apiKey, exchangeRate, prices } = get();

        if (!apiKey) {
          set({ errors: ['Se requiere API key para actualizar precios'] });
          return;
        }

        if (instrumentIds.length === 0) {
          set({ isLoading: false, errors: [] });
          return;
        }

        set({ isLoading: true, errors: [] });

        try {
          const result = await getAllPrices(instrumentIds, apiKey, exchangeRate);

          // Merge con precios existentes
          set({
            prices: { ...prices, ...result.prices },
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

      // Actualizar solo la tasa de cambio USD/COP
      // Usa APIs gratuitas (Frankfurter, exchangerate.host) - no requiere API key
      // Nota: Finnhub NO soporta USD/COP
      refreshExchangeRate: async () => {
        set({ isLoading: true, errors: [] });

        try {
          const newRate = await getUsdCopRate();

          if (newRate) {
            set({
              exchangeRate: newRate,
              lastUpdated: new Date(),
              isLoading: false,
              errors: [],
            });
          } else {
            set({
              errors: ['No se pudo obtener la tasa de cambio'],
              isLoading: false,
            });
          }
        } catch (error) {
          set({
            errors: ['Error al obtener la tasa de cambio'],
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

      // Verifica si necesita actualización (después de las 6:00 AM)
      needsUpdate: () => {
        const { lastUpdated, apiKey } = get();
        if (!apiKey) return false; // Sin API key no puede actualizar
        return !isUpdatedAfterTodayUpdateTime(lastUpdated);
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
