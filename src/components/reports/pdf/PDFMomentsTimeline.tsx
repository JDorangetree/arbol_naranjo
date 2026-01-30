/**
 * Seccion de momentos especiales (timeline)
 */

import React from 'react';
import { Page, View, Text } from '@react-pdf/renderer';
import { AnnualReportData } from '../../../types';
import { styles, colors, formatCurrencyPDF, formatDatePDF } from './pdfStyles';
import { MILESTONE_CONFIG } from '../../../utils/constants';

interface PDFMomentsTimelineProps {
  data: AnnualReportData;
}

export const PDFMomentsTimeline: React.FC<PDFMomentsTimelineProps> = ({ data }) => {
  const { specialMoments } = data;

  // Si no hay momentos especiales
  if (specialMoments.momentCount === 0) {
    return (
      <Page size="A4" style={styles.page}>
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: colors.gold,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
          }}>
            <Text style={{ fontSize: 14, color: colors.white, fontWeight: 'bold' }}>*</Text>
          </View>
          <Text style={styles.title}>Momentos Especiales</Text>
        </View>

        <View style={[styles.cardColorful, { alignItems: 'center', padding: 40 }]}>
          <View style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: colors.goldLight,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}>
            <Text style={{ fontSize: 14, color: colors.goldDark, fontWeight: 'bold' }}>!</Text>
          </View>
          <Text style={[styles.subtitle, { textAlign: 'center' }]}>
            Este ano no marcamos momentos especiales
          </Text>
          <Text style={[styles.body, { textAlign: 'center', marginTop: 12 }]}>
            Pero cada dia con {data.childName} es especial.
            El proximo ano podemos celebrar cumpleanos, logros y aventuras
            marcandolos en el arbol.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            El Tesoro de {data.childName} - {data.year}
          </Text>
          <Text style={styles.pageNumber}>Pagina 5</Text>
        </View>
      </Page>
    );
  }

  return (
    <Page size="A4" style={styles.page}>
      {/* Titulo */}
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <View style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: colors.gold,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8,
        }}>
          <Text style={{ fontSize: 14, color: colors.white, fontWeight: 'bold' }}>*</Text>
        </View>
        <Text style={styles.title}>Momentos Especiales</Text>
        <Text style={styles.caption}>
          {specialMoments.momentCount} momentos que hicieron brillar el arbol
        </Text>
      </View>

      {/* Resumen de momentos */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
      }}>
        <View style={[styles.metricContainer, { backgroundColor: colors.primaryLight }]}>
          <View style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 4,
          }}>
            <Text style={{ fontSize: 10, color: colors.white }}>#</Text>
          </View>
          <Text style={[styles.metricValue, { color: colors.primaryDark }]}>
            {specialMoments.momentCount}
          </Text>
          <Text style={styles.metricLabel}>Momentos</Text>
        </View>

        <View style={[styles.metricContainer, { backgroundColor: colors.goldLight }]}>
          <View style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: colors.gold,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 4,
          }}>
            <Text style={{ fontSize: 10, color: colors.white }}>$</Text>
          </View>
          <Text style={[styles.metricValue, { color: colors.goldDark }]}>
            {formatCurrencyPDF(specialMoments.totalInMoments)}
          </Text>
          <Text style={styles.metricLabel}>Total invertido</Text>
        </View>
      </View>

      {/* Timeline de momentos */}
      <View style={styles.card}>
        {specialMoments.moments.slice(0, 6).map((moment, index) => {
          const milestoneConfig = moment.milestone ? MILESTONE_CONFIG[moment.milestone] : null;
          const label = milestoneConfig?.label || 'Momento especial';
          const color = milestoneConfig?.color || colors.primary;
          const date = moment.date instanceof Date ? moment.date : new Date(moment.date);

          return (
            <View key={index} style={styles.timelineItem}>
              {/* Punto de la linea */}
              <View style={[styles.timelineDot, { backgroundColor: color }]} />

              {/* Contenido */}
              <View style={[styles.timelineContent, { borderLeftColor: color }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <View style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: color,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 8,
                  }}>
                    <Text style={{ fontSize: 8, color: colors.white }}>*</Text>
                  </View>
                  <Text style={[styles.heading, { marginBottom: 0, color }]}>
                    {label}
                  </Text>
                </View>

                <Text style={styles.caption}>
                  {formatDatePDF(date)}
                </Text>

                {moment.note && (
                  <Text style={[styles.body, { fontStyle: 'italic', marginTop: 4 }]}>
                    "{moment.note}"
                  </Text>
                )}

                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 8,
                }}>
                  <Text style={styles.caption}>
                    {moment.etfTicker} - {moment.units.toFixed(4)} unidades
                  </Text>
                  <Text style={[styles.value, { fontSize: 12 }]}>
                    {formatCurrencyPDF(moment.totalAmount)}
                  </Text>
                </View>

                {/* Espacio para foto si existe */}
                {moment.photo && (
                  <View style={{
                    marginTop: 8,
                    height: 60,
                    backgroundColor: colors.backgroundAlt,
                    borderRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Text style={{ fontSize: 10, color: colors.textMuted }}>[Foto del momento]</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}

        {/* Si hay mas momentos */}
        {specialMoments.momentCount > 6 && (
          <View style={{ alignItems: 'center', marginTop: 12 }}>
            <Text style={styles.caption}>
              Y {specialMoments.momentCount - 6} momentos mas...
            </Text>
          </View>
        )}
      </View>

      {/* Momento mas significativo */}
      {specialMoments.mostSignificant && (
        <View style={[styles.cardHighlight, { marginTop: 12 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: colors.goldDark,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 8,
            }}>
              <Text style={{ fontSize: 10, color: colors.white }}>!</Text>
            </View>
            <Text style={styles.heading}>El momento mas grande del ano</Text>
          </View>
          <Text style={styles.body}>
            {MILESTONE_CONFIG[specialMoments.mostSignificant.milestone || 'special_moment']?.label || 'Momento especial'} con una inversion de {formatCurrencyPDF(specialMoments.mostSignificant.totalAmount)}.
            {specialMoments.mostSignificant.note && ` "${specialMoments.mostSignificant.note}"`}
          </Text>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          El Tesoro de {data.childName} - {data.year}
        </Text>
        <Text style={styles.pageNumber}>Pagina 5</Text>
      </View>
    </Page>
  );
};
