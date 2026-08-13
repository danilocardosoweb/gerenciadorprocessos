-- Migration: Add Usinagem EXP FOM Template
-- Description: Insert the "Usinagem EXP - FOM Industrie CNC" process map template

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
    'Instrução de Trabalho - Usinagem EXP - FOM Industrie CNC',
    'map',
    '[
      {
        "id": "root",
        "type": "mindmap",
        "position": { "x": 0, "y": 0 },
        "data": {
          "label": "Usinagem EXP - FOM Industrie CNC",
          "nodeType": "root",
          "category": "root",
          "numberCode": "1.0"
        }
      },
      {
        "id": "inputs",
        "type": "mindmap",
        "position": { "x": -850, "y": -320 },
        "data": {
          "label": "Entradas",
          "nodeType": "inputs",
          "category": "inputs",
          "numberCode": "2.0"
        }
      },
      {
        "id": "in_perfil",
        "type": "mindmap",
        "position": { "x": -1220, "y": -560 },
        "data": {
          "label": "Perfil EXP 5 Metros",
          "nodeType": "inputs",
          "category": "inputs",
          "numberCode": "2.1"
        }
      },
      {
        "id": "in_cnc",
        "type": "mindmap",
        "position": { "x": -1220, "y": -400 },
        "data": {
          "label": "Programa CNC FOM",
          "nodeType": "inputs",
          "category": "inputs",
          "numberCode": "2.2"
        }
      },
      {
        "id": "resources",
        "type": "mindmap",
        "position": { "x": -850, "y": 350 },
        "data": {
          "label": "Recursos",
          "nodeType": "resources",
          "category": "resources",
          "numberCode": "4.0"
        }
      },
      {
        "id": "res_fom",
        "type": "mindmap",
        "position": { "x": -1220, "y": 80 },
        "data": {
          "label": "Centro CNC FOM Industrie",
          "nodeType": "resources",
          "category": "resources",
          "numberCode": "4.1"
        }
      },
      {
        "id": "res_tool",
        "type": "mindmap",
        "position": { "x": -1220, "y": 250 },
        "data": {
          "label": "Ferramentas de Usinagem",
          "nodeType": "resources",
          "category": "resources",
          "numberCode": "4.2"
        }
      },
      {
        "id": "res_metrology",
        "type": "mindmap",
        "position": { "x": -1220, "y": 420 },
        "data": {
          "label": "Metrologia Calibrada",
          "nodeType": "resources",
          "category": "resources",
          "numberCode": "4.3"
        }
      },
      {
        "id": "people",
        "type": "mindmap",
        "position": { "x": 850, "y": -320 },
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
        "position": { "x": 1220, "y": -560 },
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
        "position": { "x": 0, "y": 780 },
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
        "position": { "x": -620, "y": 1080 },
        "data": {
          "label": "1. Realizar Setup Técnico",
          "nodeType": "methods",
          "category": "methods",
          "numberCode": "6.1"
        }
      },
      {
        "id": "met_drain",
        "type": "mindmap",
        "position": { "x": -180, "y": 1080 },
        "data": {
          "label": "2. Executar Furos e Drenos",
          "nodeType": "methods",
          "category": "methods",
          "numberCode": "6.2"
        }
      },
      {
        "id": "met_100",
        "type": "mindmap",
        "position": { "x": 260, "y": 1080 },
        "data": {
          "label": "3. Inspeção 100% Dimensional",
          "nodeType": "methods",
          "category": "methods",
          "numberCode": "6.3"
        }
      },
      {
        "id": "met_nok",
        "type": "mindmap",
        "position": { "x": 700, "y": 1080 },
        "data": {
          "label": "4. Tratativa NOK",
          "nodeType": "methods",
          "category": "methods",
          "numberCode": "6.4"
        }
      },
      {
        "id": "outputs",
        "type": "mindmap",
        "position": { "x": 850, "y": 350 },
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
        "position": { "x": 1220, "y": 120 },
        "data": {
          "label": "Peças Usinadas OK",
          "nodeType": "outputs",
          "category": "outputs",
          "numberCode": "3.1"
        }
      },
      {
        "id": "kpis",
        "type": "mindmap",
        "position": { "x": 0, "y": -900 },
        "data": {
          "label": "KPIs",
          "nodeType": "kpis",
          "category": "kpis",
          "numberCode": "7.0"
        }
      },
      {
        "id": "kpi_cp",
        "type": "mindmap",
        "position": { "x": -420, "y": -1180 },
        "data": {
          "label": "Capabilidade Cp/Cpk",
          "nodeType": "kpis",
          "category": "kpis",
          "numberCode": "7.1"
        }
      },
      {
        "id": "kpi_rebarba",
        "type": "mindmap",
        "position": { "x": 0, "y": -1280 },
        "data": {
          "label": "Índice de Rebarba",
          "nodeType": "kpis",
          "category": "kpis",
          "numberCode": "7.2"
        }
      },
      {
        "id": "kpi_nok",
        "type": "mindmap",
        "position": { "x": 420, "y": -1180 },
        "data": {
          "label": "PPM Não Conformidade",
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
        "id": "e-inputs-in_perfil",
        "source": "inputs",
        "target": "in_perfil",
        "style": {
          "stroke": "#334155",
          "strokeWidth": 1.5,
          "strokeDasharray": 4
        }
      },
      {
        "id": "e-inputs-in_cnc",
        "source": "inputs",
        "target": "in_cnc",
        "style": {
          "stroke": "#334155",
          "strokeWidth": 1.5,
          "strokeDasharray": 4
        }
      },
      {
        "id": "e-resources-res_fom",
        "source": "resources",
        "target": "res_fom",
        "style": {
          "stroke": "#334155",
          "strokeWidth": 1.5,
          "strokeDasharray": 4
        }
      },
      {
        "id": "e-resources-res_tool",
        "source": "resources",
        "target": "res_tool",
        "style": {
          "stroke": "#334155",
          "strokeWidth": 1.5,
          "strokeDasharray": 4
        }
      },
      {
        "id": "e-resources-res_metrology",
        "source": "resources",
        "target": "res_metrology",
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
        "id": "e-methods-met_drain",
        "source": "methods",
        "target": "met_drain",
        "style": {
          "stroke": "#334155",
          "strokeWidth": 1.5,
          "strokeDasharray": 4
        }
      },
      {
        "id": "e-methods-met_100",
        "source": "methods",
        "target": "met_100",
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
        "id": "e-kpis-kpi_rebarba",
        "source": "kpis",
        "target": "kpi_rebarba",
        "style": {
          "stroke": "#334155",
          "strokeWidth": 1.5,
          "strokeDasharray": 4
        }
      },
      {
        "id": "e-kpis-kpi_nok",
        "source": "kpis",
        "target": "kpi_nok",
        "style": {
          "stroke": "#334155",
          "strokeWidth": 1.5,
          "strokeDasharray": 4
        }
      }
    ]'::jsonb,
    '{
      "root": {
        "analyticalDetails": "Padronizar a usinagem de perfis EXP em barras de 5 metros utilizando centro de usinagem CNC FOM Industrie para execução de furos, drenos e usinagens críticas com alta precisão dimensional e rastreabilidade total. Requisitos técnicos: Usinagem CNC automatizada, Controle dimensional rigoroso, Execução de furos e drenos críticos, Fixação pneumática estável, Controle de vibração e temperatura, Validação contínua do setup. Requisitos de segurança: Uso obrigatório de EPI, Bloqueio durante setup, Não acessar área de movimento CNC, Parada imediata em ruído anormal. Desvios podem causar infiltração, falha de montagem, retrabalho, sucata e reclamações de cliente automotivo/exportação. Garante repetibilidade dimensional, alinhamento de furos e conformidade funcional dos drenos. Operação contínua. Responsável: Produção, Qualidade e Engenharia de Processo.",
        "actionsAndEvidence": [
          {"action": "Monitorar processo CNC", "evidence": "Logs da máquina FOM", "frequency": "Contínuo"},
          {"action": "Registrar produção", "evidence": "Apontamento MES", "frequency": "Contínuo"}
        ]
      },
      "inputs": {
        "analyticalDetails": "Garantir que materiais, programas e desenhos estejam corretos antes da usinagem. Requisitos técnicos: Perfil correto, Desenho validado, Programa CNC atualizado, Plano de controle aprovado. Erro de usinagem e perda de rastreabilidade. Evita produção NOK.",
        "actionsAndEvidence": [
          {"action": "Conferir documentação", "evidence": "Checklist digital", "frequency": "Por setup"}
        ]
      },
      "in_perfil": {
        "analyticalDetails": "Garantir perfil correto para usinagem. Requisitos técnicos: Sem empenamento, Sem avarias, Etiqueta legível, Liga correta. Erro dimensional e montagem incorreta. Estabilidade da usinagem.",
        "actionsAndEvidence": [
          {"action": "Validar perfil", "evidence": "Leitura código barras", "frequency": "Por barra"}
        ]
      },
      "in_cnc": {
        "analyticalDetails": "Garantir programa correto para furos e drenos. Requisitos técnicos: Offsets atualizados, Ferramentas corretas, Sequência validada. Furos deslocados e drenos incorretos. Precisão do processo.",
        "actionsAndEvidence": [
          {"action": "Validar CNC", "evidence": "Print tela máquina", "frequency": "Por setup"}
        ]
      },
      "resources": {
        "analyticalDetails": "Disponibilizar equipamentos e instrumentos adequados para usinagem crítica. Variação dimensional e falha funcional. Maior estabilidade operacional.",
        "actionsAndEvidence": [
          {"action": "Liberar máquina", "evidence": "Checklist setup", "frequency": "Diário"}
        ]
      },
      "res_fom": {
        "analyticalDetails": "Executar furos, drenos e usinagens automáticas com alta repetibilidade. Requisitos técnicos: Fixação pneumática, Controle multi-eixos, Lubrificação automática, Ferramentas calibradas. Desalinhamento e falhas funcionais. Precisão repetitiva do processo.",
        "actionsAndEvidence": [
          {"action": "Inspecionar máquina", "evidence": "Checklist eletrônico", "frequency": "Diário"}
        ]
      },
      "res_tool": {
        "analyticalDetails": "Garantir integridade das ferramentas CNC. Requisitos técnicos: Brocas íntegras, Fresas afiadas, Sem desgaste excessivo. Rebarba e desvio dimensional. Acabamento e precisão.",
        "actionsAndEvidence": [
          {"action": "Validar desgaste", "evidence": "Foto ferramenta", "frequency": "Por troca"}
        ]
      },
      "res_metrology": {
        "analyticalDetails": "Garantir medições confiáveis. Requisitos técnicos: Paquímetro calibrado, Gabaritos aprovados, Etiqueta válida. Liberação incorreta. Controle dimensional robusto.",
        "actionsAndEvidence": [
          {"action": "Validar calibração", "evidence": "Etiqueta INMETRO", "frequency": "Mensal"}
        ]
      },
      "people": {
        "analyticalDetails": "Definir responsabilidades críticas da usinagem. Falha operacional. Padronização da operação.",
        "actionsAndEvidence": [
          {"action": "Registrar operador", "evidence": "Login operador", "frequency": "Por turno"}
        ]
      },
      "pe_operador": {
        "analyticalDetails": "Executar usinagem conforme plano de controle. Requisitos técnicos: Treinamento FOM, Leitura de desenho, Conhecimento de tolerâncias. Erro operacional. Estabilidade do processo.",
        "actionsAndEvidence": [
          {"action": "Validar treinamento", "evidence": "Registro RH", "frequency": "Anual"}
        ]
      },
      "methods": {
        "analyticalDetails": "Padronizar execução da usinagem crítica. Falhas funcionais. Precisão e repetibilidade.",
        "actionsAndEvidence": [
          {"action": "Auditar operação", "evidence": "Checklist auditoria", "frequency": "Semanal"}
        ]
      },
      "met_setup": {
        "analyticalDetails": "Garantir estabilidade dimensional antes da produção. Requisitos técnicos: Fixação correta, Validar offsets, Testar ferramentas, Executar peça piloto. Furos deslocados e medidas incorretas. Controle inicial do processo.",
        "actionsAndEvidence": [
          {"action": "Liberar setup", "evidence": "Aprovação qualidade", "frequency": "Por setup"},
          {"action": "Executar peça piloto", "evidence": "Relatório dimensional", "frequency": "Por setup"}
        ]
      },
      "met_drain": {
        "analyticalDetails": "Executar usinagens críticas conforme desenho EXP. Requisitos técnicos: Posicionamento exato, Profundidade correta, Sem rebarba, Controle de alinhamento. Falha de drenagem e montagem. Conformidade funcional.",
        "actionsAndEvidence": [
          {"action": "Validar drenos", "evidence": "Foto usinagem", "frequency": "Por peça"},
          {"action": "Registrar produção", "evidence": "Log CNC", "frequency": "Contínuo"}
        ]
      },
      "met_100": {
        "analyticalDetails": "Garantir conformidade total das cotas críticas. Requisitos técnicos: Medir todos os furos, Validar posição dos drenos, Registrar medidas. Peça NOK enviada ao cliente. Garantia dimensional total.",
        "actionsAndEvidence": [
          {"action": "Registrar medições", "evidence": "Planilha inspeção", "frequency": "Por peça"},
          {"action": "Anexar fotos", "evidence": "Foto paquímetro", "frequency": "Por peça"}
        ]
      },
      "met_nok": {
        "analyticalDetails": "Bloquear imediatamente peças fora de especificação. Requisitos técnicos: Segregar lote, Identificar NOK, Abrir ocorrência. Mistura de peças conformes e NOK. Proteção do cliente.",
        "actionsAndEvidence": [
          {"action": "Abrir NCR", "evidence": "Relatório qualidade", "frequency": "Quando necessário"}
        ]
      },
      "outputs": {
        "analyticalDetails": "Garantir liberação apenas de peças conformes. Cliente receber peça NOK. Confiabilidade total do processo.",
        "actionsAndEvidence": [
          {"action": "Liberar lote", "evidence": "Etiqueta aprovado", "frequency": "Por lote"}
        ]
      },
      "out_ok": {
        "analyticalDetails": "Disponibilizar peças conformes para montagem. Garantia funcional e dimensional.",
        "actionsAndEvidence": [
          {"action": "Liberar produção", "evidence": "Etiqueta aprovado", "frequency": "Por lote"}
        ]
      },
      "kpis": {
        "analyticalDetails": "Monitorar estabilidade e performance da usinagem. Melhoria contínua.",
        "actionsAndEvidence": [
          {"action": "Atualizar dashboard", "evidence": "Indicadores MES", "frequency": "Semanal"}
        ]
      },
      "kpi_cp": {
        "analyticalDetails": "Avaliar estabilidade dimensional do processo. Controle estatístico robusto.",
        "actionsAndEvidence": [
          {"action": "Atualizar CEP", "evidence": "Gráfico controle", "frequency": "Mensal"}
        ]
      },
      "kpi_rebarba": {
        "analyticalDetails": "Monitorar acabamento da usinagem. Melhor acabamento funcional.",
        "actionsAndEvidence": [
          {"action": "Registrar defeitos", "evidence": "Relatório qualidade", "frequency": "Mensal"}
        ]
      },
      "kpi_nok": {
        "analyticalDetails": "Monitorar falhas críticas. Redução de reclamações.",
        "actionsAndEvidence": [
          {"action": "Analisar ocorrências", "evidence": "Dashboard qualidade", "frequency": "Mensal"}
        ]
      }
    }'::jsonb,
    v_user_id::uuid,
    NOW(),
    'published'
  );

  RAISE NOTICE 'Usinagem EXP FOM template inserted successfully';
END $$;
