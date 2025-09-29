// src/components/CatalogoAdmin.jsx
import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import './PainelAdmin.css'; // Reutilizar os estilos

function CatalogoAdmin() {
  const [tamanhos, setTamanhos] = useState([]);
  const [complementos, setComplementos] = useState([]);
  const [novoTamanho, setNovoTamanho] = useState({ nome: '', preco: '', ordem: 0 });
  const [novoComplemento, setNovoComplemento] = useState({ nome: '', preco: '', ordem: 0 });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null); // { type: 'error'|'success', text }

  // Buscar dados do catálogo
  const fetchCatalogo = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    try {
      const [tamanhosRes, complementosRes] = await Promise.all([
        supabase.from('tamanhos').select('*').order('ordem'),
        supabase.from('complementos').select('*').order('ordem')
      ]);

      setTamanhos(tamanhosRes.data || []);
      setComplementos(complementosRes.data || []);
    } catch (error) {
      console.error('Erro ao buscar catálogo:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar catálogo' });
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchCatalogo();
  }, []);

  // Limpar mensagens após 5 segundos
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const criarTamanho = async (e) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setMessage({ type: 'error', text: 'Supabase não configurado.' });
      return;
    }

    try {
      const { error } = await supabase.from('tamanhos').insert([
        { 
          nome: novoTamanho.nome.trim(), 
          preco: Number(novoTamanho.preco), 
          ordem: Number(novoTamanho.ordem) 
        }
      ]);

      if (error) throw error;

      setMessage({ type: 'success', text: `Tamanho "${novoTamanho.nome}" criado com sucesso!` });
      setNovoTamanho({ nome: '', preco: '', ordem: 0 });
      await fetchCatalogo(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao criar tamanho:', error);
      setMessage({ type: 'error', text: 'Erro ao criar tamanho: ' + (error.message || '') });
    }
  };

  const criarComplemento = async (e) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setMessage({ type: 'error', text: 'Supabase não configurado.' });
      return;
    }

    try {
      const { error } = await supabase.from('complementos').insert([
        { 
          nome: novoComplemento.nome.trim(), 
          preco: Number(novoComplemento.preco), 
          ordem: Number(novoComplemento.ordem) 
        }
      ]);

      if (error) throw error;

      setMessage({ type: 'success', text: `Complemento "${novoComplemento.nome}" criado com sucesso!` });
      setNovoComplemento({ nome: '', preco: '', ordem: 0 });
      await fetchCatalogo(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao criar complemento:', error);
      setMessage({ type: 'error', text: 'Erro ao criar complemento: ' + (error.message || '') });
    }
  };

  const deletarTamanho = async (id, nome) => {
    if (!confirm(`Tem certeza que deseja remover o tamanho "${nome}"?`)) return;
    
    try {
      const { error } = await supabase.from('tamanhos').delete().eq('id', id);
      if (error) throw error;

      setMessage({ type: 'success', text: `Tamanho "${nome}" removido com sucesso!` });
      setTamanhos(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Erro ao deletar tamanho:', error);
      setMessage({ type: 'error', text: 'Erro ao remover tamanho: ' + (error.message || '') });
    }
  };

  const deletarComplemento = async (id, nome) => {
    if (!confirm(`Tem certeza que deseja remover o complemento "${nome}"?`)) return;
    
    try {
      const { error } = await supabase.from('complementos').delete().eq('id', id);
      if (error) throw error;

      setMessage({ type: 'success', text: `Complemento "${nome}" removido com sucesso!` });
      setComplementos(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Erro ao deletar complemento:', error);
      setMessage({ type: 'error', text: 'Erro ao remover complemento: ' + (error.message || '') });
    }
  };

  if (loading) {
    return (
      <div className="painel-admin-container">
        <p className="loading-message">Carregando catálogo...</p>
      </div>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="painel-admin-container">
        <h1>📋 Gestão de Catálogo</h1>
        <div className="message error">
          Supabase não configurado. Configure o arquivo .env antes de gerenciar o catálogo.
        </div>
      </div>
    );
  }

  return (
    <div className="painel-admin-container">
      <h1>📋 Gestão de Catálogo</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
        Gerencie os tamanhos de açaí e complementos disponíveis no cardápio
      </p>

      {message && (
        <div className={`message ${message.type}`} style={{ marginBottom: 24 }}>
          {message.text}
        </div>
      )}

      <div className="catalogo-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: 24,
        marginBottom: 32
      }}>
        {/* Seção Tamanhos */}
        <div className="catalogo-section">
          <div className="section-header" style={{ 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            padding: '12px 16px', 
            borderRadius: '8px 8px 0 0',
            marginBottom: 0
          }}>
            <h2 style={{ margin: 0, fontSize: '1.2em' }}>🥤 Tamanhos de Açaí</h2>
          </div>
          
          <div className="section-content" style={{ 
            backgroundColor: 'rgba(248, 250, 252, 0.95)', 
            padding: 16, 
            borderRadius: '0 0 8px 8px',
            border: '1px solid rgba(209, 213, 219, 0.5)'
          }}>
            <form onSubmit={criarTamanho} className="form-catalogo" style={{ marginBottom: 16 }}>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
                <input 
                  placeholder="Nome do tamanho (ex: Pequeno 300ml)" 
                  value={novoTamanho.nome} 
                  onChange={(e) => setNovoTamanho(s => ({ ...s, nome: e.target.value }))} 
                  required 
                  className="form-input"
                />
                <input 
                  placeholder="Preço" 
                  type="number" 
                  step="0.01" 
                  min="0"
                  value={novoTamanho.preco} 
                  onChange={(e) => setNovoTamanho(s => ({ ...s, preco: e.target.value }))} 
                  required 
                  className="form-input"
                />
                <input 
                  placeholder="Ordem" 
                  type="number" 
                  min="0"
                  value={novoTamanho.ordem} 
                  onChange={(e) => setNovoTamanho(s => ({ ...s, ordem: e.target.value }))} 
                  className="form-input"
                />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                ➕ Adicionar Tamanho
              </button>
            </form>

            <div className="items-list">
              {tamanhos.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 20 }}>
                  Nenhum tamanho cadastrado
                </p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {tamanhos.map((t) => (
                    <li key={t.id} className="item-card" style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: 12,
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      marginBottom: 8,
                      borderRadius: 6,
                      border: '1px solid rgba(209, 213, 219, 0.5)'
                    }}>
                      <div className="item-info">
                        <span className="item-name" style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>
                          {t.nome}
                        </span>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9em' }}>
                          R$ {Number(t.preco).toFixed(2)} • Ordem: {t.ordem}
                        </div>
                      </div>
                      <button 
                        onClick={() => deletarTamanho(t.id, t.nome)}
                        className="btn-danger"
                        style={{ 
                          padding: '6px 12px', 
                          backgroundColor: '#f44336', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: 4, 
                          cursor: 'pointer',
                          fontSize: '0.9em'
                        }}
                      >
                        🗑️ Remover
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Seção Complementos */}
        <div className="catalogo-section">
          <div className="section-header" style={{ 
            backgroundColor: '#FF9800', 
            color: 'white', 
            padding: '12px 16px', 
            borderRadius: '8px 8px 0 0',
            marginBottom: 0
          }}>
            <h2 style={{ margin: 0, fontSize: '1.2em' }}>🍓 Complementos</h2>
          </div>
          
          <div className="section-content" style={{ 
            backgroundColor: 'rgba(248, 250, 252, 0.95)', 
            padding: 16, 
            borderRadius: '0 0 8px 8px',
            border: '1px solid rgba(209, 213, 219, 0.5)'
          }}>
            <form onSubmit={criarComplemento} className="form-catalogo" style={{ marginBottom: 16 }}>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
                <input 
                  placeholder="Nome do complemento (ex: Morango)" 
                  value={novoComplemento.nome} 
                  onChange={(e) => setNovoComplemento(s => ({ ...s, nome: e.target.value }))} 
                  required 
                  className="form-input"
                />
                <input 
                  placeholder="Preço" 
                  type="number" 
                  step="0.01" 
                  min="0"
                  value={novoComplemento.preco} 
                  onChange={(e) => setNovoComplemento(s => ({ ...s, preco: e.target.value }))} 
                  required 
                  className="form-input"
                />
                <input 
                  placeholder="Ordem" 
                  type="number" 
                  min="0"
                  value={novoComplemento.ordem} 
                  onChange={(e) => setNovoComplemento(s => ({ ...s, ordem: e.target.value }))} 
                  className="form-input"
                />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                ➕ Adicionar Complemento
              </button>
            </form>

            <div className="items-list">
              {complementos.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 20 }}>
                  Nenhum complemento cadastrado
                </p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {complementos.map((c) => (
                    <li key={c.id} className="item-card" style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: 12,
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      marginBottom: 8,
                      borderRadius: 6,
                      border: '1px solid rgba(209, 213, 219, 0.5)'
                    }}>
                      <div className="item-info">
                        <span className="item-name" style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>
                          {c.nome}
                        </span>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9em' }}>
                          R$ {Number(c.preco).toFixed(2)} • Ordem: {c.ordem}
                        </div>
                      </div>
                      <button 
                        onClick={() => deletarComplemento(c.id, c.nome)}
                        className="btn-danger"
                        style={{ 
                          padding: '6px 12px', 
                          backgroundColor: '#f44336', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: 4, 
                          cursor: 'pointer',
                          fontSize: '0.9em'
                        }}
                      >
                        🗑️ Remover
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dicas de uso */}
      <div className="tips-section" style={{ 
        backgroundColor: 'rgba(248, 250, 252, 0.8)', 
        padding: 16, 
        borderRadius: 8, 
        border: '1px solid rgba(209, 213, 219, 0.5)',
        marginTop: 24
      }}>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: 12 }}>💡 Dicas de uso:</h3>
        <ul style={{ color: 'var(--text-secondary)', paddingLeft: 20 }}>
          <li>Use a ordem para definir como os itens aparecem no cardápio (menor número = aparece primeiro)</li>
          <li>Nomes descritivos ajudam os clientes a entender o que estão pedindo</li>
          <li>Preços são salvos com duas casas decimais automaticamente</li>
          <li>Remover itens do catálogo não afeta pedidos já realizados</li>
        </ul>
      </div>
    </div>
  );
}

export default CatalogoAdmin;