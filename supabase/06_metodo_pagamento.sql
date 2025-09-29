-- Migração: Suporte a Método de Pagamento
-- Execute apenas se quiser limpar/testar dados de método de pagamento

-- Nota: A estrutura atual do banco já suporta métodos de pagamento
-- O campo detalhes_pedido é JSONB e agora inclui:
-- {
--   "tamanho": "300ml", 
--   "complementos": ["Leite Condensado", "Granola"],
--   "total": "14.50",
--   "metodo_pagamento": "PIX"  -- ← NOVO CAMPO
-- }

-- Opção 1: Para testar, você pode atualizar pedidos existentes adicionando método de pagamento
-- UPDATE public.pedidos 
-- SET detalhes_pedido = detalhes_pedido || '{"metodo_pagamento": "Dinheiro"}'::jsonb
-- WHERE detalhes_pedido->>'metodo_pagamento' IS NULL;

-- Opção 2: Ver exemplo de consulta para filtrar por método de pagamento
-- SELECT * FROM public.pedidos 
-- WHERE detalhes_pedido->>'metodo_pagamento' = 'PIX';

-- Opção 3: Estatísticas de métodos de pagamento
-- SELECT 
--   detalhes_pedido->>'metodo_pagamento' as metodo,
--   COUNT(*) as quantidade,
--   SUM((detalhes_pedido->>'total')::numeric) as valor_total
-- FROM public.pedidos 
-- WHERE detalhes_pedido->>'metodo_pagamento' IS NOT NULL
-- GROUP BY detalhes_pedido->>'metodo_pagamento'
-- ORDER BY quantidade DESC;

-- Nota: Nenhuma alteração de esquema é necessária!
-- A funcionalidade é retrocompatível com pedidos existentes.