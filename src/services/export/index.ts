/**
 * Exportadores - Índice
 *
 * Sistema de exportación que permite que el contenido
 * sobreviva a cualquier tecnología (Principio 5.1 de la visión).
 */

export { exportToJSON, downloadJSON, parseExportJSON } from './jsonExporter';
export { generateFullHTML, generateChaptersHTML, downloadHTML } from './htmlExporter';
export { exportToZIP, isZipSupported } from './zipExporter';
