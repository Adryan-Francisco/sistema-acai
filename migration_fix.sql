-- SQL de correção para resolver os erros do console
-- Execute este script no Supabase SQL Editor

-- 1. Garantir que a coluna updated_at existe em pedidos
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pedidos' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.pedidos 
        ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
    END IF;
END $$;

-- 2. Recriar trigger de updated_at para pedidos
DROP TRIGGER IF EXISTS trg_pedidos_set_updated_at ON public.pedidos;
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END
$$;

CREATE TRIGGER trg_pedidos_set_updated_at
BEFORE UPDATE ON public.pedidos
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- 3. Garantir que a função is_admin existe
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END
$$;

-- 4. Recriar políticas de pedidos
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Admins podem ver todos os pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Admins podem atualizar pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "pedidos_update_admin" ON public.pedidos;

CREATE POLICY "Usuários podem inserir seus próprios pedidos" ON public.pedidos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem ver seus próprios pedidos" ON public.pedidos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todos os pedidos" ON public.pedidos
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins podem atualizar pedidos" ON public.pedidos
  FOR UPDATE 
  USING (is_admin())
  WITH CHECK (is_admin());

-- 5. Atualizar pedidos existentes com updated_at
UPDATE public.pedidos 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- 6. Garantir que sua conta é admin (substitua pelo seu email)
-- IMPORTANT: Substitua 'seu-email@exemplo.com' pelo seu email real
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'seu-email@exemplo.com';

COMMIT;