// src/utils/whatsappService.js

/**
 * Serviço para envio automático de mensagens WhatsApp
 * Integração com Baileys API Local
 */

// Configuração
const WHATSAPP_CONFIG = {
  provider: import.meta.env.VITE_WHATSAPP_PROVIDER || 'baileys',
  baileysApiUrl: import.meta.env.VITE_BAILEYS_API_URL || 'http://localhost:3001',
  lojaNome: import.meta.env.VITE_MERCHANT_NAME || 'Tiadê Açaiteria',
}

/**
 * Formata número de telefone para padrão WhatsApp
 * @param {string} phone - Número com ou sem formatação
 * @returns {string} - Número no formato 5517997422922@s.whatsapp.net
 */
export function formatPhoneNumber(phone) {
  // Remove todos os caracteres não numéricos
  const cleaned = phone.replace(/\D/g, '')
  
  // Se não começa com 55, adiciona (código do Brasil)
  const withCountryCode = cleaned.startsWith('55') ? cleaned : `55${cleaned}`
  
  return `${withCountryCode}@s.whatsapp.net`
}

/**
 * Gera mensagem de confirmação de pedido
 */
export function generateOrderConfirmationMessage(order) {
  const { detalhes_pedido, nome_cliente, id } = order
  
  let message = `🎉 *Pedido Confirmado!*\n\n`
  message += `Olá *${nome_cliente}*! Seu pedido foi recebido com sucesso.\n\n`
  message += `📋 *Detalhes do Pedido #${id}*\n`
  message += `━━━━━━━━━━━━━━━━\n`
  message += `🍨 ${detalhes_pedido.tipo_acai} - ${detalhes_pedido.tamanho}\n`
  
  if (detalhes_pedido.complementos_padrao?.length > 0) {
    message += `\n✅ *Incluso:*\n${detalhes_pedido.complementos_padrao.map(c => `• ${c}`).join('\n')}\n`
  }
  
  if (detalhes_pedido.complementos_removidos?.length > 0) {
    message += `\n❌ *Removidos:*\n${detalhes_pedido.complementos_removidos.map(c => `• ${c}`).join('\n')}\n`
  }
  
  if (detalhes_pedido.complementos_adicionais?.length > 0) {
    message += `\n➕ *Adicionais:*\n${detalhes_pedido.complementos_adicionais.map(c => `• ${c.nome} (+R$ ${c.preco.toFixed(2)})`).join('\n')}\n`
  }
  
  message += `\n━━━━━━━━━━━━━━━━\n`
  message += `💰 *Total:* R$ ${detalhes_pedido.total}\n`
  message += `💳 *Pagamento:* ${detalhes_pedido.metodo_pagamento}\n`
  
  if (detalhes_pedido.tipo_entrega === 'entrega') {
    message += `🛵 *Entrega para:* ${detalhes_pedido.endereco_entrega}\n`
    message += `📦 *Taxa de Entrega:* R$ ${detalhes_pedido.taxa_entrega.toFixed(2)}\n`
  } else {
    message += `🏪 *Tipo:* Retirada no Local\n`
  }
  
  message += `⏱️ *Tempo Estimado:* ${detalhes_pedido.tempo_preparo}\n\n`
  message += `Estamos preparando seu açaí com muito carinho! ❤️\n\n`
  message += `_${WHATSAPP_CONFIG.lojaNome}_`
  
  return message
}

/**
 * Gera mensagem de atualização de status
 */
export function generateStatusUpdateMessage(order, newStatus) {
  const { nome_cliente, id } = order
  
  let emoji = '📦'
  let statusText = ''
  let description = ''
  
  switch (newStatus) {
    case 'Em Preparo':
      emoji = '👨‍🍳'
      statusText = 'Em Preparo'
      description = 'Estamos preparando seu açaí agora!'
      break
    case 'Pronto':
      emoji = '✅'
      statusText = 'Pronto para Retirada/Entrega'
      description = 'Seu açaí está prontinho! 🎉'
      break
    case 'Saiu para Entrega':
      emoji = '🛵'
      statusText = 'Saiu para Entrega'
      description = 'O entregador está a caminho!'
      break
    case 'Entregue':
      emoji = '🎊'
      statusText = 'Pedido Entregue'
      description = 'Aproveite seu açaí! Esperamos que goste! ❤️'
      break
    case 'Cancelado':
      emoji = '❌'
      statusText = 'Pedido Cancelado'
      description = 'Seu pedido foi cancelado. Entre em contato se tiver dúvidas.'
      break
    default:
      emoji = '📋'
      statusText = newStatus
      description = 'Status do pedido atualizado.'
  }
  
  let message = `${emoji} *Atualização do Pedido #${id}*\n\n`
  message += `Olá *${nome_cliente}*!\n\n`
  message += `📊 *Novo Status:* ${statusText}\n`
  message += `${description}\n\n`
  message += `_${WHATSAPP_CONFIG.lojaNome}_`
  
  return message
}

