// src/components/WhatsAppConnection.jsx
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, CheckCircle, XCircle, RefreshCw, Loader, AlertCircle, Info } from 'lucide-react';
import { checkWhatsAppStatus, getWhatsAppQRCode } from '../utils/whatsappService';
import './WhatsAppConnection.css';

const BAILEYS_URL = import.meta.env.VITE_BAILEYS_API_URL || 'http://localhost:3001';

export default function WhatsAppConnection() {
  const [status, setStatus] = useState({
    connected: false,
    status: 'disconnected',
    hasQR: false
  });
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Função para buscar QR Code
  const fetchQRCode = async () => {
    try {
      setRetryCount(prev => prev + 1);
      setError(`⏳ Gerando QR Code do WhatsApp... (tentativa ${retryCount + 1})`);
      const qrData = await getWhatsAppQRCode();
      
      if (qrData.success && qrData.qrCode) {
        setQrCode(qrData.qrCode);
        setError(null);
        setRetryCount(0);
      } else if (qrData.message) {
        // Mensagens mais amigáveis
        if (qrData.message.includes('ainda não foi gerado')) {
          const timeEstimate = retryCount < 2 ? '5-10 segundos' : '15-20 segundos';
          setError(`⏳ O WhatsApp está gerando o QR Code. Aguarde ${timeEstimate}...`);
        } else if (qrData.message.includes('já está conectado')) {
          setError(null);
          setRetryCount(0);
        } else {
          setError(qrData.message);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar QR Code:', err);
      setError('❌ Erro ao obter QR Code. Verifique se o servidor WhatsApp está rodando.');
    }
  };

  // Função para verificar status
  const fetchStatus = async () => {
    try {
      const statusData = await checkWhatsAppStatus();
      setStatus(statusData);
      
      // Se não está conectado e não tem QR, buscar QR
      if (!statusData.connected && statusData.status !== 'connected') {
        if (!qrCode) {
          await fetchQRCode();
        }
      } else if (statusData.connected) {
        setQrCode(null); // Limpar QR se já conectado
        setError(null);
        setRetryCount(0);
      }
    } catch (err) {
      console.error('Erro ao verificar status:', err);
      setError('Erro ao conectar com servidor WhatsApp. Verifique se o servidor está rodando.');
    } finally {
      setLoading(false);
    }
  };

  // Verificar status ao montar
  useEffect(() => {
    fetchStatus();
    
    // Atualizar status periodicamente
    let interval;
    
    if (!status.connected && !qrCode) {
      // Se não conectado e sem QR, atualiza a cada 3 segundos
      interval = setInterval(fetchStatus, 3000);
    } else if (status.connected) {
      // Se conectado, atualiza a cada 10 segundos (apenas monitoramento)
      interval = setInterval(fetchStatus, 10000);
    } else {
      // Se tem QR mas não conectou, atualiza a cada 5 segundos
      interval = setInterval(fetchStatus, 5000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status.connected, qrCode]);

  // Renderizar status
  const renderStatus = () => {
    if (status.connected) {
      return (
        <div className="whatsapp-status-connected">
          <CheckCircle size={24} color="#10b981" />
          <span>WhatsApp Conectado</span>
        </div>
      );
    }

    if (status.status === 'reconnecting') {
      return (
        <div className="whatsapp-status-reconnecting">
          <Loader size={24} className="spin" />
          <span>Reconectando...</span>
        </div>
      );
    }

    if (status.status === 'qr_ready' || qrCode) {
      return (
        <div className="whatsapp-status-qr">
          <Smartphone size={24} color="#f59e0b" />
          <span>Aguardando conexão</span>
        </div>
      );
    }

    return (
      <div className="whatsapp-status-disconnected">
        <XCircle size={24} color="#ef4444" />
        <span>Desconectado</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="whatsapp-connection-card">
        <div className="whatsapp-loading">
          <Loader size={32} className="spin" />
          <p>Carregando status do WhatsApp...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="whatsapp-connection-card">
      <div className="whatsapp-header">
        <div className="whatsapp-icon">
          <Smartphone size={28} />
        </div>
        <div className="whatsapp-title">
          <h3>Conexão WhatsApp</h3>
          <p>Status da integração com WhatsApp Business</p>
        </div>
      </div>

      <div className="whatsapp-status">
        {renderStatus()}
      </div>

      {/* QR Code Display */}
      {!status.connected && qrCode && (
        <div className="whatsapp-qr-container">
          <div className="qr-instructions">
            <h4>📱 Como Conectar</h4>
            <ol>
              <li>Abra o <strong>WhatsApp</strong> no celular</li>
              <li>Toque em <strong>⋮</strong> (Menu) ou <strong>Configurações</strong></li>
              <li>Selecione <strong>Aparelhos conectados</strong></li>
              <li>Toque em <strong>Conectar aparelho</strong></li>
              <li>Aponte a câmera para o QR code abaixo</li>
            </ol>
          </div>

          <div className="qr-code-display">
            {qrCode.startsWith('data:image') ? (
              <img 
                src={qrCode} 
                alt="QR Code WhatsApp"
                loading="eager"
                style={{ display: 'block' }}
              />
            ) : (
              <QRCodeSVG 
                value={qrCode} 
                size={256}
                level="M"
                includeMargin={true}
              />
            )}
          </div>

          <button 
            className="btn-refresh-qr"
            onClick={fetchQRCode}
            title="Atualizar QR Code"
            aria-label="Atualizar QR Code do WhatsApp"
          >
            <RefreshCw size={16} />
            <span>Gerar Novo QR Code</span>
          </button>
        </div>
      )}

      {/* Erro ou Aguardando */}
      {error && !qrCode && (
        <div className={`whatsapp-error ${error.includes('⏳') ? 'loading-state' : ''}`}>
          {error.includes('⏳') && (
            <div className="loading-spinner">
              <Loader size={24} className="spin" />
            </div>
          )}
          <p>{error}</p>
          {error.includes('⏳') && (
            <div className="loading-tip">
              <p>💡 <strong>Dica:</strong> O QR Code geralmente leva de 5 a 15 segundos para ser gerado na primeira vez.</p>
              <p>O componente tentará buscar automaticamente a cada 3 segundos.</p>
            </div>
          )}
          {!error.includes('⏳') && (
            <button 
              className="btn-retry"
              onClick={fetchStatus}
            >
              <RefreshCw size={16} />
              Tentar Novamente
            </button>
          )}
        </div>
      )}

      {/* Conectado - Informações */}
      {status.connected && (
        <div className="whatsapp-connected-info">
          <div className="success-message">
            ✅ WhatsApp conectado com sucesso!
          </div>
          <p className="info-text">
            As notificações automáticas de pedidos estão ativas.
            Os clientes receberão atualizações via WhatsApp.
          </p>
        </div>
      )}

      {/* Informação sobre servidor */}
      {BAILEYS_URL.includes('localhost') ? (
        <div className="whatsapp-server-info info">
          <Info size={16} />
          <div>
            <strong>Servidor Local Detectado</strong>
            <p>Você está em desenvolvimento. Para GitHub Pages, configure VITE_BAILEYS_API_URL no .env</p>
          </div>
        </div>
      ) : (
        <div className="whatsapp-server-info success">
          <CheckCircle size={16} />
          <div>
            <strong>Servidor Configurado</strong>
            <p>URL: {BAILEYS_URL}</p>
          </div>
        </div>
      )}

      {/* Botão de atualização manual */}
      <div className="whatsapp-actions">
        <button 
          className="btn-update-status"
          onClick={fetchStatus}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Atualizar Status
        </button>
      </div>
    </div>
  );
}
