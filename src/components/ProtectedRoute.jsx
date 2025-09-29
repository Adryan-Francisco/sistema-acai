// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function ProtectedRoute({ children }) {
  const { session, userRole, loading, fetchUserRole } = useAuth();
  const [roleLoading, setRoleLoading] = useState(false);

  // Buscar role apenas quando necessário
  useEffect(() => {
    if (session && userRole === null && !roleLoading) {
      setRoleLoading(true);
      fetchUserRole().finally(() => setRoleLoading(false));
    }
  }, [session, userRole, fetchUserRole, roleLoading]);

  // Enquanto ainda carregamos a sessão, evitamos redirecionar
  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>Carregando…</div>
    );
  }

  // 1. Se não há sessão, redireciona para a página de login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // 2. Se há sessão mas ainda estamos buscando a role, aguarda
  if (session && userRole === null && roleLoading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>Verificando permissões…</div>
    );
  }

  // 3. Se há sessão, mas a role não é 'admin', redireciona para a página inicial
  if (session && userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // 4. Se há sessão E a role é 'admin', permite o acesso
  return children;
}

export default ProtectedRoute;