// src/components/ResgatarAcai.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';
import { Gift, CheckCircle, Loader, AlertCircle } from 'lucide-react';
import './ResgatarAcai.css';

export default function ResgatarAcai() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pontos, setPontos] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }
    carregarPontos();
  }, [session, navigate]);

  const carregarPontos = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('pontos_fidelidade')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      setPontos(data?.pontos_fidelidade || 0);
    } catch (err) {
      console.error('Erro ao carregar pontos:', err);
      setPontos(0);
    }
  };

  const handleResgate = async () => {
    if (pontos < 10) {
      setError('Você precisa de 10 pontos para resgatar um açaí grátis!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Atualizar pontos do usuário (10 pontos = 1 açaí grátis)
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ 
          pontos_fidelidade: pontos - 10 
        })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      // 2. Criar pedido de resgate
      const nomeCliente = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Cliente';
      
      const { error: pedidoError } = await supabase
        .from('pedidos')
        .insert({
          usuario_id: session.user.id,
          nome_cliente: nomeCliente,
          detalhes_pedido: {
            tipo: 'resgate_fidelidade',
            tipo_acai: 'Açaí Grátis - Fidelidade',
            tamanho: '500ml',
            complementos_padrao: ['Granola', 'Leite em pó', 'Paçoca'],
            complementos_adicionais: [],
            complementos_removidos: [],
            metodo_pagamento: 'Fidelidade (10 pontos)',
            total: '0.00',
            observacoes: '🎁 AÇAÍ GRÁTIS - Resgate de Fidelidade'
          },
          status: 'Recebido'
        });

      if (pedidoError) throw pedidoError;

      // 3. Mostrar sucesso
      setShowSuccess(true);
      setPontos(pontos - 10);

      // 4. Redirecionar após 3 segundos
      setTimeout(() => {
        navigate('/meus-pedidos');
      }, 3000);

    } catch (err) {
      console.error('Erro ao resgatar:', err);
      setError('Erro ao processar resgate. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="resgatar-container">
        <div className="resgatar-card success-card">
          <div className="success-icon">
            <CheckCircle size={80} />
          </div>
          <h1 className="success-title">Açaí Grátis Resgatado! 🎉</h1>
          <p className="success-message">
            Seu pedido foi enviado para a açaiteria!
            <br />
            Prepare-se para saborear seu açaí grátis!
          </p>
          <div className="success-info">
            <p>✅ Pedido criado com sucesso</p>
            <p>🔔 Açaiteria foi notificada</p>
            <p>📋 Acompanhe em "Meus Pedidos"</p>
          </div>
          <div className="loading-redirect">
            <Loader className="spin" size={20} />
            <span>Redirecionando...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="resgatar-container">
      <div className="resgatar-card">
        <div className="resgatar-header">
          <Gift className="gift-icon" size={60} />
          <h1 className="resgatar-title">Resgatar Açaí Grátis</h1>
          <p className="resgatar-subtitle">
            Use seus pontos de fidelidade para ganhar um açaí grátis!
          </p>
        </div>

        <div className="pontos-display">
          <div className="pontos-icon">🍇</div>
          <div className="pontos-info">
            <span className="pontos-label">Seus Pontos</span>
            <span className="pontos-valor">{pontos} pontos</span>
          </div>
        </div>

        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${Math.min((pontos / 10) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="progress-text">
            {pontos >= 10 
              ? '🎉 Você pode resgatar!' 
              : `Faltam ${10 - pontos} pontos para resgatar`
            }
          </p>
        </div>

        <div className="resgate-info">
          <h3>Como funciona?</h3>
          <ul>
            <li>✅ Acumule 10 pontos de fidelidade</li>
            <li>🎁 Resgate 1 açaí grátis (500ml)</li>
            <li>🍇 Inclui complementos padrão</li>
            <li>🔔 Notificação enviada para açaiteria</li>
          </ul>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <button
          className={`btn-resgatar ${pontos < 10 ? 'disabled' : ''}`}
          onClick={handleResgate}
          disabled={loading || pontos < 10}
        >
          {loading ? (
            <>
              <Loader className="spin" size={20} />
              <span>Processando...</span>
            </>
          ) : (
            <>
              <Gift size={20} />
              <span>Resgatar Açaí Grátis</span>
            </>
          )}
        </button>

        {pontos < 10 && (
          <p className="hint-text">
            💡 Dica: Cada pedido concluído te dá 1 ponto de fidelidade!
          </p>
        )}

        <button
          className="btn-voltar"
          onClick={() => navigate('/')}
        >
          Voltar ao Cardápio
        </button>
      </div>
    </div>
  );
}
