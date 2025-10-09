# 📋 INSTRUÇÕES DE MIGRAÇÃO DO BANCO DE DADOS

## 🎯 **IMPORTANTE: Execute nesta ordem!**

---

## **1️⃣ MIGRAÇÃO DE AVALIAÇÕES**

### **Passo 1: Abrir Supabase SQL Editor**
1. Acesse seu projeto no [Supabase](https://supabase.com)
2. No menu lateral, clique em **"SQL Editor"**
3. Clique em **"+ New query"**

### **Passo 2: Executar Script**
1. Abra o arquivo: `migration_avaliacoes_fixed.sql`
2. **COPIE TODO O CONTEÚDO**
3. **COLE** no SQL Editor do Supabase
4. Clique em **"RUN"** (ou pressione `Ctrl + Enter`)

### **Passo 3: Verificar Sucesso**
Você deve ver:
```
Success. No rows returned
```

Se aparecer erro, **me envie a mensagem de erro completa!**

---

## **2️⃣ MIGRAÇÃO DE HORÁRIOS**

### **Passo 1: Nova Query**
1. No SQL Editor, clique em **"+ New query"** novamente

### **Passo 2: Executar Script**
1. Abra o arquivo: `migration_horarios_fixed.sql`
2. **COPIE TODO O CONTEÚDO**
3. **COLE** no SQL Editor do Supabase
4. Clique em **"RUN"** (ou pressione `Ctrl + Enter`)

### **Passo 3: Verificar Sucesso**
Na seção "Results", você deve ver:

**Configurações:**
| id | horarios | vendas_pausadas | mensagem_fechado |
|----|----------|-----------------|------------------|
| (UUID) | {...} | false | Desculpe... |

**Está aberto:**
| esta_aberto |
|-------------|
| true ou false |

---

## **3️⃣ VERIFICAÇÃO FINAL**

### **Execute este comando no SQL Editor:**
```sql
-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('avaliacoes', 'configuracoes')
ORDER BY table_name;
```

**Resultado esperado:**
| table_name |
|------------|
| avaliacoes |
| configuracoes |

---

## **4️⃣ TESTAR NO SISTEMA**

Após executar as migrações:

### **✅ Sistema de Avaliações**
1. Acesse: `http://localhost:5173/admin/avaliacoes`
2. Deve mostrar: "Nenhuma avaliação encontrada" (normal, ainda não há avaliações)
3. Estatísticas devem aparecer zeradas

### **✅ Horário de Funcionamento**
1. Acesse: `http://localhost:5173/admin/horarios`
2. Deve mostrar: Horários da Segunda a Domingo
3. Toggle de "Vendas Ativas" deve estar ligado
4. Tente alterar um horário e clicar em "Salvar Alterações"

---

## **🚨 ERROS COMUNS E SOLUÇÕES**

### **Erro: "relation already exists"**
✅ **Solução:** Ignore, significa que a tabela já foi criada antes.

### **Erro: "permission denied"**
❌ **Problema:** Você não tem permissão de admin no Supabase
✅ **Solução:** Use a conta de administrador do Supabase

### **Erro: "column already exists"**
✅ **Solução:** Ignore, significa que a coluna já existe.

### **Erro: "function does not exist"**
❌ **Problema:** A função `trigger_set_timestamp` não foi criada
✅ **Solução:** Execute o script de avaliações primeiro!

---

## **📊 ESTRUTURA CRIADA**

### **Tabela: avaliacoes**
```sql
- id (UUID, PK)
- pedido_id (UUID, FK → pedidos)
- usuario_id (UUID, FK → auth.users)
- nota (INTEGER, 1-5)
- comentario (TEXT, opcional)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### **Tabela: configuracoes**
```sql
- id (UUID, PK)
- horarios (JSONB) → {"segunda": {...}, "terca": {...}, ...}
- vendas_pausadas (BOOLEAN)
- mensagem_fechado (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### **View: avaliacoes_stats**
```sql
- total_avaliacoes
- media_geral
- total_5_estrelas
- total_4_estrelas
- total_3_estrelas
- total_2_estrelas
- total_1_estrela
- total_com_comentario
```

### **Função: esta_aberto_agora()**
Retorna `true` se a loja está aberta agora, `false` se fechada.

---

## **✅ CHECKLIST DE CONFIRMAÇÃO**

Marque quando concluir:

- [ ] Script `migration_avaliacoes_fixed.sql` executado com sucesso
- [ ] Script `migration_horarios_fixed.sql` executado com sucesso
- [ ] Página `/admin/avaliacoes` acessível
- [ ] Página `/admin/horarios` acessível
- [ ] Consegue alterar horários e salvar
- [ ] Botão "Avaliações" aparece no PainelAdmin
- [ ] Botão "Horários" aparece no PainelAdmin

---

## **🆘 PRECISA DE AJUDA?**

Se encontrar algum erro:

1. **COPIE a mensagem de erro completa**
2. **TIRE um print da tela**
3. **ME ENVIE** para eu corrigir

---

## **🎉 PRÓXIMOS PASSOS**

Após concluir as migrações:

1. ✅ Testar criar uma avaliação (como cliente)
2. ✅ Testar configurar horários (como admin)
3. ✅ Testar pausar vendas
4. 🚀 Implementar WhatsApp Automático
5. 🚀 Implementar PIX Integrado

---

**Última atualização:** 08/10/2025
**Versão:** 1.0 (Corrigida)
