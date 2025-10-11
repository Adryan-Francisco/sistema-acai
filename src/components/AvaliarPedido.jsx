// src/components/AvaliarPedido.jsx
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Star, MessageSquare, X, CheckCircle } from 'lucide-react';
import './AvaliarPedido.css';

export default function AvaliarPedido({ pedido, onClose, onAvaliacaoEnviada }) {
  const [nota, setNota] = useState(0);
  const [notaHover, setNotaHover] = useState(0);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (nota === 0) {
      alert('Por favor, selecione uma nota de 1 a 5 estrelas');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('avaliacoes')
        .insert({
          pedido_id: pedido.id,
          usuario_id: pedido.user_id,
          nota,
          comentario: comentario.trim() || null
        });

      if (error) throw error;

      // Atualizar pedido para marcar como avaliado
      await supabase
        .from('pedidos')
        .update({ avaliado: true })
        .eq('id', pedido.id);

      setSucesso(true);
      
      setTimeout(() => {
        if (onAvaliacaoEnviada) onAvaliacaoEnviada();
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      alert('Erro ao enviar avaliação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (sucesso) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="avaliar-modal sucesso" onClick={(e) => e.stopPropagation()}>
          <div className="sucesso-icon">
            <CheckCircle size={80} />
          </div>
          <h2>Avaliação Enviada!</h2>
          <p>Obrigado pelo seu feedback! 💜</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="avaliar-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="avaliar-header">
          <h2>⭐ Avalie seu Pedido</h2>
          <p>Como foi sua experiência?</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="avaliar-content">
            {/* Estrelas */}
            <div className="stars-container">
              <p className="stars-label">Sua avaliação:</p>
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${star <= (notaHover || nota) ? 'active' : ''}`}
                    onClick={() => setNota(star)}
                    onMouseEnter={() => setNotaHover(star)}
                    onMouseLeave={() => setNotaHover(0)}
                  >
                    <Star
                      size={48}
                      fill={star <= (notaHover || nota) ? '#fbbf24' : 'none'}
                      color={star <= (notaHover || nota) ? '#fbbf24' : '#d1d5db'}
                    />
                  </button>
                ))}
              </div>
              {nota > 0 && (
                <p className="nota-texto">
                  {nota === 1 && '😞 Muito insatisfeito'}
                  {nota === 2 && '😕 Insatisfeito'}
                  {nota === 3 && '😐 Regular'}
                  {nota === 4 && '😊 Satisfeito'}
                  {nota === 5 && '🤩 Muito satisfeito'}
                </p>
              )}
            </div>

            {/* Comentário */}
            <div className="comentario-container">
              <label htmlFor="comentario">
                <MessageSquare size={20} />
                <span>Comentário (opcional):</span>
              </label>
              <textarea
                id="comentario"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Conte-nos mais sobre sua experiência..."
                rows={4}
                maxLength={500}
              />
              <p className="char-count">{comentario.length}/500</p>
            </div>
          </div>

          <div className="avaliar-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancelar"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-enviar"
              disabled={loading || nota === 0}
            >
              {loading ? 'Enviando...' : 'Enviar Avaliação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
