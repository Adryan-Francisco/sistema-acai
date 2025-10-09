// src/utils/pixGenerator.js
/**
 * Gerador de PIX Copia e Cola (BR Code)
 * Gera o código PIX dinâmico com QR Code
 */

export function generatePixCode({ 
  pixKey, 
  merchantName, 
  merchantCity, 
  amount, 
  transactionId 
}) {
  // Validar dados
  if (!pixKey || !merchantName || !merchantCity) {
    throw new Error('Dados obrigatórios: pixKey, merchantName, merchantCity')
  }

  // Formatar valor (2 casas decimais)
  const formattedAmount = amount ? parseFloat(amount).toFixed(2) : null

  // Payload Format Indicator
  let payload = '000201' // Versão fixa do PIX

  // Merchant Account Information
  const pixKeyLength = pixKey.length.toString().padStart(2, '0')
  const merchantAccountInfo = `0014br.gov.bcb.pix01${pixKeyLength}${pixKey}`
  const merchantAccountLength = merchantAccountInfo.length.toString().padStart(2, '0')
  payload += `26${merchantAccountLength}${merchantAccountInfo}`

  // Merchant Category Code (Comércio varejista)
  payload += '52040000'

  // Transaction Currency (986 = BRL)
  payload += '5303986'

  // Transaction Amount (opcional)
  if (formattedAmount) {
    const amountLength = formattedAmount.length.toString().padStart(2, '0')
    payload += `54${amountLength}${formattedAmount}`
  }

  // Country Code (BR)
  payload += '5802BR'

  // Merchant Name
  const merchantNameNormalized = merchantName.substring(0, 25).toUpperCase()
  const merchantNameLength = merchantNameNormalized.length.toString().padStart(2, '0')
  payload += `59${merchantNameLength}${merchantNameNormalized}`

  // Merchant City
  const merchantCityNormalized = merchantCity.substring(0, 15).toUpperCase()
  const merchantCityLength = merchantCityNormalized.length.toString().padStart(2, '0')
  payload += `60${merchantCityLength}${merchantCityNormalized}`

  // Additional Data Field (Transaction ID)
  if (transactionId) {
    const txIdNormalized = transactionId.substring(0, 25)
    const txIdLength = txIdNormalized.length.toString().padStart(2, '0')
    const additionalData = `05${txIdLength}${txIdNormalized}`
    const additionalDataLength = additionalData.length.toString().padStart(2, '0')
    payload += `62${additionalDataLength}${additionalData}`
  }

  // CRC16
  payload += '6304'
  const crc = calculateCRC16(payload)
  payload += crc

  return payload
}

/**
 * Calcula CRC16 CCITT
 */
function calculateCRC16(str) {
  let crc = 0xFFFF
  const polynomial = 0x1021

  for (let i = 0; i < str.length; i++) {
    const byte = str.charCodeAt(i)
    crc ^= (byte << 8)

    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ polynomial
      } else {
        crc = crc << 1
      }
    }
  }

  crc = crc & 0xFFFF
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

/**
 * Validar chave PIX
 */
export function isValidPixKey(key, type = 'auto') {
  if (!key) return false

  // Auto-detectar tipo
  if (type === 'auto') {
    if (/^\d{11}$/.test(key.replace(/\D/g, ''))) type = 'cpf'
    else if (/^\d{14}$/.test(key.replace(/\D/g, ''))) type = 'cnpj'
    else if (/^[\w.-]+@[\w.-]+\.\w+$/.test(key)) type = 'email'
    else if (/^\+?\d{10,15}$/.test(key.replace(/\D/g, ''))) type = 'phone'
    else type = 'random'
  }

  switch (type) {
    case 'cpf':
      return /^\d{11}$/.test(key.replace(/\D/g, ''))
    case 'cnpj':
      return /^\d{14}$/.test(key.replace(/\D/g, ''))
    case 'email':
      return /^[\w.-]+@[\w.-]+\.\w+$/.test(key)
    case 'phone':
      return /^\+?\d{10,15}$/.test(key.replace(/\D/g, ''))
    case 'random':
      return key.length >= 8 && key.length <= 72
    default:
      return false
  }
}

/**
 * Formatar valor em BRL
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}
