// src/utils/notificationSound.js
// Gera um som de notificação usando Web Audio API

export function playNotificationSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Criar oscilador para som
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configurar som agradável (Dó-Mi-Sol)
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // Dó
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // Mi
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // Sol
    
    // Volume
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    // Tocar
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
    
    return true;
  } catch (error) {
    console.error('Erro ao tocar som de notificação:', error);
    return false;
  }
}

// Som de sucesso
export function playSuccessSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Som de sucesso (ascendente)
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // Lá
    oscillator.frequency.setValueAtTime(554.37, audioContext.currentTime + 0.1); // Dó#
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.2); // Mi
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.4);
    
    return true;
  } catch (error) {
    console.error('Erro ao tocar som de sucesso:', error);
    return false;
  }
}

// Som de erro
export function playErrorSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Som de erro (descendente)
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime + 0.15);
    
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
    
    return true;
  } catch (error) {
    console.error('Erro ao tocar som de erro:', error);
    return false;
  }
}
