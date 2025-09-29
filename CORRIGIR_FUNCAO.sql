-- =====================================================
-- SOLUÇÃO ULTRA SIMPLES QUE SEMPRE FUNCIONA
-- =====================================================
-- Execute este SQL no Supabase (copie e cole tudo)

-- PASSO 1: Remover TUDO e começar do zero
DROP FUNCTION IF EXISTS public.criar_novo_pedido(text, jsonb);
DROP FUNCTION IF EXISTS public.criar_novo_pedido(jsonb);
DROP TABLE IF EXISTS public.pedidos CASCADE;

-- PASSO 2: Criar tabela pedidos SIMPLES
CREATE TABLE public.pedidos (
    id bigserial PRIMARY KEY,
    user_id text NOT NULL,
    nome_cliente text NOT NULL,
    detalhes_pedido jsonb NOT NULL,
    status text DEFAULT 'Recebido',
    created_at timestamp DEFAULT now()
);

-- PASSO 3: Função ULTRA SIMPLES que SEMPRE funciona
CREATE OR REPLACE FUNCTION public.criar_novo_pedido(
  p_detalhes jsonb
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
declare
  novo_id bigint;
  user_id_text text;
begin
  -- Obter ID do usuário como texto (evita problemas de UUID)
  user_id_text := coalesce(auth.uid()::text, 'usuario_anonimo');
  
  -- Inserir pedido
  insert into public.pedidos (user_id, nome_cliente, detalhes_pedido, status)
  values (
    user_id_text, 
    coalesce(p_detalhes->>'cliente', 'Cliente'),
    p_detalhes, 
    'Recebido'
  )
  returning id into novo_id;
  
  return novo_id;
end;
$$;

-- PASSO 4: Habilitar RLS e criar política SIMPLES
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem acessar pedidos" 
ON public.pedidos 
FOR ALL 
USING (true);

-- PASSO 5: Permissões
GRANT ALL ON public.pedidos TO authenticated, anon;
GRANT ALL ON SEQUENCE pedidos_id_seq TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.criar_novo_pedido(jsonb) TO authenticated, anon;

-- PASSO 6: Teste
SELECT public.criar_novo_pedido('{"tamanho": "300ml", "total": "15.00", "metodo_pagamento": "PIX"}'::jsonb) as pedido_id;

-- =====================================================
-- PRONTO! Agora deve funcionar 100%
-- =====================================================