import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { NaranjoTree } from '../../illustrations';
import { formatAge } from '../../../utils';

interface HeaderLogoProps {
  childName?: string;
  childBirthDate?: Date;
}

export const HeaderLogo: React.FC<HeaderLogoProps> = ({ childName, childBirthDate }) => {
  return (
    <Link to="/" className="flex items-center gap-2 sm:gap-3">
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="flex items-center justify-center"
      >
        <NaranjoTree size="sm" fruitCount={3} animated={false} />
      </motion.div>
      <div className="hidden sm:block">
        <h1 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
          El Tesoro de {childName || 'Tu Hijo'}
        </h1>
        {childBirthDate && (
          <p className="text-xs text-gray-500 dark:text-slate-400">
            {formatAge(childBirthDate)} cultivando futuro
          </p>
        )}
      </div>
    </Link>
  );
};
