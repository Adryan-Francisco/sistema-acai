-- Dados iniciais de cardápio
insert into public.tamanhos (nome, preco, ordem) values
  ('300ml', 10.00, 1),
  ('500ml', 14.00, 2),
  ('700ml', 18.00, 3)
on conflict do nothing;

insert into public.complementos (nome, preco, ordem) values
  ('Granola', 2.00, 1),
  ('Leite Ninho', 2.50, 2),
  ('Paçoca', 2.50, 3),
  ('Leite Condensado', 2.00, 4),
  ('Banana', 1.50, 5)
on conflict do nothing;

-- Helper para promover admin: depois de o usuário existir na auth.users, rode:
-- update public.profiles set role = 'admin' where email = 'email_do_admin@exemplo.com';
