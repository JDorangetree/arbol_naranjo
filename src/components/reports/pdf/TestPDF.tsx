/**
 * PDF de prueba simple para depurar
 */

import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';

const testStyles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  text: {
    fontSize: 12,
    marginBottom: 10,
  },
});

interface TestPDFProps {
  name: string;
  year: number;
}

export const TestPDF: React.FC<TestPDFProps> = ({ name, year }) => {
  return (
    <Document>
      <Page size="A4" style={testStyles.page}>
        <Text style={testStyles.title}>Reporte de Prueba</Text>
        <Text style={testStyles.text}>Nombre: {name}</Text>
        <Text style={testStyles.text}>Ano: {year}</Text>
        <View style={{ marginTop: 20, padding: 20, backgroundColor: '#F0F0F0', borderRadius: 10 }}>
          <Text style={testStyles.text}>Este es un PDF de prueba.</Text>
          <Text style={testStyles.text}>Si puedes ver esto, el PDF funciona correctamente.</Text>
        </View>
      </Page>
    </Document>
  );
};
