/**
 * Ilustración de la Torre Protectora
 *
 * Representa: protección, estabilidad, refugio, estructura, firmeza, legado.
 * "No se mueve. No se improvisa. Sostiene."
 */

import React from 'react';
import { motion, Variants } from 'framer-motion';

interface ProtectorTowerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  showFlag?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { width: 60, height: 100 },
  md: { width: 90, height: 150 },
  lg: { width: 135, height: 225 },
  xl: { width: 180, height: 300 },
};

export const ProtectorTower: React.FC<ProtectorTowerProps> = ({
  size = 'md',
  animated = true,
  showFlag = true,
  className = '',
}) => {
  const { width, height } = sizeMap[size];

  const flagVariants: Variants = {
    initial: { rotate: 0 },
    animate: {
      rotate: [0, 5, -3, 5, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
  };

  const buildVariants: Variants = {
    initial: { scaleY: 0, originY: 1 },
    animate: {
      scaleY: 1,
      transition: {
        duration: 1.2,
        ease: 'easeOut' as const,
      },
    },
  };

  return (
    <svg
      viewBox="0 0 60 100"
      width={width}
      height={height}
      className={className}
      aria-label="Torre - Símbolo de protección y estabilidad"
    >
      {/* Sombra base */}
      <ellipse cx="30" cy="98" rx="20" ry="3" fill="#292524" opacity="0.2" />

      {/* Cuerpo principal de la torre */}
      <motion.g
        variants={animated ? buildVariants : undefined}
        initial="initial"
        animate={animated ? 'animate' : { scaleY: 1 }}
      >
        {/* Base de la torre */}
        <path
          d="M12 100 L12 85 L48 85 L48 100 Z"
          fill="url(#stoneGradient)"
        />

        {/* Cuerpo principal */}
        <path
          d="M15 85 L15 40 L45 40 L45 85 Z"
          fill="url(#stoneGradient)"
        />

        {/* Parte superior ensanchada */}
        <path
          d="M10 40 L10 32 L50 32 L50 40 Z"
          fill="url(#stoneGradientDark)"
        />

        {/* Almenas (merlones) */}
        <rect x="10" y="25" width="8" height="7" fill="url(#stoneGradient)" />
        <rect x="22" y="25" width="8" height="7" fill="url(#stoneGradient)" />
        <rect x="34" y="25" width="8" height="7" fill="url(#stoneGradient)" />
        <rect x="46" y="25" width="4" height="7" fill="url(#stoneGradient)" />

        {/* Líneas de piedra (textura) */}
        <line x1="15" y1="50" x2="45" y2="50" stroke="#A8A29E" strokeWidth="0.5" opacity="0.5" />
        <line x1="15" y1="60" x2="45" y2="60" stroke="#A8A29E" strokeWidth="0.5" opacity="0.5" />
        <line x1="15" y1="70" x2="45" y2="70" stroke="#A8A29E" strokeWidth="0.5" opacity="0.5" />
        <line x1="15" y1="80" x2="45" y2="80" stroke="#A8A29E" strokeWidth="0.5" opacity="0.5" />

        {/* Ventana superior (arco) */}
        <path
          d="M26 45 Q30 38 34 45 L34 52 L26 52 Z"
          fill="#44403C"
        />

        {/* Puerta principal */}
        <path
          d="M23 100 L23 72 Q30 65 37 72 L37 100 Z"
          fill="#44403C"
        />

        {/* Detalles dorados de la puerta */}
        <circle cx="25" cy="85" r="1.5" fill="#F59E0B" />
        <circle cx="35" cy="85" r="1.5" fill="#F59E0B" />

        {/* Detalle dorado superior */}
        <rect x="28" y="32" width="4" height="5" fill="#F59E0B" rx="0.5" />
      </motion.g>

      {/* Bandera */}
      {showFlag && (
        <motion.g
          variants={animated ? flagVariants : undefined}
          initial="initial"
          animate={animated ? 'animate' : 'initial'}
          style={{ originX: '30px', originY: '25px' }}
        >
          {/* Mástil */}
          <line x1="30" y1="25" x2="30" y2="5" stroke="#B45309" strokeWidth="2" />

          {/* Bandera */}
          <path
            d="M30 5 L30 15 L42 10 Z"
            fill="url(#flagGradient)"
          />
        </motion.g>
      )}

      {/* Definiciones de gradientes */}
      <defs>
        <linearGradient id="stoneGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D6D3D1" />
          <stop offset="50%" stopColor="#A8A29E" />
          <stop offset="100%" stopColor="#78716C" />
        </linearGradient>

        <linearGradient id="stoneGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A8A29E" />
          <stop offset="100%" stopColor="#78716C" />
        </linearGradient>

        <linearGradient id="flagGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
      </defs>
    </svg>
  );
};
