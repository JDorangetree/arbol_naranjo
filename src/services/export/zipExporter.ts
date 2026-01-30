/**
 * Exportador ZIP
 *
 * Crea un archivo ZIP completo con:
 * - data.json (datos estructurados)
 * - index.html (versión navegable)
 * - /media (fotos si las hay)
 * - README.txt (instrucciones)
 *
 * Cumple con el principio 5.1 y 5.2 de la visión:
 * "El contenido debe poder sobrevivir a cualquier tecnología"
 */

import JSZip from 'jszip';
import { FullExportData, ExportResult, ExportProgress } from '../../types/app.types';
import { exportToJSON, ProgressCallback } from './jsonExporter';
import { generateFullHTML } from './htmlExporter';

/**
 * Genera y descarga un archivo ZIP completo
 */
export async function exportToZIP(
  userId: string,
  childInfo: {
    name: string;
    birthDate: Date;
  },
  options: {
    includeFinancial: boolean;
    includeMetadata: boolean;
    includeEmotional: boolean;
    includeLockedChapters: boolean;
    preserveVersionHistory: boolean;
  },
  onProgress?: ProgressCallback
): Promise<ExportResult> {
  const startTime = Date.now();
  const errors: string[] = [];

  try {
    // 1. Obtener datos JSON
    onProgress?.({
      stage: 'preparing',
      progress: 5,
      currentItem: 'Preparando datos...',
    });

    const { data, result: jsonResult } = await exportToJSON(
      userId,
      childInfo,
      {
        format: 'json',
        includeFinancial: options.includeFinancial,
        includeMetadata: options.includeMetadata,
        includeEmotional: options.includeEmotional,
        includeMedia: true,
        includeLockedChapters: options.includeLockedChapters,
        preserveVersionHistory: options.preserveVersionHistory,
      },
      (progress) => {
        onProgress?.({
          ...progress,
          progress: Math.min(progress.progress * 0.5, 50), // Primera mitad
        });
      }
    );

    if (!jsonResult.success) {
      errors.push(...(jsonResult.errors || []));
    }

    // 2. Crear ZIP
    onProgress?.({
      stage: 'creating_archive',
      progress: 55,
      currentItem: 'Creando archivo ZIP...',
    });

    const zip = new JSZip();

    // 3. Agregar data.json
    const jsonString = JSON.stringify(data, dateReplacer, 2);
    zip.file('data.json', jsonString);

    onProgress?.({
      stage: 'creating_archive',
      progress: 65,
      currentItem: 'Generando HTML...',
    });

    // 4. Agregar index.html
    const html = generateFullHTML(data);
    zip.file('index.html', html);

    // 5. Agregar README
    const readme = generateReadme(data, childInfo.name);
    zip.file('README.txt', readme);

    // 6. Agregar media (si hay URLs)
    onProgress?.({
      stage: 'exporting_media',
      progress: 75,
      currentItem: 'Procesando archivos multimedia...',
    });

    const mediaFolder = zip.folder('media');
    const mediaUrls = collectMediaUrls(data);

    if (mediaUrls.length > 0 && mediaFolder) {
      // Nota: En un entorno real, aquí descargaríamos las imágenes
      // Por ahora, creamos un archivo de referencia
      const mediaManifest = mediaUrls.map((url, i) => `${i + 1}. ${url}`).join('\n');
      mediaFolder.file('_referencias.txt', `Archivos multimedia referenciados:\n\n${mediaManifest}\n\nNota: Para incluir las imágenes, descárgalas manualmente y colócalas en esta carpeta.`);
    }

    // 7. Generar el ZIP
    onProgress?.({
      stage: 'finalizing',
      progress: 90,
      currentItem: 'Comprimiendo...',
    });

    const zipBlob = await zip.generateAsync(
      { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
      (metadata) => {
        onProgress?.({
          stage: 'creating_archive',
          progress: 90 + (metadata.percent * 0.1),
          currentItem: `Comprimiendo... ${metadata.percent.toFixed(0)}%`,
        });
      }
    );

    // 8. Descargar
    const filename = `Bitacora_${childInfo.name.replace(/\s+/g, '_')}_${formatDateForFile(new Date())}.zip`;
    downloadBlob(zipBlob, filename);

    onProgress?.({
      stage: 'complete',
      progress: 100,
    });

    return {
      success: true,
      format: 'zip',
      filename,
      size: zipBlob.size,
      itemCount: jsonResult.itemCount,
      errors: errors.length > 0 ? errors : undefined,
    };

  } catch (error) {
    onProgress?.({
      stage: 'error',
      progress: 0,
      currentItem: `Error: ${error}`,
    });

    return {
      success: false,
      format: 'zip',
      filename: '',
      size: 0,
      itemCount: {
        transactions: 0,
        snapshots: 0,
        chapters: 0,
        narratives: 0,
        mediaFiles: 0,
      },
      errors: [`Error creando ZIP: ${error}`],
    };
  }
}

/**
 * Genera el archivo README con instrucciones
 */
function generateReadme(data: FullExportData, childName: string): string {
  return `
================================================================================
                    BITÁCORA PATRIMONIAL DE ${childName.toUpperCase()}
================================================================================

Fecha de exportación: ${data.exportDate.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })}

Versión de exportación: ${data.exportVersion}

--------------------------------------------------------------------------------
CONTENIDO DE ESTE ARCHIVO
--------------------------------------------------------------------------------

Este archivo ZIP contiene:

1. index.html
   - Versión navegable de toda la bitácora
   - Abre este archivo en cualquier navegador web
   - No requiere internet ni software especial
   - Puede imprimirse directamente

2. data.json
   - Todos los datos en formato estructurado
   - Útil para migrar a otros sistemas
   - Legible por humanos y máquinas

3. /media (si aplica)
   - Referencias a archivos multimedia
   - Fotos y documentos adjuntos

4. README.txt (este archivo)
   - Instrucciones y documentación

--------------------------------------------------------------------------------
CÓMO USAR ESTE ARCHIVO
--------------------------------------------------------------------------------

PARA LEER LA BITÁCORA:
- Abre index.html en cualquier navegador (Chrome, Firefox, Safari, etc.)
- Navega por las secciones usando el menú
- Puedes imprimir directamente desde el navegador (Ctrl+P)

PARA HACER BACKUP:
- Guarda este archivo ZIP en un lugar seguro
- Recomendado: disco externo, nube (Google Drive, Dropbox), USB

PARA MIGRAR A OTRO SISTEMA:
- El archivo data.json contiene toda la información estructurada
- Puede ser importado por otras aplicaciones compatibles
- El formato es JSON estándar, legible por cualquier lenguaje de programación

--------------------------------------------------------------------------------
ESTRUCTURA DE DATOS
--------------------------------------------------------------------------------

El archivo data.json contiene:

- childInfo: Información del beneficiario
- financial: Transacciones y datos financieros
- metadata: Contexto de las decisiones (razones, momentos especiales)
- emotional: Capítulos, cartas y reflexiones anuales

Cada sección incluye su propio historial de versiones para auditoría.

--------------------------------------------------------------------------------
NOTA IMPORTANTE
--------------------------------------------------------------------------------

Este contenido fue creado con la intención de preservar no solo números,
sino el contexto, las decisiones y los valores detrás de cada acción.

El dinero puede perderse.
El criterio no.

--------------------------------------------------------------------------------
SOPORTE TÉCNICO
--------------------------------------------------------------------------------

Si necesitas ayuda con este archivo:
- Los formatos usados (HTML, JSON) son estándares abiertos
- Cualquier desarrollador puede leerlos y procesarlos
- No hay dependencia de software propietario

================================================================================
                         FIN DEL DOCUMENTO
================================================================================
`;
}

/**
 * Recolecta todas las URLs de media de los datos
 */
function collectMediaUrls(data: FullExportData): string[] {
  const urls: string[] = [];

  // De metadatos (fotos de transacciones)
  if (data.metadata?.transactionMetadata) {
    for (const meta of data.metadata.transactionMetadata) {
      if (meta.photoUrl) urls.push(meta.photoUrl);
    }
  }

  // De capítulos
  if (data.emotional?.chapters) {
    for (const chapter of data.emotional.chapters) {
      if (chapter.mediaUrls) {
        urls.push(...chapter.mediaUrls);
      }
    }
  }

  // De narrativas anuales
  if (data.emotional?.yearlyNarratives) {
    for (const narrative of data.emotional.yearlyNarratives) {
      if (narrative.yearPhotos) {
        urls.push(...narrative.yearPhotos);
      }
    }
  }

  return urls.filter(Boolean);
}

/**
 * Descarga un Blob como archivo
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Formatea fecha para nombre de archivo
 */
function formatDateForFile(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Replacer para serializar fechas en JSON
 */
function dateReplacer(key: string, value: any): any {
  if (value instanceof Date) {
    return { __type: 'Date', value: value.toISOString() };
  }
  return value;
}

/**
 * Verifica si JSZip está disponible
 */
export function isZipSupported(): boolean {
  try {
    return typeof JSZip !== 'undefined';
  } catch {
    return false;
  }
}
