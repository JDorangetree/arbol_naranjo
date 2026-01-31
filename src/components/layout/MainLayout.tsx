import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Header } from './Header';
import { useAuthStore } from '../../store';

export const MainLayout: React.FC = () => {
  const { user, isInitialized, isLoading } = useAuthStore();

  // Mostrar loader mientras se inicializa
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-growth-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-slate-400">Cargando...</p>
        </div>
      </div>
    );
  }

  // Redirigir a login si no hay usuario
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
      <Header />
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pb-20 sm:pb-8">
        <Outlet />
      </main>
    </div>
  );
};
