// src/components/HorarioFuncionamento.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Clock, Save, AlertCircle, CheckCircle, Power, ArrowLeft, Copy } from 'lucide-react';
import './HorarioFuncionamento.css';

export default function HorarioFuncionamento() {
  const navigate = useNavigate();
  const [horarios, setHorarios] = useState({
    segunda: { aberto: true, inicio: '09:00', fim: '22:00' },
    terca: { aberto: true, inicio: '09:00', fim: '22:00' },
    quarta: { aberto: true, inicio: '09:00', fim: '22:00' },
    quinta: { aberto: true, inicio: '09:00', fim: '22:00' },
    sexta: { aberto: true, inicio: '09:00', fim: '22:00' },
    sabado: { aberto: true, inicio: '10:00', fim: '23:00' },
    domingo: { aberto: true, inicio: '10:00', fim: '22:00' },
  });
  
  const [vendasPausadas, setVendasPausadas] = useState(false);
  const [mensagemFechado, setMensagemFechado] = useState('Desculpe, estamos fechados no momento.');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const diasSemana = {
    segunda: 'Segunda-feira',
    terca: 'Terça-feira',
    quarta: 'Quarta-feira',
    quinta: 'Quinta-feira',
    sexta: 'Sexta-feira',
    sabado: 'Sábado',
    domingo: 'Domingo'
  };

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  const carregarConfiguracoes = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracoes')
        .select('*')
        .single();

      if (data) {
        if (data.horarios) setHorarios(data.horarios);
        if (data.vendas_pausadas !== undefined) setVendasPausadas(data.vendas_pausadas);
        if (data.mensagem_fechado) setMensagemFechado(data.mensagem_fechado);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async () => {
    setSaving(true);
    try {
      // Verificar se já existe configuração
      const { data: existing } = await supabase
        .from('configuracoes')
        .select('id')
        .single();

      const configData = {
        horarios,
        vendas_pausadas: vendasPausadas,
        mensagem_fechado: mensagemFechado,
        updated_at: new Date().toISOString()
      };

      let result;
      if (existing) {
        result = await supabase
          .from('configuracoes')
          .update(configData)
          .eq('id', existing.id);
      } else {
        result = await supabase
          .from('configuracoes')
          .insert(configData);
      }

      if (result.error) throw result.error;

      setMessage({ type: 'success', text: '✅ Configurações salvas com sucesso!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setMessage({ type: 'error', text: '❌ Erro ao salvar configurações.' });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleHorarioChange = (dia, campo, valor) => {
    setHorarios(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [campo]: valor
      }
    }));
  };

  const toggleDia = (dia) => {
    setHorarios(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        aberto: !prev[dia].aberto
      }
    }));
  };

  const aplicarParaTodos = (diaReferencia) => {
    const horarioReferencia = horarios[diaReferencia];
    const novosHorarios = {};
    Object.keys(horarios).forEach(dia => {
      novosHorarios[dia] = {
        ...horarioReferencia
      };
    });
    setHorarios(novosHorarios);
    setMessage({ type: 'info', text: `✨ Horário da ${diasSemana[diaReferencia]} aplicado para todos os dias!` });
    setTimeout(() => setMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="horario-loading">
        <div className="loading-spinner"></div>
        <p>Carregando configurações...</p>
      </div>
    );
  }

  return (
    <div className="horario-funcionamento">
      {/* Header com Botão Voltar */}
      <div className="horario-header">
        <div className="header-left">
          <button 
            onClick={() => navigate('/admin')} 
            className="btn-voltar"
            title="Voltar ao Painel Admin"
          >
            <ArrowLeft size={20} />
            Voltar
          </button>
          <div className="header-title">
            <div className="title-icon">
              <Clock size={32} />
            </div>
            <div>
              <h2>⏰ Horário de Funcionamento</h2>
              <p>Configure os horários e controle de vendas</p>
            </div>
          </div>
        </div>
        <button onClick={handleSalvar} className="btn-salvar" disabled={saving}>
          <Save size={20} />
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

      {message && (
        <div className={`horario-message ${message.type}`}>
          {message.type === 'success' && <CheckCircle size={20} />}
          {message.type === 'error' && <AlertCircle size={20} />}
          {message.type === 'info' && <AlertCircle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Controle Global de Vendas */}
      <div className="vendas-controle">
        <div className="controle-header">
          <div className="controle-info">
            <Power size={24} />
            <div>
              <h3>Controle de Vendas</h3>
              <p>Pausar temporariamente todas as vendas (útil para férias, problemas técnicos, etc.)</p>
            </div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={!vendasPausadas}
              onChange={(e) => setVendasPausadas(!e.target.checked)}
            />
            <span className="toggle-slider"></span>
            <span className="toggle-label">{vendasPausadas ? 'Vendas Pausadas' : 'Vendas Ativas'}</span>
          </label>
        </div>

        {vendasPausadas && (
          <div className="mensagem-fechado">
            <label>Mensagem para clientes quando estiver fechado:</label>
            <textarea
              value={mensagemFechado}
              onChange={(e) => setMensagemFechado(e.target.value)}
              rows={3}
              placeholder="Ex: Desculpe, estamos em manutenção. Voltamos em breve!"
            />
          </div>
        )}
      </div>

      {/* Horários por Dia */}
      <div className="horarios-grid">
        {Object.keys(diasSemana).map(dia => (
          <div key={dia} className={`horario-card ${!horarios[dia].aberto ? 'fechado' : ''}`}>
            <div className="horario-card-header">
              <div className="dia-info">
                <Clock size={20} />
                <h4>{diasSemana[dia]}</h4>
              </div>
              <label className="toggle-switch-small">
                <input
                  type="checkbox"
                  checked={horarios[dia].aberto}
                  onChange={() => toggleDia(dia)}
                />
                <span className="toggle-slider-small"></span>
              </label>
            </div>

            {horarios[dia].aberto ? (
              <>
                <div className="horario-inputs">
                  <div className="input-group">
                    <label>Abertura</label>
                    <input
                      type="time"
                      value={horarios[dia].inicio}
                      onChange={(e) => handleHorarioChange(dia, 'inicio', e.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <label>Fechamento</label>
                    <input
                      type="time"
                      value={horarios[dia].fim}
                      onChange={(e) => handleHorarioChange(dia, 'fim', e.target.value)}
                    />
                  </div>
                </div>
                <button 
                  onClick={() => aplicarParaTodos(dia)}
                  className="btn-aplicar-todos"
                  title="Aplicar este horário para todos os dias"
                >
                  <Copy size={16} />
                  Aplicar para todos os dias
                </button>
              </>
            ) : (
              <div className="dia-fechado">
                <p>❌ Fechado</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
