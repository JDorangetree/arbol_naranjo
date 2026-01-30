import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LogOut,
  User,
  Settings,
  BookOpen,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '../../store';
import { useIsReadOnly, useAppModeStore } from '../../store/useAppModeStore';
import { formatAge } from '../../utils';
import { NaranjoTree } from '../illustrations';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const isReadOnly = useIsReadOnly();
  const { setMode } = useAppModeStore();

  const handleLogout = async () => {
    // Si está en modo hijo, volver a modo padre
    if (isReadOnly) {
      setMode('parent');
      navigate('/login');
      return;
    }
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center justify-center"
            >
              <NaranjoTree size="sm" fruitCount={3} animated={false} />
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-gray-900">
                El Tesoro de {user?.childName || 'Tu Hijo'}
              </h1>
              {user?.childBirthDate && (
                <p className="text-xs text-gray-500">
                  {formatAge(user.childBirthDate)} cultivando futuro
                </p>
              )}
            </div>
          </Link>

          {/* Nav y acciones */}
          <div className="flex items-center gap-4">
            {/* Indicador modo hijo */}
            {isReadOnly && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Modo Lectura</span>
              </div>
            )}

            {/* Navegación principal - solo escritorio */}
            <nav className="hidden md:flex items-center gap-6">
              <NavLink to="/">Dashboard</NavLink>
              {!isReadOnly && <NavLink to="/investments">Inversiones</NavLink>}
              <NavLink to="/story">Historia</NavLink>
              <NavLink to="/moments">Momentos</NavLink>
              {!isReadOnly && <NavLink to="/reports">Reportes</NavLink>}
              {!isReadOnly && <NavLink to="/export">Exportar</NavLink>}
              <NavLink to="/history">Historial</NavLink>
            </nav>

            {/* Usuario y configuración */}
            <div className="flex items-center gap-2">
              {!isReadOnly && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {user?.displayName}
                  </span>
                </div>
              )}

              {isReadOnly && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-growth-50 rounded-full">
                  <span className="text-sm font-medium text-growth-700">
                    {user?.childName || 'Explorador'}
                  </span>
                </div>
              )}

              {!isReadOnly && (
                <>
                  <Link
                    to="/settings/access"
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    title="Configurar acceso del hijo"
                  >
                    <Shield className="w-5 h-5" />
                  </Link>

                  <Link
                    to="/settings/instruments"
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    title="Configurar instrumentos"
                  >
                    <Settings className="w-5 h-5" />
                  </Link>
                </>
              )}

              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                title={isReadOnly ? 'Salir' : 'Cerrar sesión'}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, children }) => {
  const isActive = window.location.pathname === to;

  return (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors ${
        isActive
          ? 'text-primary-500'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {children}
    </Link>
  );
};
