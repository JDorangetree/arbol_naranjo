/**
 * Exportador HTML
 *
 * Genera un archivo HTML estático completamente navegable sin necesidad
 * de la aplicación. Cumple con el principio 5.1 de la visión:
 * "El contenido debe poder leerse sin la aplicación"
 */

import { FullExportData } from '../../types/app.types';
import { Chapter } from '../../types/emotional.types';
import { FinancialTransaction } from '../../types/financial.types';
import { formatCurrency, formatDate } from '../../utils/formatters';

/**
 * Genera HTML completo y navegable de toda la bitácora
 */
export function generateFullHTML(data: FullExportData): string {
  const { childInfo, financial, metadata, emotional } = data;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bitácora Patrimonial de ${childInfo.name}</title>
  <style>
${getStyles()}
  </style>
</head>
<body>
  <div class="container">
    ${generateHeader(childInfo)}

    <nav class="nav">
      <a href="#capitulos">Capítulos</a>
      <a href="#narrativas">Reflexiones Anuales</a>
      <a href="#historial">Historial Financiero</a>
      <a href="#momentos">Momentos Especiales</a>
    </nav>

    <main>
      ${generateChaptersSection(emotional.chapters)}
      ${generateNarrativesSection(emotional.yearlyNarratives)}
      ${generateFinancialSection(financial.transactions, financial.summary)}
      ${generateMomentsSection(metadata.transactionMetadata)}
    </main>

    ${generateFooter(data.exportDate)}
  </div>

  <script>
${getScript()}
  </script>
</body>
</html>`;
}

/**
 * Genera solo la sección de capítulos como HTML
 */
export function generateChaptersHTML(
  chapters: Chapter[],
  childName: string
): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Capítulos - ${childName}</title>
  <style>
${getStyles()}
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1>Capítulos para ${childName}</h1>
    </header>
    <main>
      ${generateChaptersSection(chapters)}
    </main>
  </div>
</body>
</html>`;
}

/**
 * Descarga el HTML generado
 */
