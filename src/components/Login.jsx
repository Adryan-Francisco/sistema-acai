// src/components/Login.jsx
import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './Login.css';

// Componente SVG para o ícone de açaí - versão melhorada
const AcaiIcon = () => (
  <svg className="login-logo" width="90" height="90" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="acaiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#667eea" />
        <stop offset="100%" stopColor="#764ba2" />
      </linearGradient>
      <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4CAF50" />
        <stop offset="100%" stopColor="#45a049" />
      </linearGradient>
    </defs>
    
    {/* Açaí bowl */}
    <circle cx="50" cy="60" r="28" fill="url(#acaiGradient)" stroke="#5a67d8" strokeWidth="2"/>
    <circle cx="50" cy="60" r="24" fill="url(#acaiGradient)" opacity="0.8"/>
    
    {/* Complementos (granola, frutas) */}
    <circle cx="42" cy="55" r="3" fill="#FFD700" opacity="0.9"/>
    <circle cx="58" cy="52" r="2.5" fill="#FF6B6B" opacity="0.9"/>
    <circle cx="46" cy="65" r="2" fill="#FF8C00" opacity="0.9"/>
    <circle cx="54" cy="68" r="2.5" fill="#32CD32" opacity="0.9"/>
    
    {/* Folha do açaí */}
    <path d="M50 25 Q45 15 35 20 Q40 30 50 25 Q55 15 65 20 Q60 30 50 25" fill="url(#leafGradient)" stroke="#2E7D32" strokeWidth="1"/>
    
    {/* Haste */}
    <line x1="50" y1="25" x2="50" y2="32" stroke="url(#leafGradient)" strokeWidth="3" strokeLinecap="round"/>
    
    {/* Brilho no bowl */}
    <ellipse cx="45" cy="52" rx="6" ry="4" fill="rgba(255,255,255,0.3)" transform="rotate(-20 45 52)"/>
  </svg>
);

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { fetchUserRole } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setError('Supabase não configurado. Crie o arquivo .env (veja .env.example) e reinicie o servidor.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Adicionar timeout para evitar travamento
      const loginPromise = supabase.auth.signInWithPassword({ email, password });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Login timeout - tente novamente')), 10000)
      );
      
      const { error } = await Promise.race([loginPromise, timeoutPromise]);
      
      if (error) {
        setError(error.error_description || error.message);
      } else {
        // Buscar role imediatamente após login para redirecionamento correto
        const role = await fetchUserRole();
        
        // Redirecionar baseado na role
        if (role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      setError(error.message || 'Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <AcaiIcon />
        <h1>Login - Açaiteria</h1>
        <p className="login-subtitle">Acesse o painel para gerenciar os pedidos.</p>
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        <p className="redirect-link">
          Não tem uma conta? <Link to="/signup">Cadastre-se agora</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
