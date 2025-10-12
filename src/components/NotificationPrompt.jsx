// src/components/NotificationPrompt.jsx
import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { requestPermissionWithPrompt, getNotificationPermission } from '../utils/pushNotifications';
import './NotificationPrompt.css';

export default function NotificationPrompt() {
  const [show, setShow] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Verificar se deve mostrar o prompt
    const checkNotificationStatus = () => {
      const permission = getNotificationPermission();
      
      // Só mostrar se ainda não pediu permissão
      if (permission === 'default') {
        // Aguardar 8 segundos antes de mostrar
        const timer = setTimeout(() => {
          setShow(true);
        }, 8000);

        return () => clearTimeout(timer);
      }
    };

    checkNotificationStatus();
  }, []);

  const handleEnable = async () => {
    setIsClosing(true);
    
    setTimeout(async () => {
      const result = await requestPermissionWithPrompt();
      
      if (result.granted) {
        // Mostrar notificação de teste
        setTimeout(() => {
          alert('🎉 Notificações ativadas! Você receberá atualizações sobre seus pedidos em tempo real.');
        }, 300);
      } else {
        alert(`⚠️ ${result.reason}`);
      }
      
      setShow(false);
    }, 300);
  };

  const handleLater = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShow(false);
    }, 300);
  };

  if (!show) return null;

  return (
    <div className={`notification-prompt-overlay ${isClosing ? 'closing' : ''}`}>
      <div className={`notification-prompt ${isClosing ? 'slide-out' : 'slide-in'}`}>
        <button className="close-btn" onClick={handleLater} aria-label="Fechar">
          <X size={20} />
        </button>
        
        <div className="notification-icon">
          <Bell size={48} />
        </div>
        
        <h3>🔔 Ativar Notificações?</h3>
        
        <p>
          Receba atualizações em tempo real sobre seus pedidos:
        </p>
        
        <ul className="benefits-list">
          <li>✅ Pedido confirmado</li>
          <li>👨‍🍳 Açaí em preparo</li>
          <li>🎉 Pedido pronto</li>
          <li>🛵 Saiu para entrega</li>
        </ul>
        
        <div className="notification-prompt-buttons">
          <button onClick={handleEnable} className="btn-enable">
            <Bell size={18} />
            Ativar Notificações
          </button>
          <button onClick={handleLater} className="btn-later">
            Agora não
          </button>
        </div>
        
        <p className="privacy-note">
          💡 Você pode desativar a qualquer momento nas configurações
        </p>
      </div>
    </div>
  );
}
