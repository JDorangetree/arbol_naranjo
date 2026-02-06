import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/common'
import { initLogging } from './services/logging'

// Inicializar logging/Sentry antes de renderizar
initLogging()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary level="page">
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