/**
 * Gera mensagem de lembrete de avaliação
 */
export function generateReviewReminderMessage(order) {
  const { nome_cliente, id } = order
  
  let message = `⭐ *Avalie seu Pedido*\n\n`
  message += `Olá *${nome_cliente}*!\n\n`
  message += `Esperamos que tenha gostado do seu açaí! 😊\n\n`
  message += `Sua opinião é muito importante para nós.\n`
  message += `Que tal avaliar seu pedido #${id}?\n\n`
  message += `Acesse nosso sistema e deixe sua avaliação! ⭐⭐⭐⭐⭐\n\n`
  message += `_${WHATSAPP_CONFIG.lojaNome}_`
  
  return message
}

/**
 * Envia mensagem via Baileys API Local
 */
async function sendViaBaileys(phone, message) {
  const url = `${WHATSAPP_CONFIG.baileysApiUrl}/send-message`
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: phone,
        message: message,
      }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erro ao enviar mensagem')
    }
    
    const data = await response.json()
    console.log('✅ WhatsApp enviado via Baileys:', data)
    return { success: true, data }
    
  } catch (error) {
    console.error('❌ Erro ao enviar WhatsApp via Baileys:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Envia mensagem WhatsApp (função principal)
 * @param {string} phone - Número do telefone
 * @param {string} message - Mensagem a enviar
 * @returns {Promise} - Resultado do envio
 */
export async function sendWhatsAppMessage(phone, message) {
  // Verificar se está configurado
  if (!WHATSAPP_CONFIG.baileysApiUrl) {
    console.warn('⚠️ WhatsApp Baileys não configurado. Mensagem não enviada.')
    return { success: false, error: 'WhatsApp não configurado' }
  }
  
  return await sendViaBaileys(phone, message)
}

/**
 * Envia confirmação de pedido
 */
export async function sendOrderConfirmation(order) {
  try {
    if (!order.telefone) {
      console.warn('⚠️ Pedido sem telefone, WhatsApp não enviado')
      return { success: false, error: 'Telefone não informado' }
    }
    const message = generateOrderConfirmationMessage(order)
    return await sendWhatsAppMessage(order.telefone, message)
  } catch (error) {
    console.error('❌ Erro ao enviar confirmação WhatsApp:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Envia atualização de status
 */
export async function sendStatusUpdate(order, newStatus) {
  try {
    if (!order.telefone) {
      console.warn('⚠️ Pedido sem telefone, WhatsApp não enviado')
      return { success: false, error: 'Telefone não informado' }
    }
    const message = generateStatusUpdateMessage(order, newStatus)
    return await sendWhatsAppMessage(order.telefone, message)
  } catch (error) {
    console.error('❌ Erro ao enviar atualização WhatsApp:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Envia lembrete de avaliação (após entrega)
 */
export async function sendReviewReminder(order) {
  try {
    if (!order.telefone) {
      console.warn('⚠️ Pedido sem telefone, WhatsApp não enviado')
      return { success: false, error: 'Telefone não informado' }
    }
    const message = generateReviewReminderMessage(order)
    return await sendWhatsAppMessage(order.telefone, message)
  } catch (error) {
    console.error('❌ Erro ao enviar lembrete WhatsApp:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Verifica se WhatsApp está configurado
 */
export function isWhatsAppConfigured() {
  return !!WHATSAPP_CONFIG.baileysApiUrl
}

/**
 * Verifica status da conexão WhatsApp
 */
export async function checkWhatsAppStatus() {
  try {
    const response = await fetch(`${WHATSAPP_CONFIG.baileysApiUrl}/status`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('❌ Erro ao verificar status WhatsApp:', error)
    return { connected: false, status: 'error' }
  }
}

/**
 * Obtém QR Code para conexão
 */
export async function getWhatsAppQRCode() {
  try {
    const response = await fetch(`${WHATSAPP_CONFIG.baileysApiUrl}/qr`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('❌ Erro ao obter QR Code:', error)
    return { success: false, message: error.message }
  }
}
