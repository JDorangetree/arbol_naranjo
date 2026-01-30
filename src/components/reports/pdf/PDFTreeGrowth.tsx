/**
 * Seccion de evolucion del arbol
 */

import React from 'react';
import { Page, View, Text } from '@react-pdf/renderer';
import { AnnualReportData, TreeStage } from '../../../types';
import { styles, colors } from './pdfStyles';
import { getTreeStageName } from '../../../utils/reportCalculations';

interface PDFTreeGrowthProps {
  data: AnnualReportData;
}

// Funcion para limpiar emojis
function cleanEmojis(text: string): string {
  return text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu, '').trim();
}

// Componente visual del arbol
const TreeVisual: React.FC<{ stage: TreeStage; label: string }> = ({ stage, label }) => {
  const stageName = getTreeStageName(stage);

  // Tamano basado en la etapa
  const sizeMap: Record<TreeStage, { canopy: number; trunk: number }> = {
    seed: { canopy: 30, trunk: 10 },
    sprout: { canopy: 50, trunk: 15 },
    sapling: { canopy: 70, trunk: 20 },
    young_tree: { canopy: 85, trunk: 25 },
    mature_tree: { canopy: 100, trunk: 30 },
    mighty_oak: { canopy: 120, trunk: 40 },
  };

  const size = sizeMap[stage];

  return (
    <View style={{ alignItems: 'center', padding: 16 }}>
      <Text style={{ fontSize: 10, color: colors.textLight, marginBottom: 8 }}>
        {label}
      </Text>

      {/* Arbol visual */}
      <View style={{ alignItems: 'center', marginBottom: 12 }}>
        {/* Copa del arbol */}
        <View style={{
          width: size.canopy,
          height: size.canopy,
          borderRadius: size.canopy / 2,
          backgroundColor: colors.growth,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: -size.trunk / 4,
        }}>
          <Text style={{ fontSize: size.canopy / 4, color: colors.white, fontWeight: 'bold' }}>
            {stage === 'seed' ? 'o' : stage === 'sprout' ? '|' : '*'}
          </Text>
        </View>

        {/* Tronco */}
        <View style={{
          width: size.trunk,
          height: size.trunk * 1.5,
          backgroundColor: '#8B4513',
          borderBottomLeftRadius: size.trunk / 4,
          borderBottomRightRadius: size.trunk / 4,
        }} />
      </View>

      {/* Nombre de la etapa */}
      <Text style={{
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.growthDark,
        textAlign: 'center',
      }}>
        {stageName}
      </Text>
    </View>
  );
};

export const PDFTreeGrowth: React.FC<PDFTreeGrowthProps> = ({ data }) => {
  const { treeGrowth, narrative } = data;

  // Dividir la narrativa de crecimiento en parrafos y limpiar emojis
  const growthParagraphs = narrative.growth.split('\n\n').filter(p => p.trim()).map(cleanEmojis);

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
          <Text style={{ fontSize: 14, color: colors.white, fontWeight: 'bold' }}>*</Text>
        </View>
        <Text style={styles.title}>El Crecimiento del Arbol</Text>
        <Text style={styles.caption}>Asi evoluciono tu arbol durante el ano</Text>
      </View>

      {/* Comparacion visual antes/despues */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: colors.backgroundAlt,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
      }}>
        {/* Arbol al inicio */}
        <TreeVisual stage={treeGrowth.startStage} label="Inicio del ano" />

        {/* Flecha de progreso */}
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 24, color: colors.growth, fontWeight: 'bold' }}>&gt;&gt;</Text>
          {treeGrowth.stagesAdvanced > 0 && (
            <View style={{
              backgroundColor: colors.gold,
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 12,
              marginTop: 8,
            }}>
              <Text style={{ fontSize: 9, color: colors.white, fontWeight: 'bold' }}>
                +{treeGrowth.stagesAdvanced} {treeGrowth.stagesAdvanced === 1 ? 'etapa' : 'etapas'}
              </Text>
            </View>
          )}
        </View>

        {/* Arbol al final */}
        <TreeVisual stage={treeGrowth.endStage} label="Final del ano" />
      </View>

      {/* Metricas de crecimiento */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
      }}>
        <View style={[styles.metricContainer, { backgroundColor: colors.backgroundAlt }]}>
          <View style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: colors.growth,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 4,
          }}>
            <Text style={{ fontSize: 10, color: colors.white }}>H</Text>
          </View>
          <Text style={styles.metricValue}>{treeGrowth.leavesGained > 0 ? `+${treeGrowth.leavesGained}` : '0'}</Text>
          <Text style={styles.metricLabel}>Hojas nuevas</Text>
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
            <Text style={{ fontSize: 10, color: colors.white }}>F</Text>
          </View>
          <Text style={[styles.metricValue, { color: colors.goldDark }]}>
            {treeGrowth.fruitsGained > 0 ? `+${treeGrowth.fruitsGained}` : '0'}
          </Text>
          <Text style={styles.metricLabel}>Frutos cosechados</Text>
        </View>

        <View style={[styles.metricContainer]}>
          <View style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 4,
          }}>
            <Text style={{ fontSize: 10, color: colors.white }}>%</Text>
          </View>
          <Text style={styles.metricValue}>{Math.round(treeGrowth.endProgress)}%</Text>
          <Text style={styles.metricLabel}>Progreso actual</Text>
        </View>
      </View>

      {/* Barra de progreso */}
      <View style={[styles.card, { marginBottom: 20 }]}>
        <Text style={styles.heading}>Progreso hacia la siguiente etapa</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${treeGrowth.endProgress}%` }]} />
        </View>
        <Text style={styles.caption}>
          {Math.round(treeGrowth.endProgress)}% completado para convertirse en la siguiente etapa
        </Text>
      </View>

      {/* Narrativa */}
      <View style={styles.cardColorful}>
        {growthParagraphs.slice(0, 3).map((paragraph, index) => (
          <Text key={index} style={[styles.body, { marginBottom: 8 }]}>
            {paragraph}
          </Text>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          El Tesoro de {data.childName} - {data.year}
        </Text>
        <Text style={styles.pageNumber}>Pagina 4</Text>
      </View>
    </Page>
  );
};
