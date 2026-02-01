/**
 * Naranjo Evolutivo con Torre Protectora
 *
 * Visualización central del patrimonio que evoluciona según el capital:
 *
 * ETAPAS DEL NARANJO:
 * 1. Semilla (0-1M) - Una semilla bajo tierra, esperando
 * 2. Brote (1M-5M) - Un pequeño brote emerge
 * 3. Plántula (5M-15M) - Tallo con primeras hojas
 * 4. Árbol joven (15M-50M) - Árbol pequeño, algunas ramas
 * 5. Árbol maduro (50M-150M) - Árbol grande con hojas
 * 6. Árbol con flores (150M-300M) - Flores naranjas aparecen
 * 7. Árbol con frutos (300M+) - Naranjas colgando
 *
 * LA TORRE:
 * - Aparece gradualmente desde la etapa 3
 * - Crece en altura con el capital
 * - Simboliza la protección del legado Torres
 *
 * "Un árbol que crece protegido por una torre.
 *  No para encerrarlo. Sino para darle tiempo."
 */

import React from 'react';
import { motion, Variants } from 'framer-motion';

interface NaranjoEvolutivoProps {
  totalValue: number;          // Valor total del portafolio
  totalInvested: number;       // Total invertido
  className?: string;
  childName?: string;
  animated?: boolean;
}

// Umbrales de evolución (en pesos colombianos)
const STAGES = {
  SEED: 0,
  SPROUT: 1_000_000,
  SEEDLING: 5_000_000,
  YOUNG_TREE: 15_000_000,
  MATURE_TREE: 50_000_000,
  FLOWERING: 150_000_000,
  FRUITING: 300_000_000,
};

type Stage = 'seed' | 'sprout' | 'seedling' | 'young_tree' | 'mature_tree' | 'flowering' | 'fruiting';

function getStage(value: number): Stage {
  if (value >= STAGES.FRUITING) return 'fruiting';
  if (value >= STAGES.FLOWERING) return 'flowering';
  if (value >= STAGES.MATURE_TREE) return 'mature_tree';
  if (value >= STAGES.YOUNG_TREE) return 'young_tree';
  if (value >= STAGES.SEEDLING) return 'seedling';
  if (value >= STAGES.SPROUT) return 'sprout';
  return 'seed';
}

function getStageProgress(value: number, stage: Stage): number {
  const ranges: Record<Stage, [number, number]> = {
    seed: [0, STAGES.SPROUT],
    sprout: [STAGES.SPROUT, STAGES.SEEDLING],
    seedling: [STAGES.SEEDLING, STAGES.YOUNG_TREE],
    young_tree: [STAGES.YOUNG_TREE, STAGES.MATURE_TREE],
    mature_tree: [STAGES.MATURE_TREE, STAGES.FLOWERING],
    flowering: [STAGES.FLOWERING, STAGES.FRUITING],
    fruiting: [STAGES.FRUITING, STAGES.FRUITING * 2],
  };

  const [min, max] = ranges[stage];
  return Math.min(1, Math.max(0, (value - min) / (max - min)));
}

function getStageLabel(stage: Stage): string {
  const labels: Record<Stage, string> = {
    seed: 'Semilla',
    sprout: 'Brote',
    seedling: 'Plántula',
    young_tree: 'Árbol Joven',
    mature_tree: 'Árbol Maduro',
    flowering: 'En Floración',
    fruiting: 'Dando Frutos',
  };
  return labels[stage];
}

function getStageMessage(stage: Stage, childName: string): string {
  const messages: Record<Stage, string> = {
    seed: `La semilla de ${childName} espera bajo tierra. Todo gran naranjo comienza así.`,
    sprout: `¡El brote de ${childName} ha emergido! La vida encuentra su camino.`,
    seedling: `La plántula crece firme. Las raíces de ${childName} se fortalecen.`,
    young_tree: `El árbol joven de ${childName} extiende sus ramas hacia el cielo.`,
    mature_tree: `Un árbol maduro y fuerte. El patrimonio de ${childName} tiene raíces profundas.`,
    flowering: `¡Las flores aparecen! Pronto el árbol de ${childName} dará sus primeros frutos.`,
    fruiting: `El naranjo de ${childName} da frutos. Años de paciencia, protegidos por la torre.`,
  };
  return messages[stage];
}

