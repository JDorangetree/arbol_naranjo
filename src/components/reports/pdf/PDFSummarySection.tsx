/**
 * Seccion de resumen financiero del ano
 */

import React from 'react';
import { Page, View, Text } from '@react-pdf/renderer';
import { AnnualReportData } from '../../../types';
import { styles, colors, formatCurrencyPDF, formatPercentagePDF } from './pdfStyles';

interface PDFSummarySectionProps {
  data: AnnualReportData;
}

export const PDFSummarySection: React.FC<PDFSummarySectionProps> = ({ data }) => {
  const { summary } = data;
  const isPositiveReturn = summary.totalReturn >= 0;

  return (
    <Page size="A4" style={styles.page}>
      {/* Titulo de seccion */}
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <View style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8,
        }}>
          <Text style={{ fontSize: 12, color: colors.white, fontWeight: 'bold' }}>$</Text>
        </View>
        <Text style={styles.title}>Resumen del Ano {data.year}</Text>
        <Text style={styles.caption}>Los numeros de tu arbol financiero</Text>
      </View>

      {/* Tarjetas principales */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
      }}>
        {/* Valor inicial */}
        <View style={[styles.metricContainer, { flex: 1, marginRight: 8 }]}>
          <View style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: colors.primaryLight,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 4,
          }}>
            <Text style={{ fontSize: 10, color: colors.primaryDark }}>INI</Text>
          </View>
          <Text style={styles.metricLabel}>Inicio del ano</Text>
          <Text style={[styles.metricValue, { fontSize: 16 }]}>
            {formatCurrencyPDF(summary.startValue)}
          </Text>
        </View>

        {/* Flecha */}
        <View style={{ justifyContent: 'center', paddingHorizontal: 8 }}>
          <Text style={{ fontSize: 16, color: colors.growth, fontWeight: 'bold' }}>&gt;</Text>
        </View>

        {/* Valor final */}
        <View style={[styles.metricContainer, {
          flex: 1,
          marginLeft: 8,
          backgroundColor: colors.goldLight,
          borderColor: colors.gold,
        }]}>
          <View style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: colors.gold,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 4,
          }}>
            <Text style={{ fontSize: 10, color: colors.white }}>FIN</Text>
          </View>
          <Text style={styles.metricLabel}>Final del ano</Text>
          <Text style={[styles.metricValue, { fontSize: 16, color: colors.goldDark }]}>
            {formatCurrencyPDF(summary.endValue)}
          </Text>
        </View>
      </View>

      {/* Metricas secundarias */}
      <View style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
      }}>
        {/* Contribuciones */}
        <View style={[styles.card, { width: '48%', marginBottom: 12 }]}>
          <View style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: colors.cyan,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
          }}>
            <Text style={{ fontSize: 10, color: colors.white }}>+</Text>
          </View>
          <Text style={styles.label}>Riegos (contribuciones)</Text>
          <Text style={styles.value}>{summary.contributionCount}</Text>
          <Text style={[styles.caption, { marginTop: 4 }]}>
            Total: {formatCurrencyPDF(summary.totalContributed)}
          </Text>
        </View>

        {/* Retorno */}
        <View style={[styles.card, {
          width: '48%',
          marginBottom: 12,
          backgroundColor: isPositiveReturn ? colors.backgroundAlt : '#FEF2F2',
        }]}>
          <View style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: isPositiveReturn ? colors.growth : colors.error,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
          }}>
            <Text style={{ fontSize: 10, color: colors.white }}>{isPositiveReturn ? '+' : '-'}</Text>
          </View>
          <Text style={styles.label}>Crecimiento magico</Text>
          <Text style={[styles.value, {
            color: isPositiveReturn ? colors.growth : colors.error,
          }]}>
            {formatCurrencyPDF(summary.totalReturn)}
          </Text>
          <Text style={[styles.caption, {
            marginTop: 4,
            color: isPositiveReturn ? colors.growth : colors.error,
          }]}>
            {formatPercentagePDF(summary.returnPercentage)}
          </Text>
        </View>

        {/* Promedio */}
        <View style={[styles.card, { width: '48%' }]}>
          <View style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: colors.gold,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
          }}>
            <Text style={{ fontSize: 10, color: colors.white }}>$</Text>
          </View>
          <Text style={styles.label}>Promedio por riego</Text>
          <Text style={styles.value}>
            {formatCurrencyPDF(summary.averageContribution)}
          </Text>
        </View>

        {/* Mayor contribucion */}
        <View style={[styles.card, { width: '48%' }]}>
          <View style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: colors.purple,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
          }}>
            <Text style={{ fontSize: 10, color: colors.white }}>!</Text>
          </View>
          <Text style={styles.label}>Mayor contribucion</Text>
          <Text style={styles.value}>
            {formatCurrencyPDF(summary.largestContribution)}
          </Text>
        </View>
      </View>

      {/* Explicacion educativa */}
      <View style={[styles.cardColorful, { marginTop: 12 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <View style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: colors.gold,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 8,
          }}>
            <Text style={{ fontSize: 10, color: colors.white }}>?</Text>
          </View>
          <Text style={styles.heading}>Que significan estos numeros?</Text>
        </View>

        <View style={styles.listItem}>
          <Text style={styles.bullet}>*</Text>
          <Text style={styles.listText}>
            <Text style={{ fontWeight: 'bold' }}>Riegos: </Text>
            Cada vez que anadimos dinero al arbol, es como regarlo. Necesita agua constante para crecer.
          </Text>
        </View>

        <View style={styles.listItem}>
          <Text style={styles.bullet}>*</Text>
          <Text style={styles.listText}>
            <Text style={{ fontWeight: 'bold' }}>Crecimiento magico: </Text>
            Es el dinero extra que el arbol produce solito, gracias a la magia del interes compuesto.
          </Text>
        </View>

        <View style={styles.listItem}>
          <Text style={styles.bullet}>*</Text>
          <Text style={styles.listText}>
            <Text style={{ fontWeight: 'bold' }}>El tesoro final: </Text>
            Es la suma de todo lo que regamos + lo que crecio magicamente.
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          El Tesoro de {data.childName} - {data.year}
        </Text>
        <Text style={styles.pageNumber}>Pagina 3</Text>
      </View>
    </Page>
  );
};
