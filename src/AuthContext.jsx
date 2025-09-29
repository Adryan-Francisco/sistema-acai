import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase, isSupabaseConfigured } from './supabaseClient.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setupAuth = async () => {
      // Se Supabase não está configurado, não bloqueia a UI
      if (!isSupabaseConfigured) {
        setSession(null);
        setUserRole(null);
        setLoading(false);
        return;
      }

      let isMounted = true;
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (!isMounted) return;
        setSession(initialSession);

        if (initialSession) {
          const { data, error } = await supabase.rpc('get_user_role');
          if (!isMounted) return;
          if (error) throw error;
          setUserRole(data);
        }
      } catch (error) {
        console.error("Erro na configuração inicial da autenticação:", error);
        if (!isMounted) return;
        setSession(null);
        setUserRole(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    setupAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        if (newSession) {
          // Buscar role apenas quando realmente precisar (lazy loading)
          // Isso acelera o login inicial
          setUserRole(null); // Reset role, será buscada quando necessário
        } else {
          setUserRole(null);
        }
      }
    );

    return () => {
      // Evita setState após unmount
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserRole = async () => {
    if (!session || !isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase.rpc('get_user_role');
      if (error) throw error;
      setUserRole(data);
      return data;
    } catch (error) {
      console.error("Erro ao buscar role:", error);
      setUserRole(null);
      return null;
    }
  };

  const value = {
    session,
    user: session?.user,
    userRole,
    signOut: () => supabase.auth.signOut(),
    loading,
    fetchUserRole,
  };

  // Não bloqueia mais a aplicação inteira; as rotas tratam o estado de loading quando necessário
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
