// src/components/DebugWhatsApp.jsx
import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Loader, Copy, Check } from 'lucide-react';
import './DebugWhatsApp.css';

export default function DebugWhatsApp() {
  const [checks, setChecks] = useState({
    serverRunning: null,
    cors: null,
    apiHealth: null,
    statusEndpoint: null,
    qrEndpoint: null,
  });
  const [details, setDetails] = useState({});
  const [copied, setCopied] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runDiagnostics = async () => {
      const results = {};
      const timeout = 5000; // 5 segundos de timeout

      // Helper para fazer fetch com timeout
      const fetchWithTimeout = (url, options = {}) => {
        return Promise.race([
          fetch(url, options),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), timeout)
          )
        ]);
      };

      // 1. Check if server is running
      try {
        const response = await fetchWithTimeout('http://localhost:3001/health');
        results.serverRunning = response.ok;
        results.serverStatus = response.status;
      } catch (err) {
        results.serverRunning = false;
        results.serverError = err.message === 'Timeout' ? 'Timeout (servidor não respondeu em 5s)' : err.message;
      }

      // 2. Check CORS
      try {
        const response = await fetchWithTimeout('http://localhost:3001/status');
        results.cors = response.ok;
      } catch (err) {
        results.cors = false;
      }

      // 3. Check /status endpoint
      try {
        const response = await fetchWithTimeout('http://localhost:3001/status');
        if (response.ok) {
          const data = await response.json();
          results.statusEndpoint = true;
          results.statusData = data;
        } else {
          results.statusEndpoint = false;
        }
      } catch (err) {
        results.statusEndpoint = false;
        results.statusError = err.message;
      }

      // 4. Check /qr endpoint
      try {
        const response = await fetchWithTimeout('http://localhost:3001/qr');
        if (response.ok) {
          const data = await response.json();
          results.qrEndpoint = true;
          results.qrData = data;
        } else {
          results.qrEndpoint = false;
        }
      } catch (err) {
        results.qrEndpoint = false;
        results.qrError = err.message;
      }

      setChecks(results);
      setDetails(results);
      setLoading(false);
    };

    runDiagnostics();
  }, []);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const renderStatus = (status) => {
    if (status === null) return <Loader size={18} className="spin" />;
    if (status === true) return <CheckCircle size={18} color="#10b981" />;
    return <XCircle size={18} color="#ef4444" />;
  };

  const renderStatusText = (status) => {
    if (status === null) return 'Verificando...';
    if (status === true) return 'OK';
    return 'ERRO';
  };

  if (loading) {
    return (
      <div className="debug-container">
        <div className="debug-loading">
          <Loader size={32} className="spin" />
          <p>Executando diagnóstico do WhatsApp...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="debug-container">
      <div className="debug-header">
        <h2>🔧 Diagnóstico WhatsApp</h2>
        <p>Verificando a configuração do servidor e conectividade</p>
      </div>

      <div className="debug-checks">
        <div className={`debug-check ${checks.serverRunning ? 'success' : 'error'}`}>
          <div className="check-icon">
            {renderStatus(checks.serverRunning)}
          </div>
          <div className="check-info">
            <h4>Servidor rodando</h4>
            <p>http://localhost:3001</p>
            {!checks.serverRunning && checks.serverError && (
              <span className="error-text">{checks.serverError}</span>
            )}
          </div>
        </div>

        <div className={`debug-check ${checks.cors ? 'success' : 'error'}`}>
          <div className="check-icon">
            {renderStatus(checks.cors)}
          </div>
          <div className="check-info">
            <h4>CORS configurado</h4>
            <p>Cross-Origin requests permitidos</p>
          </div>
        </div>

        <div className={`debug-check ${checks.statusEndpoint ? 'success' : 'error'}`}>
          <div className="check-icon">
            {renderStatus(checks.statusEndpoint)}
          </div>
          <div className="check-info">
            <h4>Endpoint /status</h4>
            <p>GET http://localhost:3001/status</p>
            {checks.statusData && (
              <pre className="debug-response">
                {JSON.stringify(checks.statusData, null, 2)}
                <button 
                  className="copy-btn"
                  onClick={() => copyToClipboard(JSON.stringify(checks.statusData, null, 2), 'status')}
                  title="Copiar"
                >
                  {copied === 'status' ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </pre>
            )}
          </div>
        </div>

        <div className={`debug-check ${checks.qrEndpoint ? 'success' : 'error'}`}>
          <div className="check-icon">
            {renderStatus(checks.qrEndpoint)}
          </div>
          <div className="check-info">
            <h4>Endpoint /qr</h4>
            <p>GET http://localhost:3001/qr</p>
            {checks.qrData?.success === false && (
              <span className="info-text">{checks.qrData.message}</span>
            )}
            {checks.qrData?.message && (
              <span className="info-text">{checks.qrData.message}</span>
            )}
          </div>
        </div>
      </div>

      <div className="debug-solutions">
        <h3>⚠️ Se algo não está funcionando:</h3>
        <ol>
          <li>
            <strong>Inicie o servidor:</strong>
            <code className="copy-text" onClick={() => copyToClipboard('cd server && npm start', 'cmd1')}>
              cd server && npm start <Copy size={14} />
            </code>
          </li>
          <li>
            <strong>Verifique a porta 3001:</strong>
            <code className="copy-text" onClick={() => copyToClipboard('netstat -an | findstr 3001', 'cmd2')}>
              netstat -an | findstr 3001 <Copy size={14} />
            </code>
          </li>
          <li>
            <strong>Limpe a sessão do WhatsApp (se tiver erro de conexão):</strong>
            <code className="copy-text" onClick={() => copyToClipboard('rmdir /s /q auth_info_baileys', 'cmd3')}>
              rmdir /s /q auth_info_baileys <Copy size={14} />
            </code>
            <p style={{ fontSize: '0.8125rem', marginTop: '0.5rem', color: '#666' }}>
              ⚠️ Isso vai remover a sessão atual e você precisará fazer login novamente
            </p>
          </li>
          <li>
            <strong>Reinicie o servidor após limpar cache</strong>
          </li>
          <li>
            <strong>Se tiver erro 401 "Unauthorized":</strong>
            <p style={{ fontSize: '0.8125rem', marginTop: '0.5rem', color: '#666' }}>
              Execute os passos 3 e 4 acima. Isso geralmente significa que a sessão do WhatsApp expirou.
            </p>
          </li>
        </ol>
      </div>

      <div className="debug-tips">
        <h3>💡 Dicas úteis:</h3>
        <ul>
          <li>O servidor precisa estar rodando <strong>antes</strong> de acessar o painel admin</li>
          <li>O QR code leva 5-15 segundos para ser gerado na primeira conexão</li>
          <li>Se o QR code expirar, clique em "Gerar Novo QR Code"</li>
          <li>A pasta <code>auth_info_baileys</code> armazena a sessão do WhatsApp</li>
          <li>Você pode ter apenas <strong>uma</strong> sessão ativa por vez</li>
        </ul>
      </div>
    </div>
  );
}
