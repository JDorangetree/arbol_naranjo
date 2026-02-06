/**
 * Hook para gestionar el reporte anual
 *
 * Incluye:
 * - Generación de datos del reporte
 * - Carta especial escrita por el usuario
 * - Contenido educativo con Gemini AI
 * - Descarga de PDF
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { pdf } from '@react-pdf/renderer';
import { AnnualReportData, UseAnnualReportReturn } from '../types';
import { useAuthStore, useInvestmentStore } from '../store';
import {
  getAnnualReportData,
  getReportAvailableYears,
  hasEnoughDataForReport,
} from '../services/reports';
import {
  getYearlyNarrative,
  saveYearlyNarrative,
} from '../services/firebase/emotionalService';
import { AnnualReportPDF } from '../components/reports/pdf/AnnualReportPDF';

/**
 * Extensión del return type para incluir carta especial
 */
export interface UseAnnualReportExtendedReturn extends UseAnnualReportReturn {
  /** Carta especial del usuario para el año seleccionado */
  specialLetter: string | undefined;
  /** Indica si se está cargando la carta especial */
  isLoadingLetter: boolean;
  /** Guardar carta especial */
  saveSpecialLetter: (letter: string) => Promise<void>;
}

export function useAnnualReport(): UseAnnualReportExtendedReturn {
  const { user } = useAuthStore();
  const { transactions, investments } = useInvestmentStore();

  const [selectedYear, setSelectedYear] = useState<number>(() => {
    // Por defecto, seleccionar el año actual o el último con datos
    const currentYear = new Date().getFullYear();
    return currentYear;
  });
  const [reportData, setReportData] = useState<AnnualReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado para carta especial
  const [specialLetter, setSpecialLetter] = useState<string | undefined>(undefined);
  const [cachedAiEducational, setCachedAiEducational] = useState<string | undefined>(undefined);
  const [isLoadingLetter, setIsLoadingLetter] = useState(false);

  // Calcular años disponibles
  const availableYears = useMemo(() => {
    // DEBUG: Verificar transacciones
    console.log('[useAnnualReport] transactions.length:', transactions.length);
    if (transactions.length > 0) {
      console.log('[useAnnualReport] Primera transacción:', {
        date: transactions[0].date,
        dateType: typeof transactions[0].date,
        dateValue: transactions[0].date instanceof Date
          ? transactions[0].date.toISOString()
          : String(transactions[0].date),
      });
    }

    if (transactions.length === 0) {
      // Si no hay transacciones, mostrar año actual
      return [new Date().getFullYear()];
    }
    const years = getReportAvailableYears(transactions);
    console.log('[useAnnualReport] Años calculados:', years);
    return years;
  }, [transactions]);

  // Cargar carta especial cuando cambia el año seleccionado
  useEffect(() => {
    async function loadYearlyData() {
      if (!user?.id || !selectedYear) return;

      setIsLoadingLetter(true);
      try {
        const yearlyNarrative = await getYearlyNarrative(user.id, selectedYear);
        if (yearlyNarrative) {
          setSpecialLetter(yearlyNarrative.specialLetter);
          setCachedAiEducational(yearlyNarrative.aiEducationalContent);
        } else {
          setSpecialLetter(undefined);
          setCachedAiEducational(undefined);
        }
      } catch (err) {
        console.error('Error cargando datos del año:', err);
        setSpecialLetter(undefined);
        setCachedAiEducational(undefined);
      } finally {
        setIsLoadingLetter(false);
      }
    }

    loadYearlyData();
  }, [user?.id, selectedYear]);

  // Guardar carta especial
  const saveSpecialLetter = useCallback(async (letter: string) => {
    if (!user?.id) {
      throw new Error('Debes iniciar sesión para guardar la carta');
    }

    // Calcular edad del niño en el año seleccionado
    const childBirthDate = user.childBirthDate
      ? (user.childBirthDate instanceof Date ? user.childBirthDate : new Date(user.childBirthDate))
      : new Date();
    const birthYear = childBirthDate.getFullYear();
    const childAgeAtYear = selectedYear - birthYear;

    await saveYearlyNarrative(user.id, selectedYear, {
      summary: '',
      highlights: [],
      lessonsLearned: [],
      whatWeDecided: '',
      whatWeLearned: '',
      childAgeAtYear,
      specialLetter: letter,
    });

    setSpecialLetter(letter);
  }, [user, selectedYear]);

  // Generar reporte
  const generateReport = useCallback(async () => {
    if (!user) {
      setError('Debes iniciar sesión para generar el reporte');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Verificar si hay datos suficientes
      const dataCheck = hasEnoughDataForReport(transactions, selectedYear);
      if (!dataCheck.hasData) {
        setError(dataCheck.message);
        setReportData(null);
        setIsLoading(false);
        return;
      }

      // Obtener datos del niño
      const childName = user.childName || 'Tu Hijo';
      const childBirthDate = user.childBirthDate
        ? (user.childBirthDate instanceof Date ? user.childBirthDate : new Date(user.childBirthDate))
        : new Date();

      // Generar datos del reporte (pasar inversiones para año actual)
      const data = await getAnnualReportData(
        transactions,
        childName,
        childBirthDate,
        selectedYear,
        investments, // Pasar inversiones para corregir valor si hay discrepancia
        {
          specialLetter,
          cachedAiEducational,
        }
      );

      // Si se generó contenido educativo nuevo con IA, guardarlo en cache
      if (user?.id && data.narrative.educational && !cachedAiEducational) {
        try {
          const birthYear = childBirthDate.getFullYear();
          const childAgeAtYear = selectedYear - birthYear;

          // Construir objeto sin campos undefined (Firestore no los acepta)
          const narrativeData: Parameters<typeof saveYearlyNarrative>[2] = {
            summary: '',
            highlights: [],
            lessonsLearned: [],
            whatWeDecided: '',
            whatWeLearned: '',
            childAgeAtYear,
            aiEducationalContent: data.narrative.educational,
            aiEducationalGeneratedAt: new Date(),
          };

          // Solo agregar specialLetter si tiene valor
          if (specialLetter) {
            narrativeData.specialLetter = specialLetter;
          }

          await saveYearlyNarrative(user.id, selectedYear, narrativeData);

          setCachedAiEducational(data.narrative.educational);
        } catch (cacheError) {
          console.warn('No se pudo cachear el contenido educativo:', cacheError);
        }
      }

      setReportData(data);
    } catch (err) {
      console.error('Error generando reporte:', err);
      setError('Error al generar el reporte. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, [user, transactions, investments, selectedYear]);

  // Descargar PDF
  const downloadPDF = useCallback(async () => {
    if (!reportData) {
      setError('Primero debes generar el reporte');
      return;
    }

    setIsGeneratingPdf(true);
    setError(null);

    try {
      console.log('Iniciando generacion de PDF...');
      console.log('Report data:', JSON.stringify(reportData, null, 2));

      // Crear el documento PDF
      const doc = <AnnualReportPDF data={reportData} />;
      console.log('Documento creado, generando blob...');

      // Generar el blob del PDF
      const blob = await pdf(doc).toBlob();
      console.log('Blob generado:', blob);

      // Crear URL y descargar
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `El_Tesoro_de_${reportData.childName.replace(/\s+/g, '_')}_${reportData.year}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      console.log('PDF descargado exitosamente');
    } catch (err: any) {
      console.error('Error descargando PDF:', err);
      console.error('Error message:', err?.message);
      console.error('Error stack:', err?.stack);
      setError(`Error al descargar el PDF: ${err?.message || 'Error desconocido'}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  }, [reportData]);

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
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
  };
}
