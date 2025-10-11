// Teste rápido do dateUtils
import { formatDate, formatTime, formatDateTime } from './src/utils/dateUtils.js';

// Simulando uma data do Supabase (UTC)
const supabaseDate = '2025-10-10T23:47:35.000Z'; // 23:47 em UTC

console.log('=== TESTE DE CONVERSÃO DE HORÁRIO ===');
console.log('Data original (UTC):', supabaseDate);
console.log('---');
console.log('Data formatada:', formatDate(supabaseDate));
console.log('Hora formatada:', formatTime(supabaseDate));
console.log('Data/Hora completa:', formatDateTime(supabaseDate));
console.log('---');
console.log('ESPERADO: 20:47:35 (Brasília)');
