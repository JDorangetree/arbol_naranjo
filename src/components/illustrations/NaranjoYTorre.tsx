/**
 * Ilustración Combinada: El Naranjo y la Torre
 *
 * "Un árbol que crece protegido por una torre.
 *  No para encerrarlo. Sino para darle tiempo."
 *
 * El Naranjo crece con el tiempo.
 * La Torre no lo controla, lo resguarda.
 * El fruto no se exige, aparece.
 * La torre no produce, sostiene.
 */

import React from 'react';
import { motion, Variants } from 'framer-motion';

interface NaranjoYTorreProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  fruitCount?: number;
  className?: string;
}

const sizeMap = {
  sm: { width: 150, height: 120 },
  md: { width: 250, height: 200 },
  lg: { width: 375, height: 300 },
  xl: { width: 500, height: 400 },
};

export const NaranjoYTorre: React.FC<NaranjoYTorreProps> = ({
  size = 'md',
  animated = true,
  fruitCount = 5,
  className = '',
}) => {
  const { width, height } = sizeMap[size];

  // Posiciones de las naranjas
  const fruitPositions = [
    { cx: 95, cy: 45 },
    { cx: 115, cy: 40 },
    { cx: 105, cy: 55 },
    { cx: 88, cy: 58 },
    { cx: 120, cy: 55 },
    { cx: 100, cy: 48 },
    { cx: 110, cy: 62 },
  ].slice(0, fruitCount);

  const containerVariants: Variants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const towerVariants: Variants = {
    initial: { scaleY: 0, originY: 1 },
    animate: {
      scaleY: 1,
      transition: { duration: 1, ease: 'easeOut' as const },
    },
  };

  const treeVariants: Variants = {
    initial: { scale: 0, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.8, delay: 0.5, ease: 'backOut' as const },
    },
  };

  const leafBreathVariants: Variants = {
    initial: { scale: 0.97 },
    animate: {
      scale: [0.97, 1, 0.97],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
  };

  const fruitVariants: Variants = {
    initial: { scale: 0, opacity: 0 },
    animate: (i: number) => ({
      scale: 1,
      opacity: 1,
      transition: {
        delay: 1 + i * 0.15,
        duration: 0.4,
        ease: 'backOut' as const,
      },
    }),
  };

  const flagVariants: Variants = {
    initial: { rotate: 0 },
    animate: {
      rotate: [0, 4, -2, 4, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
  };

  return (
    <motion.svg
      viewBox="0 0 180 145"
      width={width}
      height={height}
      className={className}
      variants={containerVariants}
      initial="initial"
      animate={animated ? 'animate' : 'initial'}
      aria-label="El Naranjo protegido por la Torre - Símbolo del patrimonio familiar"
    >
      {/* Suelo / Base */}
      <ellipse cx="90" cy="140" rx="80" ry="6" fill="#E8DFD3" opacity="0.6" />

      {/* === TORRE (izquierda) === */}
      <motion.g variants={animated ? towerVariants : undefined}>
        {/* Sombra de la torre */}
        <ellipse cx="35" cy="138" rx="18" ry="3" fill="#292524" opacity="0.15" />

        {/* Base */}
        <path d="M15 140 L15 125 L55 125 L55 140 Z" fill="url(#stoneGrad)" />

        {/* Cuerpo */}
        <path d="M18 125 L18 65 L52 65 L52 125 Z" fill="url(#stoneGrad)" />

        {/* Parte superior */}
        <path d="M12 65 L12 55 L58 55 L58 65 Z" fill="url(#stoneGradDark)" />

        {/* Almenas */}
        <rect x="12" y="47" width="9" height="8" fill="url(#stoneGrad)" />
        <rect x="25" y="47" width="9" height="8" fill="url(#stoneGrad)" />
        <rect x="38" y="47" width="9" height="8" fill="url(#stoneGrad)" />
        <rect x="51" y="47" width="7" height="8" fill="url(#stoneGrad)" />

        {/* Líneas de piedra */}
        <line x1="18" y1="80" x2="52" y2="80" stroke="#A8A29E" strokeWidth="0.5" opacity="0.4" />
        <line x1="18" y1="95" x2="52" y2="95" stroke="#A8A29E" strokeWidth="0.5" opacity="0.4" />
        <line x1="18" y1="110" x2="52" y2="110" stroke="#A8A29E" strokeWidth="0.5" opacity="0.4" />

        {/* Ventana */}
        <path d="M30 70 Q35 62 40 70 L40 80 L30 80 Z" fill="#44403C" />

        {/* Puerta */}
        <path d="M27 140 L27 112 Q35 104 43 112 L43 140 Z" fill="#44403C" />

        {/* Detalles dorados */}
        <circle cx="30" cy="125" r="1.5" fill="#F59E0B" />
        <circle cx="40" cy="125" r="1.5" fill="#F59E0B" />
        <rect x="33" y="55" width="4" height="6" fill="#F59E0B" rx="0.5" />

        {/* Bandera */}
        <motion.g
          variants={animated ? flagVariants : undefined}
          style={{ originX: '35px', originY: '47px' }}
        >
          <line x1="35" y1="47" x2="35" y2="25" stroke="#B45309" strokeWidth="2" />
          <path d="M35 25 L35 37 L50 31 Z" fill="url(#flagGrad)" />
        </motion.g>
      </motion.g>

      {/* === NARANJO (derecha, protegido) === */}
      <motion.g variants={animated ? treeVariants : undefined}>
        {/* Sombra del árbol */}
        <ellipse cx="105" cy="138" rx="30" ry="4" fill="#166534" opacity="0.15" />

        {/* Raíces sutiles */}
        <g opacity="0.25">
          <path d="M105 130 Q95 135 85 140" stroke="#7D5F48" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M105 130 Q110 138 120 142" stroke="#7D5F48" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>

        {/* Tronco */}
        <path
          d="M100 130 Q99 115 101 100 Q103 92 105 92 Q107 92 109 100 Q111 115 110 130 Z"
          fill="url(#trunkGrad)"
        />

        {/* Ramas */}
        <path d="M102 100 Q88 95 78 88" stroke="#7D5F48" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M108 100 Q122 95 132 88" stroke="#7D5F48" strokeWidth="4" fill="none" strokeLinecap="round" />

        {/* Copa (follaje) */}
        <motion.g
          variants={animated ? leafBreathVariants : undefined}
          initial="initial"
          animate={animated ? 'animate' : 'initial'}
        >
          <ellipse cx="105" cy="55" rx="40" ry="35" fill="url(#leafGradDark)" />
          <ellipse cx="105" cy="52" rx="36" ry="32" fill="url(#leafGrad)" />
          <ellipse cx="92" cy="42" rx="14" ry="12" fill="#86EFAC" opacity="0.45" />
          <ellipse cx="118" cy="48" rx="12" ry="10" fill="#86EFAC" opacity="0.35" />
        </motion.g>

        {/* Naranjas */}
        {fruitPositions.map((pos, i) => (
          <motion.g
            key={i}
            custom={i}
            variants={animated ? fruitVariants : undefined}
            initial="initial"
            animate={animated ? 'animate' : { scale: 1, opacity: 1 }}
          >
            <circle cx={pos.cx} cy={pos.cy} r="7" fill="url(#orangeGrad)" />
            <circle cx={pos.cx - 2} cy={pos.cy - 2} r="2" fill="#FED7AA" opacity="0.6" />
          </motion.g>
        ))}
      </motion.g>

      {/* Conexión sutil: sombra de la torre cubre parte del árbol (protección) */}
      <path
        d="M55 140 Q70 135 85 140"
        stroke="#78716C"
        strokeWidth="1"
        fill="none"
        opacity="0.1"
        strokeDasharray="3,3"
      />

      {/* Gradientes */}
      <defs>
        <linearGradient id="stoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D6D3D1" />
          <stop offset="50%" stopColor="#A8A29E" />
          <stop offset="100%" stopColor="#78716C" />
        </linearGradient>

        <linearGradient id="stoneGradDark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A8A29E" />
          <stop offset="100%" stopColor="#78716C" />
        </linearGradient>

        <linearGradient id="flagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>

        <linearGradient id="trunkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9C7C62" />
          <stop offset="50%" stopColor="#7D5F48" />
          <stop offset="100%" stopColor="#5E4636" />
        </linearGradient>

        <linearGradient id="leafGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4ADE80" />
          <stop offset="100%" stopColor="#22C55E" />
        </linearGradient>

        <linearGradient id="leafGradDark" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#16A34A" />
        </linearGradient>

        <radialGradient id="orangeGrad" cx="30%" cy="30%">
          <stop offset="0%" stopColor="#FDBA74" />
          <stop offset="50%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#F97316" />
        </radialGradient>
      </defs>
    </motion.svg>
  );
};
