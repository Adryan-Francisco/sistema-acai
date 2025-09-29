# 🚀 Guia Completo: Deploy no GitHub Pages

## 📋 Passos para colocar o Sistema no GitHub Pages:

### **1. Preparação Inicial**
Todos os arquivos já foram configurados automaticamente:
- ✅ `vite.config.js` configurado com `base: '/sistema-acai/'`
- ✅ `package.json` com homepage e script de deploy
- ✅ GitHub Actions workflow criado
- ✅ Rotas SPA configuradas (404.html)
- ✅ BrowserRouter com basename correto

### **2. Instalar Dependências**
```bash
npm install
```

### **3. Fazer Upload para GitHub**

**A. Se ainda não tem repositório:**
```bash
git init
git add .
git commit -m "Initial commit - Sistema AçaíSystem"
git branch -M main
git remote add origin https://github.com/Adryan-Francisco/sistema-acai.git
git push -u origin main
```

**B. Se já tem repositório:**
```bash
git add .
git commit -m "Configuração para GitHub Pages"
git push origin main
```

### **4. Configurar GitHub Pages**

1. **Vá para seu repositório** no GitHub: https://github.com/Adryan-Francisco/sistema-acai
2. **Clique em "Settings"** (Configurações)
3. **No menu lateral, clique em "Pages"**
4. **Em "Source", selecione:**
   - Source: `GitHub Actions`
5. **Clique "Save"**

### **5. Aguardar Deploy Automático**

- O GitHub Actions vai rodar automaticamente
- Aguarde 2-5 minutos para o build
- Quando finalizar, seu site estará em:
  **https://Adryan-Francisco.github.io/sistema-acai**

### **6. Configurar Variáveis de Ambiente no GitHub**

Para o Supabase funcionar em produção:

1. **Vá em Settings > Secrets and variables > Actions**
2. **Adicione as seguintes secrets:**
   - `VITE_SUPABASE_URL`: sua URL do Supabase
   - `VITE_SUPABASE_ANON_KEY`: sua chave anônima do Supabase

### **7. Testar o Site**

Após o deploy, teste:
- ✅ Página inicial carrega
- ✅ Login funciona
- ✅ Cardápio carrega
- ✅ Pedidos funcionam
- ✅ Painel admin funciona

---

## 🔧 **Comandos Úteis**

### **Deploy Manual (se necessário):**
```bash
npm run deploy
```

### **Testar localmente:**
```bash
npm run build
npm run preview
```

### **Ver logs do deploy:**
- Vá em Actions no GitHub
- Clique no último workflow
- Veja os logs detalhados

---

## 🌍 **URLs do Sistema**

- **Site Live:** https://Adryan-Francisco.github.io/sistema-acai
- **Repositório:** https://github.com/Adryan-Francisco/sistema-acai
- **Actions:** https://github.com/Adryan-Francisco/sistema-acai/actions

---

## 📱 **Funcionalidades Disponíveis Online**

- 🏠 **Página Inicial** com cardápio completo
- 🔐 **Sistema de Login/Cadastro**
- 🛒 **Carrinho com método de pagamento**
- 👤 **Área do Cliente** (Meus Pedidos)
- 👨‍💼 **Painel Administrativo**
- 📊 **Gestão de Pedidos e Produtos**
- 📱 **Design Responsivo** para mobile

---

## 🚨 **Importante:**

1. **Sempre faça push para `main`** para atualizar o site
2. **O deploy é automático** após cada push
3. **As variáveis de ambiente** devem estar configuradas no GitHub
4. **Aguarde alguns minutos** após o push para ver as mudanças

**O sistema está 100% pronto para produção!** 🎉