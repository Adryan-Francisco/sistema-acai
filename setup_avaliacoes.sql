-- ============================================
-- TABELA DE AVALIAÇÕES
-- Sistema de Avaliação de Pedidos
-- ============================================

-- Criar tabela de avaliações
CREATE TABLE IF NOT EXISTS public.avaliacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID REFERENCES public.pedidos(id) ON DELETE CASCADE NOT NULL,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar coluna 'avaliado' na tabela pedidos (se não existir)
ALTER TABLE public.pedidos 
ADD COLUMN IF NOT EXISTS avaliado BOOLEAN DEFAULT FALSE;

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_avaliacoes_pedido ON public.avaliacoes(pedido_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_usuario ON public.avaliacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_nota ON public.avaliacoes(nota);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_created_at ON public.avaliacoes(created_at);
CREATE INDEX IF NOT EXISTS idx_pedidos_avaliado ON public.pedidos(avaliado);

-- Garantir que um pedido só pode ser avaliado uma vez
CREATE UNIQUE INDEX IF NOT EXISTS idx_avaliacoes_pedido_unique 
ON public.avaliacoes(pedido_id);

-- Comentários na tabela
COMMENT ON TABLE public.avaliacoes IS 'Armazena avaliações dos clientes sobre os pedidos';
COMMENT ON COLUMN public.avaliacoes.nota IS 'Nota de 1 a 5 estrelas';
COMMENT ON COLUMN public.avaliacoes.comentario IS 'Comentário opcional do cliente';

-- ============================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================

-- Habilitar RLS
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;

-- Política: Clientes podem ver apenas suas próprias avaliações
CREATE POLICY "Clientes podem ver suas avaliações"
ON public.avaliacoes
FOR SELECT
USING (auth.uid() = usuario_id);

-- Política: Clientes podem criar avaliações apenas dos próprios pedidos
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

-- Política: Clientes podem atualizar apenas suas próprias avaliações
CREATE POLICY "Clientes podem atualizar suas avaliações"
ON public.avaliacoes
FOR UPDATE
USING (auth.uid() = usuario_id)
WITH CHECK (auth.uid() = usuario_id);

-- Política: Admins podem ver todas as avaliações
CREATE POLICY "Admins podem ver todas avaliações"
ON public.avaliacoes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- TRIGGER PARA ATUALIZAR updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_avaliacoes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER avaliacoes_updated_at
BEFORE UPDATE ON public.avaliacoes
FOR EACH ROW
EXECUTE FUNCTION update_avaliacoes_updated_at();

-- ============================================
-- FUNÇÃO PARA CALCULAR MÉDIA DE AVALIAÇÕES
-- ============================================

CREATE OR REPLACE FUNCTION get_media_avaliacoes()
RETURNS DECIMAL AS $$
BEGIN
  RETURN (
    SELECT COALESCE(AVG(nota), 0)
    FROM public.avaliacoes
  );
END;
$$ LANGUAGE plpgsql;

-- Função para média de avaliações por período
CREATE OR REPLACE FUNCTION get_media_avaliacoes_periodo(dias INTEGER DEFAULT 30)
RETURNS DECIMAL AS $$
BEGIN
  RETURN (
    SELECT COALESCE(AVG(nota), 0)
    FROM public.avaliacoes
    WHERE created_at >= NOW() - (dias || ' days')::INTERVAL
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEW PARA ESTATÍSTICAS DE AVALIAÇÕES
-- ============================================

CREATE OR REPLACE VIEW public.estatisticas_avaliacoes AS
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

-- ============================================
-- DADOS DE TESTE (OPCIONAL)
-- ============================================

-- Descomentar para inserir avaliações de teste
/*
INSERT INTO public.avaliacoes (pedido_id, usuario_id, nota, comentario)
SELECT 
  p.id,
  p.usuario_id,
  FLOOR(RANDOM() * 5 + 1)::INTEGER,
  CASE 
    WHEN RANDOM() > 0.5 THEN 'Açaí delicioso! Recomendo.'
    ELSE NULL
  END
FROM public.pedidos p
WHERE p.status = 'Concluído'
LIMIT 10;
*/

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

-- Verificar se tudo foi criado corretamente
DO $$
BEGIN
  RAISE NOTICE '✅ Tabela avaliacoes criada com sucesso!';
  RAISE NOTICE '✅ % avaliações no sistema', (SELECT COUNT(*) FROM public.avaliacoes);
  RAISE NOTICE '✅ Média geral: % estrelas', (SELECT ROUND(get_media_avaliacoes(), 2));
END $$;
