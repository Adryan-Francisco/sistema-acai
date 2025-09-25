import React, { useState, useEffect } from 'react';
// Corrigindo os caminhos de importação para serem mais explícitos
import { supabase } from '../supabaseClient.js';
import { useAuth } from '../AuthContext.jsx';
import './PainelAdmin.css';

function MeusPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPedidos = async () => {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Erro ao buscar meus pedidos:", error);
      } else {
        setPedidos(data);
      }
      setLoading(false);
    };

    if (user) {
      fetchPedidos();
    }

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
          setPedidos((prevPedidos) => 
            prevPedidos.map(p => 
              p.id === payload.new.id ? payload.new : p
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (loading) {
    return <p className="loading-message">A carregar os seus pedidos...</p>;
  }

  return (
    <div className="painel-admin-container">
      <h1>Meus Pedidos</h1>
      {pedidos.length === 0 ? (
        <p className="no-orders-message">Ainda não fez nenhum pedido.</p>
      ) : (
        <div className="pedidos-list">
          {pedidos.map((pedido) => (
            <div 
              key={pedido.id} 
              className={`pedido-card status-${(pedido.status || '').replace(/\s+/g, '-').toLowerCase()}`}
            >
              <p className="pedido-info"><strong>Horário:</strong> {new Date(pedido.created_at).toLocaleString()}</p>
              <p className="pedido-info"><strong>Tamanho:</strong> {pedido.detalhes_pedido.tamanho}</p>
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

