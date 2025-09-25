import React, { useState } from 'react';
// Corrigindo o caminho para o cliente Supabase
import { supabase } from '../supabaseClient.js';
import { useNavigate, Link } from 'react-router-dom';
// Este caminho assume que Login.css está na mesma pasta (src/components)
import './Login.css';

const AcaiIcon = () => (
    <svg className="login-logo" width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 21C5 17.134 8.13401 14 12 14C15.866 14 19 17.134 19 21" stroke="#FF69B4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 14C12 11.2386 14.2386 9 17 9C19.7614 9 22 11.2386 22 14" stroke="#8A2BE2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 14C12 11.2386 9.76142 9 7 9C4.23858 9 2 11.2386 2 14" stroke="#8A2BE2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 9C17 6.23858 14.7614 4 12 4C9.23858 4 7 6.23858 7 9" stroke="#8A2BE2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 4C12 2.89543 11.1046 2 10 2" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

function SignUp() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: nome,
        }
      }
    });

    setLoading(false);

    if (error) {
      if (error.message.includes('should be at least 6 characters')) {
          alert('A sua senha é muito curta. Por favor, use pelo menos 6 caracteres.');
      } else {
          alert(error.error_description || error.message);
      }
    } else {
      alert('Conta criada com sucesso! Enviámos um e-mail de confirmação. Por favor, verifique a sua caixa de entrada (e spam) para ativar a sua conta antes de fazer o login.');
      navigate('/login');
    }
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

