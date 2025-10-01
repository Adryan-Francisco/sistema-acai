-- =====================================================
-- CARDÁPIO COMPLETO BASEADO NO MENU REAL
-- =====================================================
-- Execute este SQL no Supabase para atualizar todo o cardápio

-- PASSO 1: Limpar dados antigos
DELETE FROM public.complementos;
DELETE FROM public.tamanhos;

-- PASSO 2: Inserir tamanhos de açaí (baseado nas fotos)
INSERT INTO public.tamanhos (nome, preco, ordem, descricao) VALUES
-- MODA DA CASA (acompanha banana, morango, granola, leite em pó e leite condensado)
('300ml - Moda da Casa', 16.00, 1, 'Acompanha banana, morango, granola, leite em pó e leite condensado'),
('550ml - Moda da Casa', 18.00, 2, 'Acompanha banana, morango, granola, leite em pó e leite condensado'),
('770ml - Moda da Casa', 20.00, 3, 'Acompanha banana, morango, granola, leite em pó e leite condensado'),

-- PURO
('300ml - Puro', 12.00, 4, 'Açaí puro sem acompanhamentos'),
('550ml - Puro', 14.00, 5, 'Açaí puro sem acompanhamentos'),
('770ml - Puro', 16.00, 6, 'Açaí puro sem acompanhamentos'),

-- ZERO COMPLETO
('300ml - Zero Completo', 18.00, 7, 'Açaí zero açúcar completo'),
('550ml - Zero Completo', 20.00, 8, 'Açaí zero açúcar completo'),
('770ml - Zero Completo', 22.00, 9, 'Açaí zero açúcar completo'),

-- ZERO PURO
('300ml - Zero Puro', 16.00, 10, 'Açaí zero açúcar puro'),
('550ml - Zero Puro', 18.00, 11, 'Açaí zero açúcar puro'),
('770ml - Zero Puro', 20.00, 12, 'Açaí zero açúcar puro'),

-- CASADINHO MODA DA CASA
('330ml - Casadinho', 17.00, 13, 'Casadinho moda da casa'),
('550ml - Casadinho', 19.00, 14, 'Casadinho moda da casa'),

-- CUPUAÇU OU YOGURTE
('330ml - Cupuaçu/Yogurte', 13.00, 15, 'Cupuaçu ou Yogurte'),
('550ml - Cupuaçu/Yogurte', 15.00, 16, 'Cupuaçu ou Yogurte'),

-- CUPUAÇU COM YOGURTE
('330ml - Cupuaçu c/ Yogurte', 14.00, 17, 'Cupuaçu com Yogurte'),
('550ml - Cupuaçu c/ Yogurte', 16.00, 18, 'Cupuaçu com Yogurte')

ON CONFLICT (nome) DO UPDATE SET 
    preco = EXCLUDED.preco,
    ordem = EXCLUDED.ordem,
    descricao = EXCLUDED.descricao;

-- PASSO 3: Inserir complementos/adicionais (baseado nas fotos)
INSERT INTO public.complementos (nome, preco, ordem, categoria) VALUES

-- CREMES
('Avelã', 5.00, 1, 'Cremes'),
('Beijinho', 5.00, 2, 'Cremes'),
('Brigadeiro', 5.00, 3, 'Cremes'),
('Doce de Leite', 5.00, 4, 'Cremes'),
('Kinder Bueno', 5.00, 5, 'Cremes'),
('Morango', 5.00, 6, 'Cremes'),
('Ninho', 5.00, 7, 'Cremes'),
('Nutella', 6.00, 8, 'Cremes'),
('Óreo', 5.00, 9, 'Cremes'),
('Ovomaltine', 6.00, 10, 'Cremes'),
('Pistache', 7.00, 11, 'Cremes'),
('Rafaello', 5.00, 12, 'Cremes'),
('Sonho de Valsa', 5.00, 13, 'Cremes'),

-- DIVERSOS
('Bis', 2.50, 14, 'Diversos'),
('Bombom', 2.00, 15, 'Diversos'),
('Castanha', 3.00, 16, 'Diversos'),
('Chantilly', 3.50, 17, 'Diversos'),
('Confete', 3.50, 18, 'Diversos'),
('Farofa de Paçoca', 2.50, 19, 'Diversos'),
('Gotas de Chocolate', 3.00, 20, 'Diversos'),
('Kit Kat', 4.50, 21, 'Diversos'),
('Mini Óreo', 4.00, 22, 'Diversos'),
('Ovomaltine', 4.00, 23, 'Diversos'),
('Paçoca', 2.50, 24, 'Diversos'),

-- FRUTAS
('Kiwi', 7.00, 25, 'Frutas'),

-- ADICIONAIS CLÁSSICOS (que já existiam)
('Granola', 2.00, 26, 'Diversos'),
('Leite Ninho', 2.50, 27, 'Diversos'),
('Leite Condensado', 2.00, 28, 'Diversos'),
('Banana', 1.50, 29, 'Frutas')

ON CONFLICT (nome) DO UPDATE SET 
    preco = EXCLUDED.preco,
    ordem = EXCLUDED.ordem,
    categoria = EXCLUDED.categoria;

-- PASSO 4: Adicionar coluna categoria se não existir
ALTER TABLE public.complementos ADD COLUMN IF NOT EXISTS categoria text DEFAULT 'Diversos';
ALTER TABLE public.tamanhos ADD COLUMN IF NOT EXISTS descricao text;

-- PASSO 5: Verificar dados inseridos (execute separadamente se necessário)
-- SELECT nome, preco FROM public.tamanhos ORDER BY ordem;
-- SELECT nome, preco, categoria FROM public.complementos ORDER BY categoria, ordem;

-- =====================================================
-- CARDÁPIO COMPLETO ATUALIZADO COM DADOS REAIS!
-- =====================================================