// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function ProtectedRoute({ children }) {
  const { session, userRole } = useAuth();

  // 1. Se não há sessão, redireciona para a página de login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // 2. Se há sessão, mas a role não é 'admin', redireciona para a página inicial
  if (session && userRole !== 'admin') {
    // Você pode criar uma página "Não Autorizado" ou simplesmente redirecionar
    alert('Você não tem permissão para acessar esta página.');
    return <Navigate to="/" replace />;
  }

  // 3. Se há sessão E a role é 'admin', permite o acesso
  return children;
}

export default ProtectedRoute;