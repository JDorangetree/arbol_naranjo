/**
 * Generador de narrativas con storytelling para reportes anuales
 * Crea textos personalizados y educativos usando metáforas del jardín/árbol
 *
 * NOTA: Este generador NO incluye proyecciones futuras.
 * Solo muestra lo que se hizo, decidió y aprendió (retrospectiva).
 *
 * La sección educativa puede generarse con Gemini AI si está configurado.
 * La carta de introducción puede ser escrita manualmente por el usuario.
 */

import {
  ReportNarrative,
  YearSummary,
  TreeGrowthData,
  SpecialMomentsData,
} from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getTreeStageName, getTreeStageEmoji } from '../../utils/reportCalculations';
import { MILESTONE_CONFIG } from '../../utils/constants';

/**
 * Opciones para personalizar la generación de narrativas
 */
export interface NarrativeOptions {
  /** Carta especial escrita por el usuario (reemplaza introducción automática) */
  specialLetter?: string;
  /** Contenido educativo cacheado de Gemini AI */
  cachedAiEducational?: string;
}

/**
 * Genera todas las narrativas del reporte
 * NOTA: El campo 'future' ahora contiene retrospectiva, no proyecciones
 *
 * @param childName - Nombre del niño
 * @param childAge - Edad del niño en el año del reporte
 * @param year - Año del reporte
 * @param summary - Resumen financiero del año
 * @param treeGrowth - Datos de crecimiento del árbol
 * @param moments - Datos de momentos especiales
 * @param options - Opciones de personalización (carta del usuario, cache AI)
 */
export async function generateReportNarrative(
  childName: string,
  childAge: number,
  year: number,
  summary: YearSummary,
  treeGrowth: TreeGrowthData,
  moments: SpecialMomentsData,
  options?: NarrativeOptions
): Promise<ReportNarrative> {
  // Usar carta especial del usuario si existe, sino generar automáticamente
  const introduction = options?.specialLetter
    || generateIntroduction(childName, childAge, year, summary, treeGrowth);

  // Generar contenido educativo (con Gemini si está disponible)
  const educational = await generateEducationalContentWithAI(
    childAge,
    childName,
    summary,
    treeGrowth,
    year,
    options?.cachedAiEducational
  );

  return {
    introduction,
    growth: generateGrowthNarrative(childName, summary, treeGrowth),
    moments: generateMomentsNarrative(childName, moments),
    future: generateRetrospectiveNarrative(childName, year, summary, treeGrowth, moments),
    educational,
  };
}

/**
 * Genera la carta de introducción
 */
function generateIntroduction(
  childName: string,
  childAge: number,
  year: number,
  summary: YearSummary,
  treeGrowth: TreeGrowthData
): string {
  const startStageName = getTreeStageName(treeGrowth.startStage);
  const endStageName = getTreeStageName(treeGrowth.endStage);
  const startEmoji = getTreeStageEmoji(treeGrowth.startStage);
  const endEmoji = getTreeStageEmoji(treeGrowth.endStage);

  let stageChange = '';
  if (treeGrowth.stagesAdvanced > 0) {
    stageChange = `¡Y lo más emocionante! Tu arbolito creció tanto que pasó de ser un ${startStageName} ${startEmoji} a convertirse en un hermoso ${endStageName} ${endEmoji}. ¡Qué orgulloso debe estar!`;
  } else {
    stageChange = `Tu ${endStageName} ${endEmoji} siguió creciendo fuerte y sano, preparándose para su próxima gran transformación.`;
  }

  const contributionMessage = summary.contributionCount > 0
    ? `Durante este año, regamos el árbol ${summary.contributionCount} veces con mucho amor y cuidado.`
    : 'Este año el árbol descansó un poco, pero sus raíces siguieron creciendo fuertes.';

  return `Querido ${childName},

¡Qué año tan maravilloso vivió tu Árbol del Tesoro en ${year}! 🌟

Cuando comenzó el año, tenías ${childAge} añitos y tu árbol guardaba ${formatCurrency(summary.startValue, 'COP')} de tesoro. ${contributionMessage}

${stageChange}

Este libro cuenta la historia de cómo tu árbol creció durante ${year}, los momentos especiales que lo hicieron más fuerte, y los sueños que está guardando para tu futuro.

¡Vamos a descubrir juntos esta aventura! 🌳✨`;
}

