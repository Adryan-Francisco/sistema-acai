import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ShoppingCart, Plus, Minus, LogOut, User, X, Check, Star, Copy, CheckCheck } from "lucide-react"
import { QRCodeSVG } from 'qrcode.react'
import confetti from 'canvas-confetti'
import { supabase } from '../supabaseClient.js'
import { useAuth } from '../AuthContext.jsx'
import { useNotification } from './NotificationToast.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import PixPayment from './PixPayment.jsx'
import { sendOrderConfirmation, isWhatsAppConfigured } from '../utils/whatsappService.js'
import { notifyOrderStatusChange } from '../utils/pushNotifications'
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
  const [userName, setUserName] = useState("") // Nome real do usuário
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("")
  const [deliveryType, setDeliveryType] = useState("retirada") // "retirada" ou "entrega"
  const [phoneNumber, setPhoneNumber] = useState("") // Telefone
  const [deliveryAddress, setDeliveryAddress] = useState("") // Endereço de entrega
  const [showPreview, setShowPreview] = useState(false)
  const [showPixModal, setShowPixModal] = useState(false)
  const [currentOrderId, setCurrentOrderId] = useState(null)
  
  // Estado da loja
  const [lojaAberta, setLojaAberta] = useState(true)
  const [mensagemFechado, setMensagemFechado] = useState("")
  const [checkingStatus, setCheckingStatus] = useState(true)

  const DELIVERY_FEE = 2.00 // Taxa de entrega
  const PREPARATION_TIME = "15-25 minutos" // Tempo estimado de preparo

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

  // Verificar se a loja está aberta
  useEffect(() => {
    const verificarStatusLoja = async () => {
      try {
        const { data, error } = await supabase
          .from('configuracoes')
          .select('vendas_pausadas, mensagem_fechado, horarios')
          .single()

        if (error) {
          console.error('Erro ao verificar status da loja:', error)
          // Se der erro, assume que está aberta (fallback)
          setLojaAberta(true)
          setCheckingStatus(false)
          return
        }

        if (data) {
          const { vendas_pausadas, mensagem_fechado, horarios } = data

          // Se vendas pausadas, fecha
          if (vendas_pausadas) {
            setLojaAberta(false)
            setMensagemFechado(mensagem_fechado || 'Desculpe, estamos fechados no momento.')
            setCheckingStatus(false)
            return
          }

          // Verificar horário
          const agora = new Date()
          const diaSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'][agora.getDay()]
          const horaAtual = agora.toTimeString().slice(0, 5) // HH:MM

          if (horarios && horarios[diaSemana]) {
            const horarioDia = horarios[diaSemana]
            
            if (!horarioDia.aberto) {
              setLojaAberta(false)
              setMensagemFechado(`Desculpe, estamos fechados às ${diaSemana}s.`)
              setCheckingStatus(false)
              return
            }

            // Verificar se está dentro do horário
            const dentroHorario = horaAtual >= horarioDia.inicio && horaAtual <= horarioDia.fim
            
            if (!dentroHorario) {
              setLojaAberta(false)
              setMensagemFechado(`Horário de funcionamento: ${horarioDia.inicio} às ${horarioDia.fim}`)
              setCheckingStatus(false)
              return
            }
          }

          setLojaAberta(true)
          setCheckingStatus(false)
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error)
        setLojaAberta(true) // Fallback
        setCheckingStatus(false)
      }
    }

    verificarStatusLoja()
    
    // Verificar a cada 1 minuto
    const interval = setInterval(verificarStatusLoja, 60000)
    return () => clearInterval(interval)
  }, [])

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
          .select('pontos_fidelidade, acais_gratis, nome')
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
          setUserName(profile.nome || user.email?.split('@')[0] || 'Cliente')
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
      return deliveryType === "entrega" ? DELIVERY_FEE : 0
    }

    const typeData = acaiTypes.find((t) => t.value === selectedType)
    const basePrice = typeData?.prices[selectedSize] || 0
    const toppingsPrice = selectedToppings.reduce((sum, id) => {
      const topping = toppings.find((t) => t.id === id)
      return sum + (topping?.price || 0)
    }, 0)

    const effectiveQuantity = useFreeAcai ? quantity - 1 : quantity
    const subtotal = (basePrice + toppingsPrice) * effectiveQuantity
    const deliveryFee = deliveryType === "entrega" ? DELIVERY_FEE : 0
    
    return subtotal + deliveryFee
  }

  const hasItemsInCart = () => {
    return selectedToppings.length > 0 || quantity > 1 || useFreeAcai || paymentMethod
  }

  // Máscara de telefone
  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
  }

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhoneNumber(formatted)
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

    if (!phoneNumber || phoneNumber.replace(/\D/g, '').length < 10) {
      showError('Informe um telefone válido para contato')
      return
    }

    if (deliveryType === "entrega" && !deliveryAddress.trim()) {
      showError('Informe o endereço de entrega')
      return
    }

    setShowPreview(true)
  }

  const handleOrder = async () => {
    setShowPreview(false)
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
      const { data: orderData, error: orderError } = await supabase.from('pedidos').insert([
        {
          user_id: user.id,
          nome_cliente: userName || user.email?.split('@')[0] || 'Cliente',
          telefone: phoneNumber,
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
            tipo_entrega: deliveryType,
            endereco_entrega: deliveryType === "entrega" ? deliveryAddress : null,
            taxa_entrega: deliveryType === "entrega" ? DELIVERY_FEE : 0,
            tempo_preparo: PREPARATION_TIME,
            total: calculateTotal().toFixed(2),
            metodo_pagamento: paymentMethod,
            usou_acai_gratis: useFreeAcai,
          },
          status: paymentMethod === 'PIX' ? 'Aguardando Pagamento' : 'Recebido',
        },
      ]).select()

      if (orderError) throw orderError

      // Se for PIX, abrir modal e salvar ID do pedido
      if (paymentMethod === 'PIX' && orderData && orderData[0]) {
        setCurrentOrderId(orderData[0].id)
        setShowPixModal(true)
        setLoading(false)
        return
      }

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
        
        // Confetti especial quando ganha açaí grátis
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#9333ea', '#fbbf24', '#10b981', '#f59e0b']
        })
      } else {
        success('Pedido criado com sucesso!', { duration: 3000 })
        
        // Confetti normal
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#9333ea', '#a855f7', '#c084fc']
        })
      }

      // Atualizar estado local
      setFidelityPoints(newPoints)
      setAvailableFreeAcais(Math.max(0, newFreeAcais))

      // Enviar WhatsApp de confirmação (se configurado)
      if (isWhatsAppConfigured() && orderData && orderData[0]) {
        try {
          const result = await sendOrderConfirmation(orderData[0])
          if (result.success) {
            console.log('✅ WhatsApp de confirmação enviado')
          } else {
            console.warn('⚠️ WhatsApp não enviado:', result.error)
          }
        } catch (whatsappError) {
          console.error('❌ Erro ao enviar WhatsApp:', whatsappError)
          // Não bloquear o fluxo se WhatsApp falhar
        }
      } else {
        console.log('ℹ️ WhatsApp não configurado, mensagem não será enviada')
      }

      // 🔔 Enviar notificação push de confirmação
      try {
        await notifyOrderStatusChange(
          orderData[0].id,
          paymentMethod === 'PIX' ? 'Aguardando Pagamento' : 'Recebido',
          {
            deliveryType: deliveryType,
            customerName: userData.nome
          }
        )
        console.log('✅ Notificação push enviada')
      } catch (notifError) {
        console.error('⚠️ Erro ao enviar notificação push:', notifError)
        // Não bloquear se falhar
      }

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

  // Função chamada quando pagamento PIX é confirmado
  const handlePixPaymentConfirmed = async () => {
    try {
      // Atualizar status do pedido
      await supabase
        .from('pedidos')
        .update({ status: 'Recebido' })
        .eq('id', currentOrderId)

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
        
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#9333ea', '#fbbf24', '#10b981', '#f59e0b']
        })
      } else {
        success('Pedido criado com sucesso!', { duration: 3000 })
        
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#9333ea', '#a855f7', '#c084fc']
        })
      }

      // Atualizar estado local
      setFidelityPoints(newPoints)
      setAvailableFreeAcais(Math.max(0, newFreeAcais))

      // Limpar formulário
      setSelectedToppings([])
      setQuantity(1)
      setUseFreeAcai(false)
      setPaymentMethod("")
      setShowPixModal(false)
      setCurrentOrderId(null)
      
      const currentTypeData = acaiTypes.find((t) => t.value === selectedType)
      if (currentTypeData?.defaultToppings) {
        setSelectedDefaultToppings(currentTypeData.defaultToppings.map((t) => t.id))
      }

      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/meus-pedidos')
      }, 2000)

    } catch (err) {
      console.error('Erro ao confirmar pagamento PIX:', err)
      showError('Erro ao confirmar pagamento. Tente novamente.')
    }
  }

  const cremes = toppings.filter((t) => t.category === "cremes")
  const diversos = toppings.filter((t) => t.category === "diversos")
  const frutas = toppings.filter((t) => t.category === "frutas")
  const currentTypeData = acaiTypes.find((t) => t.value === selectedType)
  const hasDefaultToppings = currentTypeData?.defaultToppings && currentTypeData.defaultToppings.length > 0

  return (
    <div className="cardapio-v2-container">
      {/* Aviso de Loja Fechada */}
      {!lojaAberta && (
        <div className="loja-fechada-overlay">
          <div className="loja-fechada-modal">
            <div className="loja-fechada-icon">🔒</div>
            <h2>Desculpe, estamos fechados</h2>
            <p>{mensagemFechado}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="button-primary"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      )}

      {/* Loading inicial */}
      {checkingStatus && (
        <div className="loja-checking-overlay">
          <div className="loading-spinner"></div>
          <p>Verificando disponibilidade...</p>
        </div>
      )}

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
            <ThemeToggle />
            <button 
              onClick={() => navigate('/fidelidade')} 
              className="button-outline button-sm btn-fidelidade"
              title="Programa de Fidelidade"
            >
              <Star size={16} fill="currentColor" />
              Fidelidade
            </button>
            <button 
              onClick={() => navigate('/meus-pedidos')} 
              className="button-outline button-sm"
              title="Meus Pedidos"
            >
              <User size={16} />
              {userName || user?.email?.split('@')[0] || 'Cliente'}
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
            <label className="cardapio-v2-section-label">
              🔢 Quantidade
              {useFreeAcai && <span className="cardapio-v2-quantity-hint-label">(Fixo ao usar açaí grátis)</span>}
            </label>
            <div className="cardapio-v2-quantity-container">
              <button
                className="cardapio-v2-quantity-button minus"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={useFreeAcai}
                title="Diminuir quantidade"
              >
                −
              </button>
              <div className="cardapio-v2-quantity-display">
                <span className="cardapio-v2-quantity-value">{quantity}</span>
                <span className="cardapio-v2-quantity-label">unidade{quantity > 1 ? 's' : ''}</span>
              </div>
              <button
                className="cardapio-v2-quantity-button plus"
                onClick={() => setQuantity(quantity + 1)}
                disabled={useFreeAcai}
                title="Aumentar quantidade"
              >
                +
              </button>
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

          {/* Delivery Type */}
          <div className="cardapio-v2-section">
            <label className="cardapio-v2-section-label">Tipo de Entrega *</label>
            <div className="cardapio-v2-delivery-grid">
              <button
                type="button"
                onClick={() => setDeliveryType("retirada")}
                className={`cardapio-v2-delivery-button ${deliveryType === "retirada" ? "selected" : ""}`}
              >
                <div className="delivery-icon">🏪</div>
                <div className="delivery-title">Retirada</div>
                <div className="delivery-price">Grátis</div>
              </button>
              <button
                type="button"
                onClick={() => setDeliveryType("entrega")}
                className={`cardapio-v2-delivery-button ${deliveryType === "entrega" ? "selected" : ""}`}
              >
                <div className="delivery-icon">🛵</div>
                <div className="delivery-title">Entrega</div>
                <div className="delivery-price">+ R$ 2,00</div>
              </button>
            </div>
          </div>

          {/* Phone Number */}
          <div className="cardapio-v2-section">
            <label className="cardapio-v2-section-label">
              📱 Telefone para Contato *
              <span className="cardapio-v2-section-label-hint">Usaremos para atualizar sobre seu pedido</span>
            </label>
            <div className="cardapio-v2-phone-wrapper">
              <span className="cardapio-v2-phone-icon">📞</span>
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="(00) 00000-0000"
                maxLength={15}
                className="cardapio-v2-phone-input"
              />
            </div>
          </div>

          {/* Delivery Address - Only show if delivery is selected */}
          {deliveryType === "entrega" && (
            <div className="cardapio-v2-section">
              <label className="cardapio-v2-section-label">Endereço de Entrega *</label>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Rua, número, complemento, bairro..."
                rows={3}
                className="cardapio-v2-address-input"
              />
              <p className="cardapio-v2-address-hint">📍 Informe o endereço completo para entregarmos seu pedido</p>
            </div>
          )}

          {/* Preparation Time Info */}
          <div className="cardapio-v2-prep-time-info">
            <div className="prep-time-icon">⏱️</div>
            <div className="prep-time-content">
              <strong>Tempo estimado de preparo:</strong>
              <span className="prep-time-value">{PREPARATION_TIME}</span>
            </div>
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
              disabled={loading || !lojaAberta}
              className={`cardapio-v2-order-button ${hasItemsInCart() ? 'pulse-button' : ''} ${!lojaAberta ? 'button-disabled' : ''}`}
              title={!lojaAberta ? 'Loja fechada no momento' : ''}
            >
              <ShoppingCart size={20} />
              {!lojaAberta ? '🔒 Loja Fechada' : loading ? 'Processando...' : 'Fazer Pedido'}
            </button>
          </div>
        </div>
      </section>

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
              
              <div className="preview-item">
                <span className="preview-label">Tipo de Entrega:</span>
                <span className="preview-value preview-delivery">
                  {deliveryType === "retirada" ? "🏪 Retirada (Grátis)" : "🛵 Entrega (+ R$ 2,00)"}
                </span>
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
      {showPixModal && currentOrderId && (
        <PixPayment
          amount={calculateTotal()}
          orderId={currentOrderId}
          onPaymentConfirmed={handlePixPaymentConfirmed}
          onClose={() => {
            setShowPixModal(false)
            setCurrentOrderId(null)
          }}
        />
      )}
    </div>
  )
}
