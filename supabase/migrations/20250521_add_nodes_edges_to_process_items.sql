-- Adicionar colunas nodes e edges à tabela process_items
-- para suportar importação de mapas mentais via IA

ALTER TABLE process_items
ADD COLUMN IF NOT EXISTS nodes JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS edges JSONB DEFAULT NULL;

-- Adicionar comentários para documentação
COMMENT ON COLUMN process_items.nodes IS 'Estrutura de nós do mapa mental gerado por IA';
COMMENT ON COLUMN process_items.edges IS 'Estrutura de arestas/conexões do mapa mental gerado por IA';
