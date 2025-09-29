-- Cria perfil automaticamente quando um novo usuário é criado em auth.users

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public as $$
begin
  insert into public.profiles (id, email, role, nome)
  values (
    new.id,
    new.email,
    'cliente',
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'nome', new.email)
  )
  on conflict (id) do update
    set email = excluded.email,
        nome = excluded.nome;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