export function downloadHTML(
  data: FullExportData,
  filename?: string
): void {
  const html = generateFullHTML(data);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `Bitacora_${data.childInfo.name.replace(/\s+/g, '_')}_${formatDateForFile(data.exportDate)}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================
// GENERADORES DE SECCIONES
// ============================================

function generateHeader(childInfo: FullExportData['childInfo']): string {
  return `
    <header class="header">
      <div class="header-icon">📖</div>
      <h1>Bitácora Patrimonial</h1>
      <h2>La Historia de ${childInfo.name}</h2>
      <p class="subtitle">
        Nacido el ${formatDate(childInfo.birthDate)}<br>
        ${childInfo.ageAtExport} años al momento de esta exportación
      </p>
    </header>
  `;
}

function generateChaptersSection(chapters: Chapter[]): string {
  if (!chapters || chapters.length === 0) {
    return `
      <section id="capitulos" class="section">
        <h2>📚 Capítulos</h2>
        <p class="empty-message">Aún no hay capítulos escritos.</p>
      </section>
    `;
  }

  const unlockedChapters = chapters.filter(ch => !ch.isLocked);
  const lockedChapters = chapters.filter(ch => ch.isLocked);

  let html = `
    <section id="capitulos" class="section">
      <h2>📚 Capítulos</h2>
      <p class="section-intro">
        Estos son los capítulos de tu historia, escritos con amor a lo largo del tiempo.
      </p>
  `;

  // Capítulos desbloqueados
  for (const chapter of unlockedChapters) {
    html += `
      <article class="chapter">
        <div class="chapter-header">
          <span class="chapter-type">${getChapterTypeLabel(chapter.type)}</span>
          <h3>${escapeHtml(chapter.title)}</h3>
          <time>${formatDate(chapter.createdAt)}</time>
        </div>
        <div class="chapter-content">
          ${markdownToHtml(chapter.content)}
        </div>
        ${chapter.linkedYears?.length ? `
          <div class="chapter-meta">
            Relacionado con: ${chapter.linkedYears.join(', ')}
          </div>
        ` : ''}
      </article>
    `;
  }

  // Capítulos bloqueados (solo teaser)
  if (lockedChapters.length > 0) {
    html += `
      <div class="locked-section">
        <h3>🔒 Capítulos por Descubrir</h3>
        <p>Hay ${lockedChapters.length} capítulo(s) que se desbloquearán en el futuro.</p>
    `;

    for (const chapter of lockedChapters) {
      html += `
        <div class="locked-chapter">
          <span class="lock-icon">🔒</span>
          <div>
            <strong>${escapeHtml(chapter.title)}</strong>
            ${chapter.unlockAge ? `<br><small>Se desbloqueará a los ${chapter.unlockAge} años</small>` : ''}
            ${chapter.lockedTeaser ? `<p class="teaser">"${escapeHtml(chapter.lockedTeaser)}"</p>` : ''}
          </div>
        </div>
      `;
    }

    html += `</div>`;
  }

  html += `</section>`;
  return html;
}

function generateNarrativesSection(narratives: any[]): string {
  if (!narratives || narratives.length === 0) {
    return `
      <section id="narrativas" class="section">
        <h2>📅 Reflexiones Anuales</h2>
        <p class="empty-message">Aún no hay reflexiones anuales.</p>
      </section>
    `;
  }

  let html = `
    <section id="narrativas" class="section">
      <h2>📅 Reflexiones Anuales</h2>
      <p class="section-intro">
        Cada año trae sus propias lecciones. Aquí están las reflexiones de cada uno.
      </p>
  `;

  const sortedNarratives = [...narratives].sort((a, b) => b.year - a.year);

  for (const narrative of sortedNarratives) {
    html += `
      <article class="narrative">
        <h3>Año ${narrative.year}</h3>
        <p class="child-age">Tenías ${narrative.childAgeAtYear} año(s)</p>

        <div class="narrative-section">
          <h4>Resumen</h4>
          <p>${escapeHtml(narrative.summary)}</p>
        </div>

        ${narrative.highlights?.length ? `
          <div class="narrative-section">
            <h4>Momentos Destacados</h4>
            <ul>
              ${narrative.highlights.map((h: string) => `<li>${escapeHtml(h)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <div class="narrative-section">
          <h4>Lo que Decidimos</h4>
          <p>${escapeHtml(narrative.whatWeDecided)}</p>
        </div>

        <div class="narrative-section">
          <h4>Lo que Aprendimos</h4>
          <p>${escapeHtml(narrative.whatWeLearned)}</p>
        </div>

        ${narrative.gratitude ? `
          <div class="narrative-section gratitude">
            <h4>Agradecimientos</h4>
            <p>${escapeHtml(narrative.gratitude)}</p>
          </div>
        ` : ''}
      </article>
    `;
  }

  html += `</section>`;
  return html;
}

function generateFinancialSection(
  transactions: FinancialTransaction[],
  summary: any
): string {
  let html = `
    <section id="historial" class="section">
      <h2>💰 Historial Financiero</h2>

      <div class="summary-cards">
        <div class="summary-card">
          <span class="card-label">Total Invertido</span>
          <span class="card-value">${formatCurrency(summary?.totalInvested || 0, 'COP')}</span>
        </div>
        <div class="summary-card">
          <span class="card-label">Valor Actual</span>
          <span class="card-value">${formatCurrency(summary?.currentValue || 0, 'COP')}</span>
        </div>
        <div class="summary-card">
          <span class="card-label">Transacciones</span>
          <span class="card-value">${summary?.transactionCount || 0}</span>
        </div>
      </div>
  `;

  if (transactions && transactions.length > 0) {
    html += `
      <details class="transactions-details">
        <summary>Ver todas las transacciones (${transactions.length})</summary>
        <table class="transactions-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>ETF</th>
              <th>Unidades</th>
              <th>Monto</th>
            </tr>
          </thead>
          <tbody>
    `;

    const sortedTx = [...transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    for (const tx of sortedTx) {
      html += `
        <tr>
          <td>${formatDate(tx.date)}</td>
          <td>${getTransactionTypeLabel(tx.type)}</td>
          <td>${tx.etfTicker}</td>
          <td>${tx.units.toFixed(4)}</td>
          <td>${formatCurrency(tx.totalAmount, tx.currency)}</td>
        </tr>
      `;
    }

    html += `
          </tbody>
        </table>
      </details>
    `;
  }

  html += `</section>`;
  return html;
}

function generateMomentsSection(metadata: any[]): string {
  const moments = metadata?.filter(m => m.milestone) || [];

  if (moments.length === 0) {
    return `
      <section id="momentos" class="section">
        <h2>✨ Momentos Especiales</h2>
        <p class="empty-message">Los momentos especiales aparecerán aquí.</p>
      </section>
    `;
  }

  let html = `
    <section id="momentos" class="section">
      <h2>✨ Momentos Especiales</h2>
      <p class="section-intro">
        Cada inversión puede marcar un momento especial. Estos son los que decidimos recordar.
      </p>
      <div class="moments-grid">
  `;

  for (const moment of moments) {
    html += `
      <div class="moment-card">
        <span class="moment-icon">${getMilestoneIcon(moment.milestone)}</span>
        <div class="moment-content">
          <strong>${getMilestoneLabel(moment.milestone)}</strong>
          ${moment.reason ? `<p>${escapeHtml(moment.reason)}</p>` : ''}
          ${moment.milestoneNote ? `<p class="note">"${escapeHtml(moment.milestoneNote)}"</p>` : ''}
        </div>
      </div>
    `;
  }

  html += `
      </div>
    </section>
  `;
  return html;
}

function generateFooter(exportDate: Date): string {
  return `
    <footer class="footer">
      <p>
        Esta bitácora fue exportada el ${formatDate(exportDate)}.<br>
        El contenido de este documento es independiente de cualquier aplicación.<br>
        Puede ser leído, impreso o archivado sin necesidad de software especial.
      </p>
      <p class="footer-quote">
        "El dinero puede perderse. El criterio no."
      </p>
    </footer>
  `;
}

// ============================================
// ESTILOS CSS
// ============================================

function getStyles(): string {
  return `
    :root {
      --primary: #2D5A27;
      --primary-light: #4A7C43;
      --secondary: #8B4513;
      --background: #FFFEF7;
      --surface: #FFFFFF;
      --text: #2C3E2D;
      --text-light: #5D6B5E;
      --border: #E8E5D7;
      --accent: #FFD700;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      background: var(--background);
      color: var(--text);
      line-height: 1.7;
      font-size: 16px;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
    }

    /* Header */
    .header {
      text-align: center;
      padding: 3rem 1rem;
      border-bottom: 2px solid var(--border);
      margin-bottom: 2rem;
    }

    .header-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .header h1 {
      font-size: 2.5rem;
      color: var(--primary);
      margin-bottom: 0.5rem;
    }

    .header h2 {
      font-size: 1.8rem;
      color: var(--secondary);
      font-weight: normal;
    }

    .subtitle {
      color: var(--text-light);
      margin-top: 1rem;
    }

    /* Navigation */
    .nav {
      display: flex;
      justify-content: center;
      gap: 1.5rem;
      padding: 1rem;
      background: var(--surface);
      border-radius: 8px;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .nav a {
      color: var(--primary);
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: background 0.2s;
    }

    .nav a:hover {
      background: var(--border);
    }

    /* Sections */
    .section {
      margin-bottom: 3rem;
      padding: 2rem;
      background: var(--surface);
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .section h2 {
      color: var(--primary);
      border-bottom: 2px solid var(--border);
      padding-bottom: 0.5rem;
      margin-bottom: 1.5rem;
    }

    .section-intro {
      color: var(--text-light);
      font-style: italic;
      margin-bottom: 1.5rem;
    }

    .empty-message {
      color: var(--text-light);
      text-align: center;
      padding: 2rem;
    }

    /* Chapters */
    .chapter {
      margin-bottom: 2rem;
      padding: 1.5rem;
      border-left: 4px solid var(--primary);
      background: var(--background);
    }

    .chapter-header {
      margin-bottom: 1rem;
    }

    .chapter-type {
      display: inline-block;
      font-size: 0.75rem;
      background: var(--primary);
      color: white;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      margin-bottom: 0.5rem;
    }

    .chapter h3 {
      color: var(--secondary);
    }

    .chapter time {
      font-size: 0.85rem;
      color: var(--text-light);
    }

    .chapter-content {
      margin-top: 1rem;
    }

    .chapter-meta {
      margin-top: 1rem;
      font-size: 0.85rem;
      color: var(--text-light);
    }

    /* Locked chapters */
    .locked-section {
      margin-top: 2rem;
      padding: 1.5rem;
      background: #F5F5F0;
      border-radius: 8px;
    }

    .locked-section h3 {
      color: var(--text-light);
    }

    .locked-chapter {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem 0;
      border-bottom: 1px solid var(--border);
    }

    .lock-icon {
      font-size: 1.5rem;
    }

    .teaser {
      font-style: italic;
      color: var(--text-light);
      margin-top: 0.5rem;
    }

    /* Narratives */
    .narrative {
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid var(--border);
    }

    .narrative h3 {
      color: var(--primary);
      font-size: 1.5rem;
    }

    .child-age {
      color: var(--text-light);
      margin-bottom: 1rem;
    }

    .narrative-section {
      margin-top: 1rem;
    }

    .narrative-section h4 {
      color: var(--secondary);
      font-size: 1rem;
      margin-bottom: 0.5rem;
    }

    .gratitude {
      background: #FFF9E6;
      padding: 1rem;
      border-radius: 8px;
      margin-top: 1.5rem;
    }

    /* Financial */
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .summary-card {
      background: var(--background);
      padding: 1rem;
      border-radius: 8px;
      text-align: center;
    }

    .card-label {
      display: block;
      font-size: 0.85rem;
      color: var(--text-light);
    }

    .card-value {
      display: block;
      font-size: 1.3rem;
      font-weight: bold;
      color: var(--primary);
      margin-top: 0.25rem;
    }

    .transactions-details {
      margin-top: 1rem;
    }

    .transactions-details summary {
      cursor: pointer;
      color: var(--primary);
      font-weight: bold;
    }

    .transactions-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
      font-size: 0.9rem;
    }

    .transactions-table th,
    .transactions-table td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid var(--border);
    }

    .transactions-table th {
      background: var(--background);
      font-weight: bold;
    }

    /* Moments */
    .moments-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .moment-card {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      background: var(--background);
      border-radius: 8px;
    }

    .moment-icon {
      font-size: 2rem;
    }

    .moment-content .note {
      font-style: italic;
      color: var(--text-light);
      margin-top: 0.5rem;
    }

    /* Footer */
    .footer {
      text-align: center;
      padding: 2rem;
      color: var(--text-light);
      border-top: 2px solid var(--border);
      margin-top: 2rem;
    }

    .footer-quote {
      margin-top: 1rem;
      font-style: italic;
      color: var(--secondary);
    }

    /* Print styles */
    @media print {
      body {
        font-size: 12pt;
      }

      .nav {
        display: none;
      }

      .section {
        break-inside: avoid;
        box-shadow: none;
        border: 1px solid #ccc;
      }

      .chapter {
        break-inside: avoid;
      }
    }

    /* Responsive */
    @media (max-width: 600px) {
      .container {
        padding: 1rem;
      }

      .header h1 {
        font-size: 1.8rem;
      }

      .header h2 {
        font-size: 1.3rem;
      }

      .nav {
        flex-direction: column;
        align-items: center;
      }
    }
  `;
}

// ============================================
// JAVASCRIPT PARA INTERACTIVIDAD BÁSICA
// ============================================

function getScript(): string {
  return `
    // Smooth scroll para navegación
    document.querySelectorAll('.nav a').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  `;
}

// ============================================
// UTILIDADES
// ============================================

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function markdownToHtml(markdown: string): string {
  if (!markdown) return '';

  return escapeHtml(markdown)
    // Headers
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    // Wrap in paragraph
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');
}

function formatDateForFile(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getChapterTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    letter: 'Carta',
    yearly_reflection: 'Reflexión Anual',
    milestone_story: 'Historia de un Momento',
    lesson_learned: 'Lección Aprendida',
    family_story: 'Historia Familiar',
    financial_education: 'Educación Financiera',
    future_message: 'Mensaje al Futuro',
    memory: 'Recuerdo',
    wish: 'Deseo',
  };
  return labels[type] || type;
}

function getTransactionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    buy: 'Compra',
    sell: 'Venta',
    dividend: 'Dividendo',
    transfer: 'Transferencia',
  };
  return labels[type] || type;
}

function getMilestoneIcon(milestone: string): string {
  const icons: Record<string, string> = {
    first_investment: '🌱',
    birthday: '🎂',
    christmas: '🎄',
    achievement: '🏆',
    family_moment: '👨‍👩‍👧',
    monthly: '📅',
    bonus: '💎',
    gift: '🎁',
    special: '⭐',
  };
  return icons[milestone] || '✨';
}

function getMilestoneLabel(milestone: string): string {
  const labels: Record<string, string> = {
    first_investment: 'Primera Inversión',
    birthday: 'Cumpleaños',
    christmas: 'Navidad',
    achievement: 'Logro',
    family_moment: 'Momento Familiar',
    monthly: 'Ahorro Mensual',
    bonus: 'Bonus',
    gift: 'Regalo',
    special: 'Momento Especial',
  };
  return labels[milestone] || milestone;
}
