/**
 * Seccion de proyecciones futuras
 */

import React from 'react';
import { Page, View, Text } from '@react-pdf/renderer';
import { AnnualReportData } from '../../../types';
import { styles, colors, formatCurrencyPDF } from './pdfStyles';

interface PDFFutureProps {
  data: AnnualReportData;
}

export const PDFFuture: React.FC<PDFFutureProps> = ({ data }) => {
  const { projections, childName, childAgeAtYear } = data;

  // Encontrar la proyeccion a los 18 anos
  const projection18 = projections.find(p => p.age === 18);

  return (
    <Page size="A4" style={styles.page}>
      {/* Titulo */}
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <View style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: colors.purple,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8,
        }}>
          <Text style={{ fontSize: 14, color: colors.white, fontWeight: 'bold' }}>*</Text>
        </View>
        <Text style={styles.title}>Mirando al Futuro</Text>
        <Text style={styles.caption}>Lo que podria lograr el arbol de {childName}</Text>
      </View>

      {/* Proyecciones visuales */}
      {projections.length > 0 && (
        <View style={[styles.card, { marginBottom: 20 }]}>
          <Text style={[styles.heading, { marginBottom: 16 }]}>
            Si seguimos regando el arbol con amor...
          </Text>

          {projections.map((proj, index) => {
            const yearsUntil = proj.age - childAgeAtYear;
            const isHighlight = proj.age === 18;

            // Color e icono segun la edad
            const getAgeColor = (age: number) => {
              if (age <= 6) return colors.pink;
              if (age <= 12) return colors.cyan;
              if (age <= 18) return colors.gold;
              return colors.growth;
            };

            const getAgeLabel = (age: number) => {
              if (age <= 6) return 'N';  // Nino
              if (age <= 12) return 'P';  // Pre-adolescente
              if (age <= 18) return 'G';  // Graduado
              return 'A';  // Adulto
            };

            return (
              <View key={index} style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 16,
                padding: 12,
                backgroundColor: isHighlight ? colors.goldLight : colors.backgroundAlt,
                borderRadius: 12,
                borderWidth: isHighlight ? 2 : 0,
                borderColor: colors.gold,
              }}>
                {/* Icono segun la edad */}
                <View style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: getAgeColor(proj.age),
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}>
                  <Text style={{ fontSize: 12, color: colors.white, fontWeight: 'bold' }}>
                    {getAgeLabel(proj.age)}
                  </Text>
                </View>

                {/* Informacion */}
                <View style={{ flex: 1 }}>
                  <Text style={[styles.body, { fontWeight: 'bold', marginBottom: 2 }]}>
                    {proj.label}
                  </Text>
                  <Text style={styles.caption}>
                    En {yearsUntil} anos ({proj.year}) - {proj.age} anos
                  </Text>
                </View>

                {/* Valor proyectado */}
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.valueLarge, {
                    fontSize: isHighlight ? 18 : 14,
                    color: isHighlight ? colors.goldDark : colors.primary,
                  }]}>
                    {formatCurrencyPDF(proj.projectedValue)}
                  </Text>
                </View>
              </View>
            );
          })}

          <Text style={[styles.caption, { fontStyle: 'italic', marginTop: 8 }]}>
            * Proyeccion basada en un rendimiento promedio del 8% anual
          </Text>
        </View>
      )}

      {/* Mensaje especial para los 18 anos */}
      {projection18 && (
        <View style={[styles.cardHighlight, { marginBottom: 20 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor: colors.pink,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 8,
            }}>
              <Text style={{ fontSize: 12, color: colors.white }}>!</Text>
            </View>
            <Text style={styles.heading}>Mensaje especial para {childName}</Text>
          </View>

          <Text style={[styles.bodyLarge, { fontStyle: 'italic', marginBottom: 12 }]}>
            "Cuando tengas 18 anos y leas esto, recuerda que cada peso de estos {formatCurrencyPDF(projection18.projectedValue)} fue plantado con amor cuando eras pequeñito."
          </Text>

          <Text style={styles.body}>
            Cada moneda cuenta una historia de alguien que penso en tu futuro.
            Usa este tesoro sabiamente para hacer realidad tus suenos.
          </Text>
        </View>
      )}

      {/* Cita de cierre */}
      <View style={styles.quote}>
        <Text style={styles.quoteText}>
          "El mejor momento para plantar un arbol fue hace 20 anos.
          El segundo mejor momento es ahora."
        </Text>
        <Text style={[styles.caption, { textAlign: 'right', marginTop: 4 }]}>
          - Proverbio chino
        </Text>
      </View>

      {/* Mensaje de despedida */}
      <View style={{
        marginTop: 20,
        alignItems: 'center',
        padding: 20,
        backgroundColor: colors.primaryLight,
        borderRadius: 16,
      }}>
        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.growth, marginHorizontal: 4 }} />
          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.pink, marginHorizontal: 4 }} />
          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.gold, marginHorizontal: 4 }} />
        </View>
        <Text style={[styles.subtitle, { color: colors.primaryDark, textAlign: 'center' }]}>
          Hasta el proximo ano, pequeno jardinero!
        </Text>
        <Text style={[styles.body, { textAlign: 'center', color: colors.primaryDark }]}>
          Sigue regando tu arbol y veras como crece
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          El Tesoro de {data.childName} - {data.year}
        </Text>
        <Text style={styles.pageNumber}>Pagina 8</Text>
      </View>
    </Page>
  );
};
