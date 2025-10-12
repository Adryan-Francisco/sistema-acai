# 🔧 Configuração do Supabase - Sistema de Pedidos de Açaí

## ❗ Erro Atual
Você está vendo erros **400** e **404** porque as tabelas do Supabase precisam ser configuradas.

## 📋 Tabelas Necessárias

### 1️⃣ Tabela: `profiles`
Armazena informações dos usuários.

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  endereco TEXT,
  is_admin BOOLEAN DEFAULT false,
  pontos_fidelidade INTEGER DEFAULT 0,
  acais_gratis INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_is_admin ON profiles(is_admin);

-- RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins podem ver todos os perfis"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
```

### 2️⃣ Tabela: `pedidos`
Armazena os pedidos dos clientes.

```sql
CREATE TABLE pedidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  nome_cliente TEXT NOT NULL,
  telefone_cliente TEXT NOT NULL,
  detalhes_pedido JSONB NOT NULL,
  status TEXT DEFAULT 'pendente',
  total NUMERIC(10, 2) NOT NULL,
  tipo_entrega TEXT DEFAULT 'retirada',
  endereco_entrega TEXT,
  metodo_pagamento TEXT,
  observacoes TEXT,
  avaliado BOOLEAN DEFAULT false,
  usado_acai_gratis BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_pedidos_user_id ON pedidos(user_id);
CREATE INDEX idx_pedidos_status ON pedidos(status);
CREATE INDEX idx_pedidos_created_at ON pedidos(created_at DESC);

-- RLS
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Usuários podem ver seus próprios pedidos"
  ON pedidos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar pedidos"
  ON pedidos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todos os pedidos"
  ON pedidos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins podem atualizar pedidos"
  ON pedidos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
```

### 3️⃣ Tabela: `avaliacoes`
Armazena avaliações dos pedidos.

```sql
CREATE TABLE avaliacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES auth.users(id),
  nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_avaliacoes_pedido_id ON avaliacoes(pedido_id);
CREATE INDEX idx_avaliacoes_usuario_id ON avaliacoes(usuario_id);
CREATE INDEX idx_avaliacoes_nota ON avaliacoes(nota);

-- RLS
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Todos podem ver avaliações"
  ON avaliacoes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários podem criar avaliações dos seus pedidos"
  ON avaliacoes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pedidos
      WHERE id = pedido_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins podem ver todas as avaliações"
  ON avaliacoes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
```

### 4️⃣ Tabela: `catalogo`
Armazena produtos (tamanhos e complementos).

```sql
CREATE TABLE catalogo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL, -- 'tamanho' ou 'complemento'
  nome TEXT NOT NULL,
  preco NUMERIC(10, 2) NOT NULL,
  disponivel BOOLEAN DEFAULT true,
  descricao TEXT,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_catalogo_tipo ON catalogo(tipo);
CREATE INDEX idx_catalogo_disponivel ON catalogo(disponivel);

-- RLS
ALTER TABLE catalogo ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Todos podem ver o catálogo"
  ON catalogo FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins podem gerenciar o catálogo"
  ON catalogo FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
```

### 5️⃣ Tabela: `horarios_funcionamento`
Armazena horários de funcionamento.

```sql
CREATE TABLE horarios_funcionamento (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dia_semana INTEGER NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6), -- 0=Domingo, 6=Sábado
  aberto BOOLEAN DEFAULT true,
  horario_abertura TIME,
  horario_fechamento TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(dia_semana)
);

-- RLS
ALTER TABLE horarios_funcionamento ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Todos podem ver horários"
  ON horarios_funcionamento FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins podem gerenciar horários"
  ON horarios_funcionamento FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
```

## 🔥 Realtime (WebSocket)

Ative o Realtime para a tabela `pedidos`:

1. Acesse o **Dashboard do Supabase**
2. Vá em **Database** → **Replication**
3. Ative a tabela `pedidos`

Ou execute:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE pedidos;
```

## 👤 Criar Usuário Admin

Após criar sua conta, execute no SQL Editor:

```sql
-- Substitua 'seu-email@example.com' pelo seu email
UPDATE profiles
SET is_admin = true
WHERE email = 'seu-email@example.com';
```

## 📝 Ordem de Execução

1. ✅ Execute os SQLs das tabelas na ordem (profiles → pedidos → avaliacoes → catalogo → horarios_funcionamento)
2. ✅ Configure as políticas RLS
3. ✅ Ative o Realtime para `pedidos`
4. ✅ Crie seu usuário admin
5. ✅ Reinicie o servidor local

## 🎯 Verificação

Após configurar, teste no SQL Editor:

```sql
-- Verificar tabelas criadas
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- Verificar seu perfil
SELECT * FROM profiles WHERE email = 'seu-email@example.com';

-- Verificar RLS ativado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

## 🚀 Pronto!

Após executar todos os SQLs, recarregue a aplicação e os erros 400/404 devem desaparecer!
