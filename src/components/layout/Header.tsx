import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { useIsReadOnly, useAppModeStore } from '../../store/useAppModeStore';
import { HeaderLogo, HeaderNav, HeaderActions, MobileMenu } from './header-components';

/**
 * Header principal de la aplicación
 *
 * Refactorizado en sub-componentes:
 * - HeaderLogo: Logo y nombre del tesoro
 * - HeaderNav: Navegación principal (desktop)
 * - HeaderActions: Botones de acción (tema, settings, logout)
 * - MobileMenu: Menú desplegable para móvil
 */
export const Header: React.FC = () => {
  const navigate = useNavigate();
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

  const handleToggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  const handleCloseMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 sticky top-0 z-30 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <HeaderLogo
              childName={user?.childName}
              childBirthDate={user?.childBirthDate}
            />

            <div className="flex items-center gap-2 sm:gap-4">
              <HeaderNav isReadOnly={isReadOnly} />

              <HeaderActions
                isReadOnly={isReadOnly}
                userName={user?.displayName}
                childName={user?.childName}
                mobileMenuOpen={mobileMenuOpen}
                onToggleMobileMenu={handleToggleMobileMenu}
                onLogout={handleLogout}
              />
            </div>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={mobileMenuOpen}
        isReadOnly={isReadOnly}
        userName={user?.displayName}
        childName={user?.childName}
        onClose={handleCloseMobileMenu}
        onLogout={handleLogout}
      />
    </>
  );
};
