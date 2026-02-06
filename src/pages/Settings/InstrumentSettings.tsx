import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Check,
  Search,
  Filter,
  ChevronDown,
  RotateCcw,
  TrendingUp,
  Building2,
  Globe,
  Coins,
  Key,
  Eye,
  EyeOff,
  Save,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Wifi,
  WifiOff,
  Clock,
} from 'lucide-react';
import { useInstrumentStore, useMarketStore } from '../../store';
import {
  ALL_INSTRUMENTS,
  ETF_INSTRUMENTS,
  STOCK_INSTRUMENTS,
  INSTRUMENT_CATEGORY_LABELS,
  INSTRUMENT_TYPE_LABELS,
  Instrument,
  InstrumentCategory,
  InstrumentType,
} from '../../utils/instruments';
import { isAvailableInFinnhub, getQuote } from '../../services/marketData/finnhub';
import { formatCurrency } from '../../utils/formatters';
import { Card, Button } from '../../components/common';

export const InstrumentSettings: React.FC = () => {
  const {
    selectedInstrumentIds,
    toggleInstrument,
    isSelected,
    resetToDefaults,
  } = useInstrumentStore();

  const { apiKey, setApiKey, fetchPricesForInstruments, isLoading: isPricesLoading } = useMarketStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<InstrumentType | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<InstrumentCategory | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filtrar instrumentos
  const filteredInstruments = ALL_INSTRUMENTS.filter((instrument) => {
    // Filtro de búsqueda
    const matchesSearch =
      searchQuery === '' ||
      instrument.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instrument.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instrument.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Filtro de tipo
    const matchesType = filterType === 'all' || instrument.type === filterType;

    // Filtro de categoría
    const matchesCategory = filterCategory === 'all' || instrument.category === filterCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  // Agrupar por categoría para mostrar
  const groupedInstruments = filteredInstruments.reduce((acc, instrument) => {
    const category = instrument.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(instrument);
    return acc;
  }, {} as Record<InstrumentCategory, Instrument[]>);

  const categories = Object.keys(groupedInstruments) as InstrumentCategory[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="w-7 h-7 text-primary-500" />
            Configurar Instrumentos
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            Selecciona los ETFs y acciones que quieres seguir
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-slate-400">
            {selectedInstrumentIds.length} seleccionados
          </span>
          {apiKey && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw className={`w-4 h-4 ${isPricesLoading ? 'animate-spin' : ''}`} />}
              onClick={() => fetchPricesForInstruments(selectedInstrumentIds)}
              disabled={isPricesLoading || selectedInstrumentIds.length === 0}
            >
              {isPricesLoading ? 'Actualizando...' : 'Actualizar precios'}
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RotateCcw className="w-4 h-4" />}
            onClick={resetToDefaults}
          >
            Restaurar
          </Button>
        </div>
      </div>

      {/* Búsqueda y filtros */}
      <Card>
        <div className="space-y-4">
          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre o ticker..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-slate-500"
            />
          </div>

          {/* Botón de filtros */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-sm"
            >
              <Filter className="w-4 h-4" />
              Filtros
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Chips de filtro activo */}
            {filterType !== 'all' && (
              <span className="flex items-center gap-1 px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg text-sm">
                {INSTRUMENT_TYPE_LABELS[filterType]}
                <button onClick={() => setFilterType('all')} className="hover:text-primary-900 dark:hover:text-primary-200">×</button>
              </span>
            )}
            {filterCategory !== 'all' && (
              <span className="flex items-center gap-1 px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg text-sm">
                {INSTRUMENT_CATEGORY_LABELS[filterCategory]}
                <button onClick={() => setFilterCategory('all')} className="hover:text-primary-900 dark:hover:text-primary-200">×</button>
              </span>
            )}
          </div>

          {/* Panel de filtros */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                  {/* Filtro por tipo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Tipo de instrumento
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <FilterChip
                        label="Todos"
                        isActive={filterType === 'all'}
                        onClick={() => setFilterType('all')}
                      />
                      <FilterChip
                        label="ETFs"
                        icon={<TrendingUp className="w-3 h-3" />}
                        isActive={filterType === 'etf'}
                        onClick={() => setFilterType('etf')}
                      />
                      <FilterChip
                        label="Acciones"
                        icon={<Building2 className="w-3 h-3" />}
                        isActive={filterType === 'stock'}
                        onClick={() => setFilterType('stock')}
                      />
                      <FilterChip
                        label="Bonos"
                        icon={<Coins className="w-3 h-3" />}
                        isActive={filterType === 'bond_etf'}
                        onClick={() => setFilterType('bond_etf')}
                      />
                    </div>
                  </div>

                  {/* Filtro por categoría */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Categoría
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <FilterChip
                        label="Todas"
                        isActive={filterCategory === 'all'}
                        onClick={() => setFilterCategory('all')}
                      />
                      {Object.entries(INSTRUMENT_CATEGORY_LABELS).map(([key, label]) => (
                        <FilterChip
                          key={key}
                          label={label}
                          isActive={filterCategory === key}
                          onClick={() => setFilterCategory(key as InstrumentCategory)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      {/* Configuración de API */}
      <ApiKeySection apiKey={apiKey} setApiKey={setApiKey} />

      {/* Lista de instrumentos agrupados */}
      <div className="space-y-6">
        {categories.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-gray-500 dark:text-slate-400">No se encontraron instrumentos</p>
          </Card>
        ) : (
          categories.map((category) => (
            <div key={category}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary-500" />
                {INSTRUMENT_CATEGORY_LABELS[category]}
                <span className="text-sm font-normal text-gray-500 dark:text-slate-400">
                  ({groupedInstruments[category].length})
                </span>
              </h3>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {groupedInstruments[category].map((instrument) => (
                  <InstrumentCard
                    key={instrument.id}
                    instrument={instrument}
                    isSelected={isSelected(instrument.id)}
                    onToggle={() => toggleInstrument(instrument.id)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Estado de verificación de API
type ApiTestStatus = 'idle' | 'testing' | 'success' | 'error';

interface ApiTestResult {
  status: ApiTestStatus;
  message: string;
  price?: number;
}

// Componente para configuración de API key
interface ApiKeySectionProps {
  apiKey: string | null;
  setApiKey: (key: string | null) => void;
}

const ApiKeySection: React.FC<ApiKeySectionProps> = ({ apiKey, setApiKey }) => {
  const [inputKey, setInputKey] = useState(apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testResult, setTestResult] = useState<ApiTestResult>({ status: 'idle', message: '' });

  const handleSave = () => {
    const trimmedKey = inputKey.trim();
    setApiKey(trimmedKey || null);
    setSaved(true);
    setTestResult({ status: 'idle', message: '' }); // Reset test status
    setTimeout(() => setSaved(false), 3000);
  };

  // Función para probar la API
  const testApiConnection = useCallback(async () => {
    const keyToTest = inputKey.trim() || apiKey;

    if (!keyToTest) {
      setTestResult({
        status: 'error',
        message: 'Ingresa una API key para probar'
      });
      return;
    }

    setTestResult({ status: 'testing', message: 'Probando conexión...' });

    try {
      // Probar con SPY y NU en paralelo
      const [spyQuote, nuQuote] = await Promise.all([
        getQuote('SPY', keyToTest),
        getQuote('NU', keyToTest)
      ]);

      if (spyQuote && spyQuote.price > 0) {
        let message = `SPY: $${spyQuote.price.toFixed(2)} USD`;
        if (nuQuote && nuQuote.price > 0) {
          message += ` | NU: $${nuQuote.price.toFixed(2)} USD`;
        } else {
          message += ' | NU: no disponible';
        }
        setTestResult({
          status: 'success',
          message: `✓ ${message}`,
          price: spyQuote.price
        });
      } else {
        setTestResult({
          status: 'error',
          message: 'No se pudo obtener precio. Verifica tu API key.'
        });
      }
    } catch (error) {
      setTestResult({
        status: 'error',
        message: 'Error de conexión. Verifica tu API key.'
      });
    }
  }, [inputKey, apiKey]);

  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
          <Key className="w-6 h-6 text-amber-600 dark:text-amber-400" />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            API de Precios de Mercado
          </h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Configura tu API key de Finnhub para obtener precios actualizados de los instrumentos.
          </p>

          <div className="mt-4 space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="Ingresa tu API key de Finnhub"
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                >
                  {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <Button
                onClick={handleSave}
                leftIcon={saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                variant={saved ? 'secondary' : 'primary'}
              >
                {saved ? 'Guardado' : 'Guardar'}
              </Button>
            </div>

            {/* Botón de prueba y estado */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={testApiConnection}
                variant="secondary"
                size="sm"
                disabled={testResult.status === 'testing'}
                leftIcon={
                  testResult.status === 'testing'
                    ? <RefreshCw className="w-4 h-4 animate-spin" />
                    : <Wifi className="w-4 h-4" />
                }
              >
                {testResult.status === 'testing' ? 'Probando...' : 'Probar conexión'}
              </Button>

              {/* Indicador de estado */}
              <AnimatePresence mode="wait">
                {testResult.status !== 'idle' && testResult.status !== 'testing' && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                      testResult.status === 'success'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}
                  >
                    {testResult.status === 'success' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    <span>{testResult.message}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <a
                href="https://finnhub.io/register"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
              >
                <ExternalLink className="w-4 h-4" />
                Obtener API key gratis
              </a>
              <span className="text-gray-400 dark:text-slate-600">|</span>
              <span className={`flex items-center gap-1 ${apiKey ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-slate-400'}`}>
                {apiKey ? (
                  <>
                    <Wifi className="w-3 h-3" />
                    API key configurada
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3" />
                    Sin API key (precios estáticos)
                  </>
                )}
              </span>
            </div>

            <p className="text-xs text-gray-400 dark:text-slate-500">
              Finnhub ofrece 60 consultas por minuto en su plan gratuito. Los precios se actualizan automáticamente cuando registras inversiones.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Componente para chips de filtro
interface FilterChipProps {
  label: string;
  icon?: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
      isActive
        ? 'bg-primary-500 text-white'
        : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
    }`}
  >
    {icon}
    {label}
  </button>
);

// Formatea la hora de actualización de forma corta
const formatUpdateTime = (date: Date | null): string => {
  if (!date) return '';
  const d = new Date(date);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();

  const timeStr = d.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isToday) {
    return `Hoy ${timeStr}`;
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return `Ayer ${timeStr}`;
  }

  return d.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
  });
};

// Componente para tarjeta de instrumento
interface InstrumentCardProps {
  instrument: Instrument;
  isSelected: boolean;
  onToggle: () => void;
}

const InstrumentCard: React.FC<InstrumentCardProps> = ({
  instrument,
  isSelected,
  onToggle,
}) => {
  const { getPrice, getPriceCop } = useMarketStore();
  const hasApiSupport = isAvailableInFinnhub(instrument.id);

  // Obtener precio actualizado del store o usar el estático
  const priceData = getPrice(instrument.id);
  const currentPrice = priceData?.priceCop || getPriceCop(instrument.id) || instrument.currentPriceCop;
  const isFromApi = priceData?.source === 'api';
  const lastUpdateTime = priceData?.lastUpdated ? formatUpdateTime(priceData.lastUpdated) : null;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onToggle}
      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
        isSelected
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
          : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600'
      }`}
    >
      {/* Indicador de selección */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Icono */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
          style={{ backgroundColor: `${instrument.color}20` }}
        >
          {instrument.icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 dark:text-white">{instrument.ticker}</span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300">
              {INSTRUMENT_TYPE_LABELS[instrument.type]}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-slate-300 truncate">{instrument.name}</p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{instrument.exchange}</p>
        </div>
      </div>

      {/* Precio */}
      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs text-gray-500 dark:text-slate-400">
              {isFromApi ? 'Precio actual' : 'Precio aprox.'}
            </span>
            {lastUpdateTime && (
              <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                <Clock className="w-3 h-3" />
                <span>{lastUpdateTime}</span>
              </div>
            )}
          </div>
          <div className="text-right">
            <span className="font-semibold text-gray-900 dark:text-white money">
              {formatCurrency(currentPrice, 'COP')}
            </span>
            {priceData?.priceUsd && (
              <span className="block text-xs text-gray-400 dark:text-slate-500">
                ${priceData.priceUsd.toFixed(2)} USD
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {instrument.isAvailableInMGC && (
            <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full">
              MGC
            </span>
          )}
          {hasApiSupport ? (
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              isFromApi
                ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
            }`}>
              {isFromApi ? '✓ Actualizado' : 'Precio automático'}
            </span>
          ) : (
            <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 rounded-full">
              Precio manual
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
