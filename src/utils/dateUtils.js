// src/utils/dateUtils.js

/**
 * Formata uma data do Supabase (UTC) para o horário local do Brasil (UTC-3)
 * @param {string} dateString - Data em formato ISO do Supabase
 * @returns {Date} - Objeto Date ajustado para o fuso horário do Brasil
 */
export function parseSupabaseDate(dateString) {
  if (!dateString) return new Date();
  
  // Criar data a partir da string UTC
  const date = new Date(dateString);
  
  // Ajustar para horário de Brasília (UTC-3)
  // Subtraímos 3 horas em milissegundos
  const brasiliaOffset = -3; // Brasília é UTC-3
  const utcTime = date.getTime();
  const brasiliaTime = utcTime + (brasiliaOffset * 60 * 60 * 1000);
  
  return new Date(brasiliaTime);
}

/**
 * Formata data para exibição no formato brasileiro
 * @param {string} dateString - Data em formato ISO do Supabase
 * @returns {string} - Data formatada (ex: "10/10/2025")
 */
export function formatDate(dateString) {
  if (!dateString) return '-';
  
  // Criar data UTC
  const date = new Date(dateString);
  
  // Ajustar para Brasília (UTC-3)
  const brasiliaTime = date.getTime() + (-3 * 60 * 60 * 1000);
  const brasiliaDate = new Date(brasiliaTime);
  
  const day = String(brasiliaDate.getUTCDate()).padStart(2, '0');
  const month = String(brasiliaDate.getUTCMonth() + 1).padStart(2, '0');
  const year = brasiliaDate.getUTCFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Formata hora para exibição no formato brasileiro
 * @param {string} dateString - Data em formato ISO do Supabase
 * @returns {string} - Hora formatada (ex: "20:41:05")
 */
export function formatTime(dateString) {
  if (!dateString) return '-';
  
  // Criar data UTC
  const date = new Date(dateString);
  
  // Pegar horário UTC e ajustar para Brasília (UTC-3)
  let hours = date.getUTCHours() - 3; // Subtrai 3 horas
  const minutes = date.getUTCMinutes();
  const seconds = date.getUTCSeconds();
  
  // Ajustar se passar da meia-noite (hours negativo)
  if (hours < 0) {
    hours += 24;
  }
  
  // Formatar com zero à esquerda
  const hoursStr = String(hours).padStart(2, '0');
  const minutesStr = String(minutes).padStart(2, '0');
  const secondsStr = String(seconds).padStart(2, '0');
  
  return `${hoursStr}:${minutesStr}:${secondsStr}`;
}

/**
 * Formata data e hora completa
 * @param {string} dateString - Data em formato ISO do Supabase
 * @returns {string} - Data e hora formatadas (ex: "10/10/2025 às 20:41:05")
 */
export function formatDateTime(dateString) {
  if (!dateString) return '-';
  
  return `${formatDate(dateString)} às ${formatTime(dateString)}`;
}

/**
 * Formata data e hora de forma mais compacta
 * @param {string} dateString - Data em formato ISO do Supabase
 * @returns {string} - Data e hora formatadas (ex: "10/10/2025 20:41")
 */
export function formatDateTimeShort(dateString) {
  if (!dateString) return '-';
  
  // Criar data UTC
  const date = new Date(dateString);
  
  // Ajustar para Brasília (UTC-3)
  const brasiliaTime = date.getTime() + (-3 * 60 * 60 * 1000);
  const brasiliaDate = new Date(brasiliaTime);
  
  const day = String(brasiliaDate.getUTCDate()).padStart(2, '0');
  const month = String(brasiliaDate.getUTCMonth() + 1).padStart(2, '0');
  const year = brasiliaDate.getUTCFullYear();
  const hours = String(brasiliaDate.getUTCHours()).padStart(2, '0');
  const minutes = String(brasiliaDate.getUTCMinutes()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Verifica se uma data é de hoje
 * @param {string} dateString - Data em formato ISO do Supabase
 * @returns {boolean} - True se for hoje
 */
export function isToday(dateString) {
  if (!dateString) return false;
  
  const date = parseSupabaseDate(dateString);
  const today = new Date();
  
  // Ajustar today para Brasília também
  const brasiliaOffset = -3;
  const utcTime = today.getTime();
  const brasiliaTime = utcTime + (brasiliaOffset * 60 * 60 * 1000);
  const todayBrasilia = new Date(brasiliaTime);
  
  return (
    date.getUTCDate() === todayBrasilia.getUTCDate() &&
    date.getUTCMonth() === todayBrasilia.getUTCMonth() &&
    date.getUTCFullYear() === todayBrasilia.getUTCFullYear()
  );
}

/**
 * Formata data de forma relativa (ex: "Hoje", "Ontem", "10/10/2025")
 * @param {string} dateString - Data em formato ISO do Supabase
 * @returns {string} - Data formatada de forma relativa
 */
export function formatDateRelative(dateString) {
  if (!dateString) return '-';
  
  const date = parseSupabaseDate(dateString);
  const today = new Date();
  
  // Ajustar today para Brasília
  const brasiliaOffset = -3;
  const utcTime = today.getTime();
  const brasiliaTime = utcTime + (brasiliaOffset * 60 * 60 * 1000);
  const todayBrasilia = new Date(brasiliaTime);
  
  const yesterday = new Date(todayBrasilia);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  
  if (
    date.getUTCDate() === todayBrasilia.getUTCDate() &&
    date.getUTCMonth() === todayBrasilia.getUTCMonth() &&
    date.getUTCFullYear() === todayBrasilia.getUTCFullYear()
  ) {
    return 'Hoje';
  }
  
  if (
    date.getUTCDate() === yesterday.getUTCDate() &&
    date.getUTCMonth() === yesterday.getUTCMonth() &&
    date.getUTCFullYear() === yesterday.getUTCFullYear()
  ) {
    return 'Ontem';
  }
  
  return formatDate(dateString);
}
