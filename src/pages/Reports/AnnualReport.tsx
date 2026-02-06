/**
 * Página principal de reportes anuales
 */

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Download,
  RefreshCw,
  AlertCircle,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAnnualReport } from '../../hooks/useAnnualReport';
import { useAuthStore, useInvestmentStore } from '../../store';
import { Card, Button, LoadingSpinner } from '../../components/common';
import { YearSelector } from './components/YearSelector';
import { ReportPreview } from './components/ReportPreview';
import { SpecialLetterEditor } from '../../components/reports/SpecialLetterEditor';

export const AnnualReport: React.FC = () => {
  const { user } = useAuthStore();
  const { loadInvestments, loadTransactions } = useInvestmentStore();
  const {
    availableYears,
    selectedYear,
    setSelectedYear,
    reportData,
    isLoading,
    isGeneratingPdf,
    error,
    generateReport,
    downloadPDF,
    clearError,
    // Carta especial
    specialLetter,
    isLoadingLetter,
    saveSpecialLetter,
  } = useAnnualReport();

  const childName = user?.childName || 'Tu Hijo';

  // Cargar datos al montar el componente
  useEffect(() => {
    if (user) {
      console.log('[AnnualReport] Cargando datos para usuario:', user.id);
      loadInvestments(user.id);
      loadTransactions(user.id);
    }
  }, [user, loadInvestments, loadTransactions]);

  // Generar reporte cuando cambia el año seleccionado o cuando las transacciones se cargan
  useEffect(() => {
    console.log('[AnnualReport] Effect disparado:', { selectedYear, availableYearsLength: availableYears.length, availableYears });
    // Solo generar si hay años disponibles que vengan de transacciones reales (no solo el año actual por defecto)
    if (selectedYear && availableYears.length > 0) {
      generateReport();
    }
  }, [selectedYear, availableYears, generateReport]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Volver al Dashboard</span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              El Libro del Tesoro
            </h1>
            <p className="text-gray-500 dark:text-slate-400">
              Genera el reporte anual de inversiones
            </p>
          </div>
        </div>
      </motion.div>

      {/* Selector de año y acciones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            {/* Selector */}
            <div className="flex-1">
              <YearSelector
                availableYears={availableYears}
                selectedYear={selectedYear}
                onChange={setSelectedYear}
                disabled={isLoading || isGeneratingPdf}
              />
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3">
              <Button
                onClick={() => generateReport()}
                disabled={isLoading || isGeneratingPdf}
                variant="ghost"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Generar
              </Button>

              <Button
                onClick={downloadPDF}
                disabled={!reportData || isLoading || isGeneratingPdf}
                className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
              >
                {isGeneratingPdf ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Descargar PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          <Card className="bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-700 dark:text-red-300">{error}</p>
                <button
                  onClick={clearError}
                  className="text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 mt-2"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Estado de carga */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-12"
        >
          <LoadingSpinner size="lg" message="Generando el libro del tesoro..." className="min-h-0" />
          <p className="text-sm text-gray-400 dark:text-slate-500 mt-2 text-center">
            Esto puede tomar unos segundos
          </p>
        </motion.div>
      )}

      {/* Editor de carta especial */}
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <SpecialLetterEditor
            initialValue={specialLetter}
            childName={childName}
            year={selectedYear}
            onSave={saveSpecialLetter}
            disabled={isLoadingLetter || isGeneratingPdf}
          />
        </motion.div>
      )}

      {/* Vista previa del reporte */}
      {reportData && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ReportPreview data={reportData} />

          {/* Botón de descarga adicional */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-center"
          >
            <Button
              onClick={downloadPDF}
              disabled={isGeneratingPdf}
              size="lg"
              className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white shadow-lg shadow-gold-500/30"
            >
              {isGeneratingPdf ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                  Generando PDF...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Descargar El Libro del Tesoro
                </>
              )}
            </Button>

            <p className="text-sm text-gray-500 dark:text-slate-400 mt-3">
              El PDF incluye 7 páginas con toda la historia del año
            </p>
          </motion.div>
        </motion.div>
      )}

      {/* Estado vacío */}
      {!reportData && !isLoading && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <span className="text-6xl mb-4 block">📚</span>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Selecciona un año para generar el reporte
          </h3>
          <p className="text-gray-500 dark:text-slate-400 max-w-md mx-auto">
            Elige el año del que quieres crear el libro del tesoro
            y haz clic en "Generar" para ver la vista previa.
          </p>
        </motion.div>
      )}
    </div>
  );
};
