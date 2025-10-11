// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './AuthContext.jsx' // Importe o AuthProvider
import { registerServiceWorker } from './utils/pushNotifications.js'

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    registerServiceWorker().then(registration => {
      if (registration) {
        console.log('✅ PWA pronto! Service Worker registrado');
      }
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider> {/* Envolva o App com o AuthProvider */}
      <App />
    </AuthProvider>
  </React.StrictMode>,
)