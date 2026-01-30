/**
 * Seccion de desglose por instrumento/ETF
 */

import React from 'react';
import { Page, View, Text } from '@react-pdf/renderer';
import { AnnualReportData } from '../../../types';
import { styles, colors, formatCurrencyPDF } from './pdfStyles';

interface PDFBreakdownProps {
  data: AnnualReportData;
}

export const PDFBreakdown: React.FC<PDFBreakdownProps> = ({ data }) => {
  const { etfBreakdown } = data;

  if (etfBreakdown.length === 0) {
    return (
      <Page size="A4" style={styles.page}>
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: colors.growth,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
          }}>
            <Text style={{ fontSize: 14, color: colors.white, fontWeight: 'bold' }}>$</Text>
          </View>
          <Text style={styles.title}>Tu Jardin de Inversiones</Text>
        </View>

        <View style={[styles.cardColorful, { alignItems: 'center', padding: 40 }]}>
          <View style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: colors.primaryLight,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}>
            <Text style={{ fontSize: 14, color: colors.primaryDark, fontWeight: 'bold' }}>+</Text>
          </View>
          <Text style={[styles.subtitle, { textAlign: 'center' }]}>
            El jardin esta esperando sus primeras plantas
          </Text>
          <Text style={[styles.body, { textAlign: 'center', marginTop: 12 }]}>
            Cuando agregues inversiones, aqui veras como crece
            cada planta de tu jardin financiero.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            El Tesoro de {data.childName} - {data.year}
          </Text>
          <Text style={styles.pageNumber}>Pagina 6</Text>
        </View>
      </Page>
    );
  }

  // Calcular el total para el grafico de barras
  const totalValue = etfBreakdown.reduce((sum, etf) => sum + etf.endValue, 0);

  return (
    <Page size="A4" style={styles.page}>
      {/* Titulo */}
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <View style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: colors.growth,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8,
        }}>
          <Text style={{ fontSize: 14, color: colors.white, fontWeight: 'bold' }}>$</Text>
        </View>
        <Text style={styles.title}>Tu Jardin de Inversiones</Text>
        <Text style={styles.caption}>
          {etfBreakdown.length} {etfBreakdown.length === 1 ? 'planta diferente' : 'plantas diferentes'} en tu jardin
        </Text>
      </View>

      {/* Grafico de barras visual */}
      <View style={[styles.card, { marginBottom: 20 }]}>
        <Text style={[styles.heading, { marginBottom: 16 }]}>Distribucion del Tesoro</Text>

        {etfBreakdown.map((etf, index) => (
          <View key={index} style={{ marginBottom: 16 }}>
            {/* Nombre y porcentaje */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: etf.etfColor,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 8,
                }}>
                  <Text style={{ fontSize: 8, color: colors.white }}>*</Text>
                </View>
                <Text style={styles.body}>{etf.etfTicker}</Text>
              </View>
              <Text style={styles.value}>
                {etf.percentageOfPortfolio.toFixed(1)}%
              </Text>
            </View>

            {/* Barra de progreso */}
            <View style={[styles.progressBar, { height: 16 }]}>
              <View style={[styles.progressFill, {
                width: `${etf.percentageOfPortfolio}%`,
                backgroundColor: etf.etfColor,
              }]} />
            </View>

            {/* Valor */}
            <Text style={[styles.caption, { textAlign: 'right', marginTop: 2 }]}>
              {formatCurrencyPDF(etf.endValue)}
            </Text>
          </View>
        ))}
      </View>

      {/* Tabla detallada */}
      <View style={styles.card}>
        <Text style={[styles.heading, { marginBottom: 12 }]}>Detalle por Planta</Text>

        {/* Encabezado de tabla */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCellHeader, { flex: 2 }]}>Instrumento</Text>
          <Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>Unidades</Text>
          <Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>Valor</Text>
          <Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>% Total</Text>
        </View>

        {/* Filas */}
        {etfBreakdown.map((etf, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: etf.etfColor,
                marginRight: 6,
              }} />
              <View>
                <Text style={styles.tableCell}>{etf.etfTicker}</Text>
                <Text style={[styles.caption, { fontSize: 7 }]}>{etf.etfName}</Text>
              </View>
            </View>
            <Text style={[styles.tableCell, { textAlign: 'right' }]}>
              {etf.endUnits.toFixed(4)}
            </Text>
            <Text style={[styles.tableCell, { textAlign: 'right', fontWeight: 'bold' }]}>
              {formatCurrencyPDF(etf.endValue)}
            </Text>
            <Text style={[styles.tableCell, { textAlign: 'right' }]}>
              {etf.percentageOfPortfolio.toFixed(1)}%
            </Text>
          </View>
        ))}

        {/* Total */}
        <View style={[styles.tableRow, { borderBottomWidth: 0, backgroundColor: colors.primaryLight, borderRadius: 8, marginTop: 8, paddingHorizontal: 12 }]}>
          <Text style={[styles.tableCellHeader, { flex: 2 }]}>Total</Text>
          <Text style={styles.tableCellHeader}></Text>
          <Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>
            {formatCurrencyPDF(totalValue)}
          </Text>
          <Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>100%</Text>
        </View>
      </View>

      {/* Explicacion educativa */}
      <View style={[styles.cardColorful, { marginTop: 16 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <View style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: colors.purple,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 8,
          }}>
            <Text style={{ fontSize: 10, color: colors.white }}>?</Text>
          </View>
          <Text style={styles.heading}>Por que tener varias plantas?</Text>
        </View>
        <Text style={styles.body}>
          Un jardin con muchas plantas diferentes es mas fuerte.
          Si una planta tiene problemas, las otras siguen creciendo.
          Eso se llama diversificacion!
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          El Tesoro de {data.childName} - {data.year}
        </Text>
        <Text style={styles.pageNumber}>Pagina 6</Text>
      </View>
    </Page>
  );
};
