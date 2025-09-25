// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

// Importação de todos os componentes de página
import HomePage from './components/HomePage';
import Login from './components/Login';
import SignUp from './components/SignUp'; // Página de Cadastro
import PainelAdmin from './components/PainelAdmin';
import MeusPedidos from './components/MeusPedidos';

// Importação dos componentes de proteção de rota
import ProtectedRoute from './components/ProtectedRoute'; // Para Admins
import AuthenticatedRoute from './components/AuthenticatedRoute'; // Para Clientes

import './App.css';

// Componente de Navegação separado para usar os hooks do React Router
function Navigation() {
  const { session, signOut, userRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/'); // Redireciona para a página inicial após o logout
  };

  return (
    <nav>
      {/* Mostra o link do Cardápio se não for admin */}
      {userRole !== 'admin' && (
        <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-active' : '')} end>
          Cardápio (Cliente)
        </NavLink>
      )}
      
      {/* Mostra o link "Meus Pedidos" se for um cliente logado */}
      {session && userRole === 'cliente' && (
        <NavLink to="/meus-pedidos" className={({ isActive }) => (isActive ? 'nav-active' : '')}>
          Meus Pedidos
        </NavLink>
      )}

      {/* Mostra o link do Painel se for um admin logado */}
      {session && userRole === 'admin' && (
        <NavLink to="/admin" className={({ isActive }) => (isActive ? 'nav-active' : '')}>
          Painel (Açaiteria)
        </NavLink>
      )}

      {/* Lógica para o botão de Login/Logout na direita */}
      <div style={{ marginLeft: 'auto' }}>
        {session ? (
          <button onClick={handleLogout} className="logout-button">Sair</button>
        ) : (
          <NavLink to="/login" className={({ isActive }) => (isActive ? 'nav-active' : '')}>
            Login
          </NavLink>
        )}
      </div>
    </nav>
  );
}

// Componente principal que define a estrutura de rotas
function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <div className="main-content">
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Rota Protegida para Administradores */}
          <Route
            path="/admin"
            element={ <ProtectedRoute> <PainelAdmin /> </ProtectedRoute> }
          />
          
          {/* Rota Protegida para Clientes Logados */}
          <Route
            path="/meus-pedidos"
            element={ <AuthenticatedRoute> <MeusPedidos /> </AuthenticatedRoute> }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
