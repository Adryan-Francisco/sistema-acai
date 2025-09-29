// src/components/NotificationToast.jsx
import React, { useState, useEffect, createContext, useContext } from 'react';
import './NotificationToast.css';

// Context para gerenciar notificações globalmente
const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Componente individual de toast
const Toast = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📝';
    }
  };

  const handleClose = () => {
    onRemove(toast.id);
  };

  return (
    <div className={`toast toast-${toast.type} animate-slideInRight`}>
      <div className="toast-content">
        <div className="toast-icon">
          {getIcon()}
        </div>
        <div className="toast-message">
          {toast.title && <div className="toast-title">{toast.title}</div>}
          <div className="toast-description">{toast.message}</div>
        </div>
        <button className="toast-close" onClick={handleClose}>
          ×
        </button>
      </div>
      <div className={`toast-progress toast-progress-${toast.type}`}>
        <div className="toast-progress-bar" style={{ animationDuration: `${toast.duration || 4000}ms` }}></div>
      </div>
    </div>
  );
};

// Container de toasts
const ToastContainer = ({ toasts, onRemove }) => {
  if (!toasts.length) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

// Provider de notificações
export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', options = {}) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      message,
      type,
      title: options.title,
      duration: options.duration || 4000,
      ...options
    };

    setToasts(prev => [...prev, newToast]);
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAll = () => {
    setToasts([]);
  };

  // Funções de conveniência
  const success = (message, options = {}) => addToast(message, 'success', options);
  const error = (message, options = {}) => addToast(message, 'error', options);
  const warning = (message, options = {}) => addToast(message, 'warning', options);
  const info = (message, options = {}) => addToast(message, 'info', options);

  const contextValue = {
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;