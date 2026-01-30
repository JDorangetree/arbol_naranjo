import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';
import { MainLayout } from './components/layout';
import { Login, Register, ChildAccess } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Moments } from './pages/Moments';
import { AnnualReport } from './pages/Reports';
import { InstrumentSettings, AccessSettings } from './pages/Settings';
import { ExportPage } from './pages/Export';
import { StoryMode } from './pages/Story';

// Páginas placeholder para futuras implementaciones
const InvestmentsPage = () => (
  <div className="text-center py-12">
    <h2 className="text-2xl font-bold text-gray-900 mb-2">Inversiones</h2>
    <p className="text-gray-500">Próximamente: gestión detallada de inversiones</p>
  </div>
);

const HistoryPage = () => (
  <div className="text-center py-12">
    <h2 className="text-2xl font-bold text-gray-900 mb-2">Historial</h2>
    <p className="text-gray-500">Próximamente: historial completo de transacciones</p>
  </div>
);

function App() {
  const { initialize, isInitialized, user } = useAuthStore();

  useEffect(() => {
    const unsubscribe = initialize();
    return () => unsubscribe();
  }, [initialize]);

  // Mostrar loader mientras se inicializa la autenticación
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-growth-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Iniciando aplicación...</p>
        </div>
      </div>
    );
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
          <Route path="/investments" element={<InvestmentsPage />} />
          <Route path="/moments" element={<Moments />} />
          <Route path="/history" element={<HistoryPage />} />
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
