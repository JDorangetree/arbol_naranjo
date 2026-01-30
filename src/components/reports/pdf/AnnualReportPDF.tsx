/**
 * Documento PDF principal del reporte anual
 * Ensambla todas las secciones
 */

import React from 'react';
import { Document } from '@react-pdf/renderer';
import { AnnualReportData } from '../../../types';
import { PDFCover } from './PDFCover';
import { PDFStoryIntro } from './PDFStoryIntro';
import { PDFSummarySection } from './PDFSummarySection';
import { PDFTreeGrowth } from './PDFTreeGrowth';
import { PDFMomentsTimeline } from './PDFMomentsTimeline';
import { PDFBreakdown } from './PDFBreakdown';
import { PDFEducational } from './PDFEducational';
import { PDFFuture } from './PDFFuture';

interface AnnualReportPDFProps {
  data: AnnualReportData;
}

export const AnnualReportPDF: React.FC<AnnualReportPDFProps> = ({ data }) => {
  // Renderizar solo la portada primero para depurar
  return (
    <Document
      title={`El Tesoro de ${data.childName} - ${data.year}`}
      author="El Tesoro del Futuro"
    >
      {/* 1. Portada */}
      <PDFCover data={data} />

      {/* 2. Carta de introduccion / Storytelling */}
      <PDFStoryIntro data={data} />

      {/* 3. Resumen financiero */}
      <PDFSummarySection data={data} />

      {/* 4. Evolucion del arbol */}
      <PDFTreeGrowth data={data} />

      {/* 5. Momentos especiales */}
      <PDFMomentsTimeline data={data} />

      {/* 6. Desglose por instrumento */}
      <PDFBreakdown data={data} />

      {/* 7. Seccion educativa */}
      <PDFEducational data={data} />

      {/* 8. Proyecciones futuras */}
      <PDFFuture data={data} />
    </Document>
  );
};
