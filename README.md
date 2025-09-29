# 🍇 Sistema Açaí - Gestão Completa de Açaiteria

Sistema moderno e responsivo para gestão completa de açaiteria, desenvolvido com React, Vite e Supabase. Interface intuitiva com tema claro, notificações em tempo real e painel administrativo completo.

## ✨ Funcionalidades

### 🛒 **Para Clientes**
- **Cardápio Interativo**: Seleção de tamanhos (300ml, 500ml, 700ml) e complementos
- **Cálculo Automático**: Preços atualizados em tempo real
- **Sistema de Pedidos**: Envio direto com confirmação
- **Histórico**: Visualização dos pedidos anteriores
- **Interface Responsiva**: Funciona perfeitamente em mobile e desktop

### 👨‍💼 **Para Administradores**
- **Painel de Controle**: Dashboard com estatísticas do dia
- **Gestão de Pedidos**: Controle de status (Recebido → Em Preparo → Pronto → Finalizado)
- **Gestão de Catálogo**: CRUD completo de tamanhos e complementos
- **Notificações em Tempo Real**: Som e atualização automática de novos pedidos
- **Sistema de Filtros**: Visualização por status ou todos os pedidos
- **Métricas do Dia**: Total de pedidos, pedidos ativos e faturamento

### 🎨 **Design & UX**
- **Tema Claro Moderno**: Interface limpa com excelente contraste
- **Animações Fluidas**: Micro-interações elegantes
- **Sistema de Cores**: Paleta harmoniosa com destaque para valores monetários
- **Feedback Visual**: Mensagens de sucesso, erro e loading states
- **Acessibilidade**: Design pensado para todos os usuários

## 🚀 Tecnologias Utilizadas

- **Frontend**: React 18 + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Styling**: CSS Modules com variáveis CSS customizadas
- **Autenticação**: Supabase Auth (Email/Password)
- **Real-time**: Supabase Subscriptions para atualizações instantâneas

## 📦 Instalação e Setup

### 1. **Pré-requisitos**
- Node.js (versão 16 ou superior)
- Conta no Supabase
- Git

### 2. **Clone o Repositório**
```bash
git clone https://github.com/Adryan-Francisco/sistema-acai.git
cd sistema-acai
```

### 3. **Instale as Dependências**
```bash
npm install
```

### 4. **Configure as Variáveis de Ambiente**

Copie o arquivo de exemplo e configure suas credenciais:
```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

Edite o arquivo `.env` com os dados do seu projeto Supabase:
```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA-CHAVE-ANON-PUBLICA
```

> 💡 **Onde encontrar**: Supabase Dashboard → Project Settings → API

### 5. **Configure o Banco de Dados**

No painel do Supabase (SQL Editor), execute os arquivos na ordem:

```sql
-- 1. Estrutura do banco
-- Execute: supabase/01_schema.sql

-- 2. Políticas de segurança  
-- Execute: supabase/02_policies.sql

-- 3. Funções necessárias
-- Execute: supabase/03_functions.sql

-- 4. Dados iniciais do cardápio
-- Execute: supabase/04_seed.sql

-- 5. Triggers para perfis automáticos
-- Execute: supabase/05_triggers.sql
```

### 6. **Execute o Projeto**
```bash
npm run dev
```

Acesse: **http://localhost:5173**

## 👤 Configuração de Administrador

Após criar sua conta, promova-se a administrador:

```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'seu-email@exemplo.com';
```

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Servidor local (http://localhost:5173)

# Build de produção
npm run build        # Gera arquivos para produção
npm run preview      # Preview da build local

# Linting
npm run lint         # Verifica código com ESLint
```

## 📊 Estrutura do Projeto

```
sistema-acai/
├── src/
│   ├── components/           # Componentes React
│   │   ├── Cardapio.jsx     # Interface do cardápio
│   │   ├── PainelAdmin.jsx  # Painel administrativo
│   │   ├── CatalogoAdmin.jsx # Gestão do catálogo
│   │   ├── MeusPedidos.jsx  # Histórico do cliente
│   │   └── ...
│   ├── assets/              # Arquivos estáticos
│   ├── App.jsx             # Componente principal
│   └── main.jsx            # Ponto de entrada
├── supabase/               # Scripts SQL
├── public/                 # Arquivos públicos
└── package.json           # Dependências
```

## 🎯 Uso do Sistema

### **Como Cliente:**
1. **Cadastre-se** ou faça **login**
2. **Selecione** o tamanho do açaí desejado
3. **Escolha** os complementos (opcionais)
4. **Confirme** o pedido e aguarde a preparação
5. **Acompanhe** o status em "Meus Pedidos"

### **Como Administrador:**
1. **Acesse** o "Painel Admin" no menu
2. **Gerencie** pedidos alterando status conforme preparo
3. **Configure** o catálogo em "Catálogo"
4. **Monitore** as métricas do dia no dashboard

## 🔧 Funcionalidades Avançadas

### **Notificações em Tempo Real**
- Novos pedidos aparecem automaticamente no painel
- Som de notificação para novos pedidos
- Updates automáticos de status

### **Sistema de Filtros**
- **Ativos**: Pedidos em andamento
- **Por Status**: Recebido, Em Preparo, Finalizado
- **Todos**: Visualização completa

### **Responsividade**
- Design adaptativo para todas as telas
- Navegação otimizada para mobile
- Touch-friendly em dispositivos móveis

## 🐛 Solução de Problemas

### **"Supabase não configurado"**
- Verifique se o arquivo `.env` existe na raiz
- Confirme se as variáveis estão corretas
- Reinicie o servidor de desenvolvimento

### **Cardápio não carrega**
- Execute os scripts SQL na ordem correta
- Verifique se as tabelas foram criadas
- Teste a conexão em `http://localhost:5173/_debug`

### **Erro de permissões**
- Confirme se as policies foram aplicadas
- Verifique se o RLS está habilitado
- Execute o `02_policies.sql` novamente se necessário

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuição

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

- **Issues**: [GitHub Issues](https://github.com/Adryan-Francisco/sistema-acai/issues)
- **Documentação**: Este README
- **Debug**: Acesse `/_debug` para diagnósticos

---

**Desenvolvido com ❤️ para açaiterias modernas**