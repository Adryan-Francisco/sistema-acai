-- =====================================================
-- CARDÁPIO REAL - VERSÃO SIMPLES (EXECUTE PARTE POR PARTE)
-- =====================================================

-- PARTE 1: Adicionar colunas se não existirem
ALTER TABLE public.complementos ADD COLUMN IF NOT EXISTS categoria text DEFAULT 'Diversos';
ALTER TABLE public.tamanhos ADD COLUMN IF NOT EXISTS descricao text;