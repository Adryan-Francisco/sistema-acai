import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx'; // Caminho de importação corrigido

// Protege rotas para QUALQUER usuário logado (cliente ou admin)
function AuthenticatedRoute({ children }) {
  const { session, loading } = useAuth();

  // Enquanto verifica a sessão, não renderiza nada para evitar redirecionamentos errados
  if (loading) {
    return null; // Ou um spinner de carregamento
  }

  // Se não houver sessão (e não estiver mais carregando), redireciona para a página de login
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  
  // Se houver sessão, permite o acesso à página
  return children;
}

export default AuthenticatedRoute;