/**
 * Genera la narrativa del crecimiento
 */
function generateGrowthNarrative(
  childName: string,
  summary: YearSummary,
  treeGrowth: TreeGrowthData
): string {
  const grew = summary.endValue > summary.startValue;
  const growthAmount = summary.endValue - summary.startValue;
  const leavesGained = treeGrowth.leavesGained;
  const fruitsGained = treeGrowth.fruitsGained;

  let growthMessage = '';
  if (grew) {
    growthMessage = `El árbol de ${childName} creció ${formatCurrency(growthAmount, 'COP')} este año. ¡Eso es como si hubiera crecido ${Math.round(growthAmount / 10000)} centímetros hacia el cielo! 📏`;
  } else {
    growthMessage = `Este año el árbol pasó por algunas tormentas, pero como todo buen árbol, sus raíces se hicieron más fuertes. 🌧️`;
  }

  let leavesMessage = '';
  if (leavesGained > 0) {
    leavesMessage = `Le crecieron ${leavesGained} hojitas nuevas 🍃, cada una representa un momento en que alguien pensó en el futuro de ${childName}.`;
  }

  let fruitsMessage = '';
  if (fruitsGained > 0) {
    fruitsMessage = `¡Y mira! Aparecieron ${fruitsGained} frutos dorados 🍎 en sus ramas. Los frutos son las ganancias mágicas que el árbol produce solito, sin que nadie tenga que hacer nada. ¡Es la magia del tiempo!`;
  }

  const largestContributionMsg = summary.largestContribution > 0 && summary.largestContributionDate
    ? `\n\nEl riego más grande del año fue de ${formatCurrency(summary.largestContribution, 'COP')} el ${formatDate(summary.largestContributionDate)}. Ese día el árbol bebió mucha agua y sus hojas brillaron con más fuerza.`
    : '';

  return `🌱 El Crecimiento del Árbol

${growthMessage}

${leavesMessage}

${fruitsMessage}
${largestContributionMsg}

Al terminar el año, el árbol guardaba un tesoro de ${formatCurrency(summary.endValue, 'COP')}. Cada peso está trabajando día y noche para hacer crecer más tesoro para cuando ${childName} sea grande.`;
}

/**
 * Genera la narrativa de momentos especiales
 */
function generateMomentsNarrative(
  childName: string,
  moments: SpecialMomentsData
): string {
  if (moments.momentCount === 0) {
    return `✨ Momentos Especiales

Este año no marcamos momentos especiales, pero cada día con ${childName} es especial. El próximo año podemos celebrar cumpleaños, logros y aventuras marcándolos en el árbol.`;
  }

  let momentsText = `✨ Momentos Especiales

Este año guardamos ${moments.momentCount} momentos especiales en el corazón del árbol. Cada momento es como una estrella que brilla en sus ramas.\n\n`;

  // Listar los momentos
  moments.moments.forEach((m, index) => {
    const milestoneConfig = m.milestone ? MILESTONE_CONFIG[m.milestone] : null;
    const icon = milestoneConfig?.icon || '⭐';
    const label = milestoneConfig?.label || 'Momento especial';
    const date = m.date instanceof Date ? m.date : new Date(m.date);

    momentsText += `${icon} ${label} - ${formatDate(date)}\n`;
    if (m.note) {
      momentsText += `   "${m.note}"\n`;
    }
    momentsText += `   Inversión: ${formatCurrency(m.totalAmount, 'COP')}\n\n`;
  });

  if (moments.mostSignificant) {
    const significantConfig = moments.mostSignificant.milestone
      ? MILESTONE_CONFIG[moments.mostSignificant.milestone]
      : null;
    momentsText += `\nEl momento más grande del año fue ${significantConfig?.label || 'un momento muy especial'} con una inversión de ${formatCurrency(moments.mostSignificant.totalAmount, 'COP')}. ¡Ese día el árbol brilló con luz propia! ✨`;
  }

  momentsText += `\n\nEn total, los momentos especiales sumaron ${formatCurrency(moments.totalInMoments, 'COP')} de tesoro nuevo.`;

  return momentsText;
}

