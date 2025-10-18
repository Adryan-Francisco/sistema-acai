import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import AvaliarPedido from './AvaliarPedido';
import './AvaliarPedido.css';

export default function PaginaAvaliacao() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [showAvaliar, setShowAvaliar] = useState(false);

  useEffect(() => {
    const buscarPedido = async () => {
      try {
        const pedidoId = searchParams.get('avaliar');
        
        if (!pedidoId) {
          setErro('Pedido não encontrado na URL');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('pedidos')
          .select('*')
          .eq('id', pedidoId)
          .single();

        if (error) {
          throw new Error('Pedido não encontrado');
        }

        if (data) {
          setPedido(data);
          setShowAvaliar(true);
        }
      } catch (err) {
        console.error('Erro ao buscar pedido:', err);
        setErro(err.message || 'Erro ao carregar pedido');
      } finally {
        setLoading(false);
      }
    };

    buscarPedido();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="pagina-avaliacao">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando pedido...</p>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="pagina-avaliacao">
        <div className="erro-container">
          <h2>❌ {erro}</h2>
          <p>Não conseguimos encontrar o pedido para avaliar.</p>
          <button onClick={() => navigate('/')}>Voltar para Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pagina-avaliacao">
      {showAvaliar && pedido && (
        <AvaliarPedido
          pedido={pedido}
          onClose={() => {
            setShowAvaliar(false);
            navigate('/');
          }}
          onAvaliacaoEnviada={() => {
            // Redirecionar após sucesso
            setTimeout(() => navigate('/'), 2000);
          }}
        />
      )}
    </div>
  );
}
