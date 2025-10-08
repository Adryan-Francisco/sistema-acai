import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Star } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../supabaseClient.js';
import { useAuth } from '../AuthContext.jsx';
import AvaliarPedido from './AvaliarPedido';
import './MeusPedidos.css';

function MeusPedidos() {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [buscaTexto, setBuscaTexto] = useState('');
  const [pedidoParaAvaliar, setPedidoParaAvaliar] = useState(null);
  const { user, session } = useAuth();

  useEffect(() => {
    console.log('👤 Dados do usuário:', { 
      user: user, 
      userId: user?.id,
      sessionUserId: session?.user?.id 
    });
    const fetchPedidos = async () => {
      if (!isSupabaseConfigured || !user?.id) {
        setLoading(false);
        return;
      }
      
      console.log('🔍 Buscando pedidos para usuário:', user.id);
      
      // Filtrar pedidos apenas do usuário logado
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Erro ao buscar meus pedidos:", error);
      } else {
        console.log('✅ Pedidos encontrados:', data?.length || 0);
        setPedidos(data || []);
        setPedidosFiltrados(data || []);
      }
      setLoading(false);
    };

    if (user?.id) {
      fetchPedidos();
    }

    if (!isSupabaseConfigured || !user?.id) return;

    // Subscription para atualizações em tempo real (apenas pedidos do usuário)
    const channel = supabase
      .channel(`meus_pedidos_${user.id}`)
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'pedidos', 
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔔 Atualização de pedido recebida:', payload.new);
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
    return (
      <div className="meus-pedidos-loading">
        <Package size={48} className="loading-icon" />
        <p className="loading-message">Carregando seus pedidos...</p>
      </div>
    );
  }

  return (
    <div className="meus-pedidos-wrapper">
      {/* Header */}
      <div className="meus-pedidos-header">
        <button onClick={() => navigate('/')} className="btn-voltar">
          <ArrowLeft size={20} />
          Voltar ao Cardápio
        </button>
        <h1>
          <Package size={32} />
          Meus Pedidos
        </h1>
      </div>

      <div className="meus-pedidos-container">
      
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
          {pedidosFiltrados.map((pedido) => {
            const detalhes = pedido.detalhes_pedido || {};
            const dataHora = new Date(pedido.created_at);
            // Formatar data e hora corretamente (Brasil)
            const dataFormatada = dataHora.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            });
            const horaFormatada = dataHora.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });

            return (
              <div 
                key={pedido.id} 
                className={`pedido-card status-${(pedido.status || '').replace(/\s+/g, '-').toLowerCase()}`}
              >
                <p className="pedido-info"><strong>Horário:</strong> {dataFormatada} às {horaFormatada}</p>
                
                {/* Tipo de Açaí */}
                {detalhes.tipo_acai && (
                  <p className="pedido-info"><strong>Tipo:</strong> {detalhes.tipo_acai}</p>
                )}
                
                {/* Tamanho */}
                <p className="pedido-info"><strong>Tamanho:</strong> {detalhes.tamanho}</p>
                
                {/* Quantidade */}
                {detalhes.quantidade && (
                  <p className="pedido-info"><strong>Quantidade:</strong> {detalhes.quantidade}x</p>
                )}
                
                {/* Método de Pagamento */}
                {detalhes.metodo_pagamento && (
                  <p className="pedido-info metodo-pagamento">
                    <strong>Pagamento:</strong> 
                    <span className="pagamento-badge">
                      {detalhes.metodo_pagamento === 'Dinheiro' && '💵'}
                      {detalhes.metodo_pagamento === 'Cartão' && '💳'}
                      {detalhes.metodo_pagamento === 'PIX' && '📱'}
                      {' '}{detalhes.metodo_pagamento}
                    </span>
                  </p>
                )}
                
                {/* Complementos Inclusos (Padrão) */}
                {detalhes.complementos_padrao && detalhes.complementos_padrao.length > 0 && (
                  <div className="complementos-section">
                    <strong>✅ Inclusos:</strong>
                    <ul className="complementos-list">
                      {detalhes.complementos_padrao.map((item, index) => (
                        <li key={index} style={{color: '#22c55e'}}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Complementos Removidos */}
                {detalhes.complementos_removidos && detalhes.complementos_removidos.length > 0 && (
                  <div className="complementos-section">
                    <strong>❌ Removidos:</strong>
                    <ul className="complementos-list">
                      {detalhes.complementos_removidos.map((item, index) => (
                        <li key={index} style={{color: '#ef4444', textDecoration: 'line-through'}}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Complementos Adicionais */}
                <div className="complementos-section">
                  <strong>🎨 Complementos Adicionais:</strong>
                  <ul className="complementos-list">
                    {detalhes.complementos_adicionais && detalhes.complementos_adicionais.length > 0 ? 
                      detalhes.complementos_adicionais.map((item, index) => (
                        <li key={index}>
                          {typeof item === 'object' ? `${item.nome} (+R$ ${item.preco?.toFixed(2)})` : item}
                        </li>
                      ))
                      : <li style={{color: '#888'}}>Nenhum complemento adicional</li>
                    }
                  </ul>
                </div>
                
                {/* Açaí Grátis */}
                {detalhes.usou_acai_gratis && (
                  <p className="pedido-info" style={{color: '#22c55e', fontWeight: 'bold'}}>
                    🎉 Usou açaí grátis!
                  </p>
                )}
                
                {/* Total */}
                <p className="pedido-info total-pedido"><strong>Total:</strong> R$ {parseFloat(detalhes.total || 0).toFixed(2)}</p>
                
                {/* Status */}
                <p className="pedido-info status-pedido">
                  <strong>Status:</strong> <span className="status-text">{pedido.status}</span>
                </p>

                {/* Botão de Avaliar */}
                {pedido.status === 'Concluído' && !pedido.avaliado && (
                  <button 
                    className="btn-avaliar"
                    onClick={() => setPedidoParaAvaliar(pedido)}
                  >
                    <Star size={18} />
                    Avaliar Pedido
                  </button>
                )}

                {pedido.avaliado && (
                  <p className="pedido-avaliado">
                    ⭐ Pedido já avaliado - Obrigado!
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Avaliação */}
      {pedidoParaAvaliar && (
        <AvaliarPedido
          pedido={pedidoParaAvaliar}
          onClose={() => setPedidoParaAvaliar(null)}
          onAvaliacaoEnviada={() => {
            // Recarregar pedidos para atualizar o status
            const fetchPedidos = async () => {
              const { data } = await supabase
                .from('pedidos')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
              setPedidos(data || []);
              setPedidosFiltrados(data || []);
            };
            fetchPedidos();
          }}
        />
      )}
      </div>
    </div>
  );
}

export default MeusPedidos;

