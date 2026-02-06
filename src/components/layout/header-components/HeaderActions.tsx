import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, User, Settings, Shield, BookOpen, Menu, X } from 'lucide-react';
import { ThemeToggle } from '../../common';

interface HeaderActionsProps {
  isReadOnly: boolean;
  userName?: string;
  childName?: string;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onLogout: () => void;
}

export const HeaderActions: React.FC<HeaderActionsProps> = ({
  isReadOnly,
  userName,
  childName,
  mobileMenuOpen,
  onToggleMobileMenu,
  onLogout,
}) => {
  return (
    <div className="flex items-center gap-2 sm:gap-4">
      {/* Indicador modo hijo */}
      <ReadOnlyBadge isReadOnly={isReadOnly} />

      {/* Usuario y configuración - escritorio */}
      <div className="hidden sm:flex items-center gap-2">
        <UserBadge isReadOnly={isReadOnly} userName={userName} childName={childName} />

        <ThemeToggle />

        {!isReadOnly && <SettingsLinks />}

        <LogoutButton isReadOnly={isReadOnly} onLogout={onLogout} />
      </div>

      {/* Toggle tema móvil */}
      <ThemeToggle className="sm:hidden" />

      {/* Botón menú móvil */}
      <MobileMenuButton isOpen={mobileMenuOpen} onToggle={onToggleMobileMenu} />
    </div>
  );
};

// Sub-componentes internos

const ReadOnlyBadge: React.FC<{ isReadOnly: boolean }> = ({ isReadOnly }) => {
  if (!isReadOnly) return null;

  return (
    <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-primary-100 text-primary-700 rounded-full text-xs sm:text-sm font-medium">
      <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      <span className="hidden xs:inline sm:inline">Lectura</span>
    </div>
  );
};

interface UserBadgeProps {
  isReadOnly: boolean;
  userName?: string;
  childName?: string;
}

const UserBadge: React.FC<UserBadgeProps> = ({ isReadOnly, userName, childName }) => {
  if (isReadOnly) {
    return (
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-growth-50 dark:bg-growth-900/30 rounded-full">
        <span className="text-sm font-medium text-growth-700 dark:text-growth-400">
          {childName || 'Explorador'}
        </span>
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-slate-800 rounded-full">
      <User className="w-4 h-4 text-gray-400 dark:text-slate-500" />
      <span className="text-sm font-medium text-gray-700 dark:text-slate-300 max-w-24 truncate">
        {userName}
      </span>
    </div>
  );
};

const SettingsLinks: React.FC = () => {
  const linkClasses = "p-2 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors";

  return (
    <>
      <Link to="/settings/access" className={linkClasses} title="Llave del Tesoro">
        <Shield className="w-5 h-5" />
      </Link>
      <Link to="/settings/instruments" className={linkClasses} title="Herramientas">
        <Settings className="w-5 h-5" />
      </Link>
    </>
  );
};

interface LogoutButtonProps {
  isReadOnly: boolean;
  onLogout: () => void;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ isReadOnly, onLogout }) => {
  return (
    <button
      onClick={onLogout}
      className="p-2 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
      title={isReadOnly ? 'Volver al inicio' : 'Hasta pronto'}
    >
      <LogOut className="w-5 h-5" />
    </button>
  );
};

interface MobileMenuButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({ isOpen, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="lg:hidden p-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors touch-active"
      aria-label="Menú"
      aria-expanded={isOpen}
    >
      {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
    </button>
  );
};
