/**
 * Servicio para generar contenido educativo con Google Gemini
 * Sigue el patrón de finnhub.ts
 * https://ai.google.dev/tutorials/rest_quickstart
 */

import { withRetry, API_RETRY_OPTIONS } from '../../utils/retry';
import { YearSummary, TreeGrowthData } from '../../types';
import { formatCurrency } from '../../utils/formatters';

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Metáfora educativa generada por IA
 */
export interface EducationalMetaphor {
  concept: string;
  metaphor: string;
  explanation: string;
  color: string;
}

/**
 * Request para generar contenido educativo
 */
export interface GeminiEducationalRequest {
  childAge: number;
  childName: string;
  summary: YearSummary;
  treeGrowth: TreeGrowthData;
  year: number;
}

/**
 * Respuesta del contenido educativo generado
 */
export interface GeminiEducationalResponse {
  content: string;
  metaphors: EducationalMetaphor[];
  generatedAt: Date;
}

/**
 * Respuesta de la API de Gemini
 */
interface GeminiAPIResponse {
  candidates?: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
  error?: {
    code: number;
    message: string;
  };
}

/**
 * Construye el prompt para generar contenido educativo
 */
function buildEducationalPrompt(request: GeminiEducationalRequest): string {
  const ageGroup = request.childAge <= 5 ? 'preescolar (0-5 años)'
    : request.childAge <= 10 ? 'primaria (6-10 años)'
    : 'preadolescente (11+ años)';

  const returnType = request.summary.totalReturn >= 0 ? 'positivo' : 'negativo';

  return `Eres un educador financiero experto en explicar conceptos de inversión a niños usando metáforas del jardín y la naturaleza.

Genera contenido educativo en español para un niño de ${request.childAge} años (nivel ${ageGroup}) llamado ${request.childName}.

CONTEXTO DEL AÑO ${request.year}:
- El "árbol del tesoro" creció de ${formatCurrency(request.summary.startValue, 'COP')} a ${formatCurrency(request.summary.endValue, 'COP')}
- Se hicieron ${request.summary.contributionCount} aportes (riegos)
- Total aportado: ${formatCurrency(request.summary.totalContributed, 'COP')}
- Rendimiento: ${request.summary.returnPercentage.toFixed(1)}% (${returnType})
- Etapa del árbol: de "${request.treeGrowth.startStage}" a "${request.treeGrowth.endStage}"

INSTRUCCIONES:
1. Usa lenguaje apropiado para la edad (${ageGroup})
2. Usa la metáfora del jardín/árbol para explicar conceptos financieros
3. Sé positivo y motivador, incluso si el rendimiento fue negativo (las tormentas hacen más fuertes a los árboles)
4. No uses jerga financiera compleja
5. Incluye emojis apropiados para hacer el texto más visual

CONCEPTOS A EXPLICAR CON METÁFORAS:
- Invertir = plantar semillas
- Contribuir/Aportar = regar el árbol
- Interés compuesto = la magia del sol
- Ganancias = frutos dorados
- Diversificar = tener muchas plantas diferentes
- Paciencia = el tiempo del jardinero

FORMATO DE RESPUESTA (respeta exactamente este formato):
---CONTENIDO---
[Escribe 3-4 párrafos cortos de contenido educativo, usando lenguaje apropiado para la edad]
---METAFORAS---
[{"concept": "Invertir", "metaphor": "Plantar semillas", "explanation": "explicación corta", "color": "#22C55E"},{"concept": "Aportar", "metaphor": "Regar el árbol", "explanation": "explicación corta", "color": "#06B6D4"}]
---FIN---

IMPORTANTE: Las metáforas deben ser un array JSON válido con exactamente 6 elementos, uno para cada concepto.`;
}

/**
 * Parsea la respuesta de Gemini al formato estructurado
 */
