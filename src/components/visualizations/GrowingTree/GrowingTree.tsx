import React from 'react';
import { motion } from 'framer-motion';
import { TreeVisualization, TreeStage } from '../../../types';
import {
  calculateTreeVisualization,
  TREE_STAGES,
  formatCurrency,
} from '../../../utils';

interface GrowingTreeProps {
  totalValue: number;
  totalInvested: number;
  returns: number;
  transactionCount: number;
  childName: string;
}

export const GrowingTree: React.FC<GrowingTreeProps> = ({
  totalValue,
  totalInvested,
  returns,
  transactionCount,
  childName,
}) => {
  const visualization = calculateTreeVisualization(
    totalValue,
    transactionCount,
    returns
  );

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-100 via-sky-50 to-growth-50 rounded-3xl" />

      {/* Contenedor principal */}
      <div className="relative p-8">
        {/* Sol */}
        <motion.div
          className="absolute top-4 right-8"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full shadow-lg shadow-yellow-300/50" />
        </motion.div>

        {/* Nubes */}
        <motion.div
          className="absolute top-8 left-8"
          animate={{ x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Cloud />
        </motion.div>

        {/* El árbol */}
        <div className="relative h-72 flex items-end justify-center">
          <TreeSVG stage={visualization.stage} leaves={visualization.leaves} fruits={visualization.fruits} />
        </div>

        {/* Suelo */}
        <div className="h-8 bg-gradient-to-t from-amber-700 to-amber-600 rounded-b-3xl -mx-8 -mb-8 mt-4" />

        {/* Info overlay */}
        <div className="absolute bottom-16 left-0 right-0 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg"
          >
            <p className="text-sm text-gray-500">El árbol de {childName}</p>
            <p className="text-2xl font-bold text-growth-600 money">
              {formatCurrency(totalValue)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {TREE_STAGES[visualization.stage].label} · {Math.round(visualization.progress)}% hacia la siguiente etapa
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Componente del árbol SVG
interface TreeSVGProps {
  stage: TreeStage;
  leaves: number;
  fruits: number;
}

const TreeSVG: React.FC<TreeSVGProps> = ({ stage, leaves, fruits }) => {
  const stageConfig = {
    seed: { height: 30, width: 20, showTrunk: false, showCrown: false },
    sprout: { height: 60, width: 40, showTrunk: true, showCrown: false },
    sapling: { height: 100, width: 80, showTrunk: true, showCrown: true },
    young_tree: { height: 150, width: 120, showTrunk: true, showCrown: true },
    mature_tree: { height: 200, width: 160, showTrunk: true, showCrown: true },
    mighty_oak: { height: 240, width: 200, showTrunk: true, showCrown: true },
  };

  const config = stageConfig[stage];

  return (
    <motion.svg
      viewBox="0 0 200 280"
      className="w-full h-full max-h-72"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', duration: 0.8 }}
    >
      {/* Definiciones de gradientes */}
      <defs>
        <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8B4513" />
          <stop offset="50%" stopColor="#A0522D" />
          <stop offset="100%" stopColor="#8B4513" />
        </linearGradient>
        <linearGradient id="crownGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#15803D" />
        </linearGradient>
        <radialGradient id="fruitGradient">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </radialGradient>
      </defs>

      {/* Semilla */}
      {stage === 'seed' && (
        <motion.g
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
        >
          <ellipse cx="100" cy="250" rx="15" ry="10" fill="#8B4513" />
          <motion.path
            d="M100 250 Q100 240 95 235 Q100 230 105 235 Q100 240 100 250"
            fill="#22C55E"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{ transformOrigin: '100px 250px' }}
          />
        </motion.g>
      )}

      {/* Tronco */}
      {config.showTrunk && (
        <motion.path
          d={getTrunkPath(stage)}
          fill="url(#trunkGradient)"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.5 }}
          style={{ transformOrigin: '100px 260px' }}
        />
      )}

      {/* Copa del árbol */}
      {config.showCrown && (
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
        >
          {getCrownCircles(stage).map((circle, i) => (
            <motion.circle
              key={i}
              cx={circle.cx}
              cy={circle.cy}
              r={circle.r}
              fill="url(#crownGradient)"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 + i * 0.1, type: 'spring' }}
            />
          ))}
        </motion.g>
      )}

      {/* Hojas animadas */}
      {leaves > 0 && config.showCrown && (
        <g>
          {Array.from({ length: Math.min(leaves, 15) }).map((_, i) => (
            <motion.circle
              key={`leaf-${i}`}
              cx={80 + Math.random() * 40}
              cy={60 + Math.random() * 80}
              r={3}
              fill="#4ADE80"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            />
          ))}
        </g>
      )}

      {/* Frutos dorados */}
      {fruits > 0 && config.showCrown && (
        <g>
          {Array.from({ length: Math.min(fruits, 8) }).map((_, i) => (
            <motion.circle
              key={`fruit-${i}`}
              cx={85 + (i % 4) * 10}
              cy={80 + Math.floor(i / 4) * 25}
              r={6}
              fill="url(#fruitGradient)"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ delay: 0.8 + i * 0.15, duration: 0.4 }}
            />
          ))}
        </g>
      )}
    </motion.svg>
  );
};

// Funciones auxiliares para generar paths del árbol
function getTrunkPath(stage: TreeStage): string {
  const paths: Record<TreeStage, string> = {
    seed: '',
    sprout: 'M95 260 L95 220 L105 220 L105 260 Z',
    sapling: 'M92 260 L88 180 L100 170 L112 180 L108 260 Z',
    young_tree: 'M88 260 L80 150 L100 130 L120 150 L112 260 Z',
    mature_tree: 'M85 260 L70 130 L100 100 L130 130 L115 260 Z',
    mighty_oak: 'M80 260 L60 120 L100 80 L140 120 L120 260 Z',
  };
  return paths[stage];
}

function getCrownCircles(
  stage: TreeStage
): Array<{ cx: number; cy: number; r: number }> {
  const circles: Record<TreeStage, Array<{ cx: number; cy: number; r: number }>> = {
    seed: [],
    sprout: [],
    sapling: [
      { cx: 100, cy: 140, r: 35 },
    ],
    young_tree: [
      { cx: 100, cy: 100, r: 45 },
      { cx: 70, cy: 120, r: 30 },
      { cx: 130, cy: 120, r: 30 },
    ],
    mature_tree: [
      { cx: 100, cy: 70, r: 50 },
      { cx: 60, cy: 100, r: 40 },
      { cx: 140, cy: 100, r: 40 },
      { cx: 80, cy: 50, r: 35 },
      { cx: 120, cy: 50, r: 35 },
    ],
    mighty_oak: [
      { cx: 100, cy: 50, r: 55 },
      { cx: 50, cy: 80, r: 45 },
      { cx: 150, cy: 80, r: 45 },
      { cx: 70, cy: 30, r: 40 },
      { cx: 130, cy: 30, r: 40 },
      { cx: 100, cy: 100, r: 50 },
    ],
  };
  return circles[stage];
}

// Componente de nube
const Cloud: React.FC = () => (
  <svg width="60" height="30" viewBox="0 0 60 30">
    <ellipse cx="15" cy="20" rx="12" ry="8" fill="white" opacity="0.8" />
    <ellipse cx="30" cy="15" rx="15" ry="12" fill="white" opacity="0.9" />
    <ellipse cx="45" cy="20" rx="12" ry="8" fill="white" opacity="0.8" />
  </svg>
);
