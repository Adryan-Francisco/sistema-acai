# 🚀 Configuração do Sistema no GitHub Pages

## Problema: QR Code não aparece no GitHub Pages

Quando o sistema está hospedado no GitHub Pages (ambiente de produção), o QR Code do WhatsApp não aparece porque:

❌ **Problema:** O frontend tenta acessar `http://localhost:3001` (seu servidor local) de um servidor remoto  
✅ **Solução:** Configurar a URL do servidor backend corretamente via variáveis de ambiente

---

## 🔧 Solução

### Passo 1: Identificar sua URL do servidor

Você precisa saber para onde seu servidor WhatsApp está rodando:

- **Desenvolvimento Local:** `http://localhost:3001`
- **Servidor na Nuvem (exemplo):** `https://seu-servidor.com` ou `https://seu-servidor.herokuapp.com`
- **VPS/Servidor dedicado:** `https://seu-dominio.com.br` ou `https://seu-ip:3001`

### Passo 2: Configurar a variável de ambiente

Edite o arquivo `.env` na raiz do projeto (crie se não existir):

```bash
# .env (Arquivo que fica na RAIZ do projeto, perto do package.json)

VITE_SUPABASE_URL=https://seu-supabase.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima

VITE_PIX_KEY=sua-chave-pix
VITE_MERCHANT_NAME=Tiadê Açaiteria
VITE_MERCHANT_CITY=ASPASIA

# ⭐ CONFIGURAÇÃO IMPORTANTE PARA GITHUB PAGES
VITE_BAILEYS_API_URL=https://seu-servidor-backend.com.br
# Exemplos:
# VITE_BAILEYS_API_URL=https://seu-servidor.herokuapp.com
# VITE_BAILEYS_API_URL=https://seu-servidor.replit.dev
# VITE_BAILEYS_API_URL=http://seu-ip-externo:3001
```

### Passo 3: Onde hospedar o servidor WhatsApp

Você tem várias opções:

#### Option A: Replit (Recomendado - Grátis)
1. Acesse https://replit.com
2. Crie uma nova Replication
3. Selecione "Node.js"
4. Faça upload do conteúdo da pasta `server/`
5. Rode: `npm install && npm start`
6. Sua URL será: `https://seu-replit-name.replit.dev`

#### Option B: Heroku (Com créditos grátis)
1. Acesse https://www.heroku.com
2. Crie um novo app
3. Faça deploy da pasta `server/`
4. Configure para rodar `npm start`
5. Sua URL será: `https://seu-app.herokuapp.com`

#### Option C: Seu próprio servidor
- Compre um domínio e host de VPS
- Configure um reverse proxy (Nginx/Apache)
- Garanta que a porta 3001 (ou outra) está aberta
- Seu URL será: `https://seu-dominio.com.br` ou `https://seu-ip:porta`

---

## 📋 Checklist de Configuração

Para garantir que tudo funcionará no GitHub Pages:

- [ ] `.env` está criado e preenchido corretamente
- [ ] `VITE_BAILEYS_API_URL` aponta para seu servidor backend
- [ ] Servidor backend está rodando e acessível publicamente
- [ ] CORS está configurado no servidor (já está no `server.js`)
- [ ] Rodou `npm run build` para compilar com as variáveis corretas
- [ ] Build foi feito APÓS modificar o `.env`

## ⚠️ Importante: O `.env` NÃO é versionado

Seu arquivo `.env` está no `.gitignore` (não é enviado para o Git).

**Isso significa:**

✅ Suas chaves secretas estão seguras  
❌ PORÉM, você precisa configurar `.env` manualmente em cada ambiente

### Para GitHub Pages:

1. Local (desenvolvimento): `.env` com `http://localhost:3001`
2. GitHub Pages (produção): Você precisa fazer uma build local com `.env` apontando para seu servidor
3. Ou usar GitHub Secrets + Actions para build automatizado

---

## 🏗️ Build para Produção (GitHub Pages)

### Método Manual (Recomendado para começar):

```bash
# 1. Configure o .env com sua URL produção
# VITE_BAILEYS_API_URL=https://seu-servidor.com

# 2. Limpe build anterior
rm -rf dist

# 3. Faça build
npm run build

# 4. O conteúdo de 'dist/' é o que vai para GitHub Pages
# Faça commit e push normalmente com git
```

### Método Automático com GitHub Actions:

Crie um arquivo `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Build
        env:
          VITE_BAILEYS_API_URL: ${{ secrets.BAILEYS_API_URL }}
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_KEY }}
          VITE_PIX_KEY: ${{ secrets.PIX_KEY }}
          VITE_MERCHANT_NAME: Tiadê Açaiteria
          VITE_MERCHANT_CITY: ASPASIA
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

**Para usar GitHub Actions:**
1. Vá em Settings → Secrets and variables → Actions
2. Adicione cada variável como um secret:
   - `BAILEYS_API_URL` = sua URL do servidor
   - `SUPABASE_URL` = sua URL do Supabase
   - `SUPABASE_KEY` = sua chave
   - `PIX_KEY` = sua chave PIX

---

## 🧪 Testando

### Teste Local
```bash
# Com servidor rodando em localhost:3001
npm run dev
# Abra http://localhost:5173
# QR Code deve aparecer
```

### Teste Produção (Simulado)
```bash
# Configure .env com URL produção
# VITE_BAILEYS_API_URL=https://seu-servidor.com

npm run build
npx serve -s dist
# Abra http://localhost:3000
# QR Code deve aparecer se servidor está acessível
```

---

## ❓ Troubleshooting

### "QR Code ainda não foi gerado"
- Verifique se servidor está rodando
- Verifique se `VITE_BAILEYS_API_URL` está correto
- Tente recarregar a página

### "CORS Error"
- CORS já está configurado no server.js
- Se perde mesmo assim, verifique se URL está correta
- URL deve incluir `https://` ou `http://`

### "Connexão: Desconectado"
- Servidor pode estar com problemas
- Tente reiniciar o servidor
- Verifique logs do servidor em `server` pasta

---

## 📚 Variáveis de Ambiente Disponíveis

```
# Frontend (no .env)
VITE_SUPABASE_URL          # URL do Supabase
VITE_SUPABASE_ANON_KEY     # Chave anônima Supabase
VITE_WHATSAPP_PROVIDER     # 'baileys' (padrão)
VITE_BAILEYS_API_URL       # ⭐ URL do seu servidor WhatsApp
VITE_PIX_KEY               # Sua chave PIX
VITE_MERCHANT_NAME         # Nome da loja
VITE_MERCHANT_CITY         # Cidade da loja
```

---

## 🎯 Próximos Passos

1. Escolha onde hospedar o servidor (Replit/Heroku/VPS)
2. Hospede a pasta `server/` lá
3. Atualize `VITE_BAILEYS_API_URL` no `.env`
4. Faça `npm run build`
5. Faça push para GitHub
6. GitHub Pages será atualizado automaticamente ✅

