// src/components/HomePage.jsx
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import Cardapio from './Cardapio_v2'; // ✅ Usando novo cardápio moderno

function HomePage() {
  const { userRole, loading, session, fetchUserRole } = useAuth();

  // Se há sessão mas não há role, buscar a role
  useEffect(() => {
    if (session && userRole === null) {
      fetchUserRole();
    }
  }, [session, userRole, fetchUserRole]);

  // Enquanto o AuthContext verifica a sessão, mostramos uma tela de carregamento
  // para evitar um "flash" da tela errada.
  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <h2 className="loading-text animate-pulse">Verificando sessão...</h2>
      </div>
    );
  }

  // Se há sessão mas ainda não temos a role, aguardamos
  if (session && userRole === null) {
    return (
      <div className="page-loading">
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <h2 className="loading-text animate-fadeInUp">Carregando dados do usuário...</h2>
      </div>
    );
  }

  // Se o usuário estiver logado E tiver a permissão de 'admin',
  // redirecionamos para o painel.
  if (session && userRole === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  
  // Para todos os outros casos (usuário não logado, ou logado como 'cliente'),
  // mostramos o cardápio normal.
  return <Cardapio />;
}

export default HomePage;