-- Schema: tabelas básicas para o sistema-açaí
-- Execute no SQL Editor do Supabase (Project > SQL) com um usuário com permissões de admin.

-- Extensões úteis (normalmente já habilitadas no Supabase)
create extension if not exists pgcrypto;

-- Perfis de usuário (papéis)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  role text not null default 'cliente',
  nome text,
  created_at timestamptz not null default now()
);

-- Tamanhos do açaí
create table if not exists public.tamanhos (
  id bigserial primary key,
  nome text not null,
  preco numeric(10,2) not null default 0,
  ordem int not null default 0,
  created_at timestamptz not null default now()
);

-- Complementos
create table if not exists public.complementos (
  id bigserial primary key,
  nome text not null,
  preco numeric(10,2) not null default 0,
  ordem int not null default 0,
  created_at timestamptz not null default now()
);

-- Pedidos
create table if not exists public.pedidos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  nome_cliente text,
  detalhes_pedido jsonb not null,
  status text not null default 'Recebido',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Atualiza updated_at automaticamente
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end
$$;

drop trigger if exists trg_pedidos_set_updated_at on public.pedidos;
create trigger trg_pedidos_set_updated_at
before update on public.pedidos
for each row execute procedure public.set_updated_at();

-- Índices úteis
create index if not exists idx_pedidos_user_id on public.pedidos(user_id);
create index if not exists idx_pedidos_created_at on public.pedidos(created_at desc);

-- Habilitar RLS
alter table public.profiles enable row level security;
alter table public.tamanhos enable row level security;
alter table public.complementos enable row level security;
alter table public.pedidos enable row level security;
