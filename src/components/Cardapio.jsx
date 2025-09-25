import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// Corrigindo caminhos para serem mais explícitos e garantir que o Vite os encontre
import { supabase } from '../supabaseClient.js';
import { useAuth } from '../AuthContext.jsx';
import './Cardapio.css';

// Ícone de Açaí para dar um charme visual
const AcaiHeaderIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{margin: '0 auto'}}>
        <path d="M5 21C5 17.134 8.13401 14 12 14C15.866 14 19 17.134 19 21" stroke="#FF69B4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 14C12 11.2386 14.2386 9 17 9C19.7614 9 22 11.2386 22 14" stroke="#8A2BE2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 14C12 11.2386 9.76142 9 7 9C4.23858 9 2 11.2386 2 14" stroke="#8A2BE2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17 9C17 6.23858 14.7614 4 12 4C9.23858 4 7 6.23858 7 9" stroke="#8A2BE2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 4C12 2.89543 11.1046 2 10 2" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);


function Cardapio() {
  const { session, user } = useAuth(); // Pega a sessão e os dados do utilizador
  const navigate = useNavigate();

  const [tamanho, setTamanho] = useState(null);
  const [complementosSelecionados, setComplementosSelecionados] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [listaTamanhos, setListaTamanhos] = useState([]);
  const [listaComplementos, setListaComplementos] = useState([]);
  const [loadingCardapio, setLoadingCardapio] = useState(true);

  useEffect(() => {
    const fetchCardapio = async () => {
      setLoadingCardapio(true);
      const { data: tamanhosData } = await supabase.from('tamanhos').select('*').order('ordem');
      const { data: complementosData } = await supabase.from('complementos').select('*').order('ordem');
      setListaTamanhos(tamanhosData || []);
      setListaComplementos(complementosData || []);
      setLoadingCardapio(false);
    };
    fetchCardapio();
  }, []);

  useEffect(() => {
    const precoTamanho = tamanho ? parseFloat(tamanho.preco) : 0;
    const precoComplementos = complementosSelecionados.reduce((acc, curr) => acc + parseFloat(curr.preco), 0);
    setTotal(precoTamanho + precoComplementos);
  }, [tamanho, complementosSelecionados]);

  const handleToggleComplemento = (complemento) => {
    setComplementosSelecionados((prev) =>
      prev.some(item => item.id === complemento.id)
        ? prev.filter((item) => item.id !== complemento.id)
        : [...prev, complemento]
    );
  };
  
  const handleSubmitPedido = async (e) => {
    e.preventDefault();
    if (!session) {
      alert('Você precisa criar uma conta para fazer um pedido. Vamos levá-lo para a página de registo!');
      navigate('/signup');
      return;
    }

    if (!tamanho) {
      alert('Por favor, escolha um tamanho para o açaí.');
      return;
    }

    setLoading(true);
    const detalhes_do_pedido = {
      tamanho: tamanho.nome,
      complementos: complementosSelecionados.map(c => c.nome),
      total: total.toFixed(2),
    };
    
    // Usa o nome do perfil do utilizador ou o e-mail como fallback
    const nomeFinal = user?.user_metadata?.nome || user?.email;

    const { error } = await supabase.rpc('criar_novo_pedido', {
      nome_do_cliente: nomeFinal,
      detalhes_do_pedido: detalhes_do_pedido,
    });

    setLoading(false);

    if (error) {
      console.error('Erro ao enviar pedido:', error);
      alert('Houve um erro ao enviar seu pedido. Tente novamente.');
    } else {
      alert('Pedido enviado com sucesso! Pode acompanhar o status na área "Meus Pedidos".');
      navigate('/meus-pedidos');
    }
  };
  
  if (loadingCardapio) {
    return <div style={{textAlign: 'center', marginTop: '50px'}}><h2>A carregar cardápio...</h2></div>;
  }

  return (
    <div className="cardapio-container">
      <AcaiHeaderIcon />
      <h1>Monte o seu Açaí</h1>
      <form onSubmit={handleSubmitPedido} className="acai-form">
        
        {session ? (
            <p className="welcome-message">
                Olá, {user?.user_metadata?.nome || user?.email}! Pronto para montar o seu açaí?
            </p>
        ) : (
            <p className="login-prompt">
                <Link to="/login">Faça o login</Link> ou <Link to="/signup">registe-se</Link> para fazer o seu pedido!
            </p>
        )}

        <fieldset>
          <legend>1. Escolha o Tamanho</legend>
          <div className="options-group">
            {listaTamanhos.map((t) => (
              <div key={t.id} className="option-item">
                <input type="radio" id={`tamanho-${t.id}`} name="tamanho" onChange={() => setTamanho(t)} checked={tamanho?.id === t.id} />
                <label htmlFor={`tamanho-${t.id}`}>{t.nome} (R$ {parseFloat(t.preco).toFixed(2)})</label>
              </div>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>2. Adicione Complementos</legend>
          <div className="options-group">
            {listaComplementos.map((c) => (
              <div key={c.id} className="option-item">
                <input type="checkbox" id={`complemento-${c.id}`} checked={complementosSelecionados.some(item => item.id === c.id)} onChange={() => handleToggleComplemento(c)} />
                <label htmlFor={`complemento-${c.id}`}>{c.nome} (+ R$ {parseFloat(c.preco).toFixed(2)})</label>
              </div>
            ))}
          </div>
        </fieldset>
        <div className="total-display">Total: R$ {total.toFixed(2)}</div>
        <button type="submit" disabled={loading}>{loading ? 'A enviar...' : 'Fazer Pedido'}</button>
      </form>
    </div>
  );
}

export default Cardapio;

