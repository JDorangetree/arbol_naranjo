import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';
import { MainLayout } from './components/layout';
import { LoadingSpinner } from './components/common';
import { Login, Register, ChildAccess } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Investments } from './pages/Investments';
import { Moments } from './pages/Moments';
import { AnnualReport } from './pages/Reports';
import { InstrumentSettings, AccessSettings } from './pages/Settings';
import { ExportPage } from './pages/Export';
import { StoryMode } from './pages/Story';

function App() {
  const { initialize, isInitialized, user } = useAuthStore();

  useEffect(() => {
    const unsubscribe = initialize();
    return () => unsubscribe();
  }, [initialize]);

  // Mostrar loader mientras se inicializa la autenticación
  if (!isInitialized) {
    return <LoadingSpinner size="lg" message="Iniciando aplicación..." fullScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/" replace /> : <Register />}
        />
        <Route
          path="/child-access"
          element={<ChildAccess />}
        />

        {/* Rutas protegidas */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/investments" element={<Investments />} />
          <Route path="/moments" element={<Moments />} />
          <Route path="/story" element={<StoryMode />} />
          <Route path="/reports" element={<AnnualReport />} />
          <Route path="/export" element={<ExportPage />} />
          <Route path="/settings/instruments" element={<InstrumentSettings />} />
          <Route path="/settings/access" element={<AccessSettings />} />
        </Route>

        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
