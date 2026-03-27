import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import './index.css'
import App from './App.jsx'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  enabled: !!import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.2, // 20% des transactions pour les perfs
  replaysOnErrorSampleRate: 1.0, // 100% des sessions avec erreur
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
