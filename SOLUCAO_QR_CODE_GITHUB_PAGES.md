# ❓ Por que o QR Code não aparece no GitHub Pages?

## Resposta Rápida

O QR Code é gerado por um **servidor backend** (a pasta `server/` do seu projeto) que roda **localmente em `localhost:3001`**.

Quando você hospeda no GitHub Pages:
- ❌ GitHub Pages está em `https://seu-usuario.github.io/seu-repositorio`
- ❌ Servidor local em `localhost:3001` NÃO é acessível de lá

## Solução

Você precisa:

1. **Hospedar o servidor WhatsApp** em algum lugar acessível (Replit, Heroku, VPS, etc)
2. **Atualizar a variável de ambiente** `.env` com a URL correta
3. **Fazer novo build** do projeto

## Passos Rápidos

### 1️⃣ Edite o arquivo `.env`

Arquivo raiz do projeto (perto de `package.json`):

```bash
# Antes:
VITE_BAILEYS_API_URL=http://localhost:3001

# Depois (escolha uma opção):
VITE_BAILEYS_API_URL=https://seu-servidor-replit.replit.dev
# OU
VITE_BAILEYS_API_URL=https://seu-app.herokuapp.com
# OU
VITE_BAILEYS_API_URL=https://seu-dominio.com.br
```

### 2️⃣ Hospede o servidor

Coloque a pasta `server/` em um serviço grátis:

**Opção A: Replit (Mais Fácil)**
- Vá em https://replit.com
- Novo Replit → Node.js
- Upload da pasta `server/`
- Execute `npm install && npm start`
- URL será: `https://seu-nome.replit.dev`

**Opção B: Heroku (Com créditos grátis)**
- Deploy a pasta `server/`
- URL será: `https://seu-app.herokuapp.com`

### 3️⃣ Faça novo build

```bash
npm run build
git add .
git commit -m "Configurar URL do servidor para GitHub Pages"
git push
```

## ✅ Pronto!

GitHub Pages agora conseguirá acessar seu servidor e exibir o QR Code!

---

## 📖 Para mais detalhes:

Abra o arquivo `CONFIGURACAO_GITHUB_PAGES.md` para guia completo.
