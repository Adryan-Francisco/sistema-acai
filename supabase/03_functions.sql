-- Função: obter papel do usuário autenticado
create or replace function public.get_user_role()
returns text
language sql stable security definer set search_path = public as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'cliente');
$$;

revoke all on function public.get_user_role() from anon, authenticated;
grant execute on function public.get_user_role() to authenticated;

-- Função: criar novo pedido
-- Espera: p_detalhes jsonb (detalhes do pedido completos)
create or replace function public.criar_novo_pedido(
  p_detalhes jsonb
)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  novo_id uuid;
  cliente_email text;
begin
  -- Verificar autenticação
  if auth.uid() is null then
    raise exception 'Usuário não autenticado';
  end if;
  
  -- Obter email do usuário autenticado
  select email 
  from auth.users 
  where id = auth.uid() 
  into cliente_email;
  
  -- Se não conseguir o email, usar um padrão
  if cliente_email is null then
    cliente_email := 'cliente@email.com';
  end if;
  
  -- Criar o pedido
  insert into public.pedidos (user_id, nome_cliente, detalhes_pedido, status)
  values (auth.uid(), cliente_email, p_detalhes, 'Recebido')
  returning id into novo_id;
  
  return novo_id;
end;
$$;

revoke all on function public.criar_novo_pedido(jsonb) from anon, authenticated;
grant execute on function public.criar_novo_pedido(jsonb) to authenticated;
