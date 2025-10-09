-- ============================================
-- MIGRATION: Sistema de Avaliações
-- Aplique este script no Supabase SQL Editor
-- ============================================

-- 1. Criar tabela de avaliações
CREATE TABLE IF NOT EXISTS public.avaliacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID REFERENCES public.pedidos(id) ON DELETE CASCADE NOT NULL,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Adicionar coluna 'avaliado' na tabela pedidos
ALTER TABLE public.pedidos 
ADD COLUMN IF NOT EXISTS avaliado BOOLEAN DEFAULT FALSE;

-- 3. Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_avaliacoes_pedido ON public.avaliacoes(pedido_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_usuario ON public.avaliacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_nota ON public.avaliacoes(nota);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_created_at ON public.avaliacoes(created_at);
CREATE INDEX IF NOT EXISTS idx_pedidos_avaliado ON public.pedidos(avaliado);

-- 4. Garantir que um pedido só pode ser avaliado uma vez
CREATE UNIQUE INDEX IF NOT EXISTS idx_avaliacoes_pedido_unique 
ON public.avaliacoes(pedido_id);

-- 5. Comentários na tabela
COMMENT ON TABLE public.avaliacoes IS 'Armazena avaliações dos clientes sobre os pedidos';
COMMENT ON COLUMN public.avaliacoes.nota IS 'Nota de 1 a 5 estrelas';
COMMENT ON COLUMN public.avaliacoes.comentario IS 'Comentário opcional do cliente';

-- ============================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================

-- Habilitar RLS
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;

-- Política: Clientes podem ver apenas suas próprias avaliações
DROP POLICY IF EXISTS "Clientes podem ver suas avaliações" ON public.avaliacoes;
CREATE POLICY "Clientes podem ver suas avaliações"
ON public.avaliacoes
FOR SELECT
USING (auth.uid() = usuario_id);

-- Política: Clientes podem criar avaliações apenas dos próprios pedidos
DROP POLICY IF EXISTS "Clientes podem criar avaliações dos próprios pedidos" ON public.avaliacoes;
CREATE POLICY "Clientes podem criar avaliações dos próprios pedidos"
ON public.avaliacoes
FOR INSERT
WITH CHECK (
  auth.uid() = usuario_id AND
  EXISTS (
    SELECT 1 FROM public.pedidos
    WHERE id = pedido_id AND usuario_id = auth.uid()
  )
);

-- Política: Clientes podem atualizar suas próprias avaliações
DROP POLICY IF EXISTS "Clientes podem atualizar suas avaliações" ON public.avaliacoes;
CREATE POLICY "Clientes podem atualizar suas avaliações"
ON public.avaliacoes
FOR UPDATE
USING (auth.uid() = usuario_id)
WITH CHECK (auth.uid() = usuario_id);

-- Política: Clientes podem deletar suas próprias avaliações
DROP POLICY IF EXISTS "Clientes podem deletar suas avaliações" ON public.avaliacoes;
CREATE POLICY "Clientes podem deletar suas avaliações"
ON public.avaliacoes
FOR DELETE
USING (auth.uid() = usuario_id);

-- Política: Admins podem ver todas as avaliações
DROP POLICY IF EXISTS "Admins podem ver todas avaliações" ON public.avaliacoes;
CREATE POLICY "Admins podem ver todas avaliações"
ON public.avaliacoes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- TRIGGER: Atualizar updated_at automaticamente
-- ============================================

CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp_avaliacoes ON public.avaliacoes;
CREATE TRIGGER set_timestamp_avaliacoes
BEFORE UPDATE ON public.avaliacoes
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- ============================================
-- VIEW: Estatísticas de Avaliações
-- ============================================

CREATE OR REPLACE VIEW public.avaliacoes_stats AS
SELECT 
  COUNT(*) as total_avaliacoes,
  AVG(nota) as media_geral,
  COUNT(CASE WHEN nota = 5 THEN 1 END) as total_5_estrelas,
  COUNT(CASE WHEN nota = 4 THEN 1 END) as total_4_estrelas,
  COUNT(CASE WHEN nota = 3 THEN 1 END) as total_3_estrelas,
  COUNT(CASE WHEN nota = 2 THEN 1 END) as total_2_estrelas,
  COUNT(CASE WHEN nota = 1 THEN 1 END) as total_1_estrela,
  COUNT(CASE WHEN comentario IS NOT NULL AND comentario != '' THEN 1 END) as total_com_comentario
FROM public.avaliacoes;

-- Permitir que todos vejam as estatísticas
GRANT SELECT ON public.avaliacoes_stats TO authenticated;

-- ============================================
-- DADOS DE TESTE (Opcional - Remover em produção)
-- ============================================

-- Inserir algumas avaliações de exemplo (ajuste os IDs conforme necessário)
-- IMPORTANTE: Substitua os UUIDs pelos IDs reais do seu banco!

-- INSERT INTO public.avaliacoes (pedido_id, usuario_id, nota, comentario) VALUES
-- ('PEDIDO_ID_AQUI', 'USUARIO_ID_AQUI', 5, 'Açaí delicioso! Muito bem embalado e rápido.'),
-- ('OUTRO_PEDIDO_ID', 'OUTRO_USUARIO_ID', 4, 'Muito bom, só achei um pouco caro.');

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Ver todas as avaliações
SELECT 
  a.id,
  a.nota,
  a.comentario,
  a.created_at,
  p.detalhes_pedido->>'total' as valor_pedido,
  prof.nome as cliente_nome
FROM public.avaliacoes a
JOIN public.pedidos p ON p.id = a.pedido_id
JOIN public.profiles prof ON prof.id = a.usuario_id
ORDER BY a.created_at DESC
LIMIT 10;

-- Ver estatísticas
SELECT * FROM public.avaliacoes_stats;

-- ============================================
-- SCRIPT COMPLETO! ✅
-- ============================================
