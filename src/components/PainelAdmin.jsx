// src/components/PainelAdmin.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import './PainelAdmin.css';

function PainelAdmin() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('ativos'); // Estado para o filtro. 'ativos' é o padrão.
  const [adminMessage, setAdminMessage] = useState(null); // { type: 'error'|'success', text }

  // Otimização: useMemo para calcular as estatísticas apenas quando a lista de pedidos mudar.
  const statsDoDia = useMemo(() => {
    const hoje = new Date().setHours(0, 0, 0, 0); // Pega o início do dia de hoje

    // Filtra pedidos que foram criados hoje
    const pedidosDeHoje = pedidos.filter(p => new Date(p.created_at).setHours(0, 0, 0, 0) === hoje);

    const totalPedidos = pedidosDeHoje.length;
    const faturamento = pedidosDeHoje.reduce((acc, pedido) => acc + parseFloat(pedido.detalhes_pedido.total || 0), 0);
    const pedidosAtivos = pedidosDeHoje.filter(p => p.status !== 'Finalizado' && p.status !== 'Entregue').length;

    return { totalPedidos, faturamento, pedidosAtivos };
  }, [pedidos]);

  // Filtra os pedidos a serem exibidos com base no filtro de status selecionado
  const pedidosFiltrados = useMemo(() => {
    if (filtroStatus === 'todos') {
      return pedidos;
    }
    if (filtroStatus === 'ativos') {
      return pedidos.filter(p => p.status !== 'Finalizado' && p.status !== 'Entregue');
    }
    return pedidos.filter(p => p.status === filtroStatus);
  }, [pedidos, filtroStatus]);

  // (O resto das funções como handleUpdateStatus, useEffect e renderActionButtons continua igual)
  const handleUpdateStatus = async (pedidoId, novoStatus) => {
    const pedidosOriginais = [...pedidos];
    
    // Atualização otimista (sem updated_at manual)
    setPedidos(currentPedidos =>
      currentPedidos.map(p =>
        p.id === pedidoId ? { ...p, status: novoStatus } : p
      )
    );

    if (!isSupabaseConfigured) {
      alert('Supabase não configurado. Configure o .env antes de atualizar status.');
      setPedidos(pedidosOriginais);
      return;
    }

    try {
      const { data: upd, error } = await supabase
        .from('pedidos')
        .update({ 
          status: novoStatus
        })
        .eq('id', pedidoId)
        .select();

      if (error) {
        console.error("Erro ao atualizar status:", error);
        throw error;
      }

      // Atualizar com dados retornados do servidor
      if (upd && upd.length > 0) {
        setPedidos(currentPedidos =>
          currentPedidos.map(p =>
            p.id === pedidoId ? upd[0] : p
          )
        );
      }

      setAdminMessage({ type: 'success', text: `Status atualizado para "${novoStatus}"` });
      
      // Limpar mensagem após 3 segundos
      setTimeout(() => setAdminMessage(null), 3000);
      
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      
      // Reverter mudança otimista
      setPedidos(pedidosOriginais);
      
      let msg = 'A atualização falhou!';
      
      if ((error?.message || '').includes('Refresh Token')) {
        msg = 'Sessão expirada. Faça login novamente e tente de novo.';
      } else if ((error?.message || '').includes('updated_at')) {
        msg = 'Erro de banco de dados. Execute o arquivo migration_fix.sql no Supabase.';
      } else if ((error?.code || '').includes('42703')) {
        msg = 'Coluna "updated_at" não encontrada. Execute o migration_fix.sql no Supabase.';
      } else if (error?.message) {
        msg = `Erro: ${error.message}`;
      }
        
      setAdminMessage({ type: 'error', text: msg });
      
      // Limpar mensagem de erro após 5 segundos
      setTimeout(() => setAdminMessage(null), 5000);
    }
  };
  
  useEffect(() => {
    const fetchPedidos = async () => {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.from('pedidos').select('*').order('created_at', { ascending: false });
      if (error) console.error('Erro ao buscar pedidos:', error);
      else setPedidos(data);
      setLoading(false);
    };
    
    fetchPedidos();
  if (!isSupabaseConfigured) return;
  const channel = supabase.channel('pedidos_realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setPedidos((prevPedidos) => [payload.new, ...prevPedidos]);
          new Audio('/notification.mp3').play().catch(e => console.error("Erro ao tocar som:", e));
        }
        if (payload.eventType === 'UPDATE') {
          setPedidos((prevPedidos) => prevPedidos.map((pedido) => pedido.id === payload.new.id ? payload.new : pedido));
        }
      }).subscribe();
  return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  const renderActionButtons = (pedido) => {
    switch (pedido.status) {
      case 'Recebido':
        return <button className="btn-preparo" onClick={() => handleUpdateStatus(pedido.id, 'Em preparo')}>Iniciar Preparo</button>;
      case 'Em preparo':
        return <button className="btn-pronto" onClick={() => handleUpdateStatus(pedido.id, 'Pronto para retirada')}>Marcar como Pronto</button>;
      case 'Pronto para retirada': case 'Pronto':
        return <button className="btn-finalizado" onClick={() => handleUpdateStatus(pedido.id, 'Finalizado')}>Finalizar Pedido</button>;
      case 'Entregue':
      case 'Finalizado':
        return <p className="status-finalizado">Pedido Concluído ✓</p>;
      default:
        return null;
    }
  };

  if (loading) return <p className="loading-message">Carregando pedidos...</p>;

  return (
    <div className="painel-admin-container">
      <h1>Painel de Pedidos - Açaiteria</h1>

      {adminMessage && (
        <div className={`message ${adminMessage.type}`} style={{ marginBottom: 12 }}>
          {adminMessage.text}
        </div>
      )}
      
      {/* Dashboard de Resumo do Dia */}
      <div className="dashboard-resumo">
        <div className="stat-card">
          <h2>{statsDoDia.totalPedidos}</h2>
          <p>Total de Pedidos Hoje</p>
        </div>
        <div className="stat-card">
          <h2>{statsDoDia.pedidosAtivos}</h2>
          <p>Pedidos Ativos</p>
        </div>
        <div className="stat-card">
          <h2>R$ {statsDoDia.faturamento.toFixed(2)}</h2>
          <p>Faturamento do Dia</p>
        </div>
      </div>

      {/* Botões de Filtro */}
      <div className="filtros-container">
        <button onClick={() => setFiltroStatus('ativos')} className={`filtro-btn ${filtroStatus === 'ativos' ? 'active' : ''}`}>Ativos</button>
        <button onClick={() => setFiltroStatus('Recebido')} className={`filtro-btn ${filtroStatus === 'Recebido' ? 'active' : ''}`}>Recebidos</button>
        <button onClick={() => setFiltroStatus('Em preparo')} className={`filtro-btn ${filtroStatus === 'Em preparo' ? 'active' : ''}`}>Em Preparo</button>
        <button onClick={() => setFiltroStatus('Finalizado')} className={`filtro-btn ${filtroStatus === 'Finalizado' ? 'active' : ''}`}>Finalizados</button>
        <button onClick={() => setFiltroStatus('todos')} className={`filtro-btn ${filtroStatus === 'todos' ? 'active' : ''}`}>Ver Todos</button>
      </div>
      
      {/* Lista de Pedidos agora usa 'pedidosFiltrados' */}
      {pedidosFiltrados.length === 0 ? (
        <p className="no-orders-message">Nenhum pedido encontrado para este filtro.</p>
      ) : (
        <div className="pedidos-list">
          {pedidosFiltrados.map((pedido) => (
            <div 
              key={pedido.id} 
              className={`pedido-card status-${(pedido.status || '').replace(/\s+/g, '-').toLowerCase()} ${pedido.ganhou_brinde ? 'brinde-pedido' : ''}`}
            >
              {/* O conteúdo do card continua o mesmo */}
              {pedido.ganhou_brinde && (<div className="brinde-tag">🎉 BRINDE PARA ESTE CLIENTE! 🎉</div>)}
              <h3 className="cliente-nome">Pedido de: {pedido.nome_cliente}</h3>
              <p className="pedido-info"><strong>Horário:</strong> {new Date(pedido.created_at).toLocaleTimeString()}</p>
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
                  {(pedido.detalhes_pedido.complementos && Array.isArray(pedido.detalhes_pedido.complementos) && pedido.detalhes_pedido.complementos.length > 0) ? 
                    pedido.detalhes_pedido.complementos.map((item, index) => <li key={index}>{item}</li>) 
                    : <li>Nenhum complemento</li>}
                </ul>
              </div>
              <p className="pedido-info total-pedido"><strong>Total:</strong> R$ {pedido.detalhes_pedido.total}</p>
              <p className="pedido-info status-pedido"><strong>Status:</strong> <span className="status-text">{pedido.status}</span></p>
              <div className="action-buttons-container">{renderActionButtons(pedido)}</div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default PainelAdmin;