-- Adicionar sistema de fidelidade à tabela profiles
-- Execute este script no SQL Editor do Supabase

-- Adicionar colunas de fidelidade se não existirem
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS pontos_fidelidade INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS acais_gratis INTEGER DEFAULT 0;

-- Atualizar dados existentes (opcional - define 0 para todos os perfis existentes)
UPDATE public.profiles 
SET pontos_fidelidade = COALESCE(pontos_fidelidade, 0),
    acais_gratis = COALESCE(acais_gratis, 0)
WHERE pontos_fidelidade IS NULL OR acais_gratis IS NULL;

-- Comentários nas colunas
COMMENT ON COLUMN public.profiles.pontos_fidelidade IS 'Pontos acumulados no programa de fidelidade (a cada 10 pontos = 1 açaí grátis)';
COMMENT ON COLUMN public.profiles.acais_gratis IS 'Quantidade de açaís grátis disponíveis para o cliente';

-- Criar índice para melhor performance nas consultas
CREATE INDEX IF NOT EXISTS idx_profiles_fidelidade 
ON public.profiles(pontos_fidelidade, acais_gratis);

COMMIT;

-- Verificar se as colunas foram criadas
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('pontos_fidelidade', 'acais_gratis')
ORDER BY column_name;
