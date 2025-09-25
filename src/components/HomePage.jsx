// src/components/HomePage.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import Cardapio from './Cardapio';

function HomePage() {
  const { userRole, loading, session } = useAuth();

  // Enquanto o AuthContext verifica a sessão, mostramos uma tela de carregamento
  // para evitar um "flash" da tela errada.
  if (loading) {
    return (
      <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2>Verificando sessão...</h2>
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