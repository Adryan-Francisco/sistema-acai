import React, { useState } from 'react';
// Corrigindo o caminho para o cliente Supabase
import { supabase, isSupabaseConfigured } from '../supabaseClient.js';
import { useNavigate, Link } from 'react-router-dom';
import './SignUp.css';

// Componente SVG para o ícone de açaí - versão melhorada
const AcaiIcon = () => (
  <svg className="signup-logo" width="90" height="90" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="acaiGradientSignup" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#667eea" />
        <stop offset="100%" stopColor="#764ba2" />
      </linearGradient>
      <linearGradient id="leafGradientSignup" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4CAF50" />
        <stop offset="100%" stopColor="#45a049" />
      </linearGradient>
    </defs>
    
    {/* Açaí bowl */}
    <circle cx="50" cy="60" r="28" fill="url(#acaiGradientSignup)" stroke="#5a67d8" strokeWidth="2"/>
    <circle cx="50" cy="60" r="24" fill="url(#acaiGradientSignup)" opacity="0.8"/>
    
    {/* Complementos (granola, frutas) */}
    <circle cx="42" cy="55" r="3" fill="#FFD700" opacity="0.9"/>
    <circle cx="58" cy="52" r="2.5" fill="#FF6B6B" opacity="0.9"/>
    <circle cx="46" cy="65" r="2" fill="#FF8C00" opacity="0.9"/>
    <circle cx="54" cy="68" r="2.5" fill="#32CD32" opacity="0.9"/>
    
    {/* Folha do açaí */}
    <path d="M50 25 Q45 15 35 20 Q40 30 50 25 Q55 15 65 20 Q60 30 50 25" fill="url(#leafGradientSignup)" stroke="#2E7D32" strokeWidth="1"/>
    
    {/* Haste */}
    <line x1="50" y1="25" x2="50" y2="32" stroke="url(#leafGradientSignup)" strokeWidth="3" strokeLinecap="round"/>
    
    {/* Brilho no bowl */}
    <ellipse cx="45" cy="52" rx="6" ry="4" fill="rgba(255,255,255,0.3)" transform="rotate(-20 45 52)"/>
  </svg>
);

function SignUp() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setError('Supabase não configurado. Crie o arquivo .env (veja .env.example) e reinicie o servidor.');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: nome,
          },
          emailRedirectTo: `${window.location.origin}/sistema-acai/email-confirmado`
        }
      });

      if (error) {
        if (error.message.includes('should be at least 6 characters')) {
          setError('A sua senha é muito curta. Por favor, use pelo menos 6 caracteres.');
        } else {
          setError(error.error_description || error.message);
        }
      } else {
        // Verifica se o email já foi confirmado automaticamente (em alguns casos do Supabase)
        if (data?.user?.confirmed_at) {
          setSuccessMessage('Conta criada com sucesso! Redirecionando...');
          setTimeout(() => navigate('/email-confirmado'), 2000);
        } else {
          setSuccessMessage('Conta criada! Por favor, verifique seu email para confirmar o cadastro.');
          // Limpa os campos
          setNome('');
          setEmail('');
          setPassword('');
        }
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSignUp} className="login-form">
        <AcaiIcon />
        <h1>Crie a sua Conta</h1>
        <p className="login-subtitle">Registe-se para fazer e acompanhar os seus pedidos.</p>
        <div className="input-group">
          <label htmlFor="nome">O seu Nome</label>
          <input id="nome" type="text" placeholder="Como devemos chamá-lo?" value={nome} onChange={(e) => setNome(e.target.value)} required />
        </div>
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" placeholder="O seu melhor email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="input-group">
          <label htmlFor="password">Senha</label>
          <input id="password" type="password" placeholder="Crie uma senha forte (mín. 6 caracteres)" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        
        <button type="submit" disabled={loading}>
          {loading ? 'A criar...' : 'Registar'}
        </button>
        <p className="redirect-link">
            Já tem uma conta? <Link to="/login">Faça o login</Link>
        </p>
      </form>
    </div>
  );
}

export default SignUp;

