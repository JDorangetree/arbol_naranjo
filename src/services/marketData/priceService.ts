/**
 * Servicio centralizado para gestión de precios
 * Usa Finnhub para activos USA y precios manuales para mercado colombiano
 */

import {
  getMultipleQuotes,
  getUsdCopRate,
  convertUsdToCop,
  isAvailableInFinnhub,
} from './finnhub';
import { AVAILABLE_ETFS } from '../../utils/constants';
import { getInstrumentById } from '../../utils/instruments';

export interface ETFPrice {
  etfId: string;
  priceUsd: number | null;
  priceCop: number;
  change: number;
  changePercent: number;
  lastUpdated: Date;
  source: 'api' | 'manual';
}

export interface PriceUpdateResult {
  prices: Record<string, ETFPrice>;
  exchangeRate: number;
  lastUpdated: Date;
  errors: string[];
}

// Tasa de cambio por defecto (se actualiza desde API)
const DEFAULT_EXCHANGE_RATE = 4200;

/**
 * Obtiene todos los precios, combinando Finnhub API y precios manuales
 */
export async function getAllPrices(
  instrumentIds: string[],
  apiKey: string | null,
  currentExchangeRate: number = DEFAULT_EXCHANGE_RATE
): Promise<PriceUpdateResult> {
  const errors: string[] = [];
  const prices: Record<string, ETFPrice> = {};
  let exchangeRate = currentExchangeRate;

  // Si no hay instrumentos, retornar vacío
  if (instrumentIds.length === 0) {
    return { prices, exchangeRate, lastUpdated: new Date(), errors };
  }

  // Intentar obtener tasa de cambio actualizada
  if (apiKey) {
    const newRate = await getUsdCopRate(apiKey);
    if (newRate) {
      exchangeRate = newRate;
    }
  }

  // Separar instrumentos disponibles en API vs manuales
  const apiInstruments = instrumentIds.filter(id => isAvailableInFinnhub(id));
  const manualInstruments = instrumentIds.filter(id => !isAvailableInFinnhub(id));

  // Obtener precios de Finnhub API
  if (apiKey && apiInstruments.length > 0) {
    try {
      const quotes = await getMultipleQuotes(apiInstruments, apiKey);
      const failedIds: string[] = [];

      for (const instrumentId of apiInstruments) {
        const quote = quotes[instrumentId];
        if (quote) {
          prices[instrumentId] = {
            etfId: instrumentId,
            priceUsd: quote.price,
            priceCop: convertUsdToCop(quote.price, exchangeRate),
            change: quote.change,
            changePercent: quote.changePercent,
            lastUpdated: quote.timestamp,
            source: 'api',
          };
        } else {
          failedIds.push(instrumentId);
          // Usar precio de fallback
          prices[instrumentId] = createFallbackPrice(instrumentId, exchangeRate);
        }
      }

      // Reportar si hubo fallos
      if (failedIds.length > 0 && failedIds.length < apiInstruments.length) {
        errors.push(`No se pudo obtener precio para: ${failedIds.join(', ')}`);
      } else if (failedIds.length === apiInstruments.length) {
        errors.push('No se pudieron obtener precios de la API. Usando valores guardados.');
      }
    } catch (error) {
      errors.push('Error de conexión con Finnhub API');
      // Usar precios de fallback para todos
      for (const instrumentId of apiInstruments) {
        prices[instrumentId] = createFallbackPrice(instrumentId, exchangeRate);
      }
    }
  } else if (apiInstruments.length > 0) {
    // Sin API key, usar precios de fallback (no es error, es configuración)
    for (const instrumentId of apiInstruments) {
      prices[instrumentId] = createFallbackPrice(instrumentId, exchangeRate);
    }
  }

  // Agregar precios manuales (instrumentos colombianos)
  for (const instrumentId of manualInstruments) {
    prices[instrumentId] = createFallbackPrice(instrumentId, exchangeRate);
  }

  return {
    prices,
    exchangeRate,
    lastUpdated: new Date(),
    errors,
  };
}

/**
 * Crea un precio de fallback usando los datos definidos en instruments.ts
 */
function createFallbackPrice(instrumentId: string, exchangeRate: number): ETFPrice {
  // Buscar en constants (ETFs originales)
  const etf = AVAILABLE_ETFS.find(e => e.id === instrumentId);
  if (etf) {
    return {
      etfId: instrumentId,
      priceUsd: etf.currency === 'USD' ? etf.currentPrice / exchangeRate : null,
      priceCop: etf.currentPrice || 0,
      change: 0,
      changePercent: 0,
      lastUpdated: etf.priceUpdatedAt || new Date(),
      source: 'manual',
    };
  }

  // Buscar en instruments (lista completa)
  const instrument = getInstrumentById(instrumentId);
  if (instrument) {
    return {
      etfId: instrumentId,
      priceUsd: instrument.currency === 'USD' ? instrument.currentPriceOriginal : null,
      priceCop: instrument.currentPriceCop,
      change: 0,
      changePercent: 0,
      lastUpdated: new Date(),
      source: 'manual',
    };
  }

  // Si no se encuentra, retornar precio 0
  return {
    etfId: instrumentId,
    priceUsd: null,
    priceCop: 0,
    change: 0,
    changePercent: 0,
    lastUpdated: new Date(),
    source: 'manual',
  };
}

/**
 * Formatea la fecha de última actualización
 */
export function formatLastUpdated(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays === 1) return 'Ayer';
  return `Hace ${diffDays} días`;
}
