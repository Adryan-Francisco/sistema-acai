# 🚀 Guia de Deploy Automático - GitHub Pages

## ✅ Configuração Atual

O projeto está configurado para deploy automático no GitHub Pages usando GitHub Actions.

### 📁 Arquivos de Configuração

- **`.github/workflows/deploy.yml`** - Workflow de deploy automático
- **`vite.config.js`** - Base path: `/sistema-acai/`
- **`public/.nojekyll`** - Desabilita Jekyll no GitHub Pages

---

## ⚙️ Como Configurar

### 1️⃣ Configurar GitHub Pages

1. Acesse: https://github.com/Adryan-Francisco/sistema-acai/settings/pages
2. Em **Source**, selecione: `GitHub Actions`
3. Salve as configurações

### 2️⃣ Configurar Secrets do Supabase (Opcional mas Recomendado)

Para que o build funcione com as variáveis de ambiente do Supabase:

1. Acesse: https://github.com/Adryan-Francisco/sistema-acai/settings/secrets/actions
2. Clique em **New repository secret**
3. Adicione os seguintes secrets:

   **Nome:** `VITE_SUPABASE_URL`  
   **Valor:** Sua URL do Supabase (ex: `https://xxxxx.supabase.co`)

   **Nome:** `VITE_SUPABASE_ANON_KEY`  
   **Valor:** Sua chave anônima do Supabase

### 3️⃣ Configurar URLs no Supabase

No dashboard do Supabase (Authentication → URL Configuration):

**Site URL:**
```
https://adryan-francisco.github.io/sistema-acai/
```

**Redirect URLs:**
```
https://adryan-francisco.github.io/sistema-acai/
https://adryan-francisco.github.io/sistema-acai/email-confirmado
http://localhost:5173/sistema-acai/
http://localhost:5173/sistema-acai/email-confirmado
http://localhost:5174/sistema-acai/
http://localhost:5174/sistema-acai/email-confirmado
```

---

## 🔄 Como Funciona o Deploy Automático

### Trigger
O deploy é acionado automaticamente quando você faz push para a branch `main`:

```bash
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
```

### Processo
1. **Build** - Instala dependências e compila o projeto
2. **Upload** - Envia os arquivos para GitHub Pages
3. **Deploy** - Publica o site automaticamente

### Tempo
⏱️ O processo completo leva aproximadamente **2-5 minutos**

---

## 📊 Monitorar Deploy

### Ver Status do Deploy
Acesse: https://github.com/Adryan-Francisco/sistema-acai/actions

### Verificar Erros
Se o deploy falhar, clique no workflow com erro para ver os logs detalhados.

---

## 🌐 URLs do Projeto

**🔗 Site Publicado:**
```
https://adryan-francisco.github.io/sistema-acai/
```

**📂 Repositório:**
```
https://github.com/Adryan-Francisco/sistema-acai
```

**⚙️ GitHub Actions:**
```
https://github.com/Adryan-Francisco/sistema-acai/actions
```

**📝 Configurações do Pages:**
```
https://github.com/Adryan-Francisco/sistema-acai/settings/pages
```

---

## 🛠️ Comandos Úteis

### Desenvolvimento Local
```bash
npm run dev
```

### Build Local (testar antes de fazer push)
```bash
npm run build
npm run preview
```

### Deploy Manual (alternativo)
```bash
npm run deploy
```

---

## ❗ Troubleshooting

### Problema: Deploy falha com erro 404
**Solução:** Verifique se o GitHub Pages está configurado para "GitHub Actions"

### Problema: Assets não carregam (404)
**Solução:** Verifique se `base: '/sistema-acai/'` está correto no `vite.config.js`

### Problema: Variáveis de ambiente não funcionam
**Solução:** Configure os secrets `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`

### Problema: Email de confirmação não redireciona
**Solução:** Configure as Redirect URLs no Supabase conforme mostrado acima

---

## 🎉 Pronto!

Agora toda vez que você fizer push para `main`, o site será automaticamente atualizado! 🚀

**Última atualização:** 6 de outubro de 2025
