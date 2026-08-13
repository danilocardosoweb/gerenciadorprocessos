-- Migration: Add Paletes Exportação Template
-- Description: Insert the "Montagem de Paletes para Exportação" process map template

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
    'Instrução de Trabalho - Montagem de Paletes para Exportação',
    'map',
    '[
      {
        "id": "root",
        "type": "mindmap",
        "position": { "x": 0, "y": 0 },
        "data": {
          "label": "Montagem de Paletes para Exportação",
          "nodeType": "root",
          "category": "root",
          "numberCode": "1.0"
        }
      },
      {
        "id": "inputs",
        "type": "mindmap",
        "position": { "x": -700, "y": -300 },
        "data": {
          "label": "Entradas",
          "nodeType": "inputs",
          "category": "inputs",
          "numberCode": "2.0"
        }
      },
      {
        "id": "in_palete",
        "type": "mindmap",
        "position": { "x": -1050, "y": -500 },
        "data": {
          "label": "Palete de Madeira HT",
          "nodeType": "inputs",
          "category": "inputs",
          "numberCode": "2.1"
        }
      },
      {
        "id": "in_perfis",
        "type": "mindmap",
        "position": { "x": -1050, "y": -380 },
        "data": {
          "label": "Perfis de Alumínio",
          "nodeType": "inputs",
          "category": "inputs",
          "numberCode": "2.2"
        }
      },
      {
        "id": "resources",
        "type": "mindmap",
        "position": { "x": -700, "y": 300 },
        "data": {
          "label": "Recursos",
          "nodeType": "resources",
          "category": "resources",
          "numberCode": "4.0"
        }
      },
      {
        "id": "res_fita",
        "type": "mindmap",
        "position": { "x": -1050, "y": 100 },
        "data": {
          "label": "Fita PET de Amarração",
          "nodeType": "resources",
          "category": "resources",
          "numberCode": "4.1"
        }
      },
      {
        "id": "res_filme",
        "type": "mindmap",
        "position": { "x": -1050, "y": 220 },
        "data": {
          "label": "Filme Stretch",
          "nodeType": "resources",
          "category": "resources",
          "numberCode": "4.2"
        }
      },
      {
        "id": "people",
        "type": "mindmap",
        "position": { "x": 700, "y": -300 },
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
        "position": { "x": 1050, "y": -500 },
        "data": {
          "label": "Operador de Montagem",
          "nodeType": "people",
          "category": "people",
          "numberCode": "5.1"
        }
      },
      {
        "id": "methods",
        "type": "mindmap",
        "position": { "x": 0, "y": 650 },
        "data": {
          "label": "Métodos Operacionais",
          "nodeType": "methods",
          "category": "methods",
          "numberCode": "6.0"
        }
      },
      {
        "id": "met_base",
        "type": "mindmap",
        "position": { "x": -450, "y": 900 },
        "data": {
          "label": "1. Preparar Base do Palete",
          "nodeType": "methods",
          "category": "methods",
          "numberCode": "6.1"
        }
      },
      {
        "id": "met_empilhar",
        "type": "mindmap",
        "position": { "x": -100, "y": 900 },
        "data": {
          "label": "2. Posicionar Perfis",
          "nodeType": "methods",
          "category": "methods",
          "numberCode": "6.2"
        }
      },
      {
        "id": "met_amarrar",
        "type": "mindmap",
        "position": { "x": 250, "y": 900 },
        "data": {
          "label": "3. Realizar Amarração",
          "nodeType": "methods",
          "category": "methods",
          "numberCode": "6.3"
        }
      },
      {
        "id": "met_ident",
        "type": "mindmap",
        "position": { "x": 600, "y": 900 },
        "data": {
          "label": "4. Identificar e Liberar",
          "nodeType": "methods",
          "category": "methods",
          "numberCode": "6.4"
        }
      },
      {
        "id": "outputs",
        "type": "mindmap",
        "position": { "x": 700, "y": 300 },
        "data": {
          "label": "Saídas",
          "nodeType": "outputs",
          "category": "outputs",
          "numberCode": "3.0"
        }
      },
      {
        "id": "out_palete",
        "type": "mindmap",
        "position": { "x": 1050, "y": 120 },
        "data": {
          "label": "Palete Montado",
          "nodeType": "outputs",
          "category": "outputs",
          "numberCode": "3.1"
        }
      },
      {
        "id": "kpis",
        "type": "mindmap",
        "position": { "x": 0, "y": -750 },
        "data": {
          "label": "KPIs",
          "nodeType": "kpis",
          "category": "kpis",
          "numberCode": "7.0"
        }
      },
      {
        "id": "kpi_avaria",
        "type": "mindmap",
        "position": { "x": -300, "y": -980 },
        "data": {
          "label": "Índice de Avarias",
          "nodeType": "kpis",
          "category": "kpis",
          "numberCode": "7.1"
        }
      },
      {
        "id": "kpi_prod",
        "type": "mindmap",
        "position": { "x": 0, "y": -1080 },
        "data": {
          "label": "Produtividade de Montagem",
          "nodeType": "kpis",
          "category": "kpis",
          "numberCode": "7.2"
        }
      },
      {
        "id": "kpi_reclam",
        "type": "mindmap",
        "position": { "x": 300, "y": -980 },
        "data": {
          "label": "Reclamações Cliente",
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
        "id": "e-inputs-in_palete",
        "source": "inputs",
        "target": "in_palete",
        "style": {
          "stroke": "#334155",
          "strokeWidth": 1.5,
          "strokeDasharray": 4
        }
      },
      {
        "id": "e-inputs-in_perfis",
        "source": "inputs",
        "target": "in_perfis",
        "style": {
          "stroke": "#334155",
          "strokeWidth": 1.5,
          "strokeDasharray": 4
        }
      },
      {
        "id": "e-resources-res_fita",
        "source": "resources",
        "target": "res_fita",
        "style": {
          "stroke": "#334155",
          "strokeWidth": 1.5,
          "strokeDasharray": 4
        }
      },
      {
        "id": "e-resources-res_filme",
        "source": "resources",
        "target": "res_filme",
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
        "id": "e-methods-met_base",
        "source": "methods",
        "target": "met_base",
        "style": {
          "stroke": "#334155",
          "strokeWidth": 1.5,
          "strokeDasharray": 4
        }
      },
      {
        "id": "e-methods-met_empilhar",
        "source": "methods",
        "target": "met_empilhar",
        "style": {
          "stroke": "#334155",
          "strokeWidth": 1.5,
          "strokeDasharray": 4
        }
      },
      {
        "id": "e-methods-met_amarrar",
        "source": "methods",
        "target": "met_amarrar",
        "style": {
          "stroke": "#334155",
          "strokeWidth": 1.5,
          "strokeDasharray": 4
        }
      },
      {
        "id": "e-methods-met_ident",
        "source": "methods",
        "target": "met_ident",
        "style": {
          "stroke": "#334155",
          "strokeWidth": 1.5,
          "strokeDasharray": 4
        }
      },
      {
        "id": "e-outputs-out_palete",
        "source": "outputs",
        "target": "out_palete",
        "style": {
          "stroke": "#334155",
          "strokeWidth": 1.5,
          "strokeDasharray": 4
        }
      },
      {
        "id": "e-kpis-kpi_avaria",
        "source": "kpis",
        "target": "kpi_avaria",
        "style": {
          "stroke": "#334155",
          "strokeWidth": 1.5,
          "strokeDasharray": 4
        }
      },
      {
        "id": "e-kpis-kpi_prod",
        "source": "kpis",
        "target": "kpi_prod",
        "style": {
          "stroke": "#334155",
          "strokeWidth": 1.5,
          "strokeDasharray": 4
        }
      },
      {
        "id": "e-kpis-kpi_reclam",
        "source": "kpis",
        "target": "kpi_reclam",
        "style": {
          "stroke": "#334155",
          "strokeWidth": 1.5,
          "strokeDasharray": 4
        }
      }
    ]'::jsonb,
    '{
      "root": {
        "analyticalDetails": "Padronizar a montagem de paletes destinados à exportação garantindo segurança, integridade do produto e conformidade logística internacional. Montagem incorreta pode causar avarias, tombamento, rejeição logística e perdas financeiras. Garantia de estabilidade, rastreabilidade e conformidade para transporte nacional e internacional. Processo contínuo. Responsável: Produção, Expedição e Qualidade.",
        "actionsAndEvidence": [
          {"action": "Liberar palete para expedição", "evidence": "Checklist aprovado", "frequency": "Por palete"}
        ]
      },
      "inputs": {
        "analyticalDetails": "Garantir disponibilidade correta de materiais e documentos para montagem. Requisitos técnicos: Paletes homologados, Perfis identificados, Etiqueta exportação, Ordem de produção. Erro de identificação e montagem incorreta. Assegura rastreabilidade do lote.",
        "actionsAndEvidence": [
          {"action": "Conferir materiais", "evidence": "Checklist de recebimento", "frequency": "Por palete"}
        ]
      },
      "in_palete": {
        "analyticalDetails": "Utilizar paletes tratados conforme norma ISPM-15. Requisitos técnicos: Carimbo HT visível, Estrutura íntegra, Sem rachaduras. Rejeição alfandegária. Garantia logística internacional.",
        "actionsAndEvidence": [
          {"action": "Validar carimbo HT", "evidence": "Foto do palete", "frequency": "Por palete"}
        ]
      },
      "in_perfis": {
        "analyticalDetails": "Garantir identificação e integridade dos perfis. Requisitos técnicos: Etiqueta legível, Quantidade correta, Sem danos superficiais. Mistura de lotes. Evita reclamações do cliente.",
        "actionsAndEvidence": [
          {"action": "Conferir lote", "evidence": "Leitura código barras", "frequency": "Por palete"}
        ]
      },
      "resources": {
        "analyticalDetails": "Disponibilizar recursos adequados para montagem segura. Avarias e acidentes. Melhora estabilidade do palete.",
        "actionsAndEvidence": [
          {"action": "Validar recursos", "evidence": "Checklist operacional", "frequency": "Diário"}
        ]
      },
      "res_fita": {
        "analyticalDetails": "Garantir fixação segura da carga. Requisitos técnicos: Tensão adequada, Sem danos na fita. Queda de material. Estabilidade logística.",
        "actionsAndEvidence": [
          {"action": "Inspecionar amarração", "evidence": "Foto da carga", "frequency": "Por palete"}
        ]
      },
      "res_filme": {
        "analyticalDetails": "Proteger material contra umidade e movimentação. Requisitos técnicos: Cobertura total, Sem folgas. Danos no transporte. Proteção superficial.",
        "actionsAndEvidence": [
          {"action": "Validar aplicação", "evidence": "Registro visual", "frequency": "Por palete"}
        ]
      },
      "people": {
        "analyticalDetails": "Definir responsabilidades operacionais. Falhas operacionais. Padronização do processo.",
        "actionsAndEvidence": [
          {"action": "Registrar operador", "evidence": "Login sistema", "frequency": "Por turno"}
        ]
      },
      "pe_operador": {
        "analyticalDetails": "Executar montagem conforme padrão exportação. Montagem incorreta. Garantia de conformidade.",
        "actionsAndEvidence": [
          {"action": "Executar montagem", "evidence": "Checklist preenchido", "frequency": "Por palete"}
        ]
      },
      "methods": {
        "analyticalDetails": "Padronizar a montagem e expedição. Falhas de estabilidade. Garantia logística.",
        "actionsAndEvidence": [
          {"action": "Auditar processo", "evidence": "Checklist auditoria", "frequency": "Semanal"}
        ]
      },
      "met_base": {
        "analyticalDetails": "Garantir estabilidade inicial do palete. Requisitos técnicos: Palete nivelado, Sem avarias, Capacidade adequada. Instabilidade da carga. Base segura para transporte.",
        "actionsAndEvidence": [
          {"action": "Inspecionar palete", "evidence": "Foto da base", "frequency": "Por palete"}
        ]
      },
      "met_empilhar": {
        "analyticalDetails": "Organizar perfis sem deformações. Requisitos técnicos: Separadores corretos, Alinhamento da carga, Distribuição uniforme. Empenamento e danos. Integridade do produto.",
        "actionsAndEvidence": [
          {"action": "Validar alinhamento", "evidence": "Foto lateral", "frequency": "Por palete"}
        ]
      },
      "met_amarrar": {
        "analyticalDetails": "Fixar carga evitando movimentação. Requisitos técnicos: Aplicar fita PET, Aplicar cantoneiras, Validar tensão. Queda de carga. Segurança logística.",
        "actionsAndEvidence": [
          {"action": "Conferir tensão", "evidence": "Checklist amarração", "frequency": "Por palete"}
        ]
      },
      "met_ident": {
        "analyticalDetails": "Garantir rastreabilidade da carga exportada. Requisitos técnicos: Etiqueta exportação, Lote visível, Peso identificado. Perda de rastreabilidade. Conformidade logística.",
        "actionsAndEvidence": [
          {"action": "Gerar etiqueta", "evidence": "Etiqueta impressa", "frequency": "Por palete"},
          {"action": "Liberar expedição", "evidence": "Aprovação qualidade", "frequency": "Por palete"}
        ]
      },
      "outputs": {
        "analyticalDetails": "Garantir entrega segura ao cliente. Avarias e devoluções. Cliente recebe material conforme.",
        "actionsAndEvidence": [
          {"action": "Liberar carga", "evidence": "Checklist aprovado", "frequency": "Por palete"}
        ]
      },
      "out_palete": {
        "analyticalDetails": "Disponibilizar carga pronta para exportação. Falhas logísticas. Integridade garantida.",
        "actionsAndEvidence": [
          {"action": "Inspecionar carga", "evidence": "Foto final", "frequency": "Por palete"}
        ]
      },
      "kpis": {
        "analyticalDetails": "Monitorar eficiência e qualidade do processo. Aumento de avarias. Melhoria contínua.",
        "actionsAndEvidence": [
          {"action": "Monitorar indicadores", "evidence": "Dashboard", "frequency": "Semanal"}
        ]
      },
      "kpi_avaria": {
        "analyticalDetails": "Monitorar danos no transporte. Redução de reclamações.",
        "actionsAndEvidence": [
          {"action": "Registrar ocorrências", "evidence": "Relatório logístico", "frequency": "Mensal"}
        ]
      },
      "kpi_prod": {
        "analyticalDetails": "Monitorar tempo de montagem. Melhoria operacional.",
        "actionsAndEvidence": [
          {"action": "Registrar produção", "evidence": "Apontamento sistema", "frequency": "Diário"}
        ]
      },
      "kpi_reclam": {
        "analyticalDetails": "Monitorar satisfação logística. Melhoria contínua.",
        "actionsAndEvidence": [
          {"action": "Analisar ocorrências", "evidence": "Indicadores qualidade", "frequency": "Mensal"}
        ]
      }
    }'::jsonb,
    v_user_id::uuid,
    NOW(),
    'published'
  );

  RAISE NOTICE 'Paletes Exportação template inserted successfully';
END $$;
