/**
 * Portada del reporte anual PDF
 */

import React from 'react';
import { Page, View, Text } from '@react-pdf/renderer';
import { AnnualReportData } from '../../../types';
import { styles, colors, formatCurrencyPDF } from './pdfStyles';
import { getTreeStageName } from '../../../utils/reportCalculations';
import { getInspirationalQuote } from '../../../services/reports';

interface PDFCoverProps {
  data: AnnualReportData;
}

export const PDFCover: React.FC<PDFCoverProps> = ({ data }) => {
  const quote = getInspirationalQuote();
  const stageName = getTreeStageName(data.treeGrowth.endStage);

  return (
    <Page size="A4" style={[styles.page, { backgroundColor: colors.background }]}>
      {/* Decoración superior - Árbol visual */}
      <View style={{ alignItems: 'center', marginTop: 40 }}>
        <View style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: colors.growth,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Text style={{ fontSize: 24, color: colors.white, fontWeight: 'bold' }}>*</Text>
        </View>
      </View>

      {/* Título principal */}
      <View style={{ alignItems: 'center', marginTop: 20 }}>
        <Text style={{
          fontSize: 14,
          color: colors.textLight,
          letterSpacing: 2,
          marginBottom: 8,
        }}>
          EL LIBRO DEL TESORO DE
        </Text>

        <Text style={{
          fontSize: 36,
          fontWeight: 'bold',
          color: colors.primary,
          marginBottom: 16,
        }}>
          {data.childName}
        </Text>

        <View style={{
          backgroundColor: colors.gold,
          paddingHorizontal: 24,
          paddingVertical: 8,
          borderRadius: 20,
          marginBottom: 40,
        }}>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.white,
          }}>
            Ano {data.year}
          </Text>
        </View>
      </View>

      {/* Árbol visual simplificado */}
      <View style={[styles.treeContainer, { marginHorizontal: 80 }]}>
        <View style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: colors.growth,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: -15,
        }}>
          <Text style={{ fontSize: 14, color: colors.white, fontWeight: 'bold' }}>ARBOL</Text>
        </View>
        <View style={{
          width: 25,
          height: 50,
          backgroundColor: '#8B4513',
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
        }} />

        {/* Etapa del árbol */}
        <Text style={{
          fontSize: 14,
          color: colors.growthDark,
          fontWeight: 'bold',
          marginTop: 12,
        }}>
          {stageName}
        </Text>
      </View>

      {/* Información del año */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 40,
        marginHorizontal: 40,
      }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 10, color: colors.textLight, marginBottom: 4 }}>
            Edad de {data.childName}
          </Text>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.primary }}>
            {data.childAgeAtYear} {data.childAgeAtYear === 1 ? 'ano' : 'anos'}
          </Text>
        </View>

        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 10, color: colors.textLight, marginBottom: 4 }}>
            Tesoro acumulado
          </Text>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.gold }}>
            {formatCurrencyPDF(data.summary.endValue)}
          </Text>
        </View>
      </View>

      {/* Frase inspiracional */}
      <View style={{
        marginTop: 60,
        marginHorizontal: 60,
        padding: 20,
        backgroundColor: colors.white,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: colors.gold,
      }}>
        <Text style={{
          fontSize: 11,
          color: colors.textLight,
          fontStyle: 'italic',
          lineHeight: 1.6,
          marginBottom: 8,
        }}>
          "{quote.quote}"
        </Text>
        <Text style={{
          fontSize: 9,
          color: colors.textMuted,
          textAlign: 'right',
        }}>
          - {quote.author}
        </Text>
      </View>

      {/* Decoración inferior */}
      <View style={{
        position: 'absolute',
        bottom: 40,
        left: 40,
        right: 40,
        alignItems: 'center',
      }}>
        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gold, marginHorizontal: 4 }} />
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.growth, marginHorizontal: 4 }} />
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginHorizontal: 4 }} />
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.growth, marginHorizontal: 4 }} />
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gold, marginHorizontal: 4 }} />
        </View>
        <Text style={{ fontSize: 8, color: colors.textMuted }}>
          Generado con amor el {new Date().toLocaleDateString('es-CO', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </Text>
      </View>
    </Page>
  );
};
