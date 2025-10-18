// server.js - Servidor WhatsApp com Baileys
import express from 'express';
import cors from 'cors';
import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState,
  fetchLatestBaileysVersion 
} from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import pino from 'pino';

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração melhorada de CORS
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Logger
const logger = pino({ level: 'silent' });

// Estado do WhatsApp
let sock = null;
let qrCodeData = null;
let isConnected = false;
let connectionStatus = 'disconnected';

/**
 * Inicia conexão com WhatsApp
 */
async function connectToWhatsApp() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys');
    const { version } = await fetchLatestBaileysVersion();

    console.log('🔌 Conectando ao WhatsApp...');
    console.log('📱 Versão do WhatsApp:', version);

    sock = makeWASocket({
      version,
      logger,
      printQRInTerminal: true,
      auth: state,
      browser: ['Tiadê Açaiteria', 'Chrome', '10.0'],
    });

    // Evento de atualização de conexão
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      // QR Code gerado
      if (qr) {
        console.log('📱 QR Code gerado!');
        qrCodeData = await QRCode.toDataURL(qr);
        connectionStatus = 'qr_ready';
      }

      // Conexão estabelecida
      if (connection === 'open') {
        console.log('✅ WhatsApp conectado com sucesso!');
        isConnected = true;
        connectionStatus = 'connected';
        qrCodeData = null;
      }

      // Conexão fechada
      if (connection === 'close') {
        isConnected = false;
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        
        console.log('❌ Conexão fechada. Motivo:', lastDisconnect?.error?.message || lastDisconnect?.error);
        
        if (shouldReconnect) {
          console.log('🔄 Reconectando em 3 segundos...');
          connectionStatus = 'reconnecting';
          setTimeout(connectToWhatsApp, 3000);
        } else {
          console.log('🔐 Deslogado. Novo QR necessário.');
          connectionStatus = 'logged_out';
          qrCodeData = null;
        }
      }
    });

    // Salvar credenciais quando atualizadas
    sock.ev.on('creds.update', saveCreds);

    // Evento de mensagens recebidas
    sock.ev.on('messages.upsert', async ({ messages }) => {
      const message = messages[0];
      if (!message.message) return;

      const text = message.message.conversation || 
                   message.message.extendedTextMessage?.text || '';
      
      console.log('📩 Mensagem recebida:', text);
    });

  } catch (error) {
    console.error('❌ Erro ao conectar:', error.message || error);
    connectionStatus = 'error';
    // Não lance o erro, apenas registre e tente novamente após 5 segundos
    console.log('🔄 Tentando reconectar em 5 segundos...');
    setTimeout(connectToWhatsApp, 5000);
  }
}

/**
 * Formata número de telefone para WhatsApp
 */
function formatPhoneNumber(phone) {
  // Remove caracteres não numéricos
  let cleanPhone = phone.replace(/\D/g, '');
  
  // Adiciona código do país (Brasil)
  if (!cleanPhone.startsWith('55')) {
    cleanPhone = '55' + cleanPhone;
  }
  
  return cleanPhone + '@s.whatsapp.net';
}

/**
 * Envia mensagem de texto
 */
async function sendTextMessage(to, message) {
  if (!isConnected || !sock) {
    throw new Error('WhatsApp não está conectado');
  }

  try {
    const formattedNumber = formatPhoneNumber(to);
    await sock.sendMessage(formattedNumber, { text: message });
    return { success: true, message: 'Mensagem enviada com sucesso' };
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error);
    throw error;
  }
}

// ========================================
// ROTAS DA API
// ========================================

// Preflight handler para OPTIONS requests
app.options('*', cors(corsOptions));

/**
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Servidor WhatsApp rodando',
    timestamp: new Date().toISOString()
  });
});

/**
 * Status da conexão
 */
app.get('/status', (req, res) => {
  res.json({
    connected: isConnected,
    status: connectionStatus,
    hasQR: !!qrCodeData
  });
});

/**
 * Obter QR Code
 */
app.get('/qr', (req, res) => {
  if (qrCodeData) {
    res.json({
      success: true,
      qrCode: qrCodeData,
      message: 'Escaneie o QR Code com o WhatsApp'
    });
  } else if (isConnected) {
    res.json({
      success: false,
      message: 'WhatsApp já está conectado'
    });
  } else {
    res.json({
      success: false,
      message: 'QR Code ainda não foi gerado. Aguarde...'
    });
  }
});

/**
 * Enviar mensagem
 */
app.post('/send-message', async (req, res) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({
        success: false,
        message: 'Número de telefone e mensagem são obrigatórios'
      });
    }

    const result = await sendTextMessage(to, message);
    res.json(result);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Enviar confirmação de pedido
 */
