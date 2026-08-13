-- Migration: Add Paquimetro 150 mm e 300 mm Template
-- Description: Insert the "Instrução de Trabalho - Uso de Paquímetros 150 mm e 300 mm" process map template

DO $$
DECLARE
  v_user_id TEXT;
BEGIN
  SELECT id INTO v_user_id FROM tecno_users WHERE status = 'Ativo' LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'No active user found, using fallback';
    v_user_id := '00000000-0000-0000-0000-000000000000';
  END IF;

  INSERT INTO public.process_items (
    id,
    title,
    description,
    type,
    nodes,
    edges,
    node_details,
    created_by,
    created_at,
    workflow_status,
    visibility,
    allowed_departments,
    allowed_user_ids,
    tags
  )
  SELECT
    gen_random_uuid(),
    'Instrução de Trabalho - Uso de Paquímetros 150 mm e 300 mm',
    'Mapa de inspeção dimensional para uso de paquímetros de 150 mm e 300 mm em perfis de alumínio e peças acabadas, com amostragem conforme NBR 5426 S3.',
    'map',
    '[
      {"id":"root","type":"mindmap","position":{"x":0,"y":0},"data":{"label":"Uso de Paquímetros 150 mm e 300 mm","nodeType":"root","category":"root","numberCode":"1.0"}},
      {"id":"inputs","type":"mindmap","position":{"x":-720,"y":-240},"data":{"label":"Entradas","nodeType":"inputs","category":"inputs","numberCode":"2.0"}},
      {"id":"in_perfil","type":"mindmap","position":{"x":-1080,"y":-430},"data":{"label":"Perfil de Alumínio","nodeType":"inputs","category":"inputs","numberCode":"2.1"}},
      {"id":"in_peca","type":"mindmap","position":{"x":-1080,"y":-320},"data":{"label":"Peça Acabada","nodeType":"inputs","category":"inputs","numberCode":"2.2"}},
      {"id":"in_paqui150","type":"mindmap","position":{"x":-1080,"y":-210},"data":{"label":"Paquímetro 150 mm","nodeType":"inputs","category":"inputs","numberCode":"2.3"}},
      {"id":"in_paqui300","type":"mindmap","position":{"x":-1080,"y":-100},"data":{"label":"Paquímetro 300 mm","nodeType":"inputs","category":"inputs","numberCode":"2.4"}},
      {"id":"in_nbr","type":"mindmap","position":{"x":-1080,"y":10},"data":{"label":"NBR 5426 S3","nodeType":"inputs","category":"inputs","numberCode":"2.5"}},
      {"id":"resources","type":"mindmap","position":{"x":-720,"y":280},"data":{"label":"Recursos","nodeType":"resources","category":"resources","numberCode":"4.0"}},
      {"id":"res_paqui150","type":"mindmap","position":{"x":-1080,"y":90},"data":{"label":"Paquímetro 150 mm","nodeType":"resources","category":"resources","numberCode":"4.1"}},
      {"id":"res_paqui300","type":"mindmap","position":{"x":-1080,"y":200},"data":{"label":"Paquímetro 300 mm","nodeType":"resources","category":"resources","numberCode":"4.2"}},
      {"id":"res_bancada","type":"mindmap","position":{"x":-1080,"y":310},"data":{"label":"Bancada de Medição","nodeType":"resources","category":"resources","numberCode":"4.3"}},
      {"id":"res_padrao","type":"mindmap","position":{"x":-1080,"y":420},"data":{"label":"Bloco Padrão","nodeType":"resources","category":"resources","numberCode":"4.4"}},
      {"id":"people","type":"mindmap","position":{"x":720,"y":-240},"data":{"label":"Pessoas","nodeType":"people","category":"people","numberCode":"5.0"}},
      {"id":"pe_operador","type":"mindmap","position":{"x":1080,"y":-430},"data":{"label":"Operador de Medição","nodeType":"people","category":"people","numberCode":"5.1"}},
      {"id":"pe_inspector","type":"mindmap","position":{"x":1080,"y":-320},"data":{"label":"Inspetor da Qualidade","nodeType":"people","category":"people","numberCode":"5.2"}},
      {"id":"methods","type":"mindmap","position":{"x":0,"y":620},"data":{"label":"Métodos Operacionais","nodeType":"methods","category":"methods","numberCode":"6.0"}},
      {"id":"met_selecao","type":"mindmap","position":{"x":-520,"y":860},"data":{"label":"1. Selecionar o Paquímetro","nodeType":"methods","category":"methods","numberCode":"6.1"}},
      {"id":"met_zero","type":"mindmap","position":{"x":-160,"y":860},"data":{"label":"2. Zerar e Conferir","nodeType":"methods","category":"methods","numberCode":"6.2"}},
      {"id":"met_medicao","type":"mindmap","position":{"x":200,"y":860},"data":{"label":"3. Medir a Peça","nodeType":"methods","category":"methods","numberCode":"6.3"}},
      {"id":"met_plano","type":"mindmap","position":{"x":560,"y":860},"data":{"label":"4. Aplicar NBR 5426 S3","nodeType":"methods","category":"methods","numberCode":"6.4"}},
      {"id":"outputs","type":"mindmap","position":{"x":720,"y":280},"data":{"label":"Saídas","nodeType":"outputs","category":"outputs","numberCode":"3.0"}},
      {"id":"out_aprovado","type":"mindmap","position":{"x":1080,"y":100},"data":{"label":"Peças Aprovadas","nodeType":"outputs","category":"outputs","numberCode":"3.1"}},
      {"id":"out_nok","type":"mindmap","position":{"x":1080,"y":210},"data":{"label":"Peças Não Conformes","nodeType":"outputs","category":"outputs","numberCode":"3.2"}},
      {"id":"out_relatorio","type":"mindmap","position":{"x":1080,"y":320},"data":{"label":"Relatório de Inspeção","nodeType":"outputs","category":"outputs","numberCode":"3.3"}},
      {"id":"kpis","type":"mindmap","position":{"x":0,"y":-760},"data":{"label":"KPIs","nodeType":"kpis","category":"kpis","numberCode":"7.0"}},
      {"id":"kpi_conformidade","type":"mindmap","position":{"x":-360,"y":-1000},"data":{"label":"Conformidade Dimensional","nodeType":"kpis","category":"kpis","numberCode":"7.1"}},
      {"id":"kpi_reinspecao","type":"mindmap","position":{"x":0,"y":-1100},"data":{"label":"Taxa de Reinspeção","nodeType":"kpis","category":"kpis","numberCode":"7.2"}},
      {"id":"kpi_erros","type":"mindmap","position":{"x":360,"y":-1000},"data":{"label":"Erros de Leitura","nodeType":"kpis","category":"kpis","numberCode":"7.3"}}
    ]'::jsonb,
    '[
      {"id":"e-root-inputs","source":"root","target":"inputs","animated":true,"type":"smoothstep","style":{"stroke":"#60a5fa","strokeWidth":2}},
      {"id":"e-root-resources","source":"root","target":"resources","animated":true,"type":"smoothstep","style":{"stroke":"#60a5fa","strokeWidth":2}},
      {"id":"e-root-people","source":"root","target":"people","animated":true,"type":"smoothstep","style":{"stroke":"#60a5fa","strokeWidth":2}},
      {"id":"e-root-methods","source":"root","target":"methods","animated":true,"type":"smoothstep","style":{"stroke":"#60a5fa","strokeWidth":2}},
      {"id":"e-root-outputs","source":"root","target":"outputs","animated":true,"type":"smoothstep","style":{"stroke":"#60a5fa","strokeWidth":2}},
      {"id":"e-root-kpis","source":"root","target":"kpis","animated":true,"type":"smoothstep","style":{"stroke":"#60a5fa","strokeWidth":2}},
      {"id":"e-inputs-in_perfil","source":"inputs","target":"in_perfil","style":{"stroke":"#334155","strokeWidth":1.5,"strokeDasharray":4}},
      {"id":"e-inputs-in_peca","source":"inputs","target":"in_peca","style":{"stroke":"#334155","strokeWidth":1.5,"strokeDasharray":4}},
      {"id":"e-inputs-in_paqui150","source":"inputs","target":"in_paqui150","style":{"stroke":"#334155","strokeWidth":1.5,"strokeDasharray":4}},
      {"id":"e-inputs-in_paqui300","source":"inputs","target":"in_paqui300","style":{"stroke":"#334155","strokeWidth":1.5,"strokeDasharray":4}},
      {"id":"e-inputs-in_nbr","source":"inputs","target":"in_nbr","style":{"stroke":"#334155","strokeWidth":1.5,"strokeDasharray":4}},
      {"id":"e-resources-res_paqui150","source":"resources","target":"res_paqui150","style":{"stroke":"#334155","strokeWidth":1.5,"strokeDasharray":4}},
      {"id":"e-resources-res_paqui300","source":"resources","target":"res_paqui300","style":{"stroke":"#334155","strokeWidth":1.5,"strokeDasharray":4}},
      {"id":"e-resources-res_bancada","source":"resources","target":"res_bancada","style":{"stroke":"#334155","strokeWidth":1.5,"strokeDasharray":4}},
      {"id":"e-resources-res_padrao","source":"resources","target":"res_padrao","style":{"stroke":"#334155","strokeWidth":1.5,"strokeDasharray":4}},
      {"id":"e-people-pe_operador","source":"people","target":"pe_operador","style":{"stroke":"#334155","strokeWidth":1.5,"strokeDasharray":4}},
      {"id":"e-people-pe_inspector","source":"people","target":"pe_inspector","style":{"stroke":"#334155","strokeWidth":1.5,"strokeDasharray":4}},
      {"id":"e-methods-met_selecao","source":"methods","target":"met_selecao","style":{"stroke":"#334155","strokeWidth":1.5,"strokeDasharray":4}},
      {"id":"e-methods-met_zero","source":"methods","target":"met_zero","style":{"stroke":"#334155","strokeWidth":1.5,"strokeDasharray":4}},
      {"id":"e-methods-met_medicao","source":"methods","target":"met_medicao","style":{"stroke":"#334155","strokeWidth":1.5,"strokeDasharray":4}},
      {"id":"e-methods-met_plano","source":"methods","target":"met_plano","style":{"stroke":"#334155","strokeWidth":1.5,"strokeDasharray":4}},
      {"id":"e-outputs-out_aprovado","source":"outputs","target":"out_aprovado","style":{"stroke":"#334155","strokeWidth":1.5,"strokeDasharray":4}},
      {"id":"e-outputs-out_nok","source":"outputs","target":"out_nok","style":{"stroke":"#334155","strokeWidth":1.5,"strokeDasharray":4}},
      {"id":"e-outputs-out_relatorio","source":"outputs","target":"out_relatorio","style":{"stroke":"#334155","strokeWidth":1.5,"strokeDasharray":4}},
      {"id":"e-kpis-kpi_conformidade","source":"kpis","target":"kpi_conformidade","style":{"stroke":"#334155","strokeWidth":1.5,"strokeDasharray":4}},
      {"id":"e-kpis-kpi_reinspecao","source":"kpis","target":"kpi_reinspecao","style":{"stroke":"#334155","strokeWidth":1.5,"strokeDasharray":4}},
      {"id":"e-kpis-kpi_erros","source":"kpis","target":"kpi_erros","style":{"stroke":"#334155","strokeWidth":1.5,"strokeDasharray":4}}
    ]'::jsonb,
    '{
      "root": {
        "description": "Padronizar o uso de paquímetros de 150 mm e 300 mm na usinagem de perfis de alumínio e peças acabadas, garantindo medições confiáveis, decisão correta de aceitação e rastreabilidade das inspeções.",
        "images": [],
        "tasks": [
          {"id":"root-1","text":"Conferir o fluxo de medição antes de iniciar","completed":false},
          {"id":"root-2","text":"Selecionar o instrumento correto para cada dimensão","completed":false},
          {"id":"root-3","text":"Registrar os resultados no controle do lote","completed":false}
        ]
      },
      "inputs": {
        "description": "Entradas necessárias para medir corretamente: desenho técnico vigente, ordem de produção, peça usinada ou acabada, critério de aceitação e paquímetro calibrado.",
        "images": [],
        "tasks": [
          {"id":"inputs-1","text":"Conferir revisão do desenho","completed":false},
          {"id":"inputs-2","text":"Separar a peça correta para medição","completed":false},
          {"id":"inputs-3","text":"Validar a calibração do instrumento","completed":false}
        ]
      },
      "in_perfil": {
        "description": "Perfis de alumínio devem ser medidos nas dimensões críticas de largura, altura, espessura e distâncias funcionais, sem deformação, rebarba ou impacto que comprometa a leitura.",
        "images": [],
        "tasks": [
          {"id":"in-perfil-1","text":"Verificar ausência de empeno ou amassado","completed":false},
          {"id":"in-perfil-2","text":"Identificar a face de referência do perfil","completed":false},
          {"id":"in-perfil-3","text":"Conferir as cotas críticas do desenho","completed":false}
        ]
      },
      "in_peca": {
        "description": "Peças acabadas precisam ser conferidas antes da liberação final para validar dimensões, furação, distâncias entre usinagens e acabamento superficial, evitando envio de item fora da tolerância.",
        "images": [],
        "tasks": [
          {"id":"in-peca-1","text":"Confirmar identificação da peça","completed":false},
          {"id":"in-peca-2","text":"Inspecionar bordas e faces usinadas","completed":false},
          {"id":"in-peca-3","text":"Medir cotas críticas do acabamento","completed":false}
        ]
      },
      "in_paqui150": {
        "description": "O paquímetro de 150 mm é indicado para dimensões menores, áreas com pouco espaço e medições que exigem melhor ergonomia em peças pequenas ou médias.",
        "images": [],
        "tasks": [
          {"id":"in-paqui150-1","text":"Usar para dimensões curtas e acessíveis","completed":false},
          {"id":"in-paqui150-2","text":"Checar se a abertura cobre a medida da peça","completed":false},
          {"id":"in-paqui150-3","text":"Confirmar zero antes de iniciar","completed":false}
        ]
      },
      "in_paqui300": {
        "description": "O paquímetro de 300 mm é mais adequado para peças maiores, cotas longas e medições em que a versão de 150 mm não alcança a dimensão necessária.",
        "images": [],
        "tasks": [
          {"id":"in-paqui300-1","text":"Usar quando a dimensão exceder o 150 mm","completed":false},
          {"id":"in-paqui300-2","text":"Garantir apoio firme durante a leitura","completed":false},
          {"id":"in-paqui300-3","text":"Evitar força excessiva na peça","completed":false}
        ]
      },
      "in_nbr": {
        "description": "A ABNT NBR 5426 orienta a inspeção por atributos e os planos de amostragem. O nível especial S3 deve ser aplicado conforme o plano definido para o lote, sem substituir a tolerância dimensional do desenho.",
        "images": [],
        "tasks": [
          {"id":"in-nbr-1","text":"Identificar o lote e o plano de amostragem","completed":false},
          {"id":"in-nbr-2","text":"Aplicar o critério de aceitação e rejeição","completed":false},
          {"id":"in-nbr-3","text":"Registrar a amostra e o resultado","completed":false}
        ]
      },
      "resources": {
        "description": "Recursos necessários para a inspeção: paquímetros calibrados, bloco padrão para conferência, bancada limpa e ficha de inspeção para registro dos resultados.",
        "images": [],
        "tasks": [
          {"id":"resources-1","text":"Separar todos os instrumentos antes da medição","completed":false},
          {"id":"resources-2","text":"Confirmar validade da calibração","completed":false},
          {"id":"resources-3","text":"Garantir bancada limpa e estável","completed":false}
        ]
      },
      "res_paqui150": {
        "description": "Instrumento de menor porte, com melhor manuseio em espaços reduzidos e boa resposta para medidas curtas em perfis e peças acabadas.",
        "images": [],
        "tasks": [
          {"id":"res-paqui150-1","text":"Usar em medidas curtas e acessíveis","completed":false},
          {"id":"res-paqui150-2","text":"Limpar a régua e as faces de medição","completed":false},
          {"id":"res-paqui150-3","text":"Guardar no estojo após o uso","completed":false}
        ]
      },
      "res_paqui300": {
        "description": "Instrumento indicado para maior alcance e medidas longas, mantendo a mesma lógica de leitura e conferência de zero antes de medir.",
        "images": [],
        "tasks": [
          {"id":"res-paqui300-1","text":"Usar para dimensões maiores","completed":false},
          {"id":"res-paqui300-2","text":"Conferir o travamento da escala","completed":false},
          {"id":"res-paqui300-3","text":"Evitar choque nas hastes","completed":false}
        ]
      },
      "res_bancada": {
        "description": "A bancada deve ser plana, limpa e livre de vibração para não introduzir erro de apoio ou leitura nas medidas executadas com paquímetro.",
        "images": [],
        "tasks": [
          {"id":"res-bancada-1","text":"Retirar cavacos e sujeira da bancada","completed":false},
          {"id":"res-bancada-2","text":"Verificar estabilidade da superfície","completed":false},
          {"id":"res-bancada-3","text":"Manter iluminação adequada","completed":false}
        ]
      },
      "res_padrao": {
        "description": "Bloco padrão ou referência de calibre é usado para conferir zero, checar funcionamento e evitar erro sistemático no instrumento.",
        "images": [],
        "tasks": [
          {"id":"res-padrao-1","text":"Conferir zero antes da medição","completed":false},
          {"id":"res-padrao-2","text":"Validar a leitura com referência conhecida","completed":false},
          {"id":"res-padrao-3","text":"Registrar qualquer desvio encontrado","completed":false}
        ]
      },
      "people": {
        "description": "A medição precisa depende de papéis claros: operador mede, inspetor valida e metrologia garante a confiabilidade do instrumento e do método.",
        "images": [],
        "tasks": [
          {"id":"people-1","text":"Definir responsável pela medição","completed":false},
          {"id":"people-2","text":"Separar quem mede de quem libera","completed":false},
          {"id":"people-3","text":"Acionar metrologia quando houver dúvida","completed":false}
        ]
      },
      "pe_operador": {
        "description": "O operador executa a medição seguindo o padrão, sem improviso, respeitando o ponto de leitura, a pressão aplicada e a sequência definida no processo.",
        "images": [],
        "tasks": [
          {"id":"pe-operador-1","text":"Seguir o método de medição definido","completed":false},
          {"id":"pe-operador-2","text":"Registrar a leitura imediatamente","completed":false},
          {"id":"pe-operador-3","text":"Comunicar qualquer desvio observado","completed":false}
        ]
      },
      "pe_inspector": {
        "description": "O inspetor confirma conformidade dimensional, analisa tendência de desvio e decide se a peça, o lote ou a amostra podem seguir para a próxima etapa.",
        "images": [],
        "tasks": [
          {"id":"pe-inspector-1","text":"Validar medições críticas","completed":false},
          {"id":"pe-inspector-2","text":"Conferir o plano de amostragem","completed":false},
          {"id":"pe-inspector-3","text":"Liberar ou bloquear o lote","completed":false}
        ]
      },
      "methods": {
        "description": "A sequência correta inclui selecionar o instrumento, zerar, posicionar a peça, medir sem inclinação, comparar com o desenho e registrar o resultado conforme o plano de inspeção.",
        "images": [],
        "tasks": [
          {"id":"methods-1","text":"Seguir a ordem padrão de medição","completed":false},
          {"id":"methods-2","text":"Registrar a leitura em cada etapa","completed":false},
          {"id":"methods-3","text":"Interromper em caso de divergência","completed":false}
        ]
      },
      "met_selecao": {
        "description": "A seleção do instrumento deve considerar o tamanho da medida, o acesso à região de leitura e a necessidade de ergonomia. O de 150 mm atende medidas curtas; o de 300 mm atende medidas longas.",
        "images": [],
        "tasks": [
          {"id":"met-selecao-1","text":"Escolher 150 mm para medidas curtas","completed":false},
          {"id":"met-selecao-2","text":"Escolher 300 mm para medidas longas","completed":false},
          {"id":"met-selecao-3","text":"Confirmar que o instrumento cobre a faixa necessária","completed":false},
          {"id":"met-selecao-4","text":"Evitar usar instrumento inadequado para a dimensão","completed":false}
        ]
      },
      "met_zero": {
        "description": "Antes de medir, o paquímetro deve estar limpo, sem folga aparente e com zero conferido para evitar erro de leitura ou desvio sistemático.",
        "images": [],
        "tasks": [
          {"id":"met-zero-1","text":"Limpar as faces de medição","completed":false},
          {"id":"met-zero-2","text":"Fechar o instrumento e conferir o zero","completed":false},
          {"id":"met-zero-3","text":"Verificar desgaste ou folga","completed":false},
          {"id":"met-zero-4","text":"Usar bloco padrão quando aplicável","completed":false}
        ]
      },
      "met_medicao": {
        "description": "A leitura deve ser feita com a peça bem apoiada, sem inclinar o paquímetro e sem forçar as hastes, repetindo a medição quando houver dúvida de consistência.",
        "images": [],
        "tasks": [
          {"id":"met-medicao-1","text":"Apoiar a peça na bancada","completed":false},
          {"id":"met-medicao-2","text":"Posicionar o paquímetro perpendicularmente","completed":false},
          {"id":"met-medicao-3","text":"Repetir a leitura quando necessário","completed":false},
          {"id":"met-medicao-4","text":"Usar a mesma referência em todas as peças","completed":false}
        ]
      },
      "met_plano": {
        "description": "O plano de amostragem por atributos define quando o lote pode ser aceito ou rejeitado. No nível especial S3, a amostra e o critério devem seguir a tabela aplicável ao lote e ao NQA definido.",
        "images": [],
        "tasks": [
          {"id":"met-plano-1","text":"Identificar o lote e o plano de amostragem","completed":false},
          {"id":"met-plano-2","text":"Selecionar a amostra conforme a tabela","completed":false},
          {"id":"met-plano-3","text":"Aplicar o critério de aceitação e rejeição","completed":false},
          {"id":"met-plano-4","text":"Registrar o resultado da inspeção","completed":false}
        ]
      },
      "outputs": {
        "description": "As saídas devem indicar claramente o que foi aprovado, o que foi segregado e quais registros comprovam a inspeção, garantindo rastreabilidade e decisão objetiva.",
        "images": [],
        "tasks": [
          {"id":"outputs-1","text":"Separar peças aprovadas e não conformes","completed":false},
          {"id":"outputs-2","text":"Emitir o registro da medição","completed":false},
          {"id":"outputs-3","text":"Informar o próximo passo do lote","completed":false}
        ]
      },
      "out_aprovado": {
        "description": "Peças aprovadas estão dentro da tolerância e podem seguir para montagem, embalagem ou expedição sem retrabalho.",
        "images": [],
        "tasks": [
          {"id":"out-aprovado-1","text":"Identificar lote liberado","completed":false},
          {"id":"out-aprovado-2","text":"Encaminhar para a próxima etapa","completed":false},
          {"id":"out-aprovado-3","text":"Manter a rastreabilidade do lote","completed":false}
        ]
      },
      "out_nok": {
        "description": "Peças fora de especificação devem ser segregadas, identificadas e tratadas antes de qualquer liberação, evitando mistura com material conforme.",
        "images": [],
        "tasks": [
          {"id":"out-nok-1","text":"Isolar a peça ou o lote","completed":false},
          {"id":"out-nok-2","text":"Abrir registro de não conformidade","completed":false},
          {"id":"out-nok-3","text":"Definir rework ou sucata","completed":false}
        ]
      },
      "out_relatorio": {
        "description": "O relatório comprova a leitura, o resultado da amostragem e a decisão tomada, servindo como evidência para qualidade, auditoria e rastreabilidade.",
        "images": [],
        "tasks": [
          {"id":"out-relatorio-1","text":"Salvar as medidas coletadas","completed":false},
          {"id":"out-relatorio-2","text":"Anexar evidência da inspeção","completed":false},
          {"id":"out-relatorio-3","text":"Arquivar o relatório no lote","completed":false}
        ]
      },
      "kpis": {
        "description": "Os indicadores devem mostrar se o método está estável, se a inspeção está sendo aplicada corretamente e se a frequência de retrabalho ou rechecagem está sob controle.",
        "images": [],
        "tasks": [
          {"id":"kpis-1","text":"Acompanhar os resultados por lote","completed":false},
          {"id":"kpis-2","text":"Identificar tendência de erro","completed":false},
          {"id":"kpis-3","text":"Atuar quando os índices piorarem","completed":false}
        ]
      },
      "kpi_conformidade": {
        "description": "Mede o percentual de peças que atendem às tolerâncias do desenho. Quanto maior a conformidade, mais estável é o processo de medição e usinagem.",
        "images": [],
        "tasks": [
          {"id":"kpi-conformidade-1","text":"Calcular a taxa de aprovação","completed":false},
          {"id":"kpi-conformidade-2","text":"Comparar com a meta do processo","completed":false},
          {"id":"kpi-conformidade-3","text":"Investigar causas de desvios","completed":false}
        ]
      },
      "kpi_reinspecao": {
        "description": "Mostra quantas peças precisam ser medidas novamente por dúvida, falha de leitura ou inconsistência na primeira medição.",
        "images": [],
        "tasks": [
          {"id":"kpi-reinspecao-1","text":"Registrar toda segunda medição","completed":false},
          {"id":"kpi-reinspecao-2","text":"Identificar motivo da reinspeção","completed":false},
          {"id":"kpi-reinspecao-3","text":"Reduzir retrabalho de conferência","completed":false}
        ]
      },
      "kpi_erros": {
        "description": "Aponta falhas ligadas ao instrumento, à técnica de medição ou à interpretação do desenho, ajudando a evitar decisões incorretas.",
        "images": [],
        "tasks": [
          {"id":"kpi-erros-1","text":"Classificar o tipo de erro","completed":false},
          {"id":"kpi-erros-2","text":"Verificar o instrumento usado","completed":false},
          {"id":"kpi-erros-3","text":"Treinar a equipe quando houver recorrência","completed":false}
        ]
      }
    }'::jsonb,
    v_user_id::uuid,
    NOW(),
    'published',
    'departments',
    ARRAY['Qualidade', 'PCP', 'Diretoria', 'Usinagem']::text[],
    ARRAY[]::uuid[],
    ARRAY['paquimetro', 'inspecao-dimensional', 'nbr5426']::text[]
  FROM (SELECT 1) AS src
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.process_items
    WHERE title = 'Instrução de Trabalho - Uso de Paquímetros 150 mm e 300 mm'
      AND type = 'map'
  );

  RAISE NOTICE 'Paquimetro 150 mm e 300 mm template inserted successfully';
END $$;
