// src/components/EmailConfirmado.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import './EmailConfirmado.css';

export default function EmailConfirmado() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const [isError, setIsError] = useState(false);

  // Verifica se há erro na URL
  useEffect(() => {
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    if (error || errorDescription) {
      setIsError(true);
    }
  }, [searchParams]);

  // Countdown para redirecionar
  useEffect(() => {
    if (!isError && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    
    if (countdown === 0) {
      navigate('/login');
    }
  }, [countdown, navigate, isError]);

  const handleGoToLogin = () => {
    navigate('/login');
  };

  if (isError) {
    return (
      <div className="email-confirmado-container">
        <div className="email-confirmado-card error">
          <div className="icon-container error-icon">
            <AlertCircle size={80} />
          </div>
          
          <h1 className="title">Erro na Confirmação</h1>
          
          <p className="message">
            Não foi possível confirmar seu email. O link pode estar expirado ou inválido.
          </p>

          <div className="error-details">
            <p>Por favor, tente novamente ou entre em contato com o suporte.</p>
          </div>

          <button 
            className="btn-primary"
            onClick={handleGoToLogin}
          >
            <span>Voltar para Login</span>
            <ArrowRight size={20} />
          </button>
        </div>

        <div className="background-decoration">
          <div className="circle circle-1"></div>
          <div className="circle circle-2"></div>
          <div className="circle circle-3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="email-confirmado-container">
      <div className="email-confirmado-card">
        <div className="icon-container">
          <div className="success-checkmark">
            <CheckCircle size={80} />
          </div>
          <div className="email-icon">
            <Mail size={40} />
          </div>
        </div>
        
        <h1 className="title">Email Confirmado!</h1>
        
        <p className="message">
          Parabéns! Seu email foi confirmado com sucesso. 
          Agora você já pode fazer login e começar a fazer seus pedidos de açaí! 🍇
        </p>

        <div className="features">
          <div className="feature-item">
            <span className="feature-icon">✅</span>
            <span className="feature-text">Conta ativada</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🎉</span>
            <span className="feature-text">Pronto para pedir</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🍇</span>
            <span className="feature-text">Açaí delicioso te esperando</span>
          </div>
        </div>

        <div className="countdown-container">
          <p className="countdown-text">
            Redirecionando para login em <span className="countdown-number">{countdown}</span> segundos...
          </p>
        </div>

        <button 
          className="btn-primary"
          onClick={handleGoToLogin}
        >
          <span>Ir para Login Agora</span>
          <ArrowRight size={20} />
        </button>

        <p className="help-text">
          Qualquer dúvida, estamos aqui para ajudar! 😊
        </p>
      </div>

      <div className="background-decoration">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
      </div>
    </div>
  );
}
