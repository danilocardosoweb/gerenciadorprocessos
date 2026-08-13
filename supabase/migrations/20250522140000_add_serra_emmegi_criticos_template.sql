-- Migration: Add Serra Emmegi Críticos Template
-- Description: Insert the "Serra Emmegi Automática 1 Cabeça - Itens Críticos" process map template

DO $$
DECLARE
  v_user_id TEXT;
BEGIN
  -- Get a valid user_id from tecno_users
  SELECT id INTO v_user_id FROM tecno_users WHERE status = 'Ativo' LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'No active user found, using fallback';
    v_user_id := '00000000-0000-0000-0000-000000000000';
  END IF;

  INSERT INTO public.process_items (
    id,
    title,
    type,
    nodes,
    edges,
    node_details,
    created_by,
    created_at,
    workflow_status
  ) VALUES (
    gen_random_uuid(),
    'Instrução de Trabalho - Serra Emmegi Automática 1 Cabeça - Itens Críticos',
    'map',
    '[
      {
        "id": "root",
        "type": "mindmap",
        "position": { "x": 0, "y": 0 },
        "data": {
          "label": "Serra Emmegi Automática 1 Cabeça - Itens Críticos",
          "nodeType": "root",
          "category": "root",
          "numberCode": "1.0"
        }
      },
      {
        "id": "inputs",
        "type": "mindmap",
        "position": { "x": -750, "y": -300 },
        "data": {
          "label": "Entradas",
          "nodeType": "inputs",
          "category": "inputs",
          "numberCode": "2.0"
        }
      },
      {
        "id": "in_desenho",
        "type": "mindmap",
        "position": { "x": -1100, "y": -520 },
        "data": {
          "label": "Desenho Técnico Crítico",
          "nodeType": "inputs",
          "category": "inputs",
          "numberCode": "2.1"
        }
      },
      {
        "id": "in_programa",
        "type": "mindmap",
        "position": { "x": -1100, "y": -380 },
        "data": {
          "label": "Programa CNC Validado",
          "nodeType": "inputs",
          "category": "inputs",
          "numberCode": "2.2"
        }
      },
      {
        "id": "resources",
        "type": "mindmap",
        "position": { "x": -750, "y": 320 },
        "data": {
          "label": "Recursos",
          "nodeType": "resources",
          "category": "resources",
          "numberCode": "4.0"
        }
      },
      {
        "id": "res_serra",
        "type": "mindmap",
        "position": { "x": -1100, "y": 80 },
        "data": {
          "label": "Serra Emmegi Automática",
          "nodeType": "resources",
          "category": "resources",
          "numberCode": "4.1"
        }
      },
      {
        "id": "res_medicao",
        "type": "mindmap",
        "position": { "x": -1100, "y": 220 },
        "data": {
          "label": "Instrumentos Calibrados",
          "nodeType": "resources",
          "category": "resources",
          "numberCode": "4.2"
        }
      },
      {
        "id": "people",
        "type": "mindmap",
        "position": { "x": 750, "y": -300 },
        "data": {
          "label": "Pessoas",
          "nodeType": "people",
          "category": "people",
          "numberCode": "5.0"
        }
      },
      {
        "id": "pe_operador",
        "type": "mindmap",
        "position": { "x": 1100, "y": -520 },
        "data": {
          "label": "Operador CNC Especialista",
          "nodeType": "people",
          "category": "people",
          "numberCode": "5.1"
        }
      },
      {
        "id": "methods",
        "type": "mindmap",
        "position": { "x": 0, "y": 720 },
        "data": {
          "label": "Métodos Operacionais",
          "nodeType": "methods",
          "category": "methods",
          "numberCode": "6.0"
        }
      },
      {
        "id": "met_setup",
        "type": "mindmap",
        "position": { "x": -500, "y": 980 },
        "data": {
          "label": "1. Realizar Setup Crítico",
          "nodeType": "methods",
          "category": "methods",
          "numberCode": "6.1"
        }
      },
      {
        "id": "met_inspecao",
        "type": "mindmap",
        "position": { "x": -120, "y": 980 },
        "data": {
          "label": "2. Inspeção 100% Dimensional",
          "nodeType": "methods",
          "category": "methods",
          "numberCode": "6.2"
        }
      },
      {
        "id": "met_corte",
        "type": "mindmap",
        "position": { "x": 250, "y": 980 },
        "data": {
          "label": "3. Executar Corte Controlado",
          "nodeType": "methods",
          "category": "methods",
          "numberCode": "6.3"
        }
      },
      {
        "id": "met_nok",
        "type": "mindmap",
        "position": { "x": 620, "y": 980 },
        "data": {
          "label": "4. Tratativa de Não Conformidade",
          "nodeType": "methods",
          "category": "methods",
          "numberCode": "6.4"
        }
      },
      {
        "id": "outputs",
        "type": "mindmap",
        "position": { "x": 750, "y": 320 },
        "data": {
          "label": "Saídas",
          "nodeType": "outputs",
          "category": "outputs",
          "numberCode": "3.0"
        }
      },
      {
        "id": "out_ok",
        "type": "mindmap",
        "position": { "x": 1100, "y": 120 },
        "data": {
          "label": "Peças Aprovadas",
          "nodeType": "outputs",
          "category": "outputs",
          "numberCode": "3.1"
        }
      },
      {
        "id": "out_nok",
        "type": "mindmap",
        "position": { "x": 1100, "y": 260 },
        "data": {
          "label": "Peças Não Conformes",
          "nodeType": "outputs",
          "category": "outputs",
          "numberCode": "3.2"
        }
      },
      {
        "id": "kpis",
        "type": "mindmap",
        "position": { "x": 0, "y": -820 },
        "data": {
          "label": "KPIs",
          "nodeType": "kpis",
          "category": "kpis",
          "numberCode": "7.0"
        }
      },
      {
        "id": "kpi_ppm",
        "type": "mindmap",
        "position": { "x": -350, "y": -1080 },
        "data": {
          "label": "PPM Não Conformidade",
          "nodeType": "kpis",
          "category": "kpis",
          "numberCode": "7.1"
        }
      },
      {
        "id": "kpi_cp",
        "type": "mindmap",
        "position": { "x": 0, "y": -1180 },
        "data": {
          "label": "Capabilidade Processo Cp/Cpk",
          "nodeType": "kpis",
          "category": "kpis",
          "numberCode": "7.2"
        }
      },
      {
        "id": "kpi_refugo",
        "type": "mindmap",
        "position": { "x": 350, "y": -1080 },
        "data": {
          "label": "Índice de Refugo",
          "nodeType": "kpis",
          "category": "kpis",
          "numberCode": "7.3"
        }
      }
    ]'::jsonb,
    '[
      {
        "id": "e-root-inputs",
        "source": "root",
        "target": "inputs",
        "animated": true,
        "type": "smoothstep",
        "style": {
          "stroke": "#60a5fa",
          "strokeWidth": 2
        }
      },
      {
        "id": "e-root-resources",
        "source": "root",
        "target": "resources",
        "animated": true,
        "type": "smoothstep",
        "style": {
          "stroke": "#60a5fa",
          "strokeWidth": 2
        }
      },
      {
        "id": "e-root-people",
        "source": "root",
        "target": "people",
        "animated": true,
        "type": "smoothstep",
        "style": {
          "stroke": "#60a5fa",
          "strokeWidth": 2
        }
      },
      {
        "id": "e-root-methods",
        "source": "root",
        "target": "methods",
        "animated": true,
        "type": "smoothstep",
        "style": {
          "stroke": "#60a5fa",
          "strokeWidth": 2
        }
      },
      {
        "id": "e-root-outputs",
        "source": "root",
        "target": "outputs",
        "animated": true,
        "type": "smoothstep",
        "style": {
          "stroke": "#60a5fa",
          "strokeWidth": 2
        }
      },
      {
        "id": "e-root-kpis",
        "source": "root",
        "target": "kpis",
        "animated": true,
        "type": "smoothstep",
        "style": {
          "stroke": "#60a5fa",
          "strokeWidth": 2
        }
      },
      {
        "id": "e-inputs-in_desenho",
        "source": "inputs",
        "target": "in_desenho",
        "style": {
          "stroke": "#334155",
          "strokeWidth": 1.5,
          "strokeDasharray": 4
        }
      },
      {
        "id": "e-inputs-in_programa",
        "source": "inputs",
        "target": "in_programa",
        "style": {
          "stroke": "#334155",
          "strokeWidth": 1.5,
          "strokeDasharray": 4
        }
      },
      {
        "id": "e-resources-res_serra",
        "source": "resources",
        "target": "res_serra",
        "style": {
          "stroke": "#334155",
          "strokeWidth": 1.5,
          "strokeDasharray": 4
        }
      },
      {
        "id": "e-resources-res_medicao",
        "source": "resources",
        "target": "res_medicao",
        "style": {
          "stroke": "#334155",
          "strokeWidth": 1.5,
          "strokeDasharray": 4
        }
      },
      {
        "id": "e-people-pe_operador",
        "source": "people",
        "target": "pe_operador",
        "style": {
          "stroke": "#334155",
          "strokeWidth": 1.5,
          "strokeDasharray": 4
        }
      },
      {
        "id": "e-methods-met_setup",
        "source": "methods",
        "target": "met_setup",
        "style": {
          "stroke": "#334155",
          "strokeWidth": 1.5,
          "strokeDasharray": 4
        }
      },
      {
        "id": "e-methods-met_inspecao",
        "source": "methods",
        "target": "met_inspecao",
        "style": {
          "stroke": "#334155",
          "strokeWidth": 1.5,
          "strokeDasharray": 4
        }
      },
      {
        "id": "e-methods-met_corte",
        "source": "methods",
        "target": "met_corte",
        "style": {
          "stroke": "#334155",
          "strokeWidth": 1.5,
          "strokeDasharray": 4
        }
      },
      {
        "id": "e-methods-met_nok",
        "source": "methods",
        "target": "met_nok",
        "style": {
          "stroke": "#334155",
          "strokeWidth": 1.5,
          "strokeDasharray": 4
        }
      },
      {
        "id": "e-outputs-out_ok",
        "source": "outputs",
        "target": "out_ok",
        "style": {
          "stroke": "#334155",
          "strokeWidth": 1.5,
          "strokeDasharray": 4
        }
      },
      {
        "id": "e-outputs-out_nok",
        "source": "outputs",
        "target": "out_nok",
        "style": {
          "stroke": "#334155",
          "strokeWidth": 1.5,
          "strokeDasharray": 4
        }
      },
      {
        "id": "e-kpis-kpi_ppm",
        "source": "kpis",
        "target": "kpi_ppm",
        "style": {
          "stroke": "#334155",
          "strokeWidth": 1.5,
          "strokeDasharray": 4
        }
      },
      {
        "id": "e-kpis-kpi_cp",
        "source": "kpis",
        "target": "kpi_cp",
        "style": {
          "stroke": "#334155",
          "strokeWidth": 1.5,
          "strokeDasharray": 4
        }
      },
      {
        "id": "e-kpis-kpi_refugo",
        "source": "kpis",
        "target": "kpi_refugo",
        "style": {
          "stroke": "#334155",
          "strokeWidth": 1.5,
          "strokeDasharray": 4
        }
      }
    ]'::jsonb,
    '{
      "root": {
        "analyticalDetails": "Padronizar o processo de corte de itens críticos garantindo tolerâncias rigorosas, inspeção 100% dimensional e rastreabilidade total conforme requisitos automotivos e IATF. Requisitos técnicos: Inspeção dimensional 100%, Controle rigoroso de tolerância, Validação frequente de setup, Monitoramento contínuo do disco, Controle de estabilidade térmica. Requisitos de segurança: Uso obrigatório de EPIs, Não acessar área de corte durante ciclo, Parada imediata em vibração anormal. Falhas podem gerar não conformidade crítica, montagem incorreta no cliente, sucata e reclamações automotivas. Garante repetibilidade dimensional e conformidade de itens especiais. Operação contínua. Responsável: Produção, Qualidade e Processo.",
        "actionsAndEvidence": [
          {"action": "Monitorar produção crítica", "evidence": "Logs de produção", "frequency": "Contínuo"}
        ]
      },
      "inputs": {
        "analyticalDetails": "Garantir que todos os dados e materiais estejam corretos antes do corte. Requisitos técnicos: Desenho atualizado, Plano de controle, Perfil correto, Programa CNC validado. Erro de processo e peças fora de especificação. Assegura estabilidade dimensional.",
        "actionsAndEvidence": [
          {"action": "Conferir documentação", "evidence": "Checklist eletrônico", "frequency": "Por setup"}
        ]
      },
      "in_desenho": {
        "analyticalDetails": "Garantir leitura correta das tolerâncias especiais. Requisitos técnicos: Validar revisão, Conferir cotas críticas, Validar tolerâncias. Produção incorreta. Evita desvios dimensionais.",
        "actionsAndEvidence": [
          {"action": "Validar revisão", "evidence": "Registro aprovação", "frequency": "Por setup"}
        ]
      },
      "in_programa": {
        "analyticalDetails": "Garantir programa correto para itens críticos. Requisitos técnicos: Sequência validada, Medidas corretas, Offset atualizado. Corte incorreto. Mantém repetibilidade.",
        "actionsAndEvidence": [
          {"action": "Validar programa", "evidence": "Print tela CNC", "frequency": "Por setup"}
        ]
      },
      "resources": {
        "analyticalDetails": "Disponibilizar recursos adequados para precisão dimensional. Desvio dimensional e instabilidade do processo. Controle dimensional robusto.",
        "actionsAndEvidence": [
          {"action": "Validar recursos", "evidence": "Checklist setup", "frequency": "Diário"}
        ]
      },
      "res_serra": {
        "analyticalDetails": "Executar cortes de alta precisão. Requisitos técnicos: Disco calibrado, Sem vibração, Lubrificação correta. Variação dimensional. Precisão do corte.",
        "actionsAndEvidence": [
          {"action": "Inspecionar máquina", "evidence": "Checklist equipamento", "frequency": "Diário"}
        ]
      },
      "res_medicao": {
        "analyticalDetails": "Garantir medições precisas. Requisitos técnicos: Paquímetro calibrado, Trena validada, Etiqueta de calibração válida. Medição incorreta. Controle dimensional confiável.",
        "actionsAndEvidence": [
          {"action": "Validar calibração", "evidence": "Etiqueta INMETRO", "frequency": "Mensal"}
        ]
      },
      "people": {
        "analyticalDetails": "Definir responsabilidades críticas do processo. Falha operacional. Padronização do processo.",
        "actionsAndEvidence": [
          {"action": "Registrar operador", "evidence": "Login sistema", "frequency": "Por turno"}
        ]
      },
      "pe_operador": {
        "analyticalDetails": "Executar processo conforme plano de controle. Requisitos técnicos: Treinamento validado, Conhecimento de tolerâncias. Erro operacional. Maior estabilidade dimensional.",
        "actionsAndEvidence": [
          {"action": "Validar treinamento", "evidence": "Registro treinamento", "frequency": "Anual"}
        ]
      },
      "methods": {
        "analyticalDetails": "Garantir execução padronizada do processo crítico. Desvios dimensionais. Repetibilidade do processo.",
        "actionsAndEvidence": [
          {"action": "Auditar operação", "evidence": "Checklist auditoria", "frequency": "Semanal"}
        ]
      },
      "met_setup": {
        "analyticalDetails": "Garantir estabilidade dimensional antes da produção. Requisitos técnicos: Validar batente, Validar offset, Executar corte piloto, Inspecionar primeira peça. Produção fora de tolerância. Controle inicial do processo.",
        "actionsAndEvidence": [
          {"action": "Aprovar primeira peça", "evidence": "Relatório dimensional", "frequency": "Por setup"}
        ]
      },
      "met_inspecao": {
        "analyticalDetails": "Garantir conformidade total das medidas críticas. Requisitos técnicos: Medir todas as peças, Registrar medidas, Validar tolerâncias críticas. Envio de peça NOK ao cliente. Garantia total dimensional. Frequência: Todas as peças.",
        "actionsAndEvidence": [
          {"action": "Registrar medições", "evidence": "Planilha inspeção", "frequency": "Por peça"},
          {"action": "Anexar evidência", "evidence": "Foto medição", "frequency": "Por peça"}
        ]
      },
      "met_corte": {
        "analyticalDetails": "Manter estabilidade durante toda produção. Requisitos técnicos: Monitorar aquecimento, Monitorar vibração, Validar medidas periodicamente. Variação dimensional. Controle estatístico do processo.",
        "actionsAndEvidence": [
          {"action": "Registrar produção", "evidence": "Log produção", "frequency": "Contínuo"}
        ]
      },
      "met_nok": {
        "analyticalDetails": "Bloquear imediatamente peças fora de especificação. Requisitos técnicos: Segregar material, Identificar NOK, Acionar qualidade. Mistura de lotes conformes e NOK. Proteção do cliente.",
        "actionsAndEvidence": [
          {"action": "Abrir ocorrência", "evidence": "Relatório NCR", "frequency": "Quando necessário"}
        ]
      },
      "outputs": {
        "analyticalDetails": "Garantir liberação apenas de peças conformes. Cliente receber peça NOK. Confiabilidade do processo.",
        "actionsAndEvidence": [
          {"action": "Liberar lote", "evidence": "Aprovação qualidade", "frequency": "Por lote"}
        ]
      },
      "out_ok": {
        "analyticalDetails": "Disponibilizar peças conformes para próxima etapa. Garantia dimensional total.",
        "actionsAndEvidence": [
          {"action": "Liberar peças", "evidence": "Etiqueta aprovado", "frequency": "Por lote"}
        ]
      },
      "out_nok": {
        "analyticalDetails": "Segregar peças fora de tolerância. Mistura de material. Proteção do cliente.",
        "actionsAndEvidence": [
          {"action": "Segregar material", "evidence": "Etiqueta NOK", "frequency": "Quando necessário"}
        ]
      },
      "kpis": {
        "analyticalDetails": "Monitorar estabilidade dimensional e performance do processo. Melhoria contínua.",
        "actionsAndEvidence": [
          {"action": "Atualizar dashboard", "evidence": "Indicadores sistema", "frequency": "Semanal"}
        ]
      },
      "kpi_ppm": {
        "analyticalDetails": "Monitorar peças NOK. Redução de falhas.",
        "actionsAndEvidence": [
          {"action": "Analisar falhas", "evidence": "Relatório qualidade", "frequency": "Mensal"}
        ]
      },
      "kpi_cp": {
        "analyticalDetails": "Avaliar estabilidade do processo. Controle estatístico.",
        "actionsAndEvidence": [
          {"action": "Atualizar CEP", "evidence": "Gráfico controle", "frequency": "Mensal"}
        ]
      },
      "kpi_refugo": {
        "analyticalDetails": "Monitorar perdas do processo. Redução de desperdícios.",
        "actionsAndEvidence": [
          {"action": "Registrar sucata", "evidence": "Apontamento produção", "frequency": "Diário"}
        ]
      }
    }'::jsonb,
    v_user_id::uuid,
    NOW(),
    'published'
  );

  RAISE NOTICE 'Serra Emmegi Críticos template inserted successfully';
END $$;
