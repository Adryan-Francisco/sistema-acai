// src/components/WhatsAppConnection.jsx
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, CheckCircle, XCircle, RefreshCw, Loader } from 'lucide-react';
import { checkWhatsAppStatus, getWhatsAppQRCode } from '../utils/whatsappService';
import './WhatsAppConnection.css';

export default function WhatsAppConnection() {
  const [status, setStatus] = useState({
    connected: false,
    status: 'disconnected',
    hasQR: false
  });
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função para verificar status
  const fetchStatus = async () => {
    try {
      const statusData = await checkWhatsAppStatus();
      setStatus(statusData);
      
      // Se não está conectado e não tem QR, buscar QR
      if (!statusData.connected && statusData.status !== 'connected') {
        await fetchQRCode();
      } else if (statusData.connected) {
        setQrCode(null); // Limpar QR se já conectado
      }
    } catch (err) {
      console.error('Erro ao verificar status:', err);
      setError('Erro ao conectar com servidor WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar QR Code
  const fetchQRCode = async () => {
    try {
      const qrData = await getWhatsAppQRCode();
      
      if (qrData.success && qrData.qrCode) {
        setQrCode(qrData.qrCode);
        setError(null);
      } else if (qrData.message) {
        setError(qrData.message);
      }
    } catch (err) {
      console.error('Erro ao buscar QR Code:', err);
      setError('Erro ao obter QR Code');
    }
  };

  // Verificar status ao montar
  useEffect(() => {
    fetchStatus();
    
    // Atualizar status a cada 5 segundos
    const interval = setInterval(fetchStatus, 5000);
    
    return () => clearInterval(interval);
  }, []);

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

      {/* Erro */}
      {error && !qrCode && (
        <div className="whatsapp-error">
          <p>{error}</p>
          <button 
            className="btn-retry"
            onClick={fetchStatus}
          >
            <RefreshCw size={16} />
            Tentar Novamente
          </button>
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