/**
 * Genera la narrativa de retrospectiva (reemplaza las proyecciones futuras)
 * Solo muestra lo que se hizo, decidió y aprendió durante el año
 */
function generateRetrospectiveNarrative(
  childName: string,
  year: number,
  summary: YearSummary,
  treeGrowth: TreeGrowthData,
  moments: SpecialMomentsData
): string {
  const grew = summary.endValue > summary.startValue;
  const contributionsMade = summary.contributionCount > 0;

  // Lo que decidimos este año
  let decisionsText = '';
  if (contributionsMade) {
    decisionsText = `Decidimos regar el arbol ${summary.contributionCount} veces este año, aportando un total de ${formatCurrency(summary.totalContributed, 'COP')}.`;
  } else {
    decisionsText = `Decidimos dejar que el arbol descansara este año, confiando en que sus raices seguirian creciendo.`;
  }

  // Lo que aprendimos
  let lessonsText = '';
  if (grew && summary.returnPercentage > 0) {
    lessonsText = `Aprendimos que la paciencia da frutos: el arbol crecio ${summary.returnPercentage.toFixed(1)}% por si solo, gracias a la magia del tiempo.`;
  } else if (!grew) {
    lessonsText = `Aprendimos que los arboles fuertes tambien pasan tormentas. Lo importante es mantener las raices firmes y seguir adelante.`;
  } else {
    lessonsText = `Aprendimos que cada pequeña semilla cuenta. No importa el tamaño de la contribucion, lo importante es la constancia.`;
  }

  // Momentos que celebramos
  let momentsReflection = '';
  if (moments.momentCount > 0) {
    momentsReflection = `\n\nCelebramos ${moments.momentCount} momento${moments.momentCount > 1 ? 's' : ''} especial${moments.momentCount > 1 ? 'es' : ''} este año. Cada uno quedo grabado en el corazon del arbol como un recuerdo valioso.`;
  }

  // Agradecimientos
  const gratitudeText = `Gracias a todos los que pensaron en el futuro de ${childName} durante ${year}. Cada gesto de amor quedo sembrado en este arbol.`;

  return `Lo Que Hicimos Juntos

Este año escribimos un nuevo capitulo en la historia del arbol de ${childName}.

Lo que decidimos:
${decisionsText}

Lo que aprendimos:
${lessonsText}
${momentsReflection}

Agradecimiento:
${gratitudeText}

Al cerrar ${year}, el arbol guarda ${formatCurrency(summary.endValue, 'COP')} de tesoro. Cada peso es una promesa de amor para el futuro de ${childName}.`;
}

/**
 * Genera contenido educativo adaptado a la edad
 * Intenta usar Gemini AI si está configurado, sino usa contenido local
 *
 * @param childAge - Edad del niño
 * @param childName - Nombre del niño
 * @param summary - Resumen financiero del año
 * @param treeGrowth - Datos de crecimiento del árbol
 * @param year - Año del reporte
 * @param cachedContent - Contenido ya generado previamente (para evitar llamadas repetidas)
 */
async function generateEducationalContentWithAI(
  childAge: number,
  childName: string,
  summary: YearSummary,
  treeGrowth: TreeGrowthData,
  year: number,
  cachedContent?: string
): Promise<string> {
  // Si hay contenido cacheado, usarlo directamente
  if (cachedContent) {
    return cachedContent;
  }

  // Intentar generar con Gemini AI
  try {
    const { generateEducationalWithGemini, getGeminiApiKey } = await import('../ai/gemini');
    const apiKey = getGeminiApiKey();

    if (apiKey) {
      const result = await generateEducationalWithGemini({
        childAge,
        childName,
        summary,
        treeGrowth,
        year,
      }, apiKey);

      return result.content;
    }
  } catch (error) {
    console.warn('Error generando contenido con Gemini, usando fallback local:', error);
  }

  // Fallback: contenido hardcodeado
  return generateEducationalContent(childAge);
}

/**
 * Genera contenido educativo local (fallback sin IA)
 */