app.post('/send-order-confirmation', async (req, res) => {
  try {
    const { 
      phoneNumber, 
      customerName, 
      orderDetails, 
      orderTotal,
      deliveryType 
    } = req.body;

    if (!phoneNumber || !orderDetails) {
      return res.status(400).json({
        success: false,
        message: 'Dados incompletos'
      });
    }

    // Monta mensagem de confirmação
    let message = `🍇 *Tiadê Açaiteria* 🍇\n\n`;
    message += `Olá ${customerName}! 👋\n\n`;
    message += `✅ Seu pedido foi confirmado!\n\n`;
    message += `📋 *Detalhes do Pedido:*\n`;
    message += `🔹 Tipo: ${orderDetails.tipo_acai || 'Açaí'}\n`;
    message += `🔹 Tamanho: ${orderDetails.tamanho}\n`;
    message += `🔹 Quantidade: ${orderDetails.quantidade}x\n`;
    
    if (orderDetails.complementos?.length > 0) {
      message += `🔹 Complementos: ${orderDetails.complementos.join(', ')}\n`;
    }
    
    if (orderDetails.toppings?.length > 0) {
      message += `🔹 Toppings: ${orderDetails.toppings.join(', ')}\n`;
    }
    
    message += `\n💰 *Total: R$ ${orderTotal.toFixed(2)}*\n\n`;
    
    if (deliveryType === 'entrega') {
      message += `🚚 *Entrega*: Seu pedido está sendo preparado e logo estará a caminho!\n`;
    } else {
      message += `🏪 *Retirada*: Você pode retirar seu pedido na loja em breve!\n`;
    }
    
    message += `\n⏱️ Tempo estimado: 20-30 minutos\n\n`;
    message += `Obrigado pela preferência! 🙏`;

    const result = await sendTextMessage(phoneNumber, message);
    res.json(result);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Enviar atualização de status
 */
app.post('/send-status-update', async (req, res) => {
  try {
    const { phoneNumber, customerName, status } = req.body;

    if (!phoneNumber || !status) {
      return res.status(400).json({
        success: false,
        message: 'Dados incompletos'
      });
    }

    const statusMessages = {
      'confirmado': '✅ Pedido confirmado! Estamos preparando seu açaí.',
      'preparando': '👨‍🍳 Seu açaí está sendo preparado com carinho!',
      'pronto': '🎉 Seu açaí está pronto! Pode vir buscar.',
      'saiu-para-entrega': '🚚 Seu pedido saiu para entrega!',
      'concluído': '✅ Pedido concluído! Obrigado pela preferência!',
      'cancelado': '❌ Pedido cancelado.'
    };

    const statusEmoji = {
      'confirmado': '✅',
      'preparando': '👨‍🍳',
      'pronto': '🎉',
      'saiu-para-entrega': '🚚',
      'concluído': '✅',
      'cancelado': '❌'
    };

    let message = `🍇 *Tiadê Açaiteria* 🍇\n\n`;
    message += `Olá ${customerName}!\n\n`;
    message += `${statusEmoji[status.toLowerCase()] || '📋'} *Atualização do Pedido*\n\n`;
    message += statusMessages[status.toLowerCase()] || `Status: ${status}`;

    const result = await sendTextMessage(phoneNumber, message);
    res.json(result);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Enviar lembrete de avaliação
 */
app.post('/send-review-reminder', async (req, res) => {
  try {
    const { phoneNumber, customerName } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Número de telefone obrigatório'
      });
    }

    let message = `🍇 *Tiadê Açaiteria* 🍇\n\n`;
    message += `Olá ${customerName}! 😊\n\n`;
    message += `Esperamos que tenha gostado do seu açaí! 🍇\n\n`;
    message += `⭐ Sua opinião é muito importante para nós!\n\n`;
    message += `Avalie seu pedido e nos ajude a melhorar cada vez mais.\n\n`;
    message += `Obrigado pela preferência! 🙏`;

    const result = await sendTextMessage(phoneNumber, message);
    res.json(result);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Desconectar WhatsApp
 */
app.post('/disconnect', async (req, res) => {
  try {
    if (sock) {
      await sock.logout();
      sock = null;
      isConnected = false;
      qrCodeData = null;
      connectionStatus = 'disconnected';
      
      res.json({
        success: true,
        message: 'WhatsApp desconectado com sucesso'
      });
    } else {
      res.json({
        success: false,
        message: 'WhatsApp já está desconectado'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Middleware de tratamento de erro 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.path,
    method: req.method,
    availableRoutes: [
      'GET /health',
      'GET /status',
      'GET /qr',
      'POST /send-message',
      'POST /send-order-confirmation',
      'POST /send-status-update',
      'POST /send-review-reminder',
      'POST /disconnect'
    ]
  });
});

// Middleware de tratamento de erro global
app.use((err, req, res, next) => {
  console.error('❌ Erro não tratado:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor WhatsApp rodando na porta ${PORT}`);
  console.log(`📱 Acesse http://localhost:${PORT}/status para verificar o status`);
  console.log(`📱 Acesse http://localhost:${PORT}/qr para obter o QR Code\n`);
  
  // Conectar ao WhatsApp automaticamente
  connectToWhatsApp();
});

// Tratamento de erros não capturados
process.on('uncaughtException', (err) => {
  console.error('❌ Erro não capturado:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Promise rejeitada:', err);
});
