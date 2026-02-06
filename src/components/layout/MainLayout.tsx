import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Header } from './Header';
import { useAuthStore } from '../../store';
import { ErrorBoundary, LoadingSpinner } from '../common';

export const MainLayout: React.FC = () => {
  const { user, isInitialized, isLoading } = useAuthStore();

  // Mostrar loader mientras se inicializa
  if (!isInitialized || isLoading) {
    return <LoadingSpinner size="lg" message="Cargando..." fullScreen />;
  }

  // Redirigir a login si no hay usuario
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
      <Header />
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pb-20 sm:pb-8">
        <ErrorBoundary level="section">
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
};
