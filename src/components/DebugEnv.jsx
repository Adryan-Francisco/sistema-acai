import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient.js';
import { useAuth } from '../AuthContext';

function mask(value) {
  if (!value) return '';
  if (value.length <= 6) return '***';
  return value.slice(0, 5) + '...' + value.slice(-3);
}

export default function DebugEnv() {
  const [probe, setProbe] = useState(null);
  const [authDebug, setAuthDebug] = useState(null);
  const { session, userRole, fetchUserRole } = useAuth();
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  useEffect(() => {
    const debugAuth = async () => {
      if (!session) {
        setAuthDebug({ hasSession: false });
        return;
      }

      const debug = {
        hasSession: true,
        userId: session.user.id,
        userEmail: session.user.email,
        currentRole: userRole,
        rpcTest: null,
        profileCheck: null
      };

      // Testar RPC
      try {
        const { data, error } = await supabase.rpc('get_user_role');
        debug.rpcTest = { success: !error, data, error: error?.message };
      } catch (err) {
        debug.rpcTest = { success: false, error: err.message };
      }

      // Verificar profile
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        debug.profileCheck = { success: !error, data, error: error?.message };
      } catch (err) {
        debug.profileCheck = { success: false, error: err.message };
      }

      setAuthDebug(debug);
    };

    debugAuth();
  }, [session, userRole]);

  const testQuery = async () => {
    try {
      if (!isSupabaseConfigured) {
        setProbe({ ok: false, msg: 'Supabase não configurado (.env ausente).' });
        return;
      }
      const { data, error } = await supabase.from('tamanhos').select('*').limit(1);
      if (error) setProbe({ ok: false, msg: error.message });
      else setProbe({ ok: true, msg: `OK. ${data?.length || 0} linha(s) encontradas.` });
    } catch (e) {
      setProbe({ ok: false, msg: e.message });
    }
  };

  const handleRefreshRole = async () => {
    const role = await fetchUserRole();
    alert(`Role atualizada: ${role || 'null'}`);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🔍 Diagnóstico Completo</h2>
      
      <h3>🌍 Ambiente</h3>
      <ul>
        <li>isSupabaseConfigured: <strong>{String(isSupabaseConfigured)}</strong></li>
        <li>VITE_SUPABASE_URL: <code>{url || 'undefined'}</code></li>
        <li>VITE_SUPABASE_ANON_KEY: <code>{key ? mask(key) : 'undefined'}</code></li>
      </ul>
      
      <button onClick={testQuery} style={{ padding: '8px 12px', marginRight: 10 }}>Testar consulta</button>
      <button onClick={handleRefreshRole} disabled={!session} style={{ padding: '8px 12px' }}>🔄 Atualizar Role</button>
      
      {probe && (
        <p style={{ marginTop: 12, fontWeight: 600, color: probe.ok ? '#2ecc71' : '#e74c3c' }}>
          Resultado: {probe.ok ? 'SUCESSO' : 'FALHA'} — {probe.msg}
        </p>
      )}

      <h3>🔐 Autenticação</h3>
      {authDebug && (
        <div style={{ backgroundColor: '#f8f8f8', padding: 15, borderRadius: 5, fontFamily: 'monospace' }}>
          <pre>{JSON.stringify(authDebug, null, 2)}</pre>
        </div>
      )}

      <hr />
      <div style={{ backgroundColor: '#fff3cd', padding: 15, borderRadius: 5, border: '1px solid #ffeaa7' }}>
        <h4>💡 Solução para não conseguir acessar /admin:</h4>
        <ol>
          <li><strong>Se authDebug.currentRole não é 'admin':</strong><br/>
            Execute no Supabase SQL Editor:
            <pre style={{ backgroundColor: '#f8f8f8', padding: 8, margin: '8px 0' }}>
              UPDATE public.profiles SET role = 'admin' WHERE email = '{authDebug?.userEmail || "seu-email@exemplo.com"}';
            </pre>
          </li>
          <li><strong>Se rpcTest falhou:</strong> As funções do banco podem não estar criadas.</li>
          <li><strong>Se profileCheck falhou:</strong> Faça logout e login novamente.</li>
          <li>Depois, clique em "🔄 Atualizar Role" e tente acessar /admin novamente.</li>
        </ol>
      </div>
    </div>
  );
}
