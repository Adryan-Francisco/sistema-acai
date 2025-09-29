import React, { useState, useEffect } from 'react';
// Corrigindo os caminhos de importação para serem mais explícitos
import { supabase, isSupabaseConfigured } from '../supabaseClient.js';
import { useAuth } from '../AuthContext.jsx';
import './MeusPedidos.css';

function MeusPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [buscaTexto, setBuscaTexto] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchPedidos = async () => {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Erro ao buscar meus pedidos:", error);
      } else {
        setPedidos(data);
        setPedidosFiltrados(data);
      }
      setLoading(false);
    };

    if (user) {
      fetchPedidos();
    }

    if (!isSupabaseConfigured || !user) return;

    const channel = supabase
      .channel(`meus_pedidos_${user?.id}`)
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'pedidos', 
          filter: `user_id=eq.${user?.id}`
        },
        (payload) => {
          setPedidos((prevPedidos) => {
            const updated = prevPedidos.map(p => 
              p.id === payload.new.id ? payload.new : p
            );
            return updated;
          });
          setPedidosFiltrados((prevPedidos) => {
            const updated = prevPedidos.map(p => 
              p.id === payload.new.id ? payload.new : p
            );
            return updated;
          });
        }
      )
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [user]);

  // Efeito para filtrar pedidos
  useEffect(() => {
    let filtrados = pedidos;

    // Filtro por status
    if (filtroStatus !== 'todos') {
      filtrados = filtrados.filter(pedido => 
        pedido.status?.toLowerCase().replace(/\s+/g, '-') === filtroStatus
      );
    }

    // Filtro por texto (busca em complementos)
    if (buscaTexto.trim()) {
      filtrados = filtrados.filter(pedido => {
        const complementos = pedido.detalhes_pedido?.complementos?.join(' ').toLowerCase() || '';
        const tamanho = pedido.detalhes_pedido?.tamanho?.toLowerCase() || '';
        const busca = buscaTexto.toLowerCase();
        return complementos.includes(busca) || tamanho.includes(busca);
      });
    }

    setPedidosFiltrados(filtrados);
  }, [pedidos, filtroStatus, buscaTexto]);

  if (loading) {
    return <p className="loading-message">A carregar os seus pedidos...</p>;
  }

  return (
    <div className="painel-admin-container">
      <h1>Meus Pedidos</h1>
      
      {/* Filtros */}
      <div className="filtros-container">
        <div className="filtro-status">
          <label htmlFor="filtro-status">Filtrar por status:</label>
          <select 
            id="filtro-status"
            value={filtroStatus} 
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="filtro-select"
          >
            <option value="todos">Todos</option>
            <option value="pendente">Pendente</option>
            <option value="em-preparo">Em Preparo</option>
            <option value="pronto">Pronto</option>
            <option value="entregue">Entregue</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        
        <div className="filtro-busca">
          <label htmlFor="busca-texto">Buscar:</label>
          <input
            id="busca-texto"
            type="text"
            placeholder="Buscar por tamanho ou complementos..."
            value={buscaTexto}
            onChange={(e) => setBuscaTexto(e.target.value)}
            className="filtro-input"
          />
        </div>
      </div>

      {pedidosFiltrados.length === 0 && pedidos.length > 0 ? (
        <p className="no-results-message">
          Nenhum pedido encontrado com os filtros aplicados. 
          <button onClick={() => { setFiltroStatus('todos'); setBuscaTexto(''); }}>
            Limpar filtros
          </button>
        </p>
      ) : pedidos.length === 0 ? (
        <p className="no-orders-message">Ainda não fez nenhum pedido.</p>
      ) : (
        <div className="pedidos-list">
          {pedidosFiltrados.map((pedido) => (
            <div 
              key={pedido.id} 
              className={`pedido-card status-${(pedido.status || '').replace(/\s+/g, '-').toLowerCase()}`}
            >
              <p className="pedido-info"><strong>Horário:</strong> {new Date(pedido.created_at).toLocaleString()}</p>
              <p className="pedido-info"><strong>Tamanho:</strong> {pedido.detalhes_pedido.tamanho}</p>
              {pedido.detalhes_pedido.metodo_pagamento && (
                <p className="pedido-info metodo-pagamento">
                  <strong>Pagamento:</strong> 
                  <span className="pagamento-badge">
                    {pedido.detalhes_pedido.metodo_pagamento === 'Dinheiro' && '💵'}
                    {pedido.detalhes_pedido.metodo_pagamento === 'Cartão' && '💳'}
                    {pedido.detalhes_pedido.metodo_pagamento === 'PIX' && '📱'}
                    {' '}{pedido.detalhes_pedido.metodo_pagamento}
                  </span>
                </p>
              )}
              <div className="complementos-section">
                <strong>Complementos:</strong>
                <ul className="complementos-list">
                  {pedido.detalhes_pedido.complementos && pedido.detalhes_pedido.complementos.length > 0 ? 
                    pedido.detalhes_pedido.complementos.map((item, index) => <li key={index}>{item}</li>)
                    : <li>Nenhum complemento</li>
                  }
                </ul>
              </div>
              <p className="pedido-info total-pedido"><strong>Total:</strong> R$ {parseFloat(pedido.detalhes_pedido.total || 0).toFixed(2)}</p>
              <p className="pedido-info status-pedido">
                <strong>Status:</strong> <span className="status-text">{pedido.status}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MeusPedidos;

