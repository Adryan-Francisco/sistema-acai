import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient.js';
import { useAuth } from '../AuthContext.jsx';
import './Cardapio.css';

// Ícone de Açaí
const AcaiHeaderIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{margin: '0 auto'}}>
        <path d="M5 21C5 17.134 8.13401 14 12 14C15.866 14 19 17.134 19 21" stroke="#FF69B4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 14C12 11.2386 14.2386 9 17 9C19.7614 9 22 11.2386 22 14" stroke="#8A2BE2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 14C12 11.2386 9.76142 9 7 9C4.23858 9 2 11.2386 2 14" stroke="#8A2BE2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17 9C17 6.23858 14.7614 4 12 4C9.23858 4 7 6.23858 7 9" stroke="#8A2BE2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 4C12 2.89543 11.1046 2 10 2" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

function Cardapio() {
  const { session, user } = useAuth();
  const navigate = useNavigate();

  // Estados do formulário
  const [tamanho, setTamanho] = useState(null);
  const [complementosSelecionados, setComplementosSelecionados] = useState([]);
  const [metodoPagamento, setMetodoPagamento] = useState('');
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Estados dos dados do cardápio
  const [listaTamanhos, setListaTamanhos] = useState([]);
  const [listaComplementos, setListaComplementos] = useState([]);
  const [loadingCardapio, setLoadingCardapio] = useState(true);
  const [erro, setErro] = useState('');

  // Verificação de sessão válida
  const isSessionValid = () => {
    return session && session.user && session.user.id && typeof session.user.id === 'string' && session.user.id.length > 10;
  };

  // Função para limpar tudo em caso de erro
  const limparTudo = async () => {
    console.log('🧹 Iniciando limpeza completa...');
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      console.log('✅ Limpeza concluída, redirecionando...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    } catch (error) {
      console.error('❌ Erro na limpeza:', error);
      window.location.reload();
    }
  };

  // Carregar dados do cardápio
  useEffect(() => {
    const carregarCardapio = async () => {
      try {
        setLoadingCardapio(true);
        
        const [tamanhosResponse, complementosResponse] = await Promise.all([
          supabase.from('tamanhos').select('*').order('preco', { ascending: true }),
          supabase.from('complementos').select('*').order('preco', { ascending: true })
        ]);

        if (tamanhosResponse.error) throw tamanhosResponse.error;
        if (complementosResponse.error) throw complementosResponse.error;

        setListaTamanhos(tamanhosResponse.data || []);
        setListaComplementos(complementosResponse.data || []);
        
      } catch (error) {
        console.error('Erro ao carregar cardápio:', error);
        setErro('Erro ao carregar cardápio. Recarregue a página.');
      } finally {
        setLoadingCardapio(false);
      }
    };

    carregarCardapio();
  }, []);

  // Calcular total
  useEffect(() => {
    let novoTotal = 0;
    
    if (tamanho && tamanho.preco) {
      novoTotal += parseFloat(tamanho.preco);
    }
    
    // Validar se complementosSelecionados é um array
    if (Array.isArray(complementosSelecionados)) {
      complementosSelecionados.forEach(complemento => {
        if (complemento && complemento.preco) {
          novoTotal += parseFloat(complemento.preco);
        }
      });
    }
    
    setTotal(novoTotal);
  }, [tamanho, complementosSelecionados]);

  // Função para criar pedido
  const criarPedido = async () => {
    console.log('🛒 Iniciando criação do pedido...');
    console.log('🔍 Session válida?', isSessionValid());
    console.log('👤 Session details:', { 
      exists: !!session, 
      hasUser: !!session?.user, 
      userId: session?.user?.id,
      userIdType: typeof session?.user?.id
    });

    // Validações básicas
    if (!isSessionValid()) {
      console.warn('❌ Sessão inválida detectada');
      alert('Sua sessão expirou. Você será redirecionado para o login.');
      await limparTudo();
      return;
    }

    if (!tamanho) {
      alert('Por favor, selecione um tamanho.');
      return;
    }

    if (!metodoPagamento) {
      alert('Por favor, selecione um método de pagamento.');
      return;
    }

    setLoading(true);

    try {
      // Preparar dados do pedido (com validações)
      const complementosArray = Array.isArray(complementosSelecionados) ? complementosSelecionados : [];
      
      const detalhesPedido = {
        tamanho: tamanho?.nome || 'Não especificado',
        complementos: complementosArray.map(c => c?.nome || 'Complemento').filter(Boolean),
        total: total.toFixed(2),
        metodo_pagamento: metodoPagamento || 'Não especificado'
      };

      console.log('📦 Dados do pedido:', detalhesPedido);

      // Criar pedido usando RPC
      const { data, error } = await supabase.rpc('criar_novo_pedido', {
        p_detalhes: detalhesPedido
      });

      console.log('📡 Resposta RPC:', { data, error });

      if (error) {
        console.error('❌ Erro RPC:', error);
        alert(`Erro ao criar pedido: ${error.message}`);
        return;
      }

      // Verificar se retornou um ID válido
      if (!data || data <= 0) {
        console.error('❌ ID inválido retornado:', data);
        alert('Erro: ID de pedido inválido');
        return;
      }

      // Sucesso!
      console.log('🎉 Pedido criado com ID:', data);
      alert('Pedido criado com sucesso! Você pode acompanhar na área "Meus Pedidos".');
      
      // Limpar formulário
      setTamanho(null);
      setComplementosSelecionados([]);
      setMetodoPagamento('');
      
      // Ir para meus pedidos
      navigate('/meus-pedidos');

    } catch (error) {
      console.error('❌ Erro geral ao criar pedido:', error);
      
      // Tratar erros específicos
      if (error.code === '22P02' || error.message?.includes('uuid')) {
        console.warn('🔄 Erro UUID - fazendo limpeza');
        alert('Sessão inválida. Redirecionando...');
        await limparTudo();
      } else if (error.message?.includes('RLS')) {
        console.warn('🔐 Erro RLS - problema de permissões');
        alert('Erro de permissões. Faça login novamente.');
        await limparTudo();
      } else {
        console.error('🤷‍♂️ Erro desconhecido:', error);
        alert('Erro ao criar pedido. Tente novamente.');
      }
      
    } finally {
      setLoading(false);
    }
  };

  // Renderização condicional para problemas de sessão
  if (!isSessionValid()) {
    console.warn('⚠️ Renderizando tela de sessão inválida');
    return (
      <div className="cardapio-container" style={{textAlign: 'center', padding: '50px 20px'}}>
        <h2 style={{color: '#dc3545', marginBottom: '20px'}}>⚠️ Problema de Autenticação</h2>
        <p style={{marginBottom: '30px', fontSize: '1.1em'}}>
          Sua sessão está inválida ou expirada.<br/>
          <small>Detalhes: {session ? 'Session existe, mas userId inválido' : 'Nenhuma session encontrada'}</small>
        </p>
        <button 
          onClick={limparTudo}
          style={{
            padding: '15px 30px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1em',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🔄 Limpar e Ir para Login
        </button>
      </div>
    );
  }

  // Loading do cardápio
  if (loadingCardapio) {
    return (
      <div style={{textAlign: 'center', marginTop: '50px'}}>
        <h2>🍇 Carregando cardápio...</h2>
      </div>
    );
  }

  // Erro no cardápio
  if (erro) {
    return (
      <div style={{textAlign: 'center', marginTop: '50px', color: '#dc3545'}}>
        <h2>❌ {erro}</h2>
        <button onClick={() => window.location.reload()} style={{marginTop: '20px', padding: '10px 20px'}}>
          🔄 Recarregar
        </button>
      </div>
    );
  }

  return (
    <div className="cardapio-container">
      <div className="cardapio-header">
        <AcaiHeaderIcon />
        <h1>🍇 Cardápio AçaíSystem</h1>
        <p>Olá, <strong>{user?.email}</strong>! Monte seu açaí perfeito:</p>
      </div>

      {/* Seção de Tamanhos */}
      <div className="cardapio-section">
        <h2>1. Escolha o Tamanho e Tipo</h2>
        <div className="opcoes-grid">
          {listaTamanhos.map((tam) => (
            <div
              key={tam.id}
              className={`opcao-card ${tamanho?.id === tam.id ? 'selecionada' : ''}`}
              onClick={() => setTamanho(tam)}
            >
              <h3>{tam.nome}</h3>
              <p className="preco">R$ {parseFloat(tam.preco).toFixed(2)}</p>
              {tam.descricao && (
                <p className="descricao">{tam.descricao}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Seção de Complementos */}
      <div className="cardapio-section">
        <h2>2. Adicionais (Opcionais)</h2>
        
        {/* Agrupar complementos por categoria */}
        {['Cremes', 'Diversos', 'Frutas'].map(categoria => {
          const complementosCategoria = listaComplementos.filter(comp => 
            comp.categoria === categoria || (!comp.categoria && categoria === 'Diversos')
          );
          
          if (complementosCategoria.length === 0) return null;
          
          return (
            <div key={categoria} className="categoria-section">
              <h3 className="categoria-titulo">{categoria}</h3>
              <div className="opcoes-grid-pequeno">
                {complementosCategoria.map((comp) => (
                  <div
                    key={comp.id}
                    className={`opcao-card-pequeno ${complementosSelecionados.find(c => c.id === comp.id) ? 'selecionada' : ''}`}
                    onClick={() => {
                      if (complementosSelecionados.find(c => c.id === comp.id)) {
                        setComplementosSelecionados(complementosSelecionados.filter(c => c.id !== comp.id));
                      } else {
                        setComplementosSelecionados([...complementosSelecionados, comp]);
                      }
                    }}
                  >
                    <h4>{comp.nome}</h4>
                    <p className="preco">+ R$ {parseFloat(comp.preco).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Seção de Complementos Selecionados */}
      {complementosSelecionados.length > 0 && (
        <div className="cardapio-section">
          <h2>🛒 Complementos Selecionados</h2>
          <div className="complementos-selecionados">
            {complementosSelecionados.map((comp) => (
              <div key={comp.id} className="complemento-selecionado">
                <span className="complemento-nome">{comp.nome}</span>
                <span className="complemento-preco">R$ {parseFloat(comp.preco).toFixed(2)}</span>
                <button
                  className="remover-btn"
                  onClick={() => {
                    setComplementosSelecionados(complementosSelecionados.filter(c => c.id !== comp.id));
                  }}
                  title="Remover complemento"
                >
                  ❌
                </button>
              </div>
            ))}
            <button
              className="limpar-todos-btn"
              onClick={() => {
                setComplementosSelecionados([]);
              }}
            >
              🗑️ Limpar Todos
            </button>
          </div>
        </div>
      )}

      {/* Seção de Método de Pagamento */}
      <div className="cardapio-section">
        <h2>3. Método de Pagamento</h2>
        <div className="metodos-pagamento">
          <label className={`metodo-opcao ${metodoPagamento === 'Dinheiro' ? 'selecionado' : ''}`}>
            <input
              type="radio"
              name="metodoPagamento"
              value="Dinheiro"
              checked={metodoPagamento === 'Dinheiro'}
              onChange={(e) => setMetodoPagamento(e.target.value)}
            />
            <span className="metodo-icon">💵</span> Dinheiro
          </label>

          <label className={`metodo-opcao ${metodoPagamento === 'Cartão' ? 'selecionado' : ''}`}>
            <input
              type="radio"
              name="metodoPagamento"
              value="Cartão"
              checked={metodoPagamento === 'Cartão'}
              onChange={(e) => setMetodoPagamento(e.target.value)}
            />
            <span className="metodo-icon">💳</span> Cartão (Débito/Crédito)
          </label>

          <label className={`metodo-opcao ${metodoPagamento === 'PIX' ? 'selecionado' : ''}`}>
            <input
              type="radio"
              name="metodoPagamento"
              value="PIX"
              checked={metodoPagamento === 'PIX'}
              onChange={(e) => setMetodoPagamento(e.target.value)}
            />
            <span className="metodo-icon">📱</span> PIX
          </label>
        </div>
      </div>

      {/* Total e Finalizar */}
      <div className="total-section">
        <div className="total-valor">
          <span className="total-icon">🍇</span>
          Total: R$ {total.toFixed(2)}
        </div>
        
        <button
          onClick={criarPedido}
          disabled={loading || !tamanho || !metodoPagamento}
          className={`finalizar-btn ${loading ? 'loading' : ''} ${(!tamanho || !metodoPagamento) ? 'disabled' : ''}`}
        >
          {loading ? 'Processando...' : 'A ENVIAR 🚀'}
        </button>
      </div>

      {/* Links de navegação */}
      <div className="navigation-links">
        <Link to="/meus-pedidos" className="nav-link">
          📋 Ver Meus Pedidos
        </Link>
        <Link to="/" className="nav-link">
          🏠 Voltar ao Início
        </Link>
      </div>
    </div>
  );
}

export default Cardapio;