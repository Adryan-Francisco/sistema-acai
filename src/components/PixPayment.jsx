// src/components/PixPayment.jsx
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, X, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { generatePixCode, formatCurrency } from '../utils/pixGenerator';
import './PixPayment.css';

export default function PixPayment({ 
  amount, 
  onClose, 
  onPaymentConfirmed,
  orderId 
}) {
  const [pixCode, setPixCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutos
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, confirmed, expired

  // Configurações do PIX (você pode mover para .env)
  const PIX_KEY = import.meta.env.VITE_PIX_KEY || '00000000000'; // Sua chave PIX
  const MERCHANT_NAME = 'ACAI EXPRESS';
  const MERCHANT_CITY = 'SAO PAULO';

  useEffect(() => {
    // Gerar código PIX
    try {
      const code = generatePixCode({
        pixKey: PIX_KEY,
        merchantName: MERCHANT_NAME,
        merchantCity: MERCHANT_CITY,
        amount: amount,
        transactionId: `ORDER${orderId || Date.now()}`
      });
      setPixCode(code);
    } catch (error) {
      console.error('Erro ao gerar PIX:', error);
    }
  }, [amount, orderId]);

  // Timer de expiração
  useEffect(() => {
    if (paymentStatus !== 'pending') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setPaymentStatus('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentStatus]);

  // Simular verificação de pagamento (você substituiria por webhook real)
  useEffect(() => {
    if (paymentStatus !== 'pending') return;

    // Aqui você faria polling ou usaria webhook
    // Por enquanto, simulação automática após 30s (para demo)
    const checkPayment = setTimeout(() => {
      // setPaymentStatus('confirmed');
      // onPaymentConfirmed?.();
    }, 30000);

    return () => clearTimeout(checkPayment);
  }, [paymentStatus, onPaymentConfirmed]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleManualConfirm = () => {
    setPaymentStatus('confirmed');
    onPaymentConfirmed?.();
  };

  if (paymentStatus === 'confirmed') {
    return (
      <div className="pix-modal-overlay" onClick={onClose}>
        <div className="pix-modal success" onClick={(e) => e.stopPropagation()}>
          <button className="pix-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
          <div className="pix-success-icon">
            <CheckCircle size={80} />
          </div>
          <h2>Pagamento Confirmado!</h2>
          <p>Seu pedido foi recebido e está sendo preparado.</p>
          <button onClick={onClose} className="button-primary">
            Fechar
          </button>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'expired') {
    return (
      <div className="pix-modal-overlay" onClick={onClose}>
        <div className="pix-modal expired" onClick={(e) => e.stopPropagation()}>
          <button className="pix-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
          <div className="pix-expired-icon">
            <AlertCircle size={80} />
          </div>
          <h2>QR Code Expirado</h2>
          <p>O tempo para pagamento expirou. Gere um novo código.</p>
          <button onClick={onClose} className="button-outline">
            Fechar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pix-modal-overlay" onClick={onClose}>
      <div className="pix-modal" onClick={(e) => e.stopPropagation()}>
        <button className="pix-close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="pix-header">
          <h2>💳 Pagamento via PIX</h2>
          <p>Escaneie o QR Code ou copie o código</p>
        </div>

        {/* Timer */}
        <div className="pix-timer">
          <Clock size={20} />
          <span>Expira em: {formatTime(timeLeft)}</span>
        </div>

        {/* Valor */}
        <div className="pix-amount">
          <span className="pix-amount-label">Valor a pagar:</span>
          <span className="pix-amount-value">{formatCurrency(amount)}</span>
        </div>

        {/* QR Code */}
        <div className="pix-qrcode">
          {pixCode && (
            <QRCodeSVG 
              value={pixCode} 
              size={280}
              level="H"
              includeMargin={true}
              bgColor="#ffffff"
              fgColor="#000000"
            />
          )}
        </div>

        {/* Código Copia e Cola */}
        <div className="pix-code-section">
          <label>Código Pix Copia e Cola:</label>
          <div className="pix-code-box">
            <input 
              type="text" 
              value={pixCode} 
              readOnly 
              className="pix-code-input"
            />
            <button 
              onClick={handleCopy} 
              className={`pix-copy-btn ${copied ? 'copied' : ''}`}
            >
              {copied ? (
                <>
                  <Check size={20} />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy size={20} />
                  Copiar
                </>
              )}
            </button>
          </div>
        </div>

        {/* Instruções */}
        <div className="pix-instructions">
          <h4>📱 Como pagar:</h4>
          <ol>
            <li>Abra o app do seu banco</li>
            <li>Escolha pagar com PIX QR Code</li>
            <li>Escaneie o código acima</li>
            <li>Confirme as informações e finalize</li>
          </ol>
        </div>

        {/* Botão manual (REMOVER EM PRODUÇÃO) */}
        <div className="pix-manual-confirm">
          <button 
            onClick={handleManualConfirm}
            className="button-outline button-sm"
          >
            ⚠️ Simular Pagamento (DEMO)
          </button>
        </div>
      </div>
    </div>
  );
}
