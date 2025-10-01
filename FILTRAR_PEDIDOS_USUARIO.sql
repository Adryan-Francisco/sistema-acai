-- =====================================================
-- CORREÇÃO: FILTRAR PEDIDOS POR USUÁRIO
-- =====================================================
-- Execute este SQL no Supabase para corrigir as políticas RLS

-- PASSO 1: Remover políticas antigas
DROP POLICY IF EXISTS "Todos podem acessar pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Usuarios veem apenas seus pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Usuarios podem criar pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Admins veem todos os pedidos" ON public.pedidos;

-- PASSO 2: Criar políticas corretas
-- Usuários veem apenas seus próprios pedidos
CREATE POLICY "Usuarios veem apenas seus pedidos" 
ON public.pedidos 
FOR SELECT 
USING (auth.uid()::text = user_id);

-- Usuários podem criar pedidos
CREATE POLICY "Usuarios podem criar pedidos" 
ON public.pedidos 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

-- Admins podem ver todos os pedidos (se existir tabela profiles)
CREATE POLICY "Admins veem todos os pedidos" 
ON public.pedidos 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- PASSO 3: Verificar se RLS está habilitado
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- PASSO 4: Atualizar função para garantir que salva user_id correto
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
  -- Obter ID do usuário como texto
  user_id_text := auth.uid()::text;
  
  -- Verificar se está autenticado
  if user_id_text is null then
    raise exception 'Usuário não autenticado';
  end if;
  
  -- Inserir pedido com user_id correto
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

-- PASSO 5: Permissões
GRANT SELECT, INSERT ON public.pedidos TO authenticated;
GRANT USAGE ON SEQUENCE pedidos_id_seq TO authenticated;
GRANT EXECUTE ON FUNCTION public.criar_novo_pedido(jsonb) TO authenticated;

-- PASSO 6: Consulta para debug (verificar se funcionou)
-- SELECT user_id, nome_cliente, created_at FROM public.pedidos ORDER BY created_at DESC LIMIT 10;

-- =====================================================
-- AGORA CADA USUÁRIO VÊ APENAS SEUS PRÓPRIOS PEDIDOS!
-- =====================================================