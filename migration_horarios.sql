-- ============================================
-- MIGRATION: Horário de Funcionamento
-- Aplique este script no Supabase SQL Editor
-- ============================================

-- 1. Criar tabela de configurações
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

-- 2. Inserir configuração padrão (se não existir)
INSERT INTO public.configuracoes (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM public.configuracoes LIMIT 1);

-- 3. Índice
CREATE INDEX IF NOT EXISTS idx_configuracoes_updated_at ON public.configuracoes(updated_at);

-- 4. Comentários
COMMENT ON TABLE public.configuracoes IS 'Configurações globais do sistema (horários, pausas, etc.)';
COMMENT ON COLUMN public.configuracoes.horarios IS 'Horários de funcionamento por dia da semana';
COMMENT ON COLUMN public.configuracoes.vendas_pausadas IS 'Se TRUE, vendas estão temporariamente pausadas';

-- ============================================
-- POLÍTICAS RLS
-- ============================================

ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

-- Todos podem ler as configurações
DROP POLICY IF EXISTS "Qualquer um pode ler configurações" ON public.configuracoes;
CREATE POLICY "Qualquer um pode ler configurações"
ON public.configuracoes
FOR SELECT
TO authenticated
USING (true);

-- Apenas admins podem editar
DROP POLICY IF EXISTS "Apenas admins podem editar configurações" ON public.configuracoes;
CREATE POLICY "Apenas admins podem editar configurações"
ON public.configuracoes
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- TRIGGER: Atualizar updated_at
-- ============================================

DROP TRIGGER IF EXISTS set_timestamp_configuracoes ON public.configuracoes;
CREATE TRIGGER set_timestamp_configuracoes
BEFORE UPDATE ON public.configuracoes
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- ============================================
-- FUNÇÃO: Verificar se está aberto agora
-- ============================================

CREATE OR REPLACE FUNCTION public.esta_aberto_agora()
RETURNS BOOLEAN AS $$
DECLARE
  config RECORD;
  dia_semana TEXT;
  hora_atual TIME;
  horario_dia JSONB;
BEGIN
  -- Buscar configurações
  SELECT * INTO config FROM public.configuracoes LIMIT 1;
  
  -- Se vendas pausadas, retorna falso
  IF config.vendas_pausadas THEN
    RETURN FALSE;
  END IF;
  
  -- Obter dia da semana em português
  dia_semana := CASE EXTRACT(DOW FROM CURRENT_DATE)
    WHEN 0 THEN 'domingo'
    WHEN 1 THEN 'segunda'
    WHEN 2 THEN 'terca'
    WHEN 3 THEN 'quarta'
    WHEN 4 THEN 'quinta'
    WHEN 5 THEN 'sexta'
    WHEN 6 THEN 'sabado'
  END;
  
  -- Buscar horário do dia atual
  horario_dia := config.horarios->dia_semana;
  
  -- Se fechado no dia, retorna falso
  IF NOT (horario_dia->>'aberto')::BOOLEAN THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se está dentro do horário
  hora_atual := CURRENT_TIME;
  
  RETURN hora_atual >= (horario_dia->>'inicio')::TIME 
     AND hora_atual <= (horario_dia->>'fim')::TIME;
END;
$$ LANGUAGE plpgsql;

-- Permitir que todos usem a função
GRANT EXECUTE ON FUNCTION public.esta_aberto_agora() TO authenticated;

-- ============================================
-- TESTE
-- ============================================

-- Ver configurações
SELECT * FROM public.configuracoes;

-- Testar se está aberto
SELECT public.esta_aberto_agora() AS esta_aberto;

-- ============================================
-- SCRIPT COMPLETO! ✅
-- ============================================
