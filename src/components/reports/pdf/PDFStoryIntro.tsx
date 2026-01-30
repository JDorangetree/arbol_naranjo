/**
 * Pagina de introduccion narrativa (Carta al nino)
 */

import React from 'react';
import { Page, View, Text } from '@react-pdf/renderer';
import { AnnualReportData } from '../../../types';
import { styles, colors } from './pdfStyles';

interface PDFStoryIntroProps {
  data: AnnualReportData;
}

// Funcion para limpiar emojis del texto narrativo
function cleanEmojis(text: string): string {
  return text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu, '').trim();
}

export const PDFStoryIntro: React.FC<PDFStoryIntroProps> = ({ data }) => {
  // Dividir la introduccion en parrafos y limpiar emojis
  const paragraphs = data.narrative.introduction.split('\n\n').filter(p => p.trim()).map(cleanEmojis);

  return (
    <Page size="A4" style={styles.page}>
      {/* Encabezado decorativo */}
      <View style={{ alignItems: 'center', marginBottom: 30 }}>
        <View style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: colors.pink,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
        }}>
          <Text style={{ fontSize: 14, color: colors.white, fontWeight: 'bold' }}>CARTA</Text>
        </View>
        <Text style={{
          fontSize: 22,
          fontWeight: 'bold',
          color: colors.primary,
        }}>
          Una Carta Especial
        </Text>
        <View style={[styles.dividerGold, { width: 100, marginTop: 12 }]} />
      </View>

      {/* Contenido de la carta */}
      <View style={{
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 30,
        borderWidth: 2,
        borderColor: colors.goldLight,
        marginHorizontal: 20,
      }}>
        {paragraphs.map((paragraph, index) => (
          <Text
            key={index}
            style={{
              fontSize: 12,
              color: colors.text,
              lineHeight: 1.8,
              marginBottom: 16,
              textAlign: index === 0 ? 'left' : 'justify',
            }}
          >
            {paragraph}
          </Text>
        ))}

        {/* Firma */}
        <View style={{ marginTop: 20, alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 11, color: colors.textLight }}>
            Con todo el amor del mundo,
          </Text>
          <Text style={{
            fontSize: 14,
            fontWeight: 'bold',
            color: colors.primary,
            marginTop: 8,
          }}>
            Tu familia
          </Text>
        </View>
      </View>

      {/* Decoracion inferior */}
      <View style={{
        marginTop: 30,
        alignItems: 'center',
      }}>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.gold, marginHorizontal: 4 }} />
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.growth, marginHorizontal: 4 }} />
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.gold, marginHorizontal: 4 }} />
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          El Tesoro de {data.childName} - {data.year}
        </Text>
        <Text style={styles.pageNumber}>Pagina 2</Text>
      </View>
    </Page>
  );
};
