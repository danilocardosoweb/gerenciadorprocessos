import { NodeDetails } from '../components/NodeModal';

const task = (id: string, text: string): NodeDetails['tasks'][number] => ({
  id,
  text,
  completed: false,
});

export const paquimetro150300NodeDetails: Record<string, NodeDetails> = {
  root: {
    description: `Padronizar o uso de paquímetros de 150 mm e 300 mm na usinagem de perfis de alumínio e peças acabadas, garantindo leitura correta, decisão objetiva de aprovação e rastreabilidade da inspeção. O foco do mapa  orientar a seleção do instrumento, o método de medição e o registro da evidncia dimensional conforme a lógica de amostragem da NBR 5426 S3.`,
    images: [],
    tasks: [
      task('root-1', 'Definir o instrumento adequado para cada faixa de medida'),
      task('root-2', 'Registrar a evidência dimensional do lote'),
    ],
  },
  inputs: {
    description: `As entradas precisam estar coerentes antes da medição: desenho técnico vigente, ordem de produção, peça usinada ou acabada, tolerncias definidas e instrumento calibrado. Sem essas referências, a leitura perde valor técnico e a decisão de conformidade fica insegura.`,
    images: [],
    tasks: [
      task('inputs-1', 'Conferir revisão do desenho e das cotas crticas'),
      task('inputs-2', 'Separar a peça correta e o lote correto para inspeção'),
      task('inputs-3', 'Validar a calibração do paquímetro antes de medir'),
    ],
  },
  in_perfil: {
    description: `Perfis de alumínio devem ser avaliados nas dimensões funcionais que afetam montagem, encaixe e acabamento. A peça precisa estar limpa, sem rebarbas excessivas, sem deformao visvel e com a face de referência identificada para evitar erro de leitura.`,
    images: [],
    tasks: [
      task('in-perfil-1', 'Verificar empeno, amassado ou rebarba que afete a leitura'),
      task('in-perfil-2', 'Definir a face de referência antes de medir'),
      task('in-perfil-3', 'Conferir largura, altura e espessuras críticas do perfil'),
    ],
  },
  in_peca: {
    description: `Peas acabadas precisam ser inspecionadas antes da liberação final para validar dimensões, furao, distncias entre usinagens e condição superficial. O objetivo  impedir que um item fora de tolerância siga para montagem, embalagem ou expedição.`,
    images: [],
    tasks: [
      task('in-peca-1', 'Confirmar a identificação da peça e do lote'),
      task('in-peca-2', 'Inspecionar faces usinadas e regiões críticas'),
      task('in-peca-3', 'Registrar qualquer desvio observado na peça final'),
    ],
  },
  in_paqui150: {
    description: `O paquímetro de 150 mm é indicado para medidas curtas, acessos restritos e situações em que a ergonomia da leitura importa mais. Ele tende a ser a melhor escolha para cotas pequenas, medições repetitivas e regiões com pouco espaço físico.`,
    images: [],
    tasks: [
      task('in-paqui150-1', 'Usar em medidas curtas e em regiões de acesso reduzido'),
      task('in-paqui150-2', 'Checar se a abertura cobre a dimenso requerida'),
      task('in-paqui150-3', 'Confirmar zero e limpeza antes da leitura'),
    ],
  },
  in_paqui300: {
    description: `O paquímetro de 300 mm deve ser usado quando a dimenso excede a capacidade prtica do modelo de 150 mm ou quando a peça  maior e exige maior alcance de mandbula. Ele amplia a faixa de medição sem perder a lógica de conferência bsica do instrumento.`,
    images: [],
    tasks: [
      task('in-paqui300-1', 'Escolher o instrumento quando a dimenso ultrapassar o 150 mm'),
      task('in-paqui300-2', 'Garantir apoio firme durante a leitura'),
      task('in-paqui300-3', 'Evitar força excessiva sobre a peça e sobre as hastes'),
    ],
  },
  in_nbr: {
    description: `A ABNT NBR 5426 organiza a inspeção por atributos por meio de planos de amostragem. O nvel especial S3 deve ser aplicado conforme o plano definido para o lote e o NQA adotado, sempre como suporte  decisão de aceitao ou rejeição do lote, sem substituir a tolerância do desenho.`,
    images: [],
    tasks: [
      task('in-nbr-1', 'Identificar o plano de amostragem aplicável ao lote'),
      task('in-nbr-2', 'Aplicar o critrio de aceitao e rejeição correto'),
      task('in-nbr-3', 'Registrar o resultado da amostragem de forma rastreável'),
    ],
  },
  resources: {
    description: `Os recursos de inspeção devem garantir repetibilidade: paquímetros calibrados, bloco padrão para conferência, bancada limpa e estável, iluminao adequada e ficha ou sistema de registro pronto para uso. Sem esse suporte, a medição perde confiabilidade.`,
    images: [],
    tasks: [
      task('resources-1', 'Separar todos os instrumentos antes da medição'),
      task('resources-2', 'Confirmar validade da calibração e integridade do instrumento'),
      task('resources-3', 'Manter bancada limpa, estável e bem iluminada'),
    ],
  },
  res_paqui150: {
    description: `Instrumento de menor porte, ideal para medidas curtas e para pontos em que o operador precisa de resposta rpida e boa ergonomia. Tambm  o modelo mais prtico quando a peça tem geometria simples e o alcance no  um fator limitante.`,
    images: [],
    tasks: [
      task('res-paqui150-1', 'Limpar as faces de medição antes do uso'),
      task('res-paqui150-2', 'Conferir zero e folga mecnica antes da leitura'),
      task('res-paqui150-3', 'Guardar no estojo após o uso para preservar a calibração'),
    ],
  },
  res_paqui300: {
    description: `Instrumento indicado para maior alcance e medidas longas, com leitura confivel quando a dimenso da peça exige corpo maior e abertura ampliada.  a melhor escolha para perfis mais extensos, cotas maiores e reas de leitura com melhor acesso lateral.`,
    images: [],
    tasks: [
      task('res-paqui300-1', 'Usar quando a dimenso superar o alcance prtico do 150 mm'),
      task('res-paqui300-2', 'Conferir travamento, limpeza e zero antes da medição'),
      task('res-paqui300-3', 'Evitar queda, choque ou flexo das hastes'),
    ],
  },
  res_bancada: {
    description: `A bancada de medição deve ser plana, limpa e livre de vibrao para no introduzir erro de apoio ou inclinação no momento da leitura. Um suporte estável reduz variao entre operadores e melhora a confiabilidade dos registros.`,
    images: [],
    tasks: [
      task('res-bancada-1', 'Retirar cavacos, poeira e óleo da superfície'),
      task('res-bancada-2', 'Verificar estabilidade e nivelamento da bancada'),
      task('res-bancada-3', 'Manter iluminao adequada para leitura da escala'),
    ],
  },
  res_padrao: {
    description: `O bloco padrão ou referência conhecida  usado para checar zero, confirmar funcionamento e reduzir risco de erro sistemtico. Essa conferência  importante antes de liberar a inspeção de peças crticas ou lotes com maior exigncia de rastreabilidade.`,
    images: [],
    tasks: [
      task('res-padrao-1', 'Conferir zero antes de iniciar a inspeção'),
      task('res-padrao-2', 'Validar a leitura com referência conhecida'),
      task('res-padrao-3', 'Registrar qualquer desvio observado no instrumento'),
    ],
  },
  people: {
    description: `A medição confivel depende de papis claros: o operador mede, o inspetor valida a conformidade e a qualidade define critrios e tratamento de desvios. Quando isso est bem alinhado, a decisão sobre a peça fica mais consistente e rastreável.`,
    images: [],
    tasks: [
      task('people-1', 'Definir quem mede e quem libera'),
      task('people-2', 'Garantir treinamento para leitura correta do instrumento'),
      task('people-3', 'Acionar qualidade quando houver dúvida de conformidade'),
    ],
  },
  pe_operador: {
    description: `O operador executa a medição seguindo o padrão definido, sem improviso, respeitando o ponto de leitura, a pressão aplicada e a sequência do procedimento. A disciplina operacional  o que mantm a comparabilidade entre medições.`,
    images: [],
    tasks: [
      task('pe-operador-1', 'Seguir o método de medição definido no procedimento'),
      task('pe-operador-2', 'Registrar a leitura imediatamente após a medição'),
      task('pe-operador-3', 'Comunicar qualquer desvio de leitura ou dificuldade de acesso'),
    ],
  },
  pe_inspector: {
    description: `O inspetor confirma a conformidade dimensional, analisa tendência de desvio e decide se a peça, a amostra ou o lote podem seguir para a próxima etapa. Seu papel  transformar leitura em decisão de qualidade com evidncia objetiva.`,
    images: [],
    tasks: [
      task('pe-inspector-1', 'Validar medições críticas e conferir consistência'),
      task('pe-inspector-2', 'Aplicar o plano de amostragem quando for o caso'),
      task('pe-inspector-3', 'Liberar, segregar ou bloquear o lote conforme resultado'),
    ],
  },
  methods: {
    description: `A sequência correta inclui selecionar o instrumento, zerar, posicionar a peça, medir sem inclinação, comparar com o desenho e registrar a evidncia. O método precisa ser estável para que a inspeção possa sustentar a decisão de aceitao do lote.`,
    images: [],
    tasks: [
      task('methods-1', 'Seguir a ordem padrão de medição'),
      task('methods-2', 'Registrar a leitura em cada etapa'),
      task('methods-3', 'Interromper o processo quando houver divergência relevante'),
    ],
  },
  met_selecao: {
    description: `A seleção do instrumento deve considerar a dimenso da medida, o acesso  regio de leitura e o tipo de peça. O modelo de 150 mm atende medidas curtas; o de 300 mm atende medidas maiores ou peças com alcance mais exigente.`,
    images: [],
    tasks: [
      task('met-selecao-1', 'Escolher 150 mm para medidas curtas e repetitivas'),
      task('met-selecao-2', 'Escolher 300 mm para medidas longas ou de maior alcance'),
      task('met-selecao-3', 'Confirmar que o instrumento cobre toda a faixa necessária'),
      task('met-selecao-4', 'Evitar usar instrumento inadequado para a dimenso'),
    ],
  },
  met_zero: {
    description: `Antes de medir, o paquímetro deve estar limpo, sem folga aparente e com o zero conferido. Essa rotina reduz erro sistemtico e ajuda a garantir que a leitura represente a peça e no o instrumento.`,
    images: [],
    tasks: [
      task('met-zero-1', 'Limpar as faces de medição'),
      task('met-zero-2', 'Fechar o instrumento e conferir o zero'),
      task('met-zero-3', 'Verificar desgaste, folga ou dano mecnico'),
      task('met-zero-4', 'Usar bloco padrão quando aplicável'),
    ],
  },
  met_medicao: {
    description: `A leitura deve ser feita com a peça bem apoiada, sem inclinar o paquímetro e sem forar as hastes. Sempre que houver dúvida de consistncia, a medição deve ser repetida com o mesmo critrio e o mesmo ponto de referência.`,
    images: [],
    tasks: [
      task('met-medicao-1', 'Apoiar a peça na bancada antes de medir'),
      task('met-medicao-2', 'Posicionar o paquímetro perpendicularmente à superfície'),
      task('met-medicao-3', 'Repetir a leitura quando necessário'),
      task('met-medicao-4', 'Usar a mesma referência em todas as peças do lote'),
    ],
  },
  met_plano: {
    description: `O plano de amostragem por atributos define quando o lote pode ser aceito ou rejeitado. No nvel especial S3, a amostra deve seguir a tabela aplicável ao tamanho do lote e ao NQA definido, com registro claro do resultado da inspeção.`,
    images: [],
    tasks: [
      task('met-plano-1', 'Identificar o lote e o plano de amostragem'),
      task('met-plano-2', 'Selecionar a amostra conforme a tabela'),
      task('met-plano-3', 'Aplicar o critrio de aceitao e rejeição'),
      task('met-plano-4', 'Registrar o resultado da inspeção de forma rastreável'),
    ],
  },
  outputs: {
    description: `As saídas devem indicar claramente o que foi aprovado, o que foi segregado e quais registros comprovam a inspeção. Isso d rastreabilidade ao lote e evita que uma decisão incorreta seja tomada sem evidncia técnica.`,
    images: [],
    tasks: [
      task('outputs-1', 'Separar peças aprovadas e não conformes'),
      task('outputs-2', 'Emitir o registro da medição'),
      task('outputs-3', 'Informar o próximo passo do lote'),
    ],
  },
  out_aprovado: {
    description: `Peas aprovadas esto dentro da tolerância e podem seguir para montagem, embalagem ou expedição sem retrabalho. A aprovação deve ser sustentada por leitura vlida, instrumento confivel e registro completo.`,
    images: [],
    tasks: [
      task('out-aprovado-1', 'Identificar o lote liberado'),
      task('out-aprovado-2', 'Encaminhar para a próxima etapa'),
      task('out-aprovado-3', 'Manter a rastreabilidade do lote'),
    ],
  },
  out_nok: {
    description: `Peas fora de especificação devem ser segregadas, identificadas e tratadas antes de qualquer liberação. O bloqueio imediato evita mistura com material conforme e reduz o risco de envio incorreto ao cliente.`,
    images: [],
    tasks: [
      task('out-nok-1', 'Isolar a peça ou o lote'),
      task('out-nok-2', 'Abrir registro de não conformidade'),
      task('out-nok-3', 'Definir retrabalho, triagem ou sucata'),
    ],
  },
  out_relatorio: {
    description: `O relatório comprova a leitura, o resultado da amostragem e a decisão tomada. Ele funciona como evidncia para qualidade, auditoria e rastreabilidade, alm de apoiar análise de tendência e ações corretivas.`,
    images: [],
    tasks: [
      task('out-relatorio-1', 'Salvar as medidas coletadas'),
      task('out-relatorio-2', 'Anexar evidncia da inspeção'),
      task('out-relatorio-3', 'Arquivar o relatório no lote'),
    ],
  },
  kpis: {
    description: `Os indicadores devem mostrar se o método est estável, se a inspeção est sendo aplicada corretamente e se a frequência de retrabalho ou rechecagem est sob controle. Esses dados ajudam a sustentar melhoria contínua no setor.`,
    images: [],
    tasks: [
      task('kpis-1', 'Acompanhar os resultados por lote'),
      task('kpis-2', 'Identificar tendência de erro'),
      task('kpis-3', 'Atuar quando os índices piorarem'),
    ],
  },
  kpi_conformidade: {
    description: `Mede o percentual de peças que atendem s tolerncias do desenho. Quanto maior a conformidade, mais estável  o processo de medição e usinagem e menor  a chance de retrabalho ou bloqueio de lote.`,
    images: [],
    tasks: [
      task('kpi-conformidade-1', 'Calcular a taxa de aprovação'),
      task('kpi-conformidade-2', 'Comparar com a meta do processo'),
      task('kpi-conformidade-3', 'Investigar causas de desvios'),
    ],
  },
  kpi_reinspecao: {
    description: `Mostra quantas peças precisam ser medidas novamente por dúvida, falha de leitura ou inconsistncia na primeira medição. A redução desse índice indica método mais estável e instrumento mais confivel.`,
    images: [],
    tasks: [
      task('kpi-reinspecao-1', 'Registrar toda segunda medição'),
      task('kpi-reinspecao-2', 'Identificar o motivo da reinspeo'),
      task('kpi-reinspecao-3', 'Reduzir retrabalho de conferência'),
    ],
  },
  kpi_erros: {
    description: `Aponta falhas ligadas ao instrumento,  técnica de medição ou  interpretação do desenho, ajudando a evitar decisões incorretas.  um indicador importante para treinamento e padronizao da inspeção.`,
    images: [],
    tasks: [
      task('kpi-erros-1', 'Classificar o tipo de erro'),
      task('kpi-erros-2', 'Verificar o instrumento usado'),
      task('kpi-erros-3', 'Treinar a equipe quando houver recorrência'),
    ],
  },
};
