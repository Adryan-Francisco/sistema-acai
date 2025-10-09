// src/components/ProgramaFidelidade.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';
import { Star, Gift, TrendingUp, Award, ArrowLeft, CheckCircle, Calendar, Trophy } from 'lucide-react';
import './ProgramaFidelidade.css';

export default function ProgramaFidelidade() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [pontos, setPontos] = useState(0);
  const [historico, setHistorico] = useState([]);
  const [totalResgatados, setTotalResgatados] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }
    carregarDados();
  }, [session, navigate]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      // Carregar pontos do usuário
      const { data: usuario, error: userError } = await supabase
        .from('profiles')
        .select('pontos_fidelidade')
        .eq('id', session.user.id)
        .single();

      if (userError) throw userError;
      setPontos(usuario?.pontos_fidelidade || 0);

      // Carregar histórico de pedidos (para mostrar pontos ganhos)
      const { data: pedidos, error: pedidosError } = await supabase
        .from('pedidos')
        .select('id, created_at, status, detalhes_pedido')
        .eq('usuario_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (pedidosError) throw pedidosError;
      setHistorico(pedidos || []);

      // Contar açaís resgatados
      const resgatados = pedidos?.filter(p => 
        p.detalhes_pedido?.tipo === 'resgate_fidelidade'
      ).length || 0;
      setTotalResgatados(resgatados);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const acaisDisponiveis = Math.floor(pontos / 10);
  const pontosParaProximo = 10 - (pontos % 10);
  const progresso = (pontos % 10) * 10;

  if (loading) {
    return (
      <div className="fidelidade-loading">
        <div className="loading-spinner"></div>
        <p>Carregando seus pontos...</p>
      </div>
    );
  }

  return (
    <div className="fidelidade-container">
      <div className="fidelidade-header">
        <button onClick={() => navigate('/')} className="btn-voltar">
          <ArrowLeft size={20} />
          Voltar
        </button>
        <h1>⭐ Programa de Fidelidade</h1>
        <p className="subtitle">Ganhe pontos a cada pedido e troque por açaís grátis!</p>
      </div>

      <div className="fidelidade-content">
        {/* Card Principal de Pontos */}
        <div className="pontos-card">
          <div className="pontos-icon">🍇</div>
          <h2>Seus Pontos</h2>
          <div className="pontos-display">
            <span className="pontos-numero">{pontos}</span>
            <span className="pontos-label">pontos</span>
          </div>

          <div className="progress-section">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${progresso}%` }}
              ></div>
            </div>
            <p className="progress-text">
              {pontosParaProximo === 10 
                ? '🎉 Você tem pontos para resgatar!' 
                : `Faltam ${pontosParaProximo} pontos para o próximo açaí grátis`
              }
            </p>
          </div>

          {acaisDisponiveis > 0 && (
            <button 
              className="btn-resgatar-principal"
              onClick={() => navigate('/resgatar-acai')}
            >
              <Gift size={20} />
              Resgatar {acaisDisponiveis} Açaí{acaisDisponiveis > 1 ? 's' : ''} Grátis
            </button>
          )}
        </div>

        {/* Cards de Estatísticas */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <Star size={24} fill="currentColor" />
            </div>
            <div className="stat-info">
              <p className="stat-value">{pontos % 10}/10</p>
              <p className="stat-label">Progresso Atual</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <Gift size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-value">{acaisDisponiveis}</p>
              <p className="stat-label">Açaís Disponíveis</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <Trophy size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-value">{totalResgatados}</p>
              <p className="stat-label">Açaís Resgatados</p>
            </div>
          </div>
        </div>

        {/* Como Funciona */}
        <div className="info-card">
          <h3>📖 Como Funciona?</h3>
          <div className="info-steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Faça Pedidos</h4>
                <p>A cada pedido concluído, você ganha 1 ponto de fidelidade</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Acumule Pontos</h4>
                <p>Quando atingir 10 pontos, você pode resgatar 1 açaí grátis</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Resgate Grátis</h4>
                <p>Troque seus pontos por um açaí de 500ml com complementos inclusos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Benefícios */}
        <div className="benefits-card">
          <h3>✨ Benefícios do Programa</h3>
          <ul className="benefits-list">
            <li>
              <CheckCircle size={20} />
              <span>1 ponto por pedido concluído</span>
            </li>
            <li>
              <CheckCircle size={20} />
              <span>Açaí grátis de 500ml</span>
            </li>
            <li>
              <CheckCircle size={20} />
              <span>Complementos padrão inclusos</span>
            </li>
            <li>
              <CheckCircle size={20} />
              <span>Sem data de validade dos pontos</span>
            </li>
            <li>
              <CheckCircle size={20} />
              <span>Acumule quantos pontos quiser</span>
            </li>
            <li>
              <CheckCircle size={20} />
              <span>Resgate quando quiser</span>
            </li>
          </ul>
        </div>

        {/* Histórico Recente */}
        {historico.length > 0 && (
          <div className="historico-card">
            <h3>📅 Últimos Pedidos</h3>
            <div className="historico-list">
              {historico.slice(0, 5).map((pedido) => (
                <div key={pedido.id} className="historico-item">
                  <div className="historico-icon">
                    {pedido.detalhes_pedido?.tipo === 'resgate_fidelidade' ? (
                      <Gift size={20} color="#10b981" />
                    ) : pedido.status === 'Concluído' ? (
                      <CheckCircle size={20} color="#667eea" />
                    ) : (
                      <Calendar size={20} color="#9ca3af" />
                    )}
                  </div>
                  <div className="historico-info">
                    <p className="historico-tipo">
                      {pedido.detalhes_pedido?.tipo_acai || 'Açaí'}
                    </p>
                    <p className="historico-data">
                      {new Date(pedido.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="historico-pontos">
                    {pedido.detalhes_pedido?.tipo === 'resgate_fidelidade' ? (
                      <span className="pontos-resgate">-10 pts</span>
                    ) : pedido.status === 'Concluído' ? (
                      <span className="pontos-ganho">+1 pt</span>
                    ) : (
                      <span className="pontos-pendente">Pendente</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
