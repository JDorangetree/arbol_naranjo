/**
 * Estilos compartidos para el PDF del reporte anual
 * Estilo: Colorido infantil con colores brillantes
 */

import { StyleSheet, Font } from '@react-pdf/renderer';

// Colores del tema (colorido infantil)
export const colors = {
  // Primarios
  primary: '#6366F1',      // Índigo
  primaryLight: '#A5B4FC',
  primaryDark: '#4338CA',

  // Crecimiento (verde)
  growth: '#22C55E',
  growthLight: '#86EFAC',
  growthDark: '#15803D',

  // Dorado (tesoro)
  gold: '#F59E0B',
  goldLight: '#FCD34D',
  goldDark: '#B45309',

  // Fondos
  background: '#FEFCE8',     // Amarillo muy claro
  backgroundAlt: '#F0FDF4',  // Verde muy claro
  white: '#FFFFFF',

  // Texto
  text: '#1F2937',
  textLight: '#6B7280',
  textMuted: '#9CA3AF',

  // Acentos
  pink: '#EC4899',
  cyan: '#06B6D4',
  purple: '#A855F7',
  orange: '#F97316',

  // Estado
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
};

// Estilos principales
export const styles = StyleSheet.create({
  // Página
  page: {
    flexDirection: 'column',
    backgroundColor: colors.white,
    padding: 40,
    fontFamily: 'Helvetica',
  },

  pageColorful: {
    flexDirection: 'column',
    backgroundColor: colors.background,
    padding: 40,
    fontFamily: 'Helvetica',
  },

  // Contenedores
  container: {
    marginBottom: 20,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  column: {
    flexDirection: 'column',
  },

  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Cards
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  cardColorful: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.primaryLight,
  },

  cardHighlight: {
    backgroundColor: colors.goldLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.gold,
  },

  // Tipografía
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },

  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 8,
  },

  body: {
    fontSize: 11,
    color: colors.text,
    lineHeight: 1.6,
    marginBottom: 8,
  },

  bodyLarge: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 1.8,
    marginBottom: 10,
  },

  caption: {
    fontSize: 9,
    color: colors.textLight,
    marginBottom: 4,
  },

  label: {
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 2,
  },

  value: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },

  valueLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },

  valueGrowth: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.growth,
  },

  valueGold: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.goldDark,
  },

  // Emojis y decoración
  emoji: {
    fontSize: 24,
    marginRight: 8,
  },

  emojiLarge: {
    fontSize: 48,
    marginBottom: 16,
  },

  // Listas
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 8,
  },

  bullet: {
    width: 16,
    fontSize: 10,
    color: colors.primary,
  },

  listText: {
    flex: 1,
    fontSize: 10,
    color: colors.text,
    lineHeight: 1.5,
  },

  // Tabla simple
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 8,
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 4,
  },

  tableCell: {
    flex: 1,
    fontSize: 10,
    color: colors.text,
  },

  tableCellHeader: {
    flex: 1,
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.primaryDark,
  },

  // Métricas
  metricContainer: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: 100,
  },

  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },

  metricLabel: {
    fontSize: 8,
    color: colors.textMuted,
    textAlign: 'center',
  },

  // Timeline
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },

  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    marginRight: 12,
    marginTop: 4,
  },

  timelineContent: {
    flex: 1,
    borderLeftWidth: 2,
    borderLeftColor: colors.primaryLight,
    paddingLeft: 12,
    paddingBottom: 12,
  },

  // Progreso
  progressBar: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
    marginVertical: 8,
  },

  progressFill: {
    height: '100%',
    backgroundColor: colors.growth,
    borderRadius: 6,
  },

  // Árbol (SVG simplificado con View)
  treeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 16,
    marginVertical: 12,
  },

  treeTrunk: {
    width: 20,
    height: 40,
    backgroundColor: '#8B4513',
    borderRadius: 4,
  },

  treeCanopy: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.growth,
    marginBottom: -10,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
  },

  footerText: {
    fontSize: 8,
    color: colors.textMuted,
  },

  pageNumber: {
    fontSize: 8,
    color: colors.textMuted,
  },

  // Decoraciones
  divider: {
    height: 2,
    backgroundColor: colors.primaryLight,
    marginVertical: 16,
    borderRadius: 1,
  },

  dividerGold: {
    height: 2,
    backgroundColor: colors.goldLight,
    marginVertical: 16,
    borderRadius: 1,
  },

  badge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  badgeText: {
    fontSize: 9,
    color: colors.primaryDark,
    fontWeight: 'bold',
  },

  // Especiales
  quote: {
    borderLeftWidth: 3,
    borderLeftColor: colors.gold,
    paddingLeft: 12,
    marginVertical: 12,
    fontStyle: 'italic',
  },

  quoteText: {
    fontSize: 11,
    color: colors.textLight,
    fontStyle: 'italic',
    lineHeight: 1.6,
  },

  highlight: {
    backgroundColor: colors.goldLight,
    padding: 4,
    borderRadius: 4,
  },
});

// Helpers
export const formatCurrencyPDF = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDatePDF = (date: Date): string => {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const formatPercentagePDF = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};
