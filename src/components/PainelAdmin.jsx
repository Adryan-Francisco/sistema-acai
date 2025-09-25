// src/components/PainelAdmin.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import './PainelAdmin.css';

function PainelAdmin() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('ativos'); // Estado para o filtro. 'ativos' é o padrão.

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
    setPedidos(currentPedidos =>
      currentPedidos.map(p =>
        p.id === pedidoId ? { ...p, status: novoStatus } : p
      )
    );
    const { error } = await supabase
      .from('pedidos')
      .update({ status: novoStatus })
      .eq('id', pedidoId);
    if (error) {
      console.error("Erro ao atualizar status:", error);
      alert('A atualização falhou! Revertendo a mudança.');
      setPedidos(pedidosOriginais);
    }
  };
  
  useEffect(() => {
    const fetchPedidos = async () => {
      const { data, error } = await supabase.from('pedidos').select('*').order('created_at', { ascending: false });
      if (error) console.error('Erro ao buscar pedidos:', error);
      else setPedidos(data);
      setLoading(false);
    };
    fetchPedidos();
    const channel = supabase.channel('pedidos_realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setPedidos((prevPedidos) => [payload.new, ...prevPedidos]);
          new Audio('/notification.mp3').play().catch(e => console.error("Erro ao tocar som:", e));
        }
        if (payload.eventType === 'UPDATE') {
          setPedidos((prevPedidos) => prevPedidos.map((pedido) => pedido.id === payload.new.id ? payload.new : pedido));
        }
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
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
      
      {/* NOVO: Dashboard de Resumo do Dia */}
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

      {/* NOVO: Botões de Filtro */}
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
              <div className="complementos-section">
                <strong>Complementos:</strong>
                <ul className="complementos-list">
                  {pedido.detalhes_pedido.complementos.length > 0 ? 
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