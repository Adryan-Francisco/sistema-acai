-- ============================================
-- MIGRATION: Adicionar coluna telefone
-- Execute ANTES de usar o sistema
-- ============================================

-- Adicionar coluna telefone na tabela pedidos
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'pedidos' 
    AND column_name = 'telefone'
  ) THEN
    ALTER TABLE public.pedidos ADD COLUMN telefone TEXT;
  END IF;
END $$;

-- Verificar se a coluna foi criada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'pedidos' 
  AND column_name = 'telefone';

-- ============================================
-- SUCESSO! ✅
-- ============================================
