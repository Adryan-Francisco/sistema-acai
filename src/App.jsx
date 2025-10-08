// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import NotificationProvider from './components/NotificationToast';

// Importação de todos os componentes de página
import HomePage from './components/HomePage';
import Login from './components/Login';
import SignUp from './components/SignUp'; // Página de Cadastro
import EmailConfirmado from './components/EmailConfirmado'; // Página de confirmação de email
import PainelAdmin from './components/PainelAdmin';
import CatalogoAdmin from './components/CatalogoAdmin';
import MeusPedidos from './components/MeusPedidos';
import ResgatarAcai from './components/ResgatarAcai';
import DebugEnv from './components/DebugEnv';

// Importação dos componentes de proteção de rota
import ProtectedRoute from './components/ProtectedRoute'; // Para Admins
import AuthenticatedRoute from './components/AuthenticatedRoute'; // Para Clientes

import './App.css';

// Componente de Navegação separado para usar os hooks do React Router
function Navigation() {
  const { session, signOut, userRole } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      navigate('/'); // Redireciona para a página inicial após o logout
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setIsLoggingOut(false);
      setIsMobileMenuOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="modern-nav">
      <div className="nav-container">
        {/* Logo/Brand */}
        <div className="nav-brand">
          <span className="brand-icon">🍇</span>
          <span className="brand-text">AçaíExpress</span>
        </div>

        {/* Desktop Menu */}
        <div className="nav-menu">
          {/* Mostra o link do Cardápio se não for admin */}
          {userRole !== 'admin' && (
            <NavLink 
              to="/" 
              className={({ isActive }) => `nav-link ${isActive ? 'nav-active' : ''}`} 
              end
              onClick={closeMobileMenu}
            >
              <span className="nav-icon">🏠</span>
              <span className="nav-text">Cardápio</span>
            </NavLink>
          )}
          
          {/* Mostra o link "Meus Pedidos" se for um cliente logado */}
          {session && userRole === 'cliente' && (
            <NavLink 
              to="/meus-pedidos" 
              className={({ isActive }) => `nav-link ${isActive ? 'nav-active' : ''}`}
              onClick={closeMobileMenu}
            >
              <span className="nav-icon">📋</span>
              <span className="nav-text">Meus Pedidos</span>
            </NavLink>
          )}

          {/* Mostra o link do Painel se for um admin logado */}
          {session && userRole === 'admin' && (
            <>
              <NavLink 
                to="/admin" 
                className={({ isActive }) => `nav-link ${isActive ? 'nav-active' : ''}`}
                onClick={closeMobileMenu}
              >
                <span className="nav-icon">📊</span>
                <span className="nav-text">Pedidos</span>
              </NavLink>
              <NavLink 
                to="/admin/catalogo" 
                className={({ isActive }) => `nav-link ${isActive ? 'nav-active' : ''}`}
                onClick={closeMobileMenu}
              >
                <span className="nav-icon">�️</span>
                <span className="nav-text">Catálogo</span>
              </NavLink>
            </>
          )}
        </div>

        {/* User Actions */}
        <div className="nav-actions">
          {session ? (
            <div className="user-menu">
              <span className="user-info">
                <span className="user-icon">👤</span>
                <span className="user-name">{session.user?.email?.split('@')[0]}</span>
              </span>
              <button 
                onClick={handleLogout} 
                className={`logout-button ${isLoggingOut ? 'loading' : ''}`}
                disabled={isLoggingOut}
              >
                {!isLoggingOut && <span className="nav-icon">🚪</span>}
                <span className="nav-text">Sair</span>
              </button>
            </div>
          ) : (
            <NavLink 
              to="/login" 
              className={({ isActive }) => `nav-link login-link ${isActive ? 'nav-active' : ''}`}
              onClick={closeMobileMenu}
            >
              <span className="nav-icon">🔐</span>
              <span className="nav-text">Entrar</span>
            </NavLink>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          <span className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMobileMenu}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            {userRole !== 'admin' && (
              <NavLink 
                to="/" 
                className={({ isActive }) => `mobile-nav-link ${isActive ? 'nav-active' : ''}`} 
                end
                onClick={closeMobileMenu}
              >
                <span className="nav-icon">🏠</span>
                <span className="nav-text">Cardápio</span>
              </NavLink>
            )}
            
            {session && userRole === 'cliente' && (
              <NavLink 
                to="/meus-pedidos" 
                className={({ isActive }) => `mobile-nav-link ${isActive ? 'nav-active' : ''}`}
                onClick={closeMobileMenu}
              >
                <span className="nav-icon">📋</span>
                <span className="nav-text">Meus Pedidos</span>
              </NavLink>
            )}

            {session && userRole === 'admin' && (
              <>
                <NavLink 
                  to="/admin" 
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'nav-active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <span className="nav-icon">📊</span>
                  <span className="nav-text">Pedidos</span>
                </NavLink>
                <NavLink 
                  to="/admin/catalogo" 
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'nav-active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <span className="nav-icon">🛠️</span>
                  <span className="nav-text">Catálogo</span>
                </NavLink>
              </>
            )}

            <div className="mobile-user-section">
              {session ? (
                <>
                  <div className="mobile-user-info">
                    <span className="user-icon">👤</span>
                    <span className="user-name">{session.user?.email?.split('@')[0]}</span>
                  </div>
                  <button 
                    onClick={handleLogout} 
                    className={`mobile-logout-button ${isLoggingOut ? 'loading' : ''}`}
                    disabled={isLoggingOut}
                  >
                    {!isLoggingOut && <span className="nav-icon">🚪</span>}
                    <span className="nav-text">Sair</span>
                  </button>
                </>
              ) : (
                <NavLink 
                  to="/login" 
                  className={({ isActive }) => `mobile-nav-link login-link ${isActive ? 'nav-active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <span className="nav-icon">🔐</span>
                  <span className="nav-text">Entrar</span>
                </NavLink>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

// Componente principal que define a estrutura de rotas
function App() {
  const envMissing = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

  return (
    <NotificationProvider>
      <BrowserRouter basename="/sistema-acai">
      {envMissing && (
        <div className="env-warning">
          Supabase não configurado. Crie o arquivo .env com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (veja .env.example) e reinicie o servidor.
        </div>
      )}
      {/* <Navigation /> */}
      <div className="main-content">
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/email-confirmado" element={<EmailConfirmado />} />
          <Route path="/_debug" element={<DebugEnv />} />

          {/* Rota Protegida para Administradores */}
          <Route
            path="/admin"
            element={ <ProtectedRoute> <PainelAdmin /> </ProtectedRoute> }
          />
          <Route
            path="/admin/catalogo"
            element={ <ProtectedRoute> <CatalogoAdmin /> </ProtectedRoute> }
          />
          
          {/* Rota Protegida para Clientes Logados */}
          <Route
            path="/meus-pedidos"
            element={ <AuthenticatedRoute> <MeusPedidos /> </AuthenticatedRoute> }
          />
          <Route
            path="/resgatar-acai"
            element={ <AuthenticatedRoute> <ResgatarAcai /> </AuthenticatedRoute> }
          />
        </Routes>
      </div>
      </BrowserRouter>
    </NotificationProvider>
  );
}

export default App;
