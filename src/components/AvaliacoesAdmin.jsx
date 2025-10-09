// src/components/AvaliacoesAdmin.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Star, MessageSquare, TrendingUp, Award, Filter, Search } from 'lucide-react';
import './AvaliacoesAdmin.css';

export default function AvaliacoesAdmin() {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    media: 0,
    distribuicao: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [filtroNota, setFiltroNota] = useState('all');
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarAvaliacoes();
  }, [filtroNota]);

  const carregarAvaliacoes = async () => {
    setLoading(true);
    try {
      // Buscar avaliações com informações do pedido e usuário
      let query = supabase
        .from('avaliacoes')
        .select(`
          *,
          pedidos (
            id,
            detalhes_pedido,
            created_at,
            usuario_id
          ),
          profiles:usuario_id (
            nome,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (filtroNota !== 'all') {
        query = query.eq('nota', parseInt(filtroNota));
      }

      const { data, error } = await query;

      if (error) throw error;

      setAvaliacoes(data || []);
      calcularEstatisticas(data || []);
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularEstatisticas = (data) => {
    const total = data.length;
    const soma = data.reduce((acc, av) => acc + av.nota, 0);
    const media = total > 0 ? (soma / total) : 0;

    const distribuicao = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    data.forEach(av => {
      distribuicao[av.nota]++;
    });

    setStats({ total, media, distribuicao });
  };

  const avaliacoesFiltradas = avaliacoes.filter(av => {
    if (!busca) return true;
    const nomeCliente = av.profiles?.nome?.toLowerCase() || '';
    const comentario = av.comentario?.toLowerCase() || '';
    const termoBusca = busca.toLowerCase();
    return nomeCliente.includes(termoBusca) || comentario.includes(termoBusca);
  });

  const renderStars = (nota) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={20}
        fill={i < nota ? '#fbbf24' : 'none'}
        stroke={i < nota ? '#fbbf24' : '#d1d5db'}
      />
    ));
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="avaliacoes-loading">
        <div className="loading-spinner"></div>
        <p>Carregando avaliações...</p>
      </div>
    );
  }

  return (
    <div className="avaliacoes-admin">
      <div className="avaliacoes-header">
        <h2>⭐ Avaliações dos Clientes</h2>
      </div>

      {/* Cards de Estatísticas */}
      <div className="avaliacoes-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' }}>
            <Award size={28} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Avaliação Média</p>
            <p className="stat-value">{stats.media.toFixed(1)} ⭐</p>
            <p className="stat-detail">{stats.total} avaliações</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <TrendingUp size={28} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Avaliações Positivas</p>
            <p className="stat-value">
              {stats.total > 0 
                ? Math.round(((stats.distribuicao[5] + stats.distribuicao[4]) / stats.total) * 100)
                : 0}%
            </p>
            <p className="stat-detail">4-5 estrelas</p>
          </div>
        </div>

        <div className="stat-card distribuicao-card">
          <h4>📊 Distribuição de Notas</h4>
          <div className="distribuicao-bars">
            {[5, 4, 3, 2, 1].map(nota => {
              const porcentagem = stats.total > 0 
                ? (stats.distribuicao[nota] / stats.total) * 100 
                : 0;
              return (
                <div key={nota} className="distribuicao-item">
                  <span className="nota-label">{nota} ★</span>
                  <div className="distribuicao-bar-bg">
                    <div 
                      className="distribuicao-bar-fill" 
                      style={{ 
                        width: `${porcentagem}%`,
                        background: nota >= 4 ? '#10b981' : nota === 3 ? '#fbbf24' : '#ef4444'
                      }}
                    ></div>
                  </div>
                  <span className="nota-count">{stats.distribuicao[nota]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="avaliacoes-filtros">
        <div className="filtro-busca">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar por cliente ou comentário..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="filtro-notas">
          <Filter size={20} />
          <select value={filtroNota} onChange={(e) => setFiltroNota(e.target.value)}>
            <option value="all">Todas as notas</option>
            <option value="5">⭐⭐⭐⭐⭐ (5 estrelas)</option>
            <option value="4">⭐⭐⭐⭐ (4 estrelas)</option>
            <option value="3">⭐⭐⭐ (3 estrelas)</option>
            <option value="2">⭐⭐ (2 estrelas)</option>
            <option value="1">⭐ (1 estrela)</option>
          </select>
        </div>
      </div>

      {/* Lista de Avaliações */}
      <div className="avaliacoes-lista">
        {avaliacoesFiltradas.length === 0 ? (
          <div className="avaliacoes-vazio">
            <MessageSquare size={64} />
            <p>Nenhuma avaliação encontrada</p>
          </div>
        ) : (
          avaliacoesFiltradas.map(avaliacao => (
            <div key={avaliacao.id} className="avaliacao-card">
              <div className="avaliacao-header">
                <div className="cliente-info">
                  <div className="cliente-avatar">
                    {avaliacao.profiles?.nome?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <h4>{avaliacao.profiles?.nome || 'Cliente'}</h4>
                    <p className="avaliacao-data">{formatarData(avaliacao.created_at)}</p>
                  </div>
                </div>
                <div className="avaliacao-nota">
                  {renderStars(avaliacao.nota)}
                </div>
              </div>

              {avaliacao.comentario && (
                <div className="avaliacao-comentario">
                  <MessageSquare size={16} />
                  <p>{avaliacao.comentario}</p>
                </div>
              )}

              <div className="avaliacao-pedido-info">
                <span>Pedido #{avaliacao.pedido_id.slice(0, 8)}</span>
                <span>R$ {avaliacao.pedidos?.detalhes_pedido?.total?.toFixed(2) || '0.00'}</span>
                <span>{formatarData(avaliacao.pedidos?.created_at)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
