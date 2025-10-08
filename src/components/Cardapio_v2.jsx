import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ShoppingCart, Plus, Minus, LogOut, User, X, Check, Star, Copy, CheckCheck } from "lucide-react"
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '../supabaseClient.js'
import { useAuth } from '../AuthContext.jsx'
import { useNotification } from './NotificationToast.jsx'
import './Cardapio_v2.css'

export default function CardapioV2() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { success, error: showError } = useNotification()

  const [selectedType, setSelectedType] = useState("moda-casa")
  const [selectedSize, setSelectedSize] = useState("550ml")
  const [selectedToppings, setSelectedToppings] = useState([])
  const [selectedDefaultToppings, setSelectedDefaultToppings] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [useFreeAcai, setUseFreeAcai] = useState(false)
  const [availableFreeAcais, setAvailableFreeAcais] = useState(0)
  const [fidelityPoints, setFidelityPoints] = useState(0)
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [showPixModal, setShowPixModal] = useState(false)
  const [pixCopied, setPixCopied] = useState(false)
  const [pixCode, setPixCode] = useState("")

  const acaiTypes = [
    {
      value: "moda-casa",
      label: "Moda da Casa",
      prices: { "330ml": 16, "550ml": 18, "770ml": 20 },
      description: "Acompanha banana, morango, granola, leite em pó e leite condensado",
      defaultToppings: [
        { id: "banana", name: "Banana" },
        { id: "morango-default", name: "Morango" },
        { id: "granola", name: "Granola" },
        { id: "leite-po", name: "Leite em Pó" },
        { id: "leite-condensado", name: "Leite Condensado" },
      ],
    },
    { value: "puro", label: "Puro", prices: { "330ml": 12, "550ml": 14, "770ml": 16 } },
    { value: "zero-completo", label: "Zero Completo", prices: { "330ml": 18, "550ml": 20, "770ml": 22 } },
    { value: "zero-puro", label: "Zero Puro", prices: { "330ml": 16, "550ml": 18, "770ml": 20 } },
  ]

  const toppings = [
    // Cremes
    { id: "avela", name: "Avelã", price: 5, category: "cremes" },
    { id: "beijinho", name: "Beijinho", price: 5, category: "cremes" },
    { id: "brigadeiro", name: "Brigadeiro", price: 5, category: "cremes" },
    { id: "doce-leite", name: "Doce de Leite", price: 5, category: "cremes" },
    { id: "kinder", name: "Kinder Bueno", price: 5, category: "cremes" },
    { id: "morango", name: "Morango", price: 5, category: "cremes" },
    { id: "ninho", name: "Ninho", price: 5, category: "cremes" },
    { id: "nutella", name: "Nutella", price: 6, category: "cremes" },
    { id: "oreo", name: "Oreo", price: 5, category: "cremes" },
    { id: "ovomaltine", name: "Ovomaltine", price: 6, category: "cremes" },
    { id: "pistache", name: "Pistache", price: 7, category: "cremes" },
    { id: "rafaello", name: "Rafaello", price: 5, category: "cremes" },
    { id: "sonho-valsa", name: "Sonho de Valsa", price: 5, category: "cremes" },
    // Diversos
    { id: "bis", name: "Bis", price: 2.5, category: "diversos" },
    { id: "bombom", name: "Bombom", price: 2, category: "diversos" },
    { id: "castanha", name: "Castanha", price: 3, category: "diversos" },
    { id: "chantilly", name: "Chantilly", price: 3.5, category: "diversos" },
    { id: "confete", name: "Confete", price: 3.5, category: "diversos" },
    { id: "farofa-pacoca", name: "Farofa de Paçoca", price: 2.5, category: "diversos" },
    { id: "gotas-chocolate", name: "Gotas de Chocolate", price: 3, category: "diversos" },
    { id: "kit-kat", name: "Kit Kat", price: 4.5, category: "diversos" },
    { id: "mini-oreo", name: "Mini Oreo", price: 4, category: "diversos" },
    { id: "ovomaltine-div", name: "Ovomaltine", price: 4, category: "diversos" },
    { id: "pacoca", name: "Paçoca", price: 2.5, category: "diversos" },
    // Frutas
    { id: "kiwi", name: "Kiwi", price: 7, category: "frutas" },
  ]

  // Atualizar complementos padrão quando muda o tipo
  useEffect(() => {
    const typeData = acaiTypes.find((t) => t.value === selectedType)
    if (typeData?.defaultToppings) {
      setSelectedDefaultToppings(typeData.defaultToppings.map((t) => t.id))
    } else {
      setSelectedDefaultToppings([])
    }
  }, [selectedType])

  // Carregar dados do usuário
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) {
        console.log('❌ Usuário não está logado')
        return
      }

      console.log('✅ Carregando dados do usuário:', user.id)

      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('pontos_fidelidade, acais_gratis')
          .eq('id', user.id)
          .single()

        console.log('📊 Resposta do Supabase:', { profile, profileError })

        if (profileError) {
          console.error('❌ Erro ao buscar perfil:', profileError)
          // Se der erro, ainda deixa funcionar (sem fidelidade)
          return
        }

        if (profile) {
          console.log('✅ Perfil carregado:', profile)
          setFidelityPoints(profile.pontos_fidelidade || 0)
          setAvailableFreeAcais(profile.acais_gratis || 0)
        }
      } catch (err) {
        console.error('❌ Erro ao carregar dados:', err)
      }
    }

    loadUserData()
  }, [user])

  const handleLogout = async () => {
    await signOut()
    navigate("/login")
  }

  const toggleTopping = (toppingId) => {
    setSelectedToppings((prev) =>
      prev.includes(toppingId) ? prev.filter((id) => id !== toppingId) : [...prev, toppingId],
    )
  }

  const toggleDefaultTopping = (toppingId) => {
    setSelectedDefaultToppings((prev) =>
      prev.includes(toppingId) ? prev.filter((id) => id !== toppingId) : [...prev, toppingId],
    )
  }

  const calculateTotal = () => {
    if (useFreeAcai && quantity === 1) {
      return 0
    }

    const typeData = acaiTypes.find((t) => t.value === selectedType)
    const basePrice = typeData?.prices[selectedSize] || 0
    const toppingsPrice = selectedToppings.reduce((sum, id) => {
      const topping = toppings.find((t) => t.id === id)
      return sum + (topping?.price || 0)
    }, 0)

    const effectiveQuantity = useFreeAcai ? quantity - 1 : quantity
    return (basePrice + toppingsPrice) * effectiveQuantity
  }

  const handlePreviewOrder = () => {
    if (!user) {
      showError('Você precisa estar logado para fazer pedidos')
      navigate('/login')
      return
    }

    if (!paymentMethod) {
      showError('Selecione um método de pagamento')
      return
    }

    setShowPreview(true)
  }

  const generatePixCode = (valor) => {
    // Código PIX simplificado (EMV)
    // Em produção, use uma API real de PIX
    const chavePix = "17 99742-2922" // Substitua pela sua chave PIX real
    const nomeRecebedor = "TIADÊ AÇAITERIA" 
    const cidade = "ASPÁSIA"
    
    // Formato simplificado - em produção use biblioteca específica
    return `00020126580014br.gov.bcb.pix0136${chavePix}52040000530398654${valor.toFixed(2).padStart(10, '0')}5802BR5913${nomeRecebedor}6009${cidade}62070503***6304`
  }

  const handleCopyPixCode = () => {
    navigator.clipboard.writeText(pixCode)
    setPixCopied(true)
    success('Código PIX copiado!')
    setTimeout(() => setPixCopied(false), 3000)
  }

  const handleOrder = async () => {
    setShowPreview(false)
    
    // Se for PIX, mostrar QR Code primeiro
    if (paymentMethod === 'PIX') {
      const total = calculateTotal()
      const code = generatePixCode(total)
      setPixCode(code)
      setShowPixModal(true)
      return
    }
    
    await processOrder()
  }

  const processOrder = async () => {
    setLoading(true)

    try {
      const typeData = acaiTypes.find((t) => t.value === selectedType)
      const removedDefaultToppings = typeData?.defaultToppings
        ?.filter((dt) => !selectedDefaultToppings.includes(dt.id))
        .map((dt) => dt.name) || []

      // Criar pedido
      const { error: orderError } = await supabase.from('pedidos').insert([
        {
          user_id: user.id,
          nome_cliente: user.email?.split('@')[0] || 'Cliente',
          detalhes_pedido: {
            tipo_acai: typeData?.label || "",
            tamanho: selectedSize,
            complementos_adicionais: selectedToppings.map((id) => ({
              nome: toppings.find((t) => t.id === id)?.name || "",
              preco: toppings.find((t) => t.id === id)?.price || 0
            })),
            complementos_padrao: typeData?.defaultToppings
              ?.filter((dt) => selectedDefaultToppings.includes(dt.id))
              .map((dt) => dt.name) || [],
            complementos_removidos: removedDefaultToppings,
            quantidade: quantity,
            total: calculateTotal().toFixed(2),
            metodo_pagamento: paymentMethod,
            usou_acai_gratis: useFreeAcai,
          },
          status: 'Recebido',
        },
      ])

      if (orderError) throw orderError

      // Atualizar fidelidade
      const newPoints = useFreeAcai 
        ? fidelityPoints + (quantity > 1 ? quantity - 1 : 0)
        : fidelityPoints + quantity

      const newFreeAcais = Math.floor(newPoints / 10)
      const currentFreeAcais = useFreeAcai ? availableFreeAcais - 1 : availableFreeAcais

      await supabase
        .from('profiles')
        .update({
          pontos_fidelidade: newPoints,
          acais_gratis: Math.max(0, newFreeAcais)
        })
        .eq('id', user.id)

      // Verificar se ganhou açaí grátis
      if (newFreeAcais > currentFreeAcais) {
        const gained = newFreeAcais - currentFreeAcais
        success(`Pedido criado! 🎉 Você ganhou ${gained} açaí(s) grátis!`, { duration: 5000 })
      } else {
        success('Pedido criado com sucesso!', { duration: 3000 })
      }

      // Atualizar estado local
      setFidelityPoints(newPoints)
      setAvailableFreeAcais(Math.max(0, newFreeAcais))

      // Limpar formulário
      setSelectedToppings([])
      setQuantity(1)
      setUseFreeAcai(false)
      setPaymentMethod("")
      const currentTypeData = acaiTypes.find((t) => t.value === selectedType)
      if (currentTypeData?.defaultToppings) {
        setSelectedDefaultToppings(currentTypeData.defaultToppings.map((t) => t.id))
      }

      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/meus-pedidos')
      }, 2000)

    } catch (err) {
      console.error('Erro ao criar pedido:', err)
      showError('Erro ao criar pedido. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const cremes = toppings.filter((t) => t.category === "cremes")
  const diversos = toppings.filter((t) => t.category === "diversos")
  const frutas = toppings.filter((t) => t.category === "frutas")
  const currentTypeData = acaiTypes.find((t) => t.value === selectedType)
  const hasDefaultToppings = currentTypeData?.defaultToppings && currentTypeData.defaultToppings.length > 0

  return (
    <div className="cardapio-v2-container">
      {/* Header */}
      <header className="cardapio-v2-header">
        <div className="cardapio-v2-header-content">
          <div className="cardapio-v2-logo">
            <div className="cardapio-v2-logo-icon">
              <span>A</span>
            </div>
            <div className="cardapio-v2-logo-text">
              <h1>AçaíExpress</h1>
            </div>
          </div>
          <div className="cardapio-v2-header-actions">
            <button 
              onClick={() => navigate('/meus-pedidos')} 
              className="button-outline button-sm"
              title="Meus Pedidos"
            >
              <User size={16} />
              {user?.email?.split('@')[0]}
            </button>
            <button onClick={handleLogout} className="button-outline button-sm">
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="cardapio-v2-hero">
        <div className="cardapio-v2-hero-title">
          <h2>Monte seu Açaí Perfeito</h2>
          <p>Escolha o tipo, tamanho e adicione seus complementos favoritos</p>
        </div>

        {/* Card Principal */}
        <div className="cardapio-v2-card">
          {/* Acai Type Selection */}
          <div className="cardapio-v2-section">
            <label className="cardapio-v2-section-label">Tipo de Açaí</label>
            <div className="cardapio-v2-type-grid">
              {acaiTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`cardapio-v2-type-button ${selectedType === type.value ? "selected" : ""}`}
                >
                  <div className="cardapio-v2-type-title">{type.label}</div>
                  {type.description && <div className="cardapio-v2-type-description">{type.description}</div>}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="cardapio-v2-section">
            <label className="cardapio-v2-section-label">Escolha o Tamanho</label>
            <div className="cardapio-v2-size-grid">
              {(["330ml", "550ml", "770ml"]).map((size) => {
                const typeData = acaiTypes.find((t) => t.value === selectedType)
                const price = typeData?.prices[size] || 0
                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`cardapio-v2-size-button ${selectedSize === size ? "selected" : ""}`}
                  >
                    <div className="cardapio-v2-size-label">{size}</div>
                    <div className="cardapio-v2-size-price">R$ {price.toFixed(2)}</div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Default Toppings */}
          {hasDefaultToppings && (
            <div className="cardapio-v2-section">
              <label className="cardapio-v2-section-label">
                Acompanhamentos Inclusos
                <span className="cardapio-v2-section-label-hint">(desmarque os que não deseja)</span>
              </label>
              <div className="cardapio-v2-default-toppings">
                <div className="cardapio-v2-default-grid">
                  {currentTypeData?.defaultToppings?.map((topping) => (
                    <div key={topping.id} className="cardapio-v2-default-item">
                      <input
                        type="checkbox"
                        id={topping.id}
                        checked={selectedDefaultToppings.includes(topping.id)}
                        onChange={() => toggleDefaultTopping(topping.id)}
                      />
                      <label htmlFor={topping.id}>{topping.name}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Additional Toppings */}
          <div className="cardapio-v2-section">
            <label className="cardapio-v2-section-label">Complementos Adicionais</label>

            {/* Cremes */}
            <div className="cardapio-v2-toppings-category">
              <h3 className="cardapio-v2-category-title">Cremes</h3>
              <div className="cardapio-v2-toppings-grid">
                {cremes.map((topping) => (
                  <button
                    key={topping.id}
                    onClick={() => toggleTopping(topping.id)}
                    className={`cardapio-v2-topping-button ${selectedToppings.includes(topping.id) ? "selected" : ""}`}
                  >
                    <div className="cardapio-v2-topping-name">{topping.name}</div>
                    <div className="cardapio-v2-topping-price">+R$ {topping.price.toFixed(2)}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Diversos */}
            <div className="cardapio-v2-toppings-category">
              <h3 className="cardapio-v2-category-title">Diversos</h3>
              <div className="cardapio-v2-toppings-grid">
                {diversos.map((topping) => (
                  <button
                    key={topping.id}
                    onClick={() => toggleTopping(topping.id)}
                    className={`cardapio-v2-topping-button ${selectedToppings.includes(topping.id) ? "selected" : ""}`}
                  >
                    <div className="cardapio-v2-topping-name">{topping.name}</div>
                    <div className="cardapio-v2-topping-price">+R$ {topping.price.toFixed(2)}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Frutas */}
            <div className="cardapio-v2-toppings-category">
              <h3 className="cardapio-v2-category-title">Frutas</h3>
              <div className="cardapio-v2-toppings-grid">
                {frutas.map((topping) => (
                  <button
                    key={topping.id}
                    onClick={() => toggleTopping(topping.id)}
                    className={`cardapio-v2-topping-button ${selectedToppings.includes(topping.id) ? "selected" : ""}`}
                  >
                    <div className="cardapio-v2-topping-name">{topping.name}</div>
                    <div className="cardapio-v2-topping-price">+R$ {topping.price.toFixed(2)}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quantity */}
          <div className="cardapio-v2-section">
            <label className="cardapio-v2-section-label">Quantidade</label>
            <div className="cardapio-v2-quantity">
              <button
                className="cardapio-v2-quantity-button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={useFreeAcai}
              >
                <Minus size={16} />
              </button>
              <span className="cardapio-v2-quantity-value">{quantity}</span>
              <button
                className="cardapio-v2-quantity-button"
                onClick={() => setQuantity(quantity + 1)}
                disabled={useFreeAcai}
              >
                <Plus size={16} />
              </button>
              {useFreeAcai && <span className="cardapio-v2-quantity-hint">(Quantidade fixa ao usar açaí grátis)</span>}
            </div>
          </div>

          {/* Payment Method */}
          <div className="cardapio-v2-section">
            <label className="cardapio-v2-section-label">Método de Pagamento *</label>
            <select
              className="cardapio-v2-payment-select"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="">Selecione o método de pagamento</option>
              <option value="PIX">PIX</option>
              <option value="Dinheiro">Dinheiro</option>
              <option value="Cartão de Crédito">Cartão de Crédito</option>
              <option value="Cartão de Débito">Cartão de Débito</option>
            </select>
          </div>

          {/* Total and Order Button */}
          <div className="cardapio-v2-footer">
            <div className="cardapio-v2-total-row">
              <span className="cardapio-v2-total-label">Total:</span>
              <div className="cardapio-v2-total-value-container">
                {useFreeAcai && (
                  <div className="cardapio-v2-free-applied">1 açaí grátis aplicado! 🎉</div>
                )}
                <span className="cardapio-v2-total-value">R$ {calculateTotal().toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={handlePreviewOrder}
              disabled={loading}
              className="cardapio-v2-order-button"
            >
              <ShoppingCart size={20} />
              {loading ? 'Processando...' : 'Fazer Pedido'}
            </button>
          </div>
        </div>
      </section>

      {/* Barra de Progresso de Fidelidade */}
      {user && (
        <div className="fidelity-progress-bar">
          <div className="fidelity-progress-header">
            <span className="fidelity-progress-title">
              <Star size={16} fill="currentColor" />
              Programa de Fidelidade
            </span>
            <span className="fidelity-progress-count">{fidelityPoints % 10}/10 pontos</span>
          </div>
          <div className="fidelity-progress-track">
            <div 
              className="fidelity-progress-fill" 
              style={{ width: `${(fidelityPoints % 10) * 10}%` }}
            />
          </div>
          <div className="fidelity-progress-info">
            <span>✨ {availableFreeAcais} açaí(s) grátis disponível(is)</span>
            <span>{10 - (fidelityPoints % 10)} pontos para o próximo açaí grátis</span>
          </div>
          {fidelityPoints >= 10 && (
            <button 
              onClick={() => window.location.href = '/sistema-acai/resgatar-acai'} 
              className="btn-resgatar-fidelidade"
            >
              🎁 Resgatar Açaí Grátis
            </button>
          )}
        </div>
      )}

      {/* Modal de Preview do Pedido */}
      {showPreview && (
        <div className="modal-overlay" onClick={() => setShowPreview(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirme seu Pedido</h3>
              <button onClick={() => setShowPreview(false)} className="modal-close">
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="preview-item">
                <span className="preview-label">Tipo:</span>
                <span className="preview-value">{currentTypeData?.label}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Tamanho:</span>
                <span className="preview-value">{selectedSize}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Quantidade:</span>
                <span className="preview-value">{quantity}x</span>
              </div>
              
              {hasDefaultToppings && selectedDefaultToppings.length > 0 && (
                <div className="preview-section">
                  <h4>Complementos Inclusos:</h4>
                  <div className="preview-toppings">
                    {currentTypeData.defaultToppings
                      .filter(dt => selectedDefaultToppings.includes(dt.id))
                      .map(dt => (
                        <span key={dt.id} className="preview-topping-tag included">
                          <Check size={14} />
                          {dt.name}
                        </span>
                      ))}
                  </div>
                </div>
              )}
              
              {hasDefaultToppings && currentTypeData.defaultToppings.some(dt => !selectedDefaultToppings.includes(dt.id)) && (
                <div className="preview-section">
                  <h4>Complementos Removidos:</h4>
                  <div className="preview-toppings">
                    {currentTypeData.defaultToppings
                      .filter(dt => !selectedDefaultToppings.includes(dt.id))
                      .map(dt => (
                        <span key={dt.id} className="preview-topping-tag removed">
                          <X size={14} />
                          {dt.name}
                        </span>
                      ))}
                  </div>
                </div>
              )}
              
              {selectedToppings.length > 0 && (
                <div className="preview-section">
                  <h4>Complementos Adicionais:</h4>
                  <div className="preview-toppings">
                    {selectedToppings.map(id => {
                      const topping = toppings.find(t => t.id === id)
                      return (
                        <span key={id} className="preview-topping-tag additional">
                          {topping?.name} (+R$ {topping?.price.toFixed(2)})
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
              
              <div className="preview-item">
                <span className="preview-label">Pagamento:</span>
                <span className="preview-value preview-payment">{paymentMethod}</span>
              </div>
              
              {useFreeAcai && (
                <div className="preview-free-badge">
                  🎉 1 açaí grátis sendo utilizado!
                </div>
              )}
              
              <div className="preview-total">
                <span>Total:</span>
                <span className="preview-total-value">R$ {calculateTotal().toFixed(2)}</span>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowPreview(false)} className="button-outline">
                Cancelar
              </button>
              <button onClick={handleOrder} className="button-primary" disabled={loading}>
                <Check size={18} />
                {loading ? 'Processando...' : 'Confirmar Pedido'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal do PIX */}
      {showPixModal && (
        <div className="modal-overlay" onClick={() => setShowPixModal(false)}>
          <div className="modal-content pix-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>💳 Pagamento via PIX</h3>
              <button onClick={() => setShowPixModal(false)} className="modal-close">
                <X size={24} />
              </button>
            </div>
            <div className="modal-body pix-modal-body">
              <div className="pix-instructions">
                <p>Escaneie o QR Code abaixo com o app do seu banco</p>
                <p className="pix-amount">Valor: R$ {calculateTotal().toFixed(2)}</p>
              </div>
              
              <div className="pix-qrcode-container">
                <QRCodeSVG 
                  value={pixCode}
                  size={256}
                  level="H"
                  includeMargin={true}
                  className="pix-qrcode"
                />
              </div>

              <div className="pix-divider">
                <span>ou</span>
              </div>

              <div className="pix-code-section">
                <label>Copie o código PIX:</label>
                <div className="pix-code-box">
                  <input 
                    type="text" 
                    value={pixCode} 
                    readOnly 
                    className="pix-code-input"
                  />
                  <button 
                    onClick={handleCopyPixCode} 
                    className="pix-copy-button"
                    title="Copiar código PIX"
                  >
                    {pixCopied ? <CheckCheck size={20} /> : <Copy size={20} />}
                  </button>
                </div>
                <small className="pix-hint">
                  {pixCopied ? '✓ Código copiado!' : 'Clique no botão para copiar'}
                </small>
              </div>

              <div className="pix-warning">
                ⚠️ Após efetuar o pagamento, clique em "Confirmar Pagamento" abaixo
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowPixModal(false)} className="button-outline">
                Cancelar
              </button>
              <button 
                onClick={() => {
                  setShowPixModal(false)
                  processOrder()
                }} 
                className="button-primary"
                disabled={loading}
              >
                <Check size={18} />
                {loading ? 'Processando...' : 'Confirmar Pagamento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
