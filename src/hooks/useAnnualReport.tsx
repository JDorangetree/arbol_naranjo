/**
 * Hook para gestionar el reporte anual
 */

import { useState, useCallback, useMemo } from 'react';
import { pdf } from '@react-pdf/renderer';
import { AnnualReportData, UseAnnualReportReturn } from '../types';
import { useAuthStore, useInvestmentStore } from '../store';
import {
  getAnnualReportData,
  getReportAvailableYears,
  hasEnoughDataForReport,
} from '../services/reports';
import { AnnualReportPDF } from '../components/reports/pdf/AnnualReportPDF';

export function useAnnualReport(): UseAnnualReportReturn {
  const { user } = useAuthStore();
  const { transactions } = useInvestmentStore();

  const [selectedYear, setSelectedYear] = useState<number>(() => {
    // Por defecto, seleccionar el año actual o el último con datos
    const currentYear = new Date().getFullYear();
    return currentYear;
  });
  const [reportData, setReportData] = useState<AnnualReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calcular años disponibles
  const availableYears = useMemo(() => {
    if (transactions.length === 0) {
      // Si no hay transacciones, mostrar año actual
      return [new Date().getFullYear()];
    }
    return getReportAvailableYears(transactions);
  }, [transactions]);

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

      // Generar datos del reporte
      const data = await getAnnualReportData(
        transactions,
        childName,
        childBirthDate,
        selectedYear
      );

      setReportData(data);
    } catch (err) {
      console.error('Error generando reporte:', err);
      setError('Error al generar el reporte. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, [user, transactions, selectedYear]);

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
  };
}
