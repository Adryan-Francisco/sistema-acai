// src/components/DashboardAdmin.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, ShoppingBag, Users, Star, Gift, Clock, Award, ArrowLeft } from 'lucide-react';
import './DashboardAdmin.css';

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalVendas: 0,
    pedidosHoje: 0,
    pedidosSemana: 0,
    pedidosMes: 0,
    ticketMedio: 0,
    totalClientes: 0,
    acaisResgatados: 0,
    avaliacaoMedia: 0
  });

  const [topAcais, setTopAcais] = useState([]);
  const [vendasPorDia, setVendasPorDia] = useState([]);
  const [vendasPorHorario, setVendasPorHorario] = useState([]);
  const [statusPedidos, setStatusPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarEstatisticas();
  }, []);

  const carregarEstatisticas = async () => {
    setLoading(true);
    try {
      await Promise.all([
        carregarEstatisticasGerais(),
        carregarTopAcais(),
        carregarVendasPorDia(),
        carregarVendasPorHorario(),
        carregarStatusPedidos()
      ]);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarEstatisticasGerais = async () => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const semanaAtras = new Date();
    semanaAtras.setDate(semanaAtras.getDate() - 7);

    const mesAtras = new Date();
    mesAtras.setMonth(mesAtras.getMonth() - 1);

    // Total de vendas
    const { data: todosPedidos } = await supabase
      .from('pedidos')
      .select('detalhes_pedido')
      .neq('status', 'Cancelado');

    const totalVendas = todosPedidos?.reduce((sum, p) => {
      const total = parseFloat(p.detalhes_pedido?.total || 0);
      return sum + total;
    }, 0) || 0;

    // Pedidos hoje
    const { count: pedidosHoje } = await supabase
      .from('pedidos')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', hoje.toISOString())
      .neq('status', 'Cancelado');

    // Pedidos semana
    const { count: pedidosSemana } = await supabase
      .from('pedidos')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', semanaAtras.toISOString())
      .neq('status', 'Cancelado');

    // Pedidos mês
    const { count: pedidosMes } = await supabase
      .from('pedidos')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', mesAtras.toISOString())
      .neq('status', 'Cancelado');

    // Ticket médio
    const ticketMedio = todosPedidos?.length > 0 ? totalVendas / todosPedidos.length : 0;

    // Total de clientes
    const { count: totalClientes } = await supabase
      .from('usuarios')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'cliente');

    // Açaís resgatados
    const { count: acaisResgatados } = await supabase
      .from('pedidos')
      .select('*', { count: 'exact', head: true })
      .eq('detalhes_pedido->>tipo', 'resgate_fidelidade');

    // Avaliação média
    const { data: avaliacoes } = await supabase
      .from('avaliacoes')
      .select('nota');

    const avaliacaoMedia = avaliacoes?.length > 0
      ? avaliacoes.reduce((sum, a) => sum + a.nota, 0) / avaliacoes.length
      : 0;

    setStats({
      totalVendas,
      pedidosHoje: pedidosHoje || 0,
      pedidosSemana: pedidosSemana || 0,
      pedidosMes: pedidosMes || 0,
      ticketMedio,
      totalClientes: totalClientes || 0,
      acaisResgatados: acaisResgatados || 0,
      avaliacaoMedia
    });
  };

  const carregarTopAcais = async () => {
    const { data: pedidos } = await supabase
      .from('pedidos')
      .select('detalhes_pedido')
      .neq('status', 'Cancelado');

    const contagem = {};
    pedidos?.forEach(p => {
      const tipo = p.detalhes_pedido?.tipo_acai || 'Não especificado';
      contagem[tipo] = (contagem[tipo] || 0) + 1;
    });

    const topAcais = Object.entries(contagem)
      .map(([nome, quantidade]) => ({ nome, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5);

    setTopAcais(topAcais);
  };

  const carregarVendasPorDia = async () => {
    const { data: pedidos } = await supabase
      .from('pedidos')
      .select('created_at, detalhes_pedido')
      .neq('status', 'Cancelado')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });

    const vendasPorDia = {};
    pedidos?.forEach(p => {
      const dia = new Date(p.created_at).toLocaleDateString('pt-BR', { weekday: 'short' });
      const total = parseFloat(p.detalhes_pedido?.total || 0);
      vendasPorDia[dia] = (vendasPorDia[dia] || 0) + total;
    });

    const dados = Object.entries(vendasPorDia).map(([dia, total]) => ({
      dia: dia.charAt(0).toUpperCase() + dia.slice(1),
      total: parseFloat(total.toFixed(2))
    }));

    setVendasPorDia(dados);
  };

  const carregarVendasPorHorario = async () => {
    const { data: pedidos } = await supabase
      .from('pedidos')
      .select('created_at')
      .neq('status', 'Cancelado')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const horarios = Array.from({ length: 24 }, (_, i) => ({ hora: `${i}h`, pedidos: 0 }));

    pedidos?.forEach(p => {
      const hora = new Date(p.created_at).getHours();
      horarios[hora].pedidos++;
    });

    setVendasPorHorario(horarios.filter(h => h.pedidos > 0));
  };

  const carregarStatusPedidos = async () => {
    const { data: pedidos } = await supabase
      .from('pedidos')
      .select('status')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const contagem = {};
    pedidos?.forEach(p => {
      contagem[p.status] = (contagem[p.status] || 0) + 1;
    });

    const dados = Object.entries(contagem).map(([status, quantidade]) => ({
      status,
      quantidade
    }));

    setStatusPedidos(dados);
  };

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Carregando estatísticas...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <button 
          onClick={() => navigate('/admin')} 
          className="btn-back"
          title="Voltar ao Painel Admin"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>
        <h1>📊 Dashboard de Estatísticas</h1>
        <button onClick={carregarEstatisticas} className="btn-refresh">
          🔄 Atualizar
        </button>
      </div>

      {/* Cards de Métricas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <DollarSign size={28} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Total de Vendas</p>
            <p className="stat-value">R$ {stats.totalVendas.toFixed(2)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <ShoppingBag size={28} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Pedidos Hoje</p>
            <p className="stat-value">{stats.pedidosHoje}</p>
            <p className="stat-detail">Semana: {stats.pedidosSemana} | Mês: {stats.pedidosMes}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <TrendingUp size={28} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Ticket Médio</p>
            <p className="stat-value">R$ {stats.ticketMedio.toFixed(2)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <Users size={28} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Total de Clientes</p>
            <p className="stat-value">{stats.totalClientes}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
            <Gift size={28} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Açaís Resgatados</p>
            <p className="stat-value">{stats.acaisResgatados}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ffa751 0%, #ffe259 100%)' }}>
            <Star size={28} fill="currentColor" />
          </div>
          <div className="stat-info">
            <p className="stat-label">Avaliação Média</p>
            <p className="stat-value">{stats.avaliacaoMedia.toFixed(1)} ⭐</p>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="charts-grid">
        {/* Vendas por Dia */}
        <div className="chart-card">
          <h3>📈 Vendas dos Últimos 7 Dias</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={vendasPorDia}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" />
              <YAxis />
              <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="total" fill="#667eea" name="Total (R$)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Açaís */}
        <div className="chart-card">
          <h3>🏆 Top 5 Açaís Mais Vendidos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topAcais}
                dataKey="quantidade"
                nameKey="nome"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {topAcais.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Horários de Pico */}
        <div className="chart-card">
          <h3>⏰ Horários de Pico (Últimos 7 Dias)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={vendasPorHorario}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hora" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="pedidos" stroke="#764ba2" strokeWidth={2} name="Pedidos" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status dos Pedidos */}
        <div className="chart-card">
          <h3>📊 Status dos Pedidos (Último Mês)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusPedidos} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="status" type="category" />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantidade" fill="#f093fb" name="Quantidade" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
