/**
 * Servicio para obtener datos de mercado de Finnhub
 * API con límite de 60 calls/minuto (gratis)
 * https://finnhub.io/docs/api
 */

import { getInstrumentById } from '../../utils/instruments';
import { withRetry, API_RETRY_OPTIONS } from '../../utils/retry';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

export interface FinnhubQuote {
  c: number;  // Current price
  h: number;  // High price of the day
  l: number;  // Low price of the day
  o: number;  // Open price of the day
  pc: number; // Previous close price
  t: number;  // Timestamp
  d: number;  // Change
  dp: number; // Percent change
}

export interface QuoteResult {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  timestamp: Date;
}

/**
 * Determina si un instrumento está disponible en Finnhub
 * Solo acciones y ETFs de mercados USA están disponibles
 */
export function isAvailableInFinnhub(instrumentId: string): boolean {
  const instrument = getInstrumentById(instrumentId);
  if (!instrument) return false;

  // Instrumentos colombianos locales NO están en Finnhub
  if (instrument.category === 'colombia' || instrument.category === 'colombia_stock') {
    return false;
  }

  // ETFs y acciones de USA sí están disponibles
  // Instrumentos del MGC también (son acciones USA listadas en BVC)
  return true;
}

/**
 * Obtiene el símbolo para Finnhub
 */
export function getFinnhubSymbol(instrumentId: string): string | null {
  const instrument = getInstrumentById(instrumentId);
  if (!instrument) return null;

  if (!isAvailableInFinnhub(instrumentId)) return null;

  // Finnhub usa los mismos tickers que Alpha Vantage/NYSE
  return instrument.tickerAlphaVantage || instrument.ticker;
}

/**
 * Obtiene el precio actual de un símbolo desde Finnhub
 */
export async function getQuote(
  symbol: string,
  apiKey: string
): Promise<QuoteResult | null> {
  try {
    const url = `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${apiKey}`;

    const response = await withRetry(
      async () => {
        const res = await fetch(url);
        // Si es rate limit, lanzar error para que se reintente
        if (res.status === 429) {
          throw new Error('Rate limit exceeded');
        }
        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }
        return res;
      },
      API_RETRY_OPTIONS
    );

    const data: FinnhubQuote = await response.json();

    // Finnhub retorna 0 en todos los campos si el símbolo no existe
    if (data.c === 0 && data.pc === 0) {
      console.warn('Símbolo no encontrado en Finnhub:', symbol);
      return null;
    }

    return {
      symbol,
      price: data.c,
      change: data.d || (data.c - data.pc),
      changePercent: data.dp || ((data.c - data.pc) / data.pc * 100),
      previousClose: data.pc,
      timestamp: new Date(data.t * 1000),
    };
  } catch (error) {
    console.error('Error obteniendo quote de Finnhub:', error);
    return null;
  }
}

/**
 * Obtiene precios de múltiples instrumentos
 * Finnhub permite 60 calls/minuto, así que podemos hacer llamadas paralelas
 */
export async function getMultipleQuotes(
  instrumentIds: string[],
  apiKey: string
): Promise<Record<string, QuoteResult>> {
  const results: Record<string, QuoteResult> = {};

  // Filtrar solo los que tienen símbolo válido
  const validInstruments = instrumentIds
    .map(id => ({ id, symbol: getFinnhubSymbol(id) }))
    .filter((item): item is { id: string; symbol: string } => item.symbol !== null);

  // Hacer llamadas en paralelo (Finnhub soporta 60/min)
  const promises = validInstruments.map(async ({ id, symbol }) => {
    const quote = await getQuote(symbol, apiKey);
    if (quote) {
      results[id] = quote;
    }
  });

  await Promise.all(promises);

  return results;
}

/**
 * Obtiene la tasa de cambio USD/COP desde APIs gratuitas
 * Finnhub NO soporta USD/COP, por eso usamos alternativas gratuitas:
 * 1. Open Exchange Rates API (gratis, sin API key, soporta COP)
 *
 * No requiere API key
 */
export async function getUsdCopRate(): Promise<number | null> {
  // Usar Open Exchange Rates API (gratis, sin API key, soporta COP)
  try {
    const url = 'https://open.er-api.com/v6/latest/USD';
    const response = await withRetry(
      async () => {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }
        return res;
      },
      API_RETRY_OPTIONS
    );

    const data = await response.json();
    if (data.result === 'success' && data.rates && data.rates.COP) {
      return data.rates.COP;
    }
  } catch (error) {
    console.error('Error obteniendo tasa USD/COP:', error);
  }

  return null;
}

/**
 * Convierte precio USD a COP
 */
export function convertUsdToCop(priceUsd: number, exchangeRate: number): number {
  return Math.round(priceUsd * exchangeRate);
}
