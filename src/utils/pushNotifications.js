// src/utils/pushNotifications.js
// Gerenciamento de notificações push para PWA

/**
 * Verifica se o navegador suporta notificações
 */
export function isNotificationSupported() {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Verifica o status da permissão de notificações
 */
export function getNotificationPermission() {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Solicita permissão para notificações
 */
export async function requestNotificationPermission() {
  if (!isNotificationSupported()) {
    console.warn('Notificações não suportadas neste navegador');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    console.warn('Permissão de notificação foi negada');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Erro ao solicitar permissão:', error);
    return false;
  }
}

/**
 * Registra o service worker
 */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker não suportado');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('✅ Service Worker registrado:', registration);

    // Aguardar até que o SW esteja ativo
    await navigator.serviceWorker.ready;
    console.log('✅ Service Worker está pronto!');

    return registration;
  } catch (error) {
    console.error('❌ Erro ao registrar Service Worker:', error);
    return null;
  }
}

/**
 * Envia uma notificação local (não precisa de servidor)
 */
export async function showLocalNotification(title, options = {}) {
  if (!isNotificationSupported()) {
    console.warn('Notificações não suportadas');
    return;
  }

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    console.warn('Sem permissão para notificações');
    return;
  }

  const registration = await navigator.serviceWorker.ready;

  const defaultOptions = {
    body: '',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [200, 100, 200],
    tag: 'default',
    requireInteraction: false,
    data: {},
    actions: []
  };

  const notificationOptions = { ...defaultOptions, ...options };

  try {
    await registration.showNotification(title, notificationOptions);
    console.log('✅ Notificação enviada:', title);
  } catch (error) {
    console.error('❌ Erro ao enviar notificação:', error);
  }
}

/**
 * Notificação para CLIENTE quando pedido muda de status
 */
export async function notifyOrderStatusChange(orderId, status, details = {}) {
  const statusMessages = {
    'Recebido': {
      title: '🎉 Pedido Recebido!',
      body: `Seu pedido #${orderId} foi recebido e está sendo preparado.`,
      icon: '/icon-success.png',
      tag: `order-${orderId}`,
      requireInteraction: false,
      data: { url: '/meus-pedidos', orderId }
    },
    'Em Preparo': {
      title: '👨‍🍳 Açaí em Preparo!',
      body: `Seu pedido #${orderId} está sendo preparado agora!`,
      icon: '/icon-cooking.png',
      tag: `order-${orderId}`,
      requireInteraction: false,
      data: { url: '/meus-pedidos', orderId }
    },
    'Pronto': {
      title: '✅ Pedido Pronto!',
      body: `Seu açaí está pronto! ${details.deliveryType === 'retirada' ? 'Pode vir buscar! 🏪' : 'O entregador já saiu! 🛵'}`,
      icon: '/icon-ready.png',
      tag: `order-${orderId}`,
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 200],
      data: { url: '/meus-pedidos', orderId },
      actions: [
        { action: 'view', title: 'Ver Pedido', icon: '/icon-view.png' },
        { action: 'close', title: 'OK', icon: '/icon-check.png' }
      ]
    },
    'Saiu para Entrega': {
      title: '🛵 Saiu para Entrega!',
      body: `Seu pedido #${orderId} está a caminho! Chegada prevista em ${details.eta || '15-20'} minutos.`,
      icon: '/icon-delivery.png',
      tag: `order-${orderId}`,
      requireInteraction: true,
      data: { url: '/meus-pedidos', orderId }
    },
    'Entregue': {
      title: '🎊 Pedido Entregue!',
      body: `Aproveite seu açaí! Não esqueça de avaliar seu pedido ⭐`,
      icon: '/icon-success.png',
      tag: `order-${orderId}`,
      requireInteraction: false,
      data: { url: '/meus-pedidos', orderId }
    }
  };

  const config = statusMessages[status];
  if (!config) {
    console.warn('Status desconhecido:', status);
    return;
  }

  await showLocalNotification(config.title, {
    body: config.body,
    icon: config.icon,
    tag: config.tag,
    requireInteraction: config.requireInteraction,
    vibrate: config.vibrate,
    data: config.data,
    actions: config.actions
  });
}

/**
 * Notificação para ADMIN quando novo pedido é criado
 */
export async function notifyNewOrder(orderId, customerName, total) {
  await showLocalNotification('🔔 Novo Pedido Recebido!', {
    body: `Cliente: ${customerName}\nTotal: R$ ${parseFloat(total).toFixed(2)}\nPedido #${orderId}`,
    icon: '/icon-order.png',
    badge: '/badge-72.png',
    tag: `new-order-${orderId}`,
    requireInteraction: true,
    vibrate: [300, 100, 300, 100, 300],
    data: { url: '/admin/painel', orderId },
    actions: [
      { action: 'view', title: 'Ver Pedido', icon: '/icon-view.png' },
      { action: 'accept', title: 'Aceitar', icon: '/icon-check.png' }
    ]
  });

  // Também tocar um som (se disponível)
  playNotificationSound();
}

/**
 * Toca som de notificação (opcional)
 */
function playNotificationSound() {
  try {
    const audio = new Audio('/notification.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {
      console.log('Não foi possível tocar o som de notificação');
    });
  } catch (error) {
    console.log('Som de notificação não disponível');
  }
}

/**
 * Solicitar permissão com mensagem amigável
 */
export async function requestPermissionWithPrompt() {
  if (!isNotificationSupported()) {
    return {
      granted: false,
      reason: 'Seu navegador não suporta notificações'
    };
  }

  const current = getNotificationPermission();

  if (current === 'granted') {
    return { granted: true, reason: 'Já possui permissão' };
  }

  if (current === 'denied') {
    return {
      granted: false,
      reason: 'Permissão foi negada. Ative nas configurações do navegador.'
    };
  }

  const granted = await requestNotificationPermission();

  return {
    granted,
    reason: granted ? 'Permissão concedida!' : 'Permissão negada pelo usuário'
  };
}

/**
 * Inicializar sistema de notificações
 */
export async function initNotifications() {
  console.log('🔔 Inicializando sistema de notificações...');

  // 1. Registrar Service Worker
  const registration = await registerServiceWorker();
  if (!registration) {
    console.warn('Service Worker não disponível');
    return false;
  }

  // 2. Solicitar permissão (de forma não intrusiva)
  const permission = getNotificationPermission();
  if (permission === 'default') {
    console.log('💡 Permissão de notificação pode ser solicitada');
  }

  console.log('✅ Sistema de notificações pronto!');
  return true;
}

/**
 * Verificar se está instalado como PWA
 */
export function isPWAInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone ||
         document.referrer.includes('android-app://');
}

/**
 * Prompt de instalação do PWA
 */
let deferredPrompt = null;

export function setupPWAInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('💡 PWA pode ser instalado');
    return false;
  });

  window.addEventListener('appinstalled', () => {
    console.log('✅ PWA foi instalado!');
    deferredPrompt = null;
  });
}

export async function promptPWAInstall() {
  if (!deferredPrompt) {
    return {
      success: false,
      reason: 'PWA já instalado ou prompt não disponível'
    };
  }

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  
  deferredPrompt = null;
  
  return {
    success: outcome === 'accepted',
    reason: outcome === 'accepted' ? 'Usuário aceitou instalar' : 'Usuário recusou'
  };
}

export function canShowPWAInstall() {
  return deferredPrompt !== null && !isPWAInstalled();
}
