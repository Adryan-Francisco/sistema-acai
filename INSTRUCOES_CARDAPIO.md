# 🍇 INSTRUÇÕES PARA ATUALIZAR CARDÁPIO

## ⚠️ O arquivo `CARDAPIO_REAL.sql` teve erro de sintaxe!

**Execute os arquivos na ordem abaixo no Supabase SQL Editor:**

### **1. CARDAPIO_SIMPLES_1.sql**
```sql
-- Adicionar colunas
ALTER TABLE public.complementos ADD COLUMN IF NOT EXISTS categoria text DEFAULT 'Diversos';
ALTER TABLE public.tamanhos ADD COLUMN IF NOT EXISTS descricao text;
```

### **2. CARDAPIO_SIMPLES_2.sql** 
```sql
-- Limpar dados antigos
DELETE FROM public.complementos;
DELETE FROM public.tamanhos;
```

### **3. CARDAPIO_SIMPLES_3.sql**
```sql
-- Inserir todos os tamanhos (18 produtos)
INSERT INTO public.tamanhos (nome, preco, ordem, descricao) VALUES...
```

### **4. CARDAPIO_SIMPLES_4.sql**
```sql
-- Inserir cremes (13 produtos)
INSERT INTO public.complementos (nome, preco, ordem, categoria) VALUES...
```

### **5. CARDAPIO_SIMPLES_5.sql**
```sql
-- Inserir diversos (14 produtos)
INSERT INTO public.complementos (nome, preco, ordem, categoria) VALUES...
```

### **6. CARDAPIO_SIMPLES_6.sql**
```sql
-- Inserir frutas (2 produtos)
INSERT INTO public.complementos (nome, preco, ordem, categoria) VALUES...
```

---

## ✅ **Após executar todos:**

1. **Recarregue o site:** https://Adryan-Francisco.github.io/sistema-acai
2. **Faça login**
3. **Veja o cardápio completo** com todos os produtos reais!

**Total:** 18 tamanhos + 29 complementos = 47 produtos no cardápio!