export const NaranjoEvolutivo: React.FC<NaranjoEvolutivoProps> = ({
  totalValue,
  totalInvested,
  className = '',
  childName = 'tu hijo',
  animated = true,
}) => {
  const stage = getStage(totalValue);
  const progress = getStageProgress(totalValue, stage);
  const stageIndex = ['seed', 'sprout', 'seedling', 'young_tree', 'mature_tree', 'flowering', 'fruiting'].indexOf(stage);

  // La torre aparece desde la etapa 3 (seedling) y crece
  const showTower = stageIndex >= 2;
  const towerHeight = showTower ? Math.min(1, (stageIndex - 1) / 5) : 0;

  // Número de frutos basado en el valor (máx 12)
  const fruitCount = stage === 'fruiting' ? Math.min(12, Math.floor(progress * 12) + 1) : 0;

  // Número de flores
  const flowerCount = stage === 'flowering' ? Math.min(8, Math.floor(progress * 8) + 1) : 0;

  const breatheVariants: Variants = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.02, 1],
      transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' as const },
    },
  };

  return (
    <div className={`relative ${className}`}>
      {/* Contenedor principal */}
      <div className="bg-gradient-to-b from-sky-100 via-sky-50 to-trunk-100 dark:from-slate-800 dark:via-slate-800 dark:to-slate-700 rounded-3xl p-6 overflow-hidden">
        {/* SVG de la escena */}
        <svg viewBox="0 0 400 300" className="w-full h-auto max-h-[400px]">
          {/* Cielo con nubes sutiles */}
          <defs>
            <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E0F2FE" />
              <stop offset="100%" stopColor="#F0FDF4" />
            </linearGradient>
            <linearGradient id="groundGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#D4C4B0" />
              <stop offset="50%" stopColor="#B8A089" />
              <stop offset="100%" stopColor="#9C7C62" />
            </linearGradient>
            <linearGradient id="towerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D6D3D1" />
              <stop offset="50%" stopColor="#A8A29E" />
              <stop offset="100%" stopColor="#78716C" />
            </linearGradient>
            <radialGradient id="orangeGradient" cx="30%" cy="30%">
              <stop offset="0%" stopColor="#FDBA74" />
              <stop offset="50%" stopColor="#FB923C" />
              <stop offset="100%" stopColor="#F97316" />
            </radialGradient>
            <radialGradient id="flowerGradient" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#FEF3C7" />
              <stop offset="100%" stopColor="#FDE68A" />
            </radialGradient>
            <linearGradient id="leafGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4ADE80" />
              <stop offset="100%" stopColor="#22C55E" />
            </linearGradient>
            <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7D5F48" />
              <stop offset="50%" stopColor="#9C7C62" />
              <stop offset="100%" stopColor="#7D5F48" />
            </linearGradient>
          </defs>

          {/* Fondo cielo */}
          <rect x="0" y="0" width="400" height="220" fill="url(#skyGradient)" />

          {/* Nubes decorativas */}
          <ellipse cx="60" cy="40" rx="30" ry="15" fill="white" opacity="0.6" />
          <ellipse cx="80" cy="35" rx="25" ry="12" fill="white" opacity="0.6" />
          <ellipse cx="320" cy="50" rx="35" ry="18" fill="white" opacity="0.5" />
          <ellipse cx="350" cy="45" rx="25" ry="12" fill="white" opacity="0.5" />

          {/* Suelo */}
          <path d="M0 220 Q100 210 200 220 Q300 230 400 220 L400 300 L0 300 Z" fill="url(#groundGradient)" />

          {/* ============ TORRE (aparece gradualmente) ============ */}
          {showTower && (
            <motion.g
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, ease: 'easeOut' as const }}
            >
              {/* Sombra de la torre */}
              <ellipse cx="100" cy="255" rx={25 * towerHeight} ry={5 * towerHeight} fill="#5E4636" opacity="0.2" />

              {/* Base de la torre */}
              <rect
                x="70"
                y={260 - 80 * towerHeight}
                width="60"
                height={80 * towerHeight}
                fill="url(#towerGradient)"
              />

              {/* Parte superior ensanchada */}
              <rect
                x="65"
                y={260 - 90 * towerHeight}
                width="70"
                height={10 * towerHeight}
                fill="#A8A29E"
              />

              {/* Almenas */}
              {towerHeight > 0.3 && (
                <>
                  <rect x="65" y={260 - 100 * towerHeight} width="12" height={10 * towerHeight} fill="url(#towerGradient)" />
                  <rect x="82" y={260 - 100 * towerHeight} width="12" height={10 * towerHeight} fill="url(#towerGradient)" />
                  <rect x="99" y={260 - 100 * towerHeight} width="12" height={10 * towerHeight} fill="url(#towerGradient)" />
                  <rect x="116" y={260 - 100 * towerHeight} width="12" height={10 * towerHeight} fill="url(#towerGradient)" />
                </>
              )}

              {/* Ventana */}
              {towerHeight > 0.5 && (
                <path
                  d={`M90 ${260 - 60 * towerHeight} Q100 ${260 - 70 * towerHeight} 110 ${260 - 60 * towerHeight} L110 ${260 - 45 * towerHeight} L90 ${260 - 45 * towerHeight} Z`}
                  fill="#44403C"
                />
              )}

              {/* Puerta */}
              <path
                d={`M85 260 L85 ${260 - 30 * towerHeight} Q100 ${260 - 40 * towerHeight} 115 ${260 - 30 * towerHeight} L115 260 Z`}
                fill="#44403C"
              />

              {/* Detalles dorados */}
              {towerHeight > 0.4 && (
                <>
                  <circle cx="90" cy={260 - 15 * towerHeight} r="2" fill="#F59E0B" />
                  <circle cx="110" cy={260 - 15 * towerHeight} r="2" fill="#F59E0B" />
                  <rect x="97" y={260 - 88 * towerHeight} width="6" height={8 * towerHeight} fill="#F59E0B" rx="1" />
                </>
              )}

              {/* Bandera */}
              {towerHeight > 0.6 && (
                <motion.g
                  animate={{ rotate: [0, 3, -2, 3, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
                  style={{ originX: '100px', originY: `${260 - 100 * towerHeight}px` }}
                >
                  <line
                    x1="100"
                    y1={260 - 100 * towerHeight}
                    x2="100"
                    y2={260 - 130 * towerHeight}
                    stroke="#B45309"
                    strokeWidth="2"
                  />
                  <path
                    d={`M100 ${260 - 130 * towerHeight} L100 ${260 - 115 * towerHeight} L118 ${260 - 122 * towerHeight} Z`}
                    fill="#F97316"
                  />
                </motion.g>
              )}
            </motion.g>
          )}

          {/* ============ NARANJO (evoluciona por etapas) ============ */}
          <motion.g
            variants={animated ? breatheVariants : undefined}
            initial="initial"
            animate={animated ? 'animate' : 'initial'}
          >
            {/* ETAPA 1: SEMILLA */}
            {stage === 'seed' && (
              <g>
                {/* Montículo de tierra */}
                <ellipse cx="250" cy="250" rx="40" ry="15" fill="#9C7C62" />
                {/* Semilla enterrada (visible parcialmente) */}
                <motion.ellipse
                  cx="250"
                  cy="248"
                  rx={8 + progress * 4}
                  ry={5 + progress * 3}
                  fill="#7D5F48"
                  initial={{ y: 5 }}
                  animate={{ y: [5, 3, 5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
                />
                {/* Pequeña grieta indicando vida */}
                {progress > 0.5 && (
                  <motion.path
                    d={`M248 247 Q250 ${245 - progress * 5} 252 247`}
                    stroke="#4ADE80"
                    strokeWidth="2"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1 }}
                  />
                )}
              </g>
            )}

            {/* ETAPA 2: BROTE */}
            {stage === 'sprout' && (
              <g>
                <ellipse cx="250" cy="250" rx="30" ry="10" fill="#9C7C62" />
                {/* Tallo emergiendo */}
                <motion.path
                  d={`M250 250 Q250 ${240 - progress * 20} 250 ${230 - progress * 30}`}
                  stroke="#22C55E"
                  strokeWidth={3 + progress * 2}
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Primeras hojas */}
                {progress > 0.3 && (
                  <>
                    <ellipse
                      cx={245 - progress * 10}
                      cy={235 - progress * 25}
                      rx={5 + progress * 5}
                      ry={3 + progress * 3}
                      fill="#4ADE80"
                      transform={`rotate(-30 ${245 - progress * 10} ${235 - progress * 25})`}
                    />
                    <ellipse
                      cx={255 + progress * 10}
                      cy={235 - progress * 25}
                      rx={5 + progress * 5}
                      ry={3 + progress * 3}
                      fill="#4ADE80"
                      transform={`rotate(30 ${255 + progress * 10} ${235 - progress * 25})`}
                    />
                  </>
                )}
              </g>
            )}

            {/* ETAPA 3: PLÁNTULA */}
            {stage === 'seedling' && (
              <g>
                {/* Base/raíces visibles */}
                <ellipse cx="250" cy="252" rx="25" ry="8" fill="#9C7C62" />
                {/* Tallo más grueso */}
                <path
                  d={`M247 255 Q246 220 248 ${180 - progress * 20} Q250 ${175 - progress * 20} 252 ${180 - progress * 20} Q254 220 253 255 Z`}
                  fill="url(#trunkGradient)"
                />
                {/* Copa pequeña */}
                <ellipse cx="250" cy={170 - progress * 30} rx={25 + progress * 15} ry={20 + progress * 10} fill="#16A34A" />
                <ellipse cx="250" cy={165 - progress * 30} rx={22 + progress * 12} ry={17 + progress * 8} fill="url(#leafGradient)" />
              </g>
            )}

            {/* ETAPA 4: ÁRBOL JOVEN */}
            {stage === 'young_tree' && (
              <g>
                {/* Sombra */}
                <ellipse cx="260" cy="255" rx={35 + progress * 10} ry="8" fill="#166534" opacity="0.2" />
                {/* Tronco */}
                <path
                  d="M243 260 Q240 200 245 150 Q250 140 255 150 Q260 200 257 260 Z"
                  fill="url(#trunkGradient)"
                />
                {/* Ramas */}
                <path d="M248 180 Q220 170 200 180" stroke="#7D5F48" strokeWidth="6" fill="none" strokeLinecap="round" />
                <path d="M252 180 Q280 170 300 180" stroke="#7D5F48" strokeWidth="6" fill="none" strokeLinecap="round" />
                <path d="M250 160 Q250 145 250 130" stroke="#7D5F48" strokeWidth="5" fill="none" strokeLinecap="round" />
                {/* Copa */}
                <ellipse cx="250" cy={120 - progress * 20} rx={50 + progress * 20} ry={40 + progress * 15} fill="#16A34A" />
                <ellipse cx="250" cy={115 - progress * 20} rx={45 + progress * 18} ry={35 + progress * 12} fill="url(#leafGradient)" />
                <ellipse cx="230" cy={105 - progress * 20} rx="15" ry="12" fill="#86EFAC" opacity="0.5" />
              </g>
            )}

            {/* ETAPA 5: ÁRBOL MADURO */}
            {stage === 'mature_tree' && (
              <g>
                {/* Sombra grande */}
                <ellipse cx="265" cy="258" rx="55" ry="12" fill="#166534" opacity="0.25" />
                {/* Tronco grueso */}
                <path
                  d="M238 260 Q232 180 240 120 Q250 100 260 120 Q268 180 262 260 Z"
                  fill="url(#trunkGradient)"
                />
                {/* Ramas principales */}
                <path d="M245 150 Q200 140 170 160" stroke="#7D5F48" strokeWidth="8" fill="none" strokeLinecap="round" />
                <path d="M255 150 Q300 140 330 160" stroke="#7D5F48" strokeWidth="8" fill="none" strokeLinecap="round" />
                <path d="M248 130 Q230 100 210 90" stroke="#7D5F48" strokeWidth="6" fill="none" strokeLinecap="round" />
                <path d="M252 130 Q270 100 290 90" stroke="#7D5F48" strokeWidth="6" fill="none" strokeLinecap="round" />
                {/* Copa frondosa */}
                <ellipse cx="250" cy="85" rx="80" ry="60" fill="#15803D" />
                <ellipse cx="250" cy="80" rx="75" ry="55" fill="#22C55E" />
                <ellipse cx="250" cy="75" rx="70" ry="50" fill="url(#leafGradient)" />
                <ellipse cx="220" cy="60" rx="20" ry="15" fill="#86EFAC" opacity="0.5" />
                <ellipse cx="280" cy="70" rx="18" ry="12" fill="#86EFAC" opacity="0.4" />
              </g>
            )}

            {/* ETAPA 6: EN FLORACIÓN */}
            {stage === 'flowering' && (
              <g>
                {/* Árbol maduro base */}
                <ellipse cx="265" cy="258" rx="55" ry="12" fill="#166534" opacity="0.25" />
                <path d="M238 260 Q232 180 240 120 Q250 100 260 120 Q268 180 262 260 Z" fill="url(#trunkGradient)" />
                <path d="M245 150 Q200 140 170 160" stroke="#7D5F48" strokeWidth="8" fill="none" strokeLinecap="round" />
                <path d="M255 150 Q300 140 330 160" stroke="#7D5F48" strokeWidth="8" fill="none" strokeLinecap="round" />
                <path d="M248 130 Q230 100 210 90" stroke="#7D5F48" strokeWidth="6" fill="none" strokeLinecap="round" />
                <path d="M252 130 Q270 100 290 90" stroke="#7D5F48" strokeWidth="6" fill="none" strokeLinecap="round" />
                <ellipse cx="250" cy="85" rx="80" ry="60" fill="#15803D" />
                <ellipse cx="250" cy="80" rx="75" ry="55" fill="#22C55E" />
                <ellipse cx="250" cy="75" rx="70" ry="50" fill="url(#leafGradient)" />
                {/* Flores */}
                {[
                  { cx: 200, cy: 70 }, { cx: 230, cy: 50 }, { cx: 260, cy: 45 },
                  { cx: 290, cy: 55 }, { cx: 310, cy: 80 }, { cx: 220, cy: 90 },
                  { cx: 270, cy: 85 }, { cx: 185, cy: 95 },
                ].slice(0, flowerCount).map((pos, i) => (
                  <motion.g
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                  >
                    <circle cx={pos.cx} cy={pos.cy} r="6" fill="url(#flowerGradient)" />
                    <circle cx={pos.cx} cy={pos.cy} r="2" fill="#F59E0B" />
                  </motion.g>
                ))}
              </g>
            )}

            {/* ETAPA 7: DANDO FRUTOS */}
            {stage === 'fruiting' && (
              <g>
                {/* Árbol completo */}
                <ellipse cx="265" cy="258" rx="60" ry="14" fill="#166534" opacity="0.3" />
                <path d="M235 260 Q228 175 238 115 Q250 90 262 115 Q272 175 265 260 Z" fill="url(#trunkGradient)" />
                <path d="M243 145 Q195 130 160 155" stroke="#7D5F48" strokeWidth="10" fill="none" strokeLinecap="round" />
                <path d="M257 145 Q305 130 340 155" stroke="#7D5F48" strokeWidth="10" fill="none" strokeLinecap="round" />
                <path d="M246 120 Q220 85 195 75" stroke="#7D5F48" strokeWidth="7" fill="none" strokeLinecap="round" />
                <path d="M254 120 Q280 85 305 75" stroke="#7D5F48" strokeWidth="7" fill="none" strokeLinecap="round" />
                <ellipse cx="250" cy="80" rx="90" ry="65" fill="#15803D" />
                <ellipse cx="250" cy="75" rx="85" ry="60" fill="#22C55E" />
                <ellipse cx="250" cy="70" rx="80" ry="55" fill="url(#leafGradient)" />
                <ellipse cx="215" cy="50" rx="22" ry="16" fill="#86EFAC" opacity="0.5" />
                <ellipse cx="290" cy="60" rx="20" ry="14" fill="#86EFAC" opacity="0.4" />
                {/* Naranjas */}
                {[
                  { cx: 185, cy: 85 }, { cx: 210, cy: 60 }, { cx: 240, cy: 45 },
                  { cx: 270, cy: 50 }, { cx: 300, cy: 70 }, { cx: 320, cy: 95 },
                  { cx: 195, cy: 110 }, { cx: 230, cy: 95 }, { cx: 265, cy: 90 },
                  { cx: 295, cy: 105 }, { cx: 175, cy: 125 }, { cx: 325, cy: 120 },
                ].slice(0, fruitCount).map((pos, i) => (
                  <motion.g
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.15, duration: 0.4, ease: 'backOut' as const }}
                  >
                    <circle cx={pos.cx} cy={pos.cy} r="10" fill="url(#orangeGradient)" />
                    <circle cx={pos.cx - 3} cy={pos.cy - 3} r="3" fill="#FED7AA" opacity="0.6" />
                  </motion.g>
                ))}
              </g>
            )}
          </motion.g>

          {/* Línea del suelo decorativa */}
          <path d="M0 260 Q50 255 100 260 Q150 265 200 260 Q250 255 300 260 Q350 265 400 260" stroke="#7D5F48" strokeWidth="2" fill="none" opacity="0.3" />
        </svg>

        {/* Información de la etapa */}
        <div className="mt-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">
              {stage === 'seed' && '🌱'}
              {stage === 'sprout' && '🌿'}
              {stage === 'seedling' && '🪴'}
              {stage === 'young_tree' && '🌳'}
              {stage === 'mature_tree' && '🌲'}
              {stage === 'flowering' && '🌸'}
              {stage === 'fruiting' && '🍊'}
            </span>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{getStageLabel(stage)}</h3>
            {showTower && <span className="text-xl">🏰</span>}
          </div>
          <p className="text-gray-600 dark:text-slate-300 text-sm max-w-md mx-auto">
            {getStageMessage(stage, childName)}
          </p>
        </div>
      </div>
    </div>
  );
};
