/**
 * Ilustración del Naranjo
 *
 * Representa: crecimiento natural, tiempo, ciclos, frutos, paciencia, raíces invisibles.
 * "Nada crece rápido. Nada se fuerza. Todo madura."
 */

import React from 'react';
import { motion, Variants } from 'framer-motion';

interface NaranjoTreeProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  showFruits?: boolean;
  fruitCount?: number;
  className?: string;
}

const sizeMap = {
  sm: { width: 80, height: 100 },
  md: { width: 120, height: 150 },
  lg: { width: 180, height: 225 },
  xl: { width: 240, height: 300 },
};

export const NaranjoTree: React.FC<NaranjoTreeProps> = ({
  size = 'md',
  animated = true,
  showFruits = true,
  fruitCount = 5,
  className = '',
}) => {
  const { width, height } = sizeMap[size];

  // Posiciones de las naranjas (máximo 8)
  const fruitPositions = [
    { cx: 35, cy: 35 },
    { cx: 65, cy: 30 },
    { cx: 50, cy: 50 },
    { cx: 30, cy: 55 },
    { cx: 70, cy: 55 },
    { cx: 45, cy: 40 },
    { cx: 55, cy: 60 },
    { cx: 40, cy: 65 },
  ].slice(0, fruitCount);

  const leafVariants: Variants = {
    initial: { scale: 0.95 },
    animate: {
      scale: [0.95, 1, 0.95],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  const fruitVariants: Variants = {
    initial: { scale: 0, opacity: 0 },
    animate: (i: number) => ({
      scale: 1,
      opacity: 1,
      transition: {
        delay: i * 0.2,
        duration: 0.5,
        ease: 'backOut',
      },
    }),
  };

  return (
    <svg
      viewBox="0 0 100 125"
      width={width}
      height={height}
      className={className}
      aria-label="Naranjo - Símbolo de crecimiento y paciencia"
    >
      {/* Raíces (sutiles, bajo tierra) */}
      <g opacity="0.3">
        <path
          d="M50 110 Q40 115 30 120"
          stroke="#7D5F48"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M50 110 Q55 118 65 122"
          stroke="#7D5F48"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M50 110 Q50 115 50 125"
          stroke="#7D5F48"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      </g>

      {/* Tronco */}
      <motion.path
        d="M45 110 Q44 95 46 80 Q48 70 50 70 Q52 70 54 80 Q56 95 55 110 Z"
        fill="url(#trunkGradient)"
        initial={{ scaleY: 0, originY: 1 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />

      {/* Rama izquierda */}
      <path
        d="M47 80 Q35 75 28 68"
        stroke="#7D5F48"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />

      {/* Rama derecha */}
      <path
        d="M53 80 Q65 75 72 68"
        stroke="#7D5F48"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />

      {/* Copa del árbol (follaje) */}
      <motion.g
        variants={animated ? leafVariants : undefined}
        initial="initial"
        animate={animated ? 'animate' : 'initial'}
      >
        {/* Capa de hojas trasera */}
        <ellipse cx="50" cy="45" rx="35" ry="30" fill="url(#leafGradientDark)" />

        {/* Capa de hojas frontal */}
        <ellipse cx="50" cy="42" rx="32" ry="27" fill="url(#leafGradient)" />

        {/* Highlights */}
        <ellipse cx="40" cy="35" rx="12" ry="10" fill="#86EFAC" opacity="0.5" />
        <ellipse cx="60" cy="38" rx="10" ry="8" fill="#86EFAC" opacity="0.4" />
      </motion.g>

      {/* Naranjas (frutos) */}
      {showFruits &&
        fruitPositions.map((pos, i) => (
          <motion.g
            key={i}
            custom={i}
            variants={animated ? fruitVariants : undefined}
            initial="initial"
            animate={animated ? 'animate' : { scale: 1, opacity: 1 }}
          >
            <circle cx={pos.cx} cy={pos.cy} r="6" fill="url(#orangeGradient)" />
            {/* Brillo */}
            <circle cx={pos.cx - 2} cy={pos.cy - 2} r="1.5" fill="#FED7AA" opacity="0.7" />
          </motion.g>
        ))}

      {/* Definiciones de gradientes */}
      <defs>
        <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9C7C62" />
          <stop offset="50%" stopColor="#7D5F48" />
          <stop offset="100%" stopColor="#5E4636" />
        </linearGradient>

        <linearGradient id="leafGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4ADE80" />
          <stop offset="100%" stopColor="#22C55E" />
        </linearGradient>

        <linearGradient id="leafGradientDark" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#16A34A" />
        </linearGradient>

        <radialGradient id="orangeGradient" cx="30%" cy="30%">
          <stop offset="0%" stopColor="#FDBA74" />
          <stop offset="50%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#F97316" />
        </radialGradient>
      </defs>
    </svg>
  );
};
