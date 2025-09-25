// src/components/Login.jsx
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom'; // Importa o Link
import './Login.css';

// Componente SVG para o ícone de açaí
const AcaiIcon = () => (
  <svg className="login-logo" width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 21C5 17.134 8.13401 14 12 14C15.866 14 19 17.134 19 21" stroke="#FF69B4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 14C12 11.2386 14.2386 9 17 9C19.7614 9 22 11.2386 22 14" stroke="#8A2BE2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 14C12 11.2386 9.76142 9 7 9C4.23858 9 2 11.2386 2 14" stroke="#8A2BE2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 9C17 6.23858 14.7614 4 12 4C9.23858 4 7 6.23858 7 9" stroke="#8A2BE2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 4C12 2.89543 11.1046 2 10 2" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.error_description || error.message);
    } else {
      // O AuthContext irá detetar o login e o HomePage fará o redirecionamento
      // correto (para /admin se for admin, ou / se for cliente)
      navigate('/'); 
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <AcaiIcon />
        <h1>Login - Açaiteria</h1>
        <p className="login-subtitle">Acesse o painel para gerenciar os pedidos.</p>
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
