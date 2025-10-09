# 📱 Configuração do WhatsApp Automático

## Visão Geral

O sistema envia automaticamente mensagens WhatsApp para os clientes nos seguintes momentos:

1. **Confirmação do Pedido** - Assim que o pedido é criado
2. **Atualização de Status** - Quando o status muda (Em Preparo, Pronto, Saiu para Entrega, etc.)
3. **Lembrete de Avaliação** - 5 minutos após a entrega (para incentivar reviews)

## Provedores Suportados

### 🚀 Evolution API (Recomendado)

**Vantagens:**
- ✅ Gratuito e open-source
- ✅ Auto-hospedado (seu próprio servidor)
- ✅ Sem limite de mensagens
- ✅ Múltiplas instâncias
- ✅ API REST simples

**Como Configurar:**

1. **Instalar Evolution API:**
   ```bash
   # Com Docker
   docker run -d \
     --name evolution-api \
     -p 8080:8080 \
     atendai/evolution-api
   ```

2. **Criar uma Instância:**
   - Acesse `http://localhost:8080`
   - Crie uma nova instância
   - Conecte seu WhatsApp escaneando o QR Code

3. **Configurar no .env:**
   ```bash
   VITE_WHATSAPP_PROVIDER=evolution
   VITE_EVOLUTION_API_URL=http://localhost:8080
   VITE_EVOLUTION_API_KEY=sua-api-key
   VITE_EVOLUTION_INSTANCE=nome-da-instancia
   ```

**Links:**
- Repositório: https://github.com/EvolutionAPI/evolution-api
- Documentação: https://doc.evolution-api.com
- Deploy na Nuvem: Railway, Render, Digital Ocean

---

### 💳 Twilio (Alternativa Paga)

**Vantagens:**
- ✅ Infraestrutura robusta
- ✅ Suporte oficial
- ✅ Fácil de configurar
- ⚠️ Pago (US$ 0.005 por mensagem + taxa mensal)

**Como Configurar:**

1. **Criar Conta:**
   - Acesse https://www.twilio.com/try-twilio
   - Crie uma conta gratuita (trial)
   - Verifique seu número de telefone

2. **Ativar WhatsApp:**
   - No console, vá em "Messaging" > "Try it Out" > "Send a WhatsApp message"
   - Configure o sandbox do WhatsApp
   - Anote o número do Twilio (ex: +14155238886)

3. **Pegar Credenciais:**
   - Account SID: Dashboard principal
   - Auth Token: Dashboard principal (botão "View")

4. **Configurar no .env:**
   ```bash
   VITE_WHATSAPP_PROVIDER=twilio
   VITE_TWILIO_ACCOUNT_SID=AC...
   VITE_TWILIO_AUTH_TOKEN=...
   VITE_TWILIO_PHONE_NUMBER=+14155238886
   ```

**Limitações do Sandbox:**
- Cada cliente precisa aderir ao sandbox primeiro
- Não funciona para produção
- Para produção, precisa de aprovação do WhatsApp Business

**Links:**
- Console: https://console.twilio.com
- Pricing: https://www.twilio.com/whatsapp/pricing
- Docs: https://www.twilio.com/docs/whatsapp

---

## 📝 Formato das Mensagens

### 1. Confirmação do Pedido
```
🎉 *Pedido Confirmado!*

Olá *João*! Seu pedido foi recebido com sucesso.

📋 *Detalhes do Pedido #123*
━━━━━━━━━━━━━━━━
🍨 Moda da Casa - 550ml

✅ *Incluso:*
• Banana
• Morango
• Granola
• Leite em Pó
• Leite Condensado

➕ *Adicionais:*
• Nutella (+R$ 6.00)
• Ovomaltine (+R$ 6.00)

━━━━━━━━━━━━━━━━
💰 *Total:* R$ 30.00
💳 *Pagamento:* PIX
🏪 *Tipo:* Retirada no Local
⏱️ *Tempo Estimado:* 15-25 minutos

Estamos preparando seu açaí com muito carinho! ❤️

_Tiadê Açaiteria_
```

### 2. Atualização de Status
```
👨‍🍳 *Atualização do Pedido #123*

Olá *João*!

📊 *Novo Status:* Em Preparo
Estamos preparando seu açaí agora!

_Tiadê Açaiteria_
```

