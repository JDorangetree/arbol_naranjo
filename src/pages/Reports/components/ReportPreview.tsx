/**
 * Vista previa del reporte en pantalla
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  TreeDeciduous,
  TrendingUp,
  Sparkles,
  PieChart,
  GraduationCap,
  Rocket,
} from 'lucide-react';
import { AnnualReportData } from '../../../types';
import { formatCurrency } from '../../../utils/formatters';
import { getTreeStageName, getTreeStageEmoji } from '../../../utils/reportCalculations';
import { Card } from '../../../components/common';

interface ReportPreviewProps {
  data: AnnualReportData;
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({ data }) => {
  const isPositiveReturn = data.summary.totalReturn >= 0;

  return (
    <div className="space-y-6">
      {/* Encabezado del preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <span className="text-6xl mb-4 block">🌳</span>
        <h2 className="text-2xl font-bold text-primary-600">
          El Libro del Tesoro de {data.childName}
        </h2>
        <p className="text-gray-500">Año {data.year}</p>
      </motion.div>

      {/* Resumen rápido */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {/* Edad */}
        <Card className="text-center p-4">
          <span className="text-2xl mb-2 block">👶</span>
          <p className="text-xs text-gray-500">Edad</p>
          <p className="text-lg font-bold text-primary-600">
            {data.childAgeAtYear} {data.childAgeAtYear === 1 ? 'año' : 'años'}
          </p>
        </Card>

        {/* Valor total */}
        <Card className="text-center p-4 bg-gold-50 border-gold-200">
          <span className="text-2xl mb-2 block">💰</span>
          <p className="text-xs text-gray-500">Tesoro</p>
          <p className="text-lg font-bold text-gold-600 money">
            {formatCurrency(data.summary.endValue, 'COP')}
          </p>
        </Card>

        {/* Etapa del árbol */}
        <Card className="text-center p-4 bg-growth-50 border-growth-200">
          <span className="text-2xl mb-2 block">{getTreeStageEmoji(data.treeGrowth.endStage)}</span>
          <p className="text-xs text-gray-500">Etapa</p>
          <p className="text-lg font-bold text-growth-600">
            {getTreeStageName(data.treeGrowth.endStage)}
          </p>
        </Card>

        {/* Contribuciones */}
        <Card className="text-center p-4">
          <span className="text-2xl mb-2 block">💧</span>
          <p className="text-xs text-gray-500">Riegos</p>
          <p className="text-lg font-bold text-primary-600">
            {data.summary.contributionCount}
          </p>
        </Card>
      </motion.div>

      {/* Secciones del reporte */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-500" />
            El reporte incluirá:
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sección 1 */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">💌</span>
              <div>
                <p className="font-medium text-gray-900">Carta Especial</p>
                <p className="text-xs text-gray-500">
                  Una historia personalizada del año
                </p>
              </div>
            </div>

            {/* Sección 2 */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">📊</span>
              <div>
                <p className="font-medium text-gray-900">Resumen Financiero</p>
                <p className="text-xs text-gray-500">
                  Números del crecimiento del árbol
                </p>
              </div>
            </div>

            {/* Sección 3 */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">🌳</span>
              <div>
                <p className="font-medium text-gray-900">Evolución del Árbol</p>
                <p className="text-xs text-gray-500">
                  Comparación visual inicio vs fin
                </p>
              </div>
            </div>

            {/* Sección 4 */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">✨</span>
              <div>
                <p className="font-medium text-gray-900">Momentos Especiales</p>
                <p className="text-xs text-gray-500">
                  {data.specialMoments.momentCount} momentos registrados
                </p>
              </div>
            </div>

            {/* Sección 5 */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">🌿</span>
              <div>
                <p className="font-medium text-gray-900">Jardín de Inversiones</p>
                <p className="text-xs text-gray-500">
                  {data.etfBreakdown.length} plantas diferentes
                </p>
              </div>
            </div>

            {/* Sección 6 */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">📚</span>
              <div>
                <p className="font-medium text-gray-900">Sección Educativa</p>
                <p className="text-xs text-gray-500">
                  Lecciones adaptadas a la edad
                </p>
              </div>
            </div>

            {/* Sección 7 */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">🔮</span>
              <div>
                <p className="font-medium text-gray-900">Proyecciones</p>
                <p className="text-xs text-gray-500">
                  El futuro del tesoro de {data.childName}
                </p>
              </div>
            </div>

            {/* Sección 8 */}
            <div className="flex items-start gap-3 p-3 bg-gold-50 rounded-lg border border-gold-200">
              <span className="text-2xl">💝</span>
              <div>
                <p className="font-medium text-gold-700">Mensaje Especial</p>
                <p className="text-xs text-gold-600">
                  Para cuando {data.childName} tenga 18 años
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Preview de la narrativa */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-primary-50 to-white border-primary-200">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-xl">📜</span>
            Vista previa de la carta:
          </h3>

          <div className="bg-white p-4 rounded-lg border border-gray-100 max-h-48 overflow-y-auto">
            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
              {data.narrative.introduction.substring(0, 500)}
              {data.narrative.introduction.length > 500 && '...'}
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
