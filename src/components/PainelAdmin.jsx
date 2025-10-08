// src/components/PainelAdmin.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Package, DollarSign, ChefHat, CheckCircle, XCircle, RefreshCw, LogOut, Printer } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { useAuth } from '../AuthContext';
import './PainelAdmin.css';

function PainelAdmin() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState('ativos');
  const [adminMessage, setAdminMessage] = useState(null);

  // Função para fazer logout
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Função para atualizar lista de pedidos
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao atualizar pedidos:', error);
        setAdminMessage({ type: 'error', text: 'Erro ao atualizar a lista de pedidos.' });
      } else {
        setPedidos(data || []);
        setAdminMessage({ type: 'success', text: 'Lista de pedidos atualizada!' });
      }
      
      setTimeout(() => setAdminMessage(null), 3000);
    } catch (err) {
      console.error('Erro:', err);
      setAdminMessage({ type: 'error', text: 'Erro ao atualizar pedidos.' });
      setTimeout(() => setAdminMessage(null), 3000);
    } finally {
      setRefreshing(false);
    }
  };

  // Função para imprimir pedido individual - Formato compacto para impressora térmica
  const handlePrintOrder = (pedido) => {
    const printWindow = window.open('', '', 'width=300,height=600');
    const complementosInclusos = pedido.detalhes_pedido.complementos_padrao || [];
    const complementosRemovidos = pedido.detalhes_pedido.complementos_removidos || [];
    const complementosAdicionais = pedido.detalhes_pedido.complementos_adicionais || [];
    
    // Combinar todos os complementos em uma lista única de "EXTRAS ADICIONADOS"
    const todosComplementos = [
      ...complementosInclusos,
      ...complementosAdicionais.map(c => typeof c === 'object' ? c.nome : c)
    ];
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Pedido #${pedido.id}</title>
        <meta charset="UTF-8">
        <style>
          * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
          }
          
          body { 
            font-family: 'Courier New', Courier, monospace; 
            padding: 10px; 
            font-size: 11px;
            line-height: 1.3;
            max-width: 300px;
          }
          
          .header { 
            text-align: center; 
            margin-bottom: 10px;
          }
          
          .header h1 { 
            font-size: 16px; 
            font-weight: bold;
            margin-bottom: 5px;
            letter-spacing: 2px;
          }
          
          .header .subtitle {
            font-size: 11px;
            margin: 2px 0;
          }
          
          .divider {
            border-bottom: 1px dashed #000;
            margin: 8px 0;
          }
          
          .client-box {
            border: 1px solid #000;
            padding: 8px;
            margin: 10px 0;
            text-align: center;
          }
          
          .client-label {
            font-weight: bold;
            font-size: 10px;
          }
          
          .client-name {
            font-size: 12px;
            font-weight: bold;
            margin-top: 3px;
          }
          
          .client-info {
            font-size: 9px;
            margin-top: 3px;
          }
          
          .section-title {
            font-weight: bold;
            font-size: 11px;
            margin: 10px 0 5px 0;
          }
          
          .pedido-linha {
            margin: 3px 0;
            font-size: 11px;
          }
          
          .pedido-linha strong {
            display: inline-block;
            width: 75px;
          }
          
          .extras-list {
            list-style: none;
            padding-left: 0;
            margin: 5px 0;
          }
          
          .extras-list li {
            padding-left: 15px;
            position: relative;
            margin: 2px 0;
            font-size: 10px;
          }
          
          .extras-list li:before {
            content: "•";
            position: absolute;
            left: 0;
          }
          
          .total {
            text-align: center;
            margin: 10px 0;
            font-size: 13px;
            font-weight: bold;
            letter-spacing: 1px;
          }
          
          .status-line {
            margin: 8px 0;
            font-size: 10px;
            text-align: center;
          }
          
          .footer {
            text-align: center;
            margin-top: 10px;
            font-size: 9px;
            padding-top: 8px;
            border-top: 1px dashed #000;
          }
          
          @media print {
            body { 
              padding: 5px;
              width: 80mm;
            }
            @page {
              size: 80mm auto;
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🍇 AÇAÍ SYSTEM</h1>
          <div class="subtitle">COMANDA DE PEDIDO</div>
          <div class="subtitle">Pedido #${pedido.id}</div>
        </div>
        
        <div class="divider"></div>
        
        <div class="client-box">
          <div class="client-label">CLIENTE: ${pedido.nome_cliente.toUpperCase()}</div>
          <div class="client-info">Data: ${new Date(pedido.created_at).toLocaleDateString('pt-BR')} Hora: ${new Date(pedido.created_at).toLocaleTimeString('pt-BR')}</div>
        </div>
        
        <div class="divider"></div>
        
        <div class="section-title">PEDIDO</div>
        <div class="pedido-linha"><strong>Tamanho:</strong> ${pedido.detalhes_pedido.tamanho} - ${pedido.detalhes_pedido.tipo_acai || 'Moda da Casa'}</div>
        <div class="pedido-linha"><strong>Pagamento:</strong> ${pedido.detalhes_pedido.metodo_pagamento || 'Não informado'}</div>
        
        ${todosComplementos.length > 0 ? `
        <div class="section-title">EXTRAS ADICIONADOS</div>
        <ul class="extras-list">
          ${todosComplementos.map(c => `<li>${c}</li>`).join('')}
        </ul>
        ` : ''}
        
        <div class="divider"></div>
        
        <div class="total">TOTAL: R$ ${pedido.detalhes_pedido.total}</div>
        
        <div class="divider"></div>
        
        <div class="status-line">Status: ${pedido.status}</div>
        
        <div class="footer">
          Obrigado pela preferência! 🍇
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(() => window.close(), 500);
          };
        </script>
      </body>
      </html>
    `);
    
    printWindow.document.close();
  };

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
    return (
      <div className="action-buttons-group">
        {pedido.status === 'Recebido' && (
          <button className="btn-action btn-preparo" onClick={() => handleUpdateStatus(pedido.id, 'Em preparo')}>
            <ChefHat size={18} />
            Iniciar Preparo
          </button>
        )}
        {pedido.status === 'Em preparo' && (
          <button className="btn-action btn-pronto" onClick={() => handleUpdateStatus(pedido.id, 'Pronto para retirada')}>
            <CheckCircle size={18} />
            Marcar como Pronto
          </button>
        )}
        {(pedido.status === 'Pronto para retirada' || pedido.status === 'Pronto') && (
          <button className="btn-action btn-finalizado" onClick={() => handleUpdateStatus(pedido.id, 'Finalizado')}>
            <Package size={18} />
            Finalizar Pedido
          </button>
        )}
        {(pedido.status === 'Entregue' || pedido.status === 'Finalizado') && (
          <div className="status-finalizado">
            <CheckCircle size={18} />
            Pedido Concluído
          </div>
        )}
        <button 
          className="btn-action btn-print" 
          onClick={() => handlePrintOrder(pedido)}
          title="Imprimir pedido"
        >
          <Printer size={18} />
          Imprimir
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="painel-loading">
        <RefreshCw size={48} className="loading-spinner" />
        <p>Carregando pedidos...</p>
      </div>
    );
  }

  return (
    <div className="painel-admin-wrapper">
      {/* Header */}
      <div className="painel-admin-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-title">
              <ChefHat size={32} />
              <h1>Painel da Açaiteria</h1>
            </div>
            <div className="header-subtitle">
              <Clock size={16} />
              <span>{new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          </div>
          <div className="header-actions">
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="btn-header btn-dashboard"
              title="Ver Dashboard de Estatísticas"
            >
              <ChefHat size={18} />
              <span className="btn-text">Dashboard</span>
            </button>
            <button 
              onClick={handleRefresh} 
              className="btn-header btn-refresh"
              disabled={refreshing}
              title="Atualizar lista de pedidos"
            >
              <RefreshCw size={18} className={refreshing ? 'spinning' : ''} />
              <span className="btn-text">Atualizar</span>
            </button>
            <button 
              onClick={handleLogout} 
              className="btn-header btn-logout"
              title="Sair do sistema"
            >
              <LogOut size={18} />
              <span className="btn-text">Sair</span>
            </button>
          </div>
        </div>
      </div>

      <div className="painel-admin-container">{adminMessage && (
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
              className={`pedido-card status-${(pedido.status || '').replace(/\s+/g, '-').toLowerCase()}`}
            >
              <h3 className="cliente-nome">Pedido de: {pedido.nome_cliente}</h3>
              <p className="pedido-info"><strong>Horário:</strong> {new Date(pedido.created_at).toLocaleTimeString('pt-BR')}</p>
              
              {/* Tipo de Açaí */}
              {pedido.detalhes_pedido.tipo_acai && (
                <p className="pedido-info tipo-acai">
                  <strong>Tipo:</strong> {pedido.detalhes_pedido.tipo_acai}
                </p>
              )}
              
              <p className="pedido-info"><strong>Tamanho:</strong> {pedido.detalhes_pedido.tamanho}</p>
              
              {/* Quantidade */}
              {pedido.detalhes_pedido.quantidade && (
                <p className="pedido-info">
                  <strong>Quantidade:</strong> {pedido.detalhes_pedido.quantidade}x
                </p>
              )}
              
              {/* Método de Pagamento */}
              {pedido.detalhes_pedido.metodo_pagamento && (
                <p className="pedido-info metodo-pagamento">
                  <strong>Pagamento:</strong> 
                  <span className="pagamento-badge">
                    {pedido.detalhes_pedido.metodo_pagamento === 'Dinheiro' && '💵'}
                    {(pedido.detalhes_pedido.metodo_pagamento === 'Cartão' || 
                      pedido.detalhes_pedido.metodo_pagamento === 'Cartão de Crédito' || 
                      pedido.detalhes_pedido.metodo_pagamento === 'Cartão de Débito') && '💳'}
                    {pedido.detalhes_pedido.metodo_pagamento === 'PIX' && '📱'}
                    {' '}{pedido.detalhes_pedido.metodo_pagamento}
                  </span>
                </p>
              )}
              
              {/* Complementos */}
              <div className="complementos-section">
                <strong>Complementos:</strong>
                
                {/* Complementos Padrão (Inclusos) */}
                {pedido.detalhes_pedido.complementos_padrao && pedido.detalhes_pedido.complementos_padrao.length > 0 && (
                  <div className="complementos-group">
                    <p className="complementos-subtitle">✅ Inclusos:</p>
                    <ul className="complementos-list inclusos">
                      {pedido.detalhes_pedido.complementos_padrao.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Complementos Removidos */}
                {pedido.detalhes_pedido.complementos_removidos && pedido.detalhes_pedido.complementos_removidos.length > 0 && (
                  <div className="complementos-group">
                    <p className="complementos-subtitle">❌ Removidos:</p>
                    <ul className="complementos-list removidos">
                      {pedido.detalhes_pedido.complementos_removidos.map((item, index) => (
                        <li key={index} style={{ textDecoration: 'line-through', color: '#dc2626' }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Complementos Adicionais */}
                {pedido.detalhes_pedido.complementos_adicionais && pedido.detalhes_pedido.complementos_adicionais.length > 0 && (
                  <div className="complementos-group">
                    <p className="complementos-subtitle">➕ Adicionais:</p>
                    <ul className="complementos-list adicionais">
                      {pedido.detalhes_pedido.complementos_adicionais.map((item, index) => (
                        <li key={index}>
                          {typeof item === 'object' ? `${item.nome} (+R$ ${item.preco.toFixed(2)})` : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Nenhum complemento */}
                {!pedido.detalhes_pedido.complementos_padrao && 
                 !pedido.detalhes_pedido.complementos_removidos && 
                 !pedido.detalhes_pedido.complementos_adicionais && (
                  <p style={{ color: '#6b7280', fontStyle: 'italic', marginTop: '8px' }}>Nenhum complemento</p>
                )}
              </div>
              
              <p className="pedido-info total-pedido"><strong>Total:</strong> R$ {pedido.detalhes_pedido.total}</p>
              <p className="pedido-info status-pedido"><strong>Status:</strong> <span className="status-text">{pedido.status}</span></p>
              <div className="action-buttons-container">{renderActionButtons(pedido)}</div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}

export default PainelAdmin;