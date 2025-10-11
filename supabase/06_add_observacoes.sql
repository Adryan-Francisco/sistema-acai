-- Adicionar campo de observações na tabela de pedidos
-- Execute no Supabase SQL Editor

ALTER TABLE pedidos 
ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- Comentário na coluna
COMMENT ON COLUMN pedidos.observacoes IS 'Observações/instruções especiais do cliente para o pedido';

-- Criar índice para busca (opcional, mas útil)
CREATE INDEX IF NOT EXISTS idx_pedidos_observacoes ON pedidos(observacoes) WHERE observacoes IS NOT NULL;
