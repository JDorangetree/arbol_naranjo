/**
 * Seccion educativa adaptada a la edad
 */

import React from 'react';
import { Page, View, Text } from '@react-pdf/renderer';
import { AnnualReportData } from '../../../types';
import { styles, colors } from './pdfStyles';

interface PDFEducationalProps {
  data: AnnualReportData;
}

// Funcion para limpiar emojis
function cleanEmojis(text: string): string {
  return text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu, '').trim();
}

export const PDFEducational: React.FC<PDFEducationalProps> = ({ data }) => {
  // Dividir el contenido educativo en parrafos y limpiar emojis
  const educationalContent = data.narrative.educational.split('\n\n').filter(p => p.trim()).map(cleanEmojis);

  // Metaforas del jardin (sin emojis)
  const metaphors = [
    {
      concept: 'Invertir',
      metaphor: 'Plantar semillas',
      color: colors.growth,
      explanation: 'Cada peso que guardamos es como plantar una semillita que crecera con el tiempo.',
    },
    {
      concept: 'Contribuir',
      metaphor: 'Regar el arbol',
      color: colors.cyan,
      explanation: 'Agregar dinero regularmente es como regar: mantiene el arbol sano y creciendo.',
    },
    {
      concept: 'Interes compuesto',
      metaphor: 'La magia del sol',
      color: colors.gold,
      explanation: 'El sol hace crecer las plantas sin que hagamos nada. El tiempo hace crecer el dinero igual.',
    },
    {
      concept: 'Ganancias',
      metaphor: 'Frutos dorados',
      color: colors.goldDark,
      explanation: 'Cuando el arbol crece bien, da frutos. Son las ganancias que produce el dinero.',
    },
    {
      concept: 'Diversificar',
      metaphor: 'Muchas plantas',
      color: colors.growthDark,
      explanation: 'Un jardin con diferentes plantas es mas fuerte que uno con solo una.',
    },
    {
      concept: 'Paciencia',
      metaphor: 'El tiempo del jardinero',
      color: colors.primary,
      explanation: 'Los arboles grandes tardan anos en crecer. El tesoro tambien necesita tiempo.',
    },
  ];

  return (
    <Page size="A4" style={styles.page}>
      {/* Titulo */}
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <View style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8,
        }}>
          <Text style={{ fontSize: 14, color: colors.white, fontWeight: 'bold' }}>?</Text>
        </View>
        <Text style={styles.title}>Lo Que Aprendio el Arbol</Text>
        <Text style={styles.caption}>Lecciones del jardin financiero</Text>
      </View>

      {/* Contenido narrativo */}
      <View style={[styles.card, { marginBottom: 20 }]}>
        {educationalContent.map((paragraph, index) => {
          // Verificar si es un titulo de seccion (lineas cortas que terminan en ciertos patrones)
          const isTitle = paragraph.length < 50 && (
            paragraph.includes('Sembrando') ||
            paragraph.includes('Magia') ||
            paragraph.includes('Regar') ||
            paragraph.includes('Jardin') ||
            paragraph.includes('Dinero') ||
            paragraph.includes('Aprendio')
          );

          if (isTitle) {
            return (
              <Text key={index} style={[styles.heading, { marginTop: index > 0 ? 16 : 0 }]}>
                {paragraph}
              </Text>
            );
          }

          return (
            <Text key={index} style={[styles.bodyLarge, { marginBottom: 12 }]}>
              {paragraph}
            </Text>
          );
        })}
      </View>

      {/* Tarjetas de metaforas */}
      <View style={[styles.cardColorful, { backgroundColor: colors.backgroundAlt }]}>
        <Text style={[styles.heading, { marginBottom: 16, textAlign: 'center' }]}>
          El Diccionario del Jardin
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {metaphors.map((item, index) => (
            <View key={index} style={{
              width: '48%',
              backgroundColor: colors.white,
              borderRadius: 12,
              padding: 12,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: colors.primaryLight,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <View style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: item.color,
                  marginRight: 8,
                }} />
                <View>
                  <Text style={[styles.label, { fontWeight: 'bold', color: colors.primaryDark }]}>
                    {item.concept}
                  </Text>
                  <Text style={[styles.caption, { color: colors.growth }]}>
                    = {item.metaphor}
                  </Text>
                </View>
              </View>
              <Text style={[styles.caption, { lineHeight: 1.4 }]}>
                {item.explanation}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          El Tesoro de {data.childName} - {data.year}
        </Text>
        <Text style={styles.pageNumber}>Pagina 7</Text>
      </View>
    </Page>
  );
};
