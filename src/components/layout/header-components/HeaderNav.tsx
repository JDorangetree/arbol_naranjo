import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  TrendingUp,
  BookHeart,
  Camera,
  FileText,
  Download,
  LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  showInReadOnly: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Mi Árbol', icon: Home, showInReadOnly: true },
  { to: '/investments', label: 'Sembrar', icon: TrendingUp, showInReadOnly: false },
  { to: '/story', label: 'Mi Historia', icon: BookHeart, showInReadOnly: true },
  { to: '/moments', label: 'Recuerdos', icon: Camera, showInReadOnly: true },
  { to: '/reports', label: 'Cosecha Anual', icon: FileText, showInReadOnly: false },
  { to: '/export', label: 'Guardar', icon: Download, showInReadOnly: false },
];

export const getFilteredNavItems = (isReadOnly: boolean): NavItem[] => {
  return NAV_ITEMS.filter(item => !isReadOnly || item.showInReadOnly);
};

interface HeaderNavProps {
  isReadOnly: boolean;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ isReadOnly }) => {
  const filteredItems = getFilteredNavItems(isReadOnly);

  return (
    <nav className="hidden lg:flex items-center gap-6">
      {filteredItems.map(item => (
        <NavLink key={item.to} to={item.to}>
          {item.label}
        </NavLink>
      ))}
    </nav>
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
          ? 'text-primary-500 dark:text-primary-400'
          : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
      }`}
    >
      {children}
    </Link>
  );
};
