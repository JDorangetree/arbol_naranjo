import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogOut, Settings, Shield } from 'lucide-react';
import { NavItem, getFilteredNavItems } from './HeaderNav';

interface MobileMenuProps {
  isOpen: boolean;
  isReadOnly: boolean;
  userName?: string;
  childName?: string;
  onClose: () => void;
  onLogout: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  isReadOnly,
  userName,
  childName,
  onClose,
  onLogout,
}) => {
  const location = useLocation();
  const filteredItems = getFilteredNavItems(isReadOnly);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40 lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel del menú */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="fixed top-0 right-0 bottom-0 w-72 bg-white dark:bg-slate-900 shadow-xl z-50 lg:hidden overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
          >
            {/* Header del menú */}
            <MobileMenuHeader
              isReadOnly={isReadOnly}
              userName={userName}
              childName={childName}
              onClose={onClose}
            />

            {/* Navegación principal */}
            <nav className="p-2" aria-label="Navegación principal">
              {filteredItems.map(item => (
                <MobileNavLink
                  key={item.to}
                  item={item}
                  isActive={location.pathname === item.to}
                  onClose={onClose}
                />
              ))}
            </nav>

            {/* Enlaces de configuración (solo padres) */}
            {!isReadOnly && <MobileSettingsLinks onClose={onClose} />}

            {/* Botón de salir */}
            <MobileLogoutSection isReadOnly={isReadOnly} onLogout={onLogout} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Sub-componentes del menú móvil

interface MobileMenuHeaderProps {
  isReadOnly: boolean;
  userName?: string;
  childName?: string;
  onClose: () => void;
}

const MobileMenuHeader: React.FC<MobileMenuHeaderProps> = ({
  isReadOnly,
  userName,
  childName,
  onClose,
}) => {
  return (
    <div className="p-4 border-b border-gray-100 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">
            {isReadOnly ? childName : userName}
          </p>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {isReadOnly ? 'Modo Lectura' : 'Modo Padre'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full"
          aria-label="Cerrar menú"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

interface MobileNavLinkProps {
  item: NavItem;
  isActive: boolean;
  onClose: () => void;
}

const MobileNavLink: React.FC<MobileNavLinkProps> = ({ item, isActive, onClose }) => {
  const Icon = item.icon;

  return (
    <Link
      to={item.to}
      onClick={onClose}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors touch-active ${
        isActive
          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
          : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className="w-5 h-5" aria-hidden="true" />
      <span className="font-medium">{item.label}</span>
    </Link>
  );
};

interface MobileSettingsLinksProps {
  onClose: () => void;
}

const MobileSettingsLinks: React.FC<MobileSettingsLinksProps> = ({ onClose }) => {
  const linkClasses = "flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors touch-active";

  return (
    <div className="p-2 border-t border-gray-100 dark:border-slate-800">
      <Link to="/settings/access" onClick={onClose} className={linkClasses}>
        <Shield className="w-5 h-5" aria-hidden="true" />
        <span className="font-medium">Llave del Tesoro</span>
      </Link>
      <Link to="/settings/instruments" onClick={onClose} className={linkClasses}>
        <Settings className="w-5 h-5" aria-hidden="true" />
        <span className="font-medium">Herramientas</span>
      </Link>
    </div>
  );
};

interface MobileLogoutSectionProps {
  isReadOnly: boolean;
  onLogout: () => void;
}

const MobileLogoutSection: React.FC<MobileLogoutSectionProps> = ({ isReadOnly, onLogout }) => {
  return (
    <div className="p-2 border-t border-gray-100 dark:border-slate-800">
      <button
        onClick={onLogout}
        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors touch-active"
      >
        <LogOut className="w-5 h-5" aria-hidden="true" />
        <span className="font-medium">{isReadOnly ? 'Volver al inicio' : 'Hasta pronto'}</span>
      </button>
    </div>
  );
};