function parseGeminiResponse(text: string): GeminiEducationalResponse {
  const contentMatch = text.match(/---CONTENIDO---([\s\S]*?)---METAFORAS---/);
  const metaphorsMatch = text.match(/---METAFORAS---([\s\S]*?)---FIN---/);

  let content = contentMatch?.[1]?.trim() || text;
  let metaphors: EducationalMetaphor[] = [];

  // Colores por defecto para las metáforas
  const defaultColors: Record<string, string> = {
    'Invertir': '#22C55E',
    'Aportar': '#06B6D4',
    'Interés compuesto': '#EAB308',
    'Ganancias': '#F59E0B',
    'Diversificar': '#166534',
    'Paciencia': '#6366F1',
  };

  if (metaphorsMatch) {
    try {
      const jsonStr = metaphorsMatch[1].trim();
      // Intentar parsear como array JSON
      const parsed = JSON.parse(jsonStr.startsWith('[') ? jsonStr : `[${jsonStr}]`);
      metaphors = parsed.map((m: EducationalMetaphor) => ({
        ...m,
        color: m.color || defaultColors[m.concept] || '#6366F1',
      }));
    } catch (error) {
      console.warn('Error parseando metáforas de Gemini, usando fallback:', error);
      // Metáforas por defecto si falla el parse
      metaphors = getDefaultMetaphors();
    }
  } else {
    metaphors = getDefaultMetaphors();
  }

  return {
    content,
    metaphors,
    generatedAt: new Date(),
  };
}

/**
 * Metáforas por defecto si Gemini no las genera correctamente
 */
function getDefaultMetaphors(): EducationalMetaphor[] {
  return [
    {
      concept: 'Invertir',
      metaphor: 'Plantar semillas',
      explanation: 'Cada peso que guardamos es como plantar una semillita que crecerá con el tiempo.',
      color: '#22C55E',
    },
    {
      concept: 'Aportar',
      metaphor: 'Regar el árbol',
      explanation: 'Agregar dinero regularmente es como regar: mantiene el árbol sano y creciendo.',
      color: '#06B6D4',
    },
    {
      concept: 'Interés compuesto',
      metaphor: 'La magia del sol',
      explanation: 'El sol hace crecer las plantas sin que hagamos nada. El tiempo hace crecer el dinero igual.',
      color: '#EAB308',
    },
    {
      concept: 'Ganancias',
      metaphor: 'Frutos dorados',
      explanation: 'Cuando el árbol crece bien, da frutos. Son las ganancias que produce el dinero.',
      color: '#F59E0B',
    },
    {
      concept: 'Diversificar',
      metaphor: 'Muchas plantas',
      explanation: 'Un jardín con diferentes plantas es más fuerte que uno con solo una.',
      color: '#166534',
    },
    {
      concept: 'Paciencia',
      metaphor: 'El tiempo del jardinero',
      explanation: 'Los árboles grandes tardan años en crecer. El tesoro también necesita tiempo.',
      color: '#6366F1',
    },
  ];
}

/**
 * Genera contenido educativo adaptado a la edad usando Gemini
 */
export async function generateEducationalWithGemini(
  request: GeminiEducationalRequest,
  apiKey: string
): Promise<GeminiEducationalResponse> {
  const prompt = buildEducationalPrompt(request);

  try {
    const response = await withRetry(
      async () => {
        const res = await fetch(`${GEMINI_BASE_URL}?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2000,
            },
          }),
        });

        // Si es rate limit, lanzar error para que se reintente
        if (res.status === 429) {
          throw new Error('Rate limit exceeded');
        }
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(`HTTP error: ${res.status} - ${errorData.error?.message || 'Unknown error'}`);
        }
        return res;
      },
      API_RETRY_OPTIONS
    );

    const data: GeminiAPIResponse = await response.json();

    // Verificar si hay error en la respuesta
    if (data.error) {
      throw new Error(`Gemini API error: ${data.error.message}`);
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!text) {
      throw new Error('Gemini no retornó contenido');
    }

    return parseGeminiResponse(text);
  } catch (error) {
    console.error('Error generando contenido con Gemini:', error);
    throw error;
  }
}

/**
 * Verifica si la API key de Gemini está configurada
 */
export function isGeminiConfigured(): boolean {
  return !!import.meta.env.VITE_GEMINI_API_KEY;
}

/**
 * Obtiene la API key de Gemini desde las variables de entorno
 */
export function getGeminiApiKey(): string | undefined {
  return import.meta.env.VITE_GEMINI_API_KEY;
}
