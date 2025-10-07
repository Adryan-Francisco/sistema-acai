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
  cliente_nome text;
  cliente_email text;
begin
  -- Verificar autenticação
  if auth.uid() is null then
    raise exception 'Usuário não autenticado';
  end if;
  
  -- Buscar nome do perfil do usuário
  select nome, email
  from public.profiles 
  where id = auth.uid() 
  into cliente_nome, cliente_email;
  
  -- Se não encontrar o nome no perfil, buscar do auth.users
  if cliente_nome is null or cliente_nome = '' then
    select 
      coalesce(
        raw_user_meta_data->>'name',
        raw_user_meta_data->>'full_name',
        email
      )
    from auth.users 
    where id = auth.uid() 
    into cliente_nome;
  end if;
  
  -- Se ainda não tiver nome, usar email
  if cliente_nome is null or cliente_nome = '' then
    cliente_nome := coalesce(cliente_email, 'Cliente');
  end if;
  
  -- Criar o pedido com timezone do Brasil
  insert into public.pedidos (user_id, nome_cliente, detalhes_pedido, status, created_at)
  values (
    auth.uid(), 
    cliente_nome, 
    p_detalhes, 
    'Recebido',
    timezone('America/Sao_Paulo', now())
  )
  returning id into novo_id;
  
  return novo_id;
end;
$$;

revoke all on function public.criar_novo_pedido(jsonb) from anon, authenticated;
grant execute on function public.criar_novo_pedido(jsonb) to authenticated;
