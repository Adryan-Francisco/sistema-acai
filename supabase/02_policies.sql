-- Policies: regras de acesso

-- Helper: determinar se o usuário é admin (via profiles.role)
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public as $$
  select exists(
    select 1 from public.profiles p
    where p.id = uid and p.role = 'admin'
  );
$$;

-- Tamanhos/complementos: leitura pública (somente select)
drop policy if exists "tamanhos_read" on public.tamanhos;
create policy "tamanhos_read" on public.tamanhos for select using (true);

drop policy if exists "complementos_read" on public.complementos;
create policy "complementos_read" on public.complementos for select using (true);

-- Admin pode inserir/atualizar/deletar tamanhos e complementos
drop policy if exists "tamanhos_admin_write" on public.tamanhos;
create policy "tamanhos_admin_write" on public.tamanhos
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "complementos_admin_write" on public.complementos;
create policy "complementos_admin_write" on public.complementos
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Perfis: usuário vê/atualiza apenas o seu, admin vê todos
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles for select using (
  auth.uid() = id or public.is_admin(auth.uid())
);

drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles for update using (
  auth.uid() = id or public.is_admin(auth.uid())
);

-- Políticas para pedidos
create policy "Usuários podem inserir seus próprios pedidos" on public.pedidos
  for insert with check (auth.uid() = user_id);

create policy "Usuários podem ver seus próprios pedidos" on public.pedidos
  for select using (auth.uid() = user_id);

create policy "Admins podem ver todos os pedidos" on public.pedidos
  for select using (is_admin());

create policy "Admins podem atualizar pedidos" on public.pedidos
  for update using (is_admin())
  with check (is_admin());
drop policy if exists "pedidos_insert" on public.pedidos;
create policy "pedidos_insert" on public.pedidos for insert with check (
  auth.uid() = user_id or public.is_admin(auth.uid())
);

drop policy if exists "pedidos_select" on public.pedidos;
create policy "pedidos_select" on public.pedidos for select using (
  auth.uid() = user_id or public.is_admin(auth.uid())
);

drop policy if exists "pedidos_update_admin" on public.pedidos;
create policy "pedidos_update_admin" on public.pedidos
for update using (
  public.is_admin(auth.uid())
) with check (
  public.is_admin(auth.uid())
);