### 3. Lembrete de Avaliação
```
⭐ *Avalie seu Pedido*

Olá *João*!

Esperamos que tenha gostado do seu açaí! 😊

Sua opinião é muito importante para nós.
Que tal avaliar seu pedido #123?

Acesse nosso sistema e deixe sua avaliação! ⭐⭐⭐⭐⭐

_Tiadê Açaiteria_
```

---

## 🔧 Funções Disponíveis

### `sendOrderConfirmation(order)`
Envia confirmação de pedido criado.

```javascript
import { sendOrderConfirmation } from '../utils/whatsappService'

const order = { /* dados do pedido */ }
await sendOrderConfirmation(order)
```

### `sendStatusUpdate(order, newStatus)`
Envia atualização quando status muda.

```javascript
import { sendStatusUpdate } from '../utils/whatsappService'

await sendStatusUpdate(order, 'Em Preparo')
```

### `sendReviewReminder(order)`
Envia lembrete para avaliar pedido.

```javascript
import { sendReviewReminder } from '../utils/whatsappService'

await sendReviewReminder(order)
```

### `isWhatsAppConfigured()`
Verifica se WhatsApp está configurado.

```javascript
import { isWhatsAppConfigured } from '../utils/whatsappService'

if (isWhatsAppConfigured()) {
  console.log('WhatsApp está pronto!')
}
```

---

## 🧪 Testando

1. **Configure as variáveis de ambiente**
2. **Crie um pedido de teste**
3. **Verifique o console do navegador:**
   - ✅ "WhatsApp de confirmação enviado"
   - ❌ "WhatsApp não configurado. Mensagem não enviada."
4. **Verifique seu telefone**

---

## 🐛 Troubleshooting

### "WhatsApp não configurado"
- Verifique se as variáveis estão no `.env`
- Certifique-se de que o arquivo `.env` está na raiz do projeto
- Reinicie o servidor de desenvolvimento (`npm run dev`)

### "Evolution API error"
- Verifique se a Evolution API está rodando
- Teste o endpoint: `curl http://localhost:8080/instance/connect/nome-da-instancia`
- Verifique se a API Key está correta
- Certifique-se de que a instância está conectada ao WhatsApp

### "Twilio API error"
- Verifique Account SID e Auth Token
- Certifique-se de que o número está no formato correto (+5517997422922)
- No sandbox, o cliente precisa enviar "join [código]" primeiro
- Verifique saldo da conta Twilio

### Mensagens não chegam
- Verifique o número de telefone do cliente (deve ter DDD + número)
- Teste enviando para seu próprio número primeiro
- Verifique logs do console (`F12` > Console)
- Verifique se o WhatsApp Business está ativo

---

## 🚀 Deploy em Produção

### Evolution API

**Railway:**
```bash
git clone https://github.com/EvolutionAPI/evolution-api
cd evolution-api
railway login
railway init
railway up
```

**Render:**
1. Fork do repositório
2. New Web Service
3. Conectar ao fork
4. Deploy

### Recomendações

- ✅ Use HTTPS para Evolution API
- ✅ Configure rate limiting
- ✅ Monitore logs
- ✅ Backup do banco de dados da Evolution
- ✅ Teste antes de lançar
- ⚠️ Respeite limites do WhatsApp (evite spam)

---

## 📊 Boas Práticas

1. **Não envie spam** - Apenas mensagens importantes
2. **Personalize** - Use nome do cliente sempre
3. **Seja claro** - Informações diretas e úteis
4. **Emojis** - Use com moderação para melhor UX
5. **Timing** - Avaliação apenas 5min após entrega
6. **Fallback** - Sistema funciona mesmo sem WhatsApp configurado

---

## 🔒 Segurança

- ✅ **NUNCA** commite credenciais no git
- ✅ Use `.env` local (não versionado)
- ✅ Em produção, use variáveis de ambiente do servidor
- ✅ Proteja API Keys com HTTPS
- ✅ Implemente rate limiting
- ✅ Monitore uso da API

---

## 📚 Referências

- [Evolution API Docs](https://doc.evolution-api.com)
- [Twilio WhatsApp Docs](https://www.twilio.com/docs/whatsapp)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [WhatsApp Messaging Limits](https://www.twilio.com/docs/whatsapp/limits-rate-limiting)

---

**Desenvolvido com ❤️ para Tiadê Açaiteria**