function generateEducationalContent(childAge: number): string {
  if (childAge <= 5) {
    return generateToddlerEducation();
  } else if (childAge <= 10) {
    return generateChildEducation();
  } else {
    return generatePreteenEducation();
  }
}

function generateToddlerEducation(): string {
  return `📚 Lo Que Aprendió el Árbol Este Año

🌱 Sembrando Semillas
Cuando guardamos dinero en el árbol, es como plantar una semillita.
Con el tiempo, esa semillita crece y se convierte en algo más grande.

☀️ La Magia del Sol
El árbol tiene un secreto mágico: ¡puede hacer que el dinero crezca solito!
Es como cuando el sol hace crecer las plantas sin que nadie tenga que hacer nada.

💧 Regar con Paciencia
Los árboles grandes no crecen de un día para otro.
Necesitan que los reguemos poquito a poco, con mucha paciencia.
¡Tu árbol es igual!

🌈 El Jardín de los Sueños
Cada moneda que guardamos es como una semilla de sueños.
Algún día, cuando seas grande, podrás usar estas semillas
para hacer realidad tus aventuras más increíbles.`;
}

function generateChildEducation(): string {
  return `📚 Lo Que Aprendió el Árbol Este Año

💰 El Dinero Trabajador
¿Sabías que el dinero puede trabajar? Cuando lo guardamos bien,
el dinero trabaja día y noche para traer más dinero.
¡Es como tener un pequeño ayudante incansable!

🌳 La Diversificación (Muchos Árboles)
El árbol de tu tesoro no está solo. Tiene amigos que son diferentes
tipos de plantas: bambú que crece rápido, flores que dan frutos,
y robles fuertes. Tener muchos amigos diferentes lo hace más fuerte.

⏰ El Tiempo es Tu Amigo
Aquí hay un secreto importante: mientras más tiempo dejes crecer
tu árbol, más grande será. Empezar de pequeño, como tú,
es la mejor decisión que podemos tomar.

🎯 Las Metas
Tu árbol tiene metas: ayudarte con la universidad,
tu primer carro, o las aventuras que quieras vivir.
Cada peso nos acerca más a esas metas.`;
}

function generatePreteenEducation(): string {
  return `📚 Lo Que Aprendió el Árbol Este Año

📈 El Interés Compuesto
Este año tu árbol experimentó algo llamado "interés compuesto".
Es cuando las ganancias generan más ganancias. Por ejemplo:
- Año 1: Plantas $100, ganas $8 = $108
- Año 2: Esos $108 ganan $8.64 = $116.64
- Año 10: ¡Tu dinero casi se duplica!

🌍 ETFs: Invertir en el Mundo
Tu árbol está conectado con empresas de todo el mundo.
Un ETF es como comprar un pedacito de muchas empresas a la vez,
en lugar de apostar todo a una sola.

📊 Volatilidad: Las Tormentas Pasan
A veces el mercado sube, a veces baja. Es normal.
Lo importante es no asustarse y mantener el plan.
Las tormentas siempre pasan, y después sale el sol.

🎓 Para Tu Futuro
Cuando tengas 18 años, tendrás una base financiera que muy
pocos jóvenes tienen. Podrás decidir si usarla para estudiar,
emprender, o seguir haciéndola crecer. ¡El poder está en tus manos!`;
}

/**
 * Obtiene una frase inspiracional aleatoria
 */
export function getInspirationalQuote(): { quote: string; author: string } {
  const quotes = [
    { quote: "El mejor momento para plantar un árbol fue hace 20 años. El segundo mejor momento es ahora.", author: "Proverbio chino" },
    { quote: "No ahorres lo que te queda después de gastar, gasta lo que te queda después de ahorrar.", author: "Warren Buffett" },
    { quote: "El interés compuesto es la octava maravilla del mundo.", author: "Albert Einstein" },
    { quote: "La paciencia es la madre de todas las virtudes.", author: "San Agustín" },
    { quote: "Siembra un árbol aunque no vayas a ver su sombra.", author: "Proverbio" },
  ];

  return quotes[Math.floor(Math.random() * quotes.length)];
}
