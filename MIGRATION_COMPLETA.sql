-- ============================================
-- PASSO 1: Adicionar coluna telefone
-- Execute PRIMEIRO este script
-- ============================================

ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS telefone TEXT;

-- Verificar
SELECT column_name FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'pedidos' AND column_name = 'telefone';

-- ============================================
-- PASSO 2: Sistema de Avaliações
-- Execute DEPOIS do Passo 1
-- ============================================

CREATE TABLE IF NOT EXISTS public.avaliacoes (
  id BIGSERIAL PRIMARY KEY,
  pedido_id BIGINT REFERENCES public.pedidos(id) ON DELETE CASCADE NOT NULL,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS avaliado BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_avaliacoes_pedido ON public.avaliacoes(pedido_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_usuario ON public.avaliacoes(usuario_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_avaliacoes_pedido_unique ON public.avaliacoes(pedido_id);

ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clientes podem ver suas avaliações" ON public.avaliacoes;
CREATE POLICY "Clientes podem ver suas avaliações"
ON public.avaliacoes FOR SELECT
USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Clientes podem criar avaliações" ON public.avaliacoes;
CREATE POLICY "Clientes podem criar avaliações"
ON public.avaliacoes FOR INSERT
WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Admins podem ver todas" ON public.avaliacoes;
CREATE POLICY "Admins podem ver todas"
ON public.avaliacoes FOR SELECT
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

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
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

-- ============================================
-- PASSO 3: Horário de Funcionamento
-- Execute DEPOIS do Passo 2
-- ============================================

CREATE TABLE IF NOT EXISTS public.configuracoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  horarios JSONB DEFAULT '{
    "segunda": {"aberto": true, "inicio": "09:00", "fim": "22:00"},
    "terca": {"aberto": true, "inicio": "09:00", "fim": "22:00"},
    "quarta": {"aberto": true, "inicio": "09:00", "fim": "22:00"},
    "quinta": {"aberto": true, "inicio": "09:00", "fim": "22:00"},
    "sexta": {"aberto": true, "inicio": "09:00", "fim": "22:00"},
    "sabado": {"aberto": true, "inicio": "10:00", "fim": "23:00"},
    "domingo": {"aberto": true, "inicio": "10:00", "fim": "22:00"}
  }'::jsonb,
  vendas_pausadas BOOLEAN DEFAULT FALSE,
  mensagem_fechado TEXT DEFAULT 'Desculpe, estamos fechados no momento.',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO public.configuracoes (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM public.configuracoes);

ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos podem ler configurações" ON public.configuracoes;
CREATE POLICY "Todos podem ler configurações"
ON public.configuracoes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins podem editar" ON public.configuracoes;
CREATE POLICY "Admins podem editar"
ON public.configuracoes FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

SELECT 'avaliacoes' as tabela, COUNT(*) as registros FROM public.avaliacoes
UNION ALL
SELECT 'configuracoes', COUNT(*) FROM public.configuracoes;

-- ============================================
-- CONCLUÍDO! ✅
-- ============================================
