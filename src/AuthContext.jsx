import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from './supabaseClient.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setupAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);

        if (initialSession) {
          const { data, error } = await supabase.rpc('get_user_role');
          if (error) throw error;
          setUserRole(data);
        }
      } catch (error) {
        console.error("Erro na configuração inicial da autenticação:", error);
        setSession(null);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    setupAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        if (newSession) {
          try {
            const { data, error } = await supabase.rpc('get_user_role');
            if (error) throw error;
            setUserRole(data);
          } catch (error) {
            console.error("Erro ao buscar role na mudança de estado:", error);
            setUserRole(null);
          }
        } else {
          setUserRole(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    session,
    user: session?.user,
    userRole,
    signOut: () => supabase.auth.signOut(),
    loading,
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a1a2e', color: 'white' }}>
        <h2>A carregar Aplicação...</h2>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
