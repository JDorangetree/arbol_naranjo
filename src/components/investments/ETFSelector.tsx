import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';
import type { ETF } from '../../types';
import { AVAILABLE_ETFS, ETF_CATEGORY_LABELS } from '../../utils';
import { Instrument, INSTRUMENT_CATEGORY_LABELS } from '../../utils/instruments';
import { useInstrumentStore } from '../../store/useInstrumentStore';

// Tipo unificado para mostrar en el selector
type SelectableItem = ETF | Instrument;

interface ETFSelectorProps {
  selectedId: string | null;
  onSelect: (etf: ETF) => void;
  /** Si es true, usa los instrumentos seleccionados en la configuración */
  useConfiguredInstruments?: boolean;
}

// Helper para convertir Instrument a ETF (para compatibilidad con el form)
const instrumentToETF = (instrument: Instrument): ETF => ({
  id: instrument.id,
  ticker: instrument.ticker,
  name: instrument.name,
  description: instrument.description,
  category: mapInstrumentCategoryToETFCategory(instrument.category),
  currency: instrument.currency === 'EUR' ? 'USD' : instrument.currency,
  exchange: instrument.exchange,
  currentPrice: instrument.currentPriceCop,
  priceUpdatedAt: new Date(),
  icon: instrument.icon,
  color: instrument.color,
  plantType: mapTypeToPlantType(instrument.type),
});

// Mapea categoría de Instrument a ETFCategory
const mapInstrumentCategoryToETFCategory = (category: Instrument['category']): ETF['category'] => {
  const mapping: Record<Instrument['category'], ETF['category']> = {
    sp500: 'international_equity',
    total_market: 'international_equity',
    international: 'international_equity',
    emerging: 'international_equity',
    bonds: 'bonds',
    dividend: 'dividend',
    tech: 'international_equity',
    colombia: 'colombian_equity',
    colombia_stock: 'colombian_equity',
    mgc: 'international_equity',
    individual: 'international_equity',
  };
  return mapping[category] || 'international_equity';
};

// Mapea tipo de instrumento a PlantType
const mapTypeToPlantType = (type: Instrument['type']): ETF['plantType'] => {
  const mapping: Record<Instrument['type'], ETF['plantType']> = {
    etf: 'bamboo',
    stock: 'oak',
    bond_etf: 'flower',
  };
  return mapping[type] || 'bamboo';
};

// Helper para obtener el label de categoría
const getCategoryLabel = (item: SelectableItem): string => {
  if ('type' in item && 'market' in item) {
    // Es un Instrument
    return INSTRUMENT_CATEGORY_LABELS[item.category] || item.category;
  }
  // Es un ETF
  return ETF_CATEGORY_LABELS[item.category] || item.category;
};

export const ETFSelector: React.FC<ETFSelectorProps> = ({
  selectedId,
  onSelect,
  useConfiguredInstruments = true,
}) => {
  const { getSelectedInstruments } = useInstrumentStore();

  // Obtener los items a mostrar
  const items: SelectableItem[] = useConfiguredInstruments
    ? getSelectedInstruments()
    : AVAILABLE_ETFS;

  const handleSelect = (item: SelectableItem) => {
    // Convertir a ETF si es Instrument
    const etf: ETF = 'type' in item && 'market' in item
      ? instrumentToETF(item)
      : item;
    console.log('Instrumento seleccionado:', etf.ticker);
    onSelect(etf);
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-slate-400">
        <p className="mb-2">No hay instrumentos configurados.</p>
        <p className="text-sm">Ve a Configuración para seleccionar los instrumentos que deseas usar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => handleSelect(item)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleSelect(item)}
          className={clsx(
            'relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200',
            selectedId === item.id
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
              : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
          )}
        >
          <div className="flex items-center gap-4">
            {/* Icono del instrumento */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${item.color}20` }}
            >
              {item.icon}
            </div>

            {/* Info del instrumento */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-gray-900 dark:text-white">{item.ticker}</h4>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300">
                  {item.currency}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-300 truncate">{item.name}</p>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                {getCategoryLabel(item)}
              </p>
            </div>

            {/* Indicador de selección */}
            {selectedId === item.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center"
              >
                <Check className="w-4 h-4 text-white" />
              </motion.div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};
