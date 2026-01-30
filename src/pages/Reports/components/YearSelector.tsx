/**
 * Selector de año para el reporte
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronDown } from 'lucide-react';

interface YearSelectorProps {
  availableYears: number[];
  selectedYear: number;
  onChange: (year: number) => void;
  disabled?: boolean;
}

export const YearSelector: React.FC<YearSelectorProps> = ({
  availableYears,
  selectedYear,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Selecciona el año del reporte
      </label>

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500">
          <Calendar className="w-5 h-5" />
        </div>

        <select
          value={selectedYear}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className={`
            w-full pl-10 pr-10 py-3
            appearance-none
            bg-white
            border-2 border-primary-200
            rounded-xl
            text-lg font-bold text-primary-700
            focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all
          `}
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-500 pointer-events-none">
          <ChevronDown className="w-5 h-5" />
        </div>
      </div>

      {availableYears.length === 0 && (
        <p className="mt-2 text-sm text-amber-600">
          No hay años con transacciones registradas
        </p>
      )}
    </div>
  );
};
