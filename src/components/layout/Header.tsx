import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut,
  User,
  Settings,
  BookOpen,
  Shield,
  Menu,
  X,
  Home,
  TrendingUp,
  BookHeart,
  Camera,
  FileText,
  Download,
  History,
} from 'lucide-react';
import { useAuthStore } from '../../store';
import { useIsReadOnly, useAppModeStore } from '../../store/useAppModeStore';
import { formatAge } from '../../utils';
import { NaranjoTree } from '../illustrations';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const isReadOnly = useIsReadOnly();
  const { setMode } = useAppModeStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    if (isReadOnly) {
      setMode('parent');
      navigate('/login');
      return;
    }
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: Home, showInReadOnly: true },
    { to: '/investments', label: 'Inversiones', icon: TrendingUp, showInReadOnly: false },
    { to: '/story', label: 'Historia', icon: BookHeart, showInReadOnly: true },
    { to: '/moments', label: 'Momentos', icon: Camera, showInReadOnly: true },
    { to: '/reports', label: 'Reportes', icon: FileText, showInReadOnly: false },
    { to: '/export', label: 'Exportar', icon: Download, showInReadOnly: false },
    { to: '/history', label: 'Historial', icon: History, showInReadOnly: true },
  ];

  const filteredNavItems = navItems.filter(item => !isReadOnly || item.showInReadOnly);

  return (
    <>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center justify-center"
              >
                <NaranjoTree size="sm" fruitCount={3} animated={false} />
              </motion.div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-gray-900 text-sm sm:text-base">
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
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Indicador modo hijo */}
              {isReadOnly && (
                <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-primary-100 text-primary-700 rounded-full text-xs sm:text-sm font-medium">
                  <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline sm:inline">Lectura</span>
                </div>
              )}

              {/* Navegación principal - solo escritorio */}
              <nav className="hidden lg:flex items-center gap-6">
                {filteredNavItems.map(item => (
                  <NavLink key={item.to} to={item.to}>{item.label}</NavLink>
                ))}
              </nav>

              {/* Usuario y configuración - escritorio */}
              <div className="hidden sm:flex items-center gap-2">
                {!isReadOnly && (
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 max-w-24 truncate">
                      {user?.displayName}
                    </span>
                  </div>
                )}

                {isReadOnly && (
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-growth-50 rounded-full">
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

              {/* Botón menú móvil */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors touch-active"
                aria-label="Menú"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Menú móvil */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Panel del menú */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-white shadow-xl z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {isReadOnly ? user?.childName : user?.displayName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {isReadOnly ? 'Modo Lectura' : 'Modo Padre'}
                    </p>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <nav className="p-2">
                {filteredNavItems.map(item => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors touch-active ${
                        isActive
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {!isReadOnly && (
                <div className="p-2 border-t border-gray-100">
                  <Link
                    to="/settings/access"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors touch-active"
                  >
                    <Shield className="w-5 h-5" />
                    <span className="font-medium">Acceso del Hijo</span>
                  </Link>
                  <Link
                    to="/settings/instruments"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors touch-active"
                  >
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">Configuración</span>
                  </Link>
                </div>
              )}

              <div className="p-2 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors touch-active"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">{isReadOnly ? 'Salir' : 'Cerrar Sesión'}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

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
