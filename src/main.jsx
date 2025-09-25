// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './AuthContext.jsx' // Importe o AuthProvider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider> {/* Envolva o App com o AuthProvider */}
      <App />
    </AuthProvider>
  </React.StrictMode>,
)