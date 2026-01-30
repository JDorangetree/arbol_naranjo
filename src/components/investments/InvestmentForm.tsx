import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Coins,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  TreeDeciduous,
  Plus,
} from 'lucide-react';
import { Button, Input } from '../common';
import { ETFSelector } from './ETFSelector';
import { ETF } from '../../types';
import { formatCurrency, MILESTONE_CONFIG } from '../../utils';
import { useMarketStore } from '../../store';

const investmentSchema = z.object({
  units: z.number().positive('Debe ser mayor a 0'),
  pricePerUnit: z.number().positive('Debe ser mayor a 0'),
  date: z.string().min(1, 'Selecciona una fecha'),
  note: z.string().optional(),
  milestone: z.string().optional(),
});

type InvestmentFormData = z.infer<typeof investmentSchema>;

interface InvestmentFormProps {
  onSubmit: (data: {
    etf: ETF;
    units: number;
    pricePerUnit: number;
    date: Date;
    note?: string;
    milestone?: string;
  }) => Promise<void>;
  onCancel: () => void;
}

export const InvestmentForm: React.FC<InvestmentFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [step, setStep] = useState(1);
  const [selectedETF, setSelectedETF] = useState<ETF | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<string>('');

  const { getPriceCop } = useMarketStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvestmentFormData>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      pricePerUnit: 0,
    },
  });

  // Actualizar precio cuando se selecciona un ETF
  useEffect(() => {
    if (selectedETF) {
      // Obtener precio del store de mercado o usar el precio por defecto del ETF
      const marketPrice = getPriceCop(selectedETF.id);
      const price = marketPrice > 0 ? marketPrice : selectedETF.currentPrice;
      setValue('pricePerUnit', price);
    }
  }, [selectedETF, getPriceCop, setValue]);

  const units = watch('units') || 0;
  const pricePerUnit = watch('pricePerUnit') || 0;
  const total = units * pricePerUnit;

  const handleFormSubmit = async (data: InvestmentFormData) => {
    if (!selectedETF) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        etf: selectedETF,
        units: data.units,
        pricePerUnit: data.pricePerUnit,
        date: new Date(data.date),
        note: data.note,
        milestone: selectedMilestone || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Indicador de pasos */}
      <div className="flex items-center justify-center gap-2 mb-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={clsx(
              'h-2 rounded-full transition-all duration-300',
              s === step
                ? 'w-8 bg-primary-500'
                : s < step
                ? 'w-2 bg-growth-500'
                : 'w-2 bg-gray-300'
            )}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <AnimatePresence mode="wait">
          {/* Paso 1: Seleccionar ETF */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-2">
                  <TreeDeciduous className="w-6 h-6 text-primary-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  ¿En qué instrumento deseas invertir?
                </h3>
                <p className="text-sm text-gray-500">
                  Selecciona el activo para este aporte
                </p>
              </div>

              <ETFSelector
                selectedId={selectedETF?.id || null}
                onSelect={setSelectedETF}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onCancel}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!selectedETF}
                  className="flex-1"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  Siguiente
                </Button>
              </div>
            </motion.div>
          )}

          {/* Paso 2: Cantidad y precio */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gold-100 rounded-full mb-2">
                  <Coins className="w-6 h-6 text-gold-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  ¿Cuánto vas a invertir?
                </h3>
                <p className="text-sm text-gray-500">
                  Ingresa los detalles de tu inversión en {selectedETF?.ticker}
                </p>
              </div>

              <Input
                label="Unidades"
                type="number"
                step="0.0001"
                placeholder="Ej: 10.5"
                leftIcon={<Coins className="w-5 h-5" />}
                error={errors.units?.message}
                {...register('units', { valueAsNumber: true })}
              />

              <Input
                label="Precio por unidad (COP)"
                type="number"
                step="1"
                placeholder="Ej: 2500000"
                error={errors.pricePerUnit?.message}
                {...register('pricePerUnit', { valueAsNumber: true })}
              />

              {/* Vista previa del total */}
              <div className="bg-gradient-to-r from-growth-50 to-gold-50 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total a invertir:</span>
                  <span className="text-2xl font-bold text-growth-600 money">
                    {formatCurrency(total, 'COP')}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setStep(1)}
                  className="flex-1"
                  leftIcon={<ArrowLeft className="w-5 h-5" />}
                >
                  Atrás
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!units || !pricePerUnit}
                  className="flex-1"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  Siguiente
                </Button>
              </div>
            </motion.div>
          )}

          {/* Paso 3: Fecha y nota */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-trust-100 rounded-full mb-2">
                  <Sparkles className="w-6 h-6 text-trust-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  ¿Es un momento especial?
                </h3>
                <p className="text-sm text-gray-500">
                  Agrega un recuerdo para el futuro
                </p>
              </div>

              <Input
                label="Fecha de la inversión"
                type="date"
                leftIcon={<Calendar className="w-5 h-5" />}
                error={errors.date?.message}
                {...register('date')}
              />

              {/* Selector visual de momentos especiales */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de momento
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                  {/* Opción sin momento especial */}
                  <button
                    type="button"
                    onClick={() => setSelectedMilestone('')}
                    className={clsx(
                      'flex flex-col items-center p-3 rounded-xl border-2 transition-all',
                      selectedMilestone === ''
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <span className="text-2xl mb-1">📝</span>
                    <span className="text-xs text-center text-gray-600">Normal</span>
                  </button>

                  {/* Opciones de momentos especiales */}
                  {Object.entries(MILESTONE_CONFIG).map(([key, config]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedMilestone(key)}
                      className={clsx(
                        'flex flex-col items-center p-3 rounded-xl border-2 transition-all',
                        selectedMilestone === key
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <span className="text-2xl mb-1">{config.icon}</span>
                      <span className="text-xs text-center text-gray-600 line-clamp-2">
                        {config.label}
                      </span>
                    </button>
                  ))}
                </div>
                {selectedMilestone && MILESTONE_CONFIG[selectedMilestone] && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-gray-500 mt-2 italic"
                  >
                    {MILESTONE_CONFIG[selectedMilestone].description}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nota para el futuro (opcional)
                </label>
                <textarea
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 resize-none"
                  rows={3}
                  placeholder="Ej: Esta inversión la hicimos el día que aprendiste a caminar..."
                  {...register('note')}
                />
              </div>

              {/* Resumen */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <h4 className="font-semibold text-gray-900">Resumen:</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">ETF:</span>
                    <span className="font-medium">
                      {selectedETF?.ticker} - {selectedETF?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Unidades:</span>
                    <span className="font-medium money">{units}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total:</span>
                    <span className="font-bold text-growth-600 money">
                      {formatCurrency(total, 'COP')}
                    </span>
                  </div>
                  {selectedMilestone && MILESTONE_CONFIG[selectedMilestone] && (
                    <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                      <span className="text-gray-500">Momento:</span>
                      <span className="font-medium flex items-center gap-1">
                        {MILESTONE_CONFIG[selectedMilestone].icon}{' '}
                        {MILESTONE_CONFIG[selectedMilestone].label}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setStep(2)}
                  className="flex-1"
                  leftIcon={<ArrowLeft className="w-5 h-5" />}
                >
                  Atrás
                </Button>
                <Button
                  type="submit"
                  variant="success"
                  className="flex-1"
                  isLoading={isSubmitting}
                  rightIcon={<Plus className="w-5 h-5" />}
                >
                  Registrar
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
};

// Helper para clsx (importar o definir)
function clsx(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
