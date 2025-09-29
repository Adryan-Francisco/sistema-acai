// src/components/TestSupabase.jsx
import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

function TestSupabase() {
  const [status, setStatus] = useState('Iniciando teste de conexão...');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Define um timeout de 10 segundos. Se a conexão não responder, acusa erro.
    const timeoutId = setTimeout(() => {
      setStatus('Falha na conexão: A requisição demorou demais (Timeout).');
      setError('Verifique se o seu projeto Supabase está ativo e se as chaves de API estão corretas.');
    }, 10000); // 10 segundos

    const testConnection = async () => {
      if (!isSupabaseConfigured) {
        setStatus('Supabase não configurado (.env ausente).');
        setError('Crie o arquivo .env a partir de .env.example e reinicie o servidor.');
        clearTimeout(timeoutId);
        return;
      }
      // O teste mais simples: contar as linhas da tabela 'pedidos'.
      const { error: countError } = await supabase
        .from('pedidos')
        .select('*', { count: 'exact', head: true }); // head: true não baixa os dados, só a contagem. É rápido.

      clearTimeout(timeoutId); // Cancela o timeout pois recebemos uma resposta

      if (countError) {
        setStatus('FALHA na conexão com o Supabase.');
        setError(countError.message);
      } else {
        setStatus('CONEXÃO BEM-SUCEDIDA!');
        setError(null);
      }
    };

    testConnection();

    // Limpeza do timeout caso o componente seja desmontado
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div style={{ padding: '40px', backgroundColor: '#282a36', borderRadius: '10px', color: 'white', maxWidth: '800px', margin: 'auto' }}>
      <h1>Teste de Conexão com Supabase</h1>
      <p style={{ fontSize: '1.2em', fontWeight: 'bold', color: status === 'CONEXÃO BEM-SUCEDIDA!' ? '#2ecc71' : '#e74c3c' }}>
        Status: {status}
      </p>
      {error && (
        <div>
          <p><strong>Detalhe do Erro:</strong></p>
          <pre style={{ backgroundColor: '#1a1a2e', padding: '10px', borderRadius: '5px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {error}
          </pre>
        </div>
      )}
      <hr style={{ borderColor: '#444' }} />
      <h3>O que fazer agora?</h3>
      <p>
        Se a conexão falhou, verifique a checklist de possíveis causas na minha resposta.
      </p>
      <p>
        Se a conexão foi bem-sucedida, o problema está especificamente na parte de Autenticação.
      </p>
    </div>
  );
}

export default TestSupabase;