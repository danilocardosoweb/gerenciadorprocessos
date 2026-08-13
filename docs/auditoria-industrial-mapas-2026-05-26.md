# Auditoria Industrial dos Mapas de Processo

Data da revisao: 26/05/2026

Escopo: mapas cadastrados em `process_items`, incluindo estrutura de nos, conexoes, detalhes analiticos e tarefas operacionais.

Observacao: esta auditoria nao alterou dados no banco. O objetivo foi identificar falhas tecnicas, didaticas e hierarquicas antes de aplicar correcao definitiva.

## Diagnostico Geral

A base possui conteudo operacional relevante, mas parte dos mapas foi contaminada por reaproveitamento de texto entre temas. O principal risco nao esta apenas no layout visual: alguns processos trazem instrucoes de serra dentro de paquimetro, montagem de paletes e usinagem, o que reduz confianca tecnica para operador e auditoria.

Tambem ha excesso de filhos diretos em alguns pais, principalmente raiz e metodos. Isso deixa a arvore vertical, poluida e menos didatica. A numeracao pai-filho esta tecnicamente consistente, mas a distribuicao de conteudo ainda precisa ser reagrupada em camadas mais industriais.

## Score por Mapa

| Mapa | Estrutura | Clareza | Tecnica | Padronizacao | Usabilidade |
|---|---:|---:|---:|---:|---:|
| Montagem de Paletes para Exportacao | 78 | 74 | 76 | 70 | 70 |
| Montagem de Paletes Tramontina | 66 | 60 | 68 | 55 | 58 |
| Serra Doppia 2 Cabecas | 58 | 55 | 70 | 52 | 57 |
| Serra Emmegi Automatica 1 Cabeca | 62 | 58 | 72 | 55 | 55 |
| Usinagem EXP - FOM Industrie CNC | 77 | 73 | 76 | 70 | 70 |
| Uso de Paquimetros 150 mm e 300 mm | 65 | 62 | 72 | 58 | 60 |
| Procedimento Operacional Usinagem | 70 | 66 | 75 | 68 | 62 |

## Problemas Encontrados

| Item | Problema | Impacto | Correcao sugerida |
|---|---|---|---|
| Conteudo cruzado entre temas | Textos de serra aparecem em Paquimetro, Paletes e FOM. Exemplos: lubrificacao de duas cabecas, escolher serra correta, identificar serra em uso. | Operador pode seguir orientacao errada; risco de nao conformidade documental. | Remover conteudo herdado e substituir por acao especifica do processo real. |
| Nos sem detalhe operacional | Paquimetro tem 38 nos sem detalhes; Doppia tem 39; Tramontina tem 5. | Modo operador fica pobre e sem valor de treinamento. | Cada no deve ter objetivo, como executar, criterio OK/NOK, registro esperado e acao em caso de desvio. |
| Tarefas ausentes | Serra Doppia tem muitos nos com descricao mas sem tarefas; Emmegi tem 23 nos fracos ou sem tarefas. | Operador le, mas nao sabe exatamente o que fazer. | Criar checklist pratico por no, com verbos de acao: conferir, posicionar, medir, registrar, segregar, comunicar. |
| Duplicidade de instrucoes | Repeticoes como "Ler integralmente a OP", "Colocar oculos", "Contar pecas refugadas", "Identificar lote" aparecem em varios pontos. | Polui o mapa, aumenta tempo de leitura e reduz clareza. | Consolidar repeticoes em uma etapa unica e referenciar somente quando necessario. |
| Titulos pobres ou abreviados | Exemplos: `Saf`, `Peo`, `Qua`, `Nc`, `Ok`, `Op`, `Draw`, `Paqui150`, `Paqui300`. | Nao e linguagem profissional para chao de fabrica. | Reescrever para nomes completos: Seguranca, Pessoas, Qualidade, Nao conformidade, Ordem de Producao, Desenho tecnico. |
| Excesso de filhos em um mesmo pai | Alguns mapas chegam a 20 filhos diretos na raiz ou em metodos. | Gera arvore longa, dificil de navegar e visualmente confusa. | Reagrupar em: Entradas, Seguranca, Recursos, Preparacao, Execucao, Inspecao, Registros, Saidas e Indicadores. |
| Criterios OK/NOK incompletos | Varias saidas e inspecoes nao deixam claro o limite de aceitacao. | Pode haver decisao subjetiva do operador. | Toda inspecao deve ter: caracteristica, instrumento, frequencia, tolerancia, criterio OK/NOK e acao quando NOK. |
| Linguagem generica | Frases como "garante qualidade", "validar processo", "executar conforme procedimento" aparecem sem criterio operacional. | Parece texto artificial e nao instrucao de trabalho. | Trocar por acao mensuravel: medir comprimento com paquimetro, comparar com desenho vigente, registrar no checklist. |
| Hierarquia pouco didatica | A numeracao esta coerente, mas a estrutura agrupa muitos itens no mesmo nivel. | O mapa nao guia o operador em ordem natural de trabalho. | Converter para camadas: processo > macroetapa > atividade > detalhe/checkpoint. |

## Diagnostico por Mapa

### Montagem de Paletes para Exportacao

Pontos fortes: estrutura numerica consistente, poucas duplicidades, boa base para transformacao em instrucao.

Problemas principais: 3 nos sem detalhe (`Saf`, `Peo`, `Qua`) e textos herdados de serra em recursos/metodos. O mapa deve focar palete, cintamento, protecao, identificacao, conferencia de lote e requisitos de exportacao.

Correcao tecnica recomendada: separar montagem fisica, protecao do perfil, identificacao, conferencia final e liberacao para expedicao.

### Montagem de Paletes Tramontina

Pontos fortes: contem varias atividades reais de montagem, embalagem e identificacao.

Problemas principais: repeticoes de lote, oculos, cintas, filme e sarrafos. Tambem existem nos sem tarefas e grupos abreviados (`Qua`, `Ppl`, `Qlty`, `Saf`).

Correcao tecnica recomendada: consolidar repeticoes e criar uma sequencia unica: preparar base, separar perfis, montar camadas, proteger extremidades, aplicar cintas/filme, identificar lote, liberar.

### Serra Doppia 2 Cabecas

Pontos fortes: possui quantidade grande de conteudo tecnico e cobre OP, desenho, setup, corte, qualidade e indicadores.

Problemas principais: 39 nos sem detalhe, muitas tarefas ausentes e conteudo duplicado. Ha mistura de Serra Emmegi e Doppia em algumas descricoes. Para Doppia, o foco deve ser corte angular/simultaneo, esquadro, batentes, duas cabecas, sincronismo e validacao da primeira peca.

Correcao tecnica recomendada: separar claramente `Preparacao da maquina`, `Setup de angulo/comprimento`, `Primeira peca`, `Producao`, `Inspecao`, `NOK/Refugo` e `Registros`.

### Serra Emmegi Automatica 1 Cabeca

Pontos fortes: mapa completo em quantidade de nos.

Problemas principais: excesso de filhos diretos na raiz e em metodos; varias repeticoes de OP, EPIs e leitura de desenho. Tambem ha descricao fraca em grupos estruturais (`Inputs`, `Resources`, `People`, `Outputs`).

Correcao tecnica recomendada: remover repeticoes, transformar `Inputs/Resources/People` em titulos industriais em portugues e concentrar a instrucao no fluxo: OP > desenho > material > setup > primeira peca > producao > inspecao > registro.

### Usinagem EXP - FOM Industrie CNC

Pontos fortes: boa base de estrutura, poucos itens sem detalhe.

Problemas principais: ainda contem instrucoes de serra e lubrificacao de serras, que nao devem estar em uma instrucao de centro CNC FOM. Falta reforcar zero peca, fixacao, programa CNC, ferramentas, primeira peca e controle dimensional.

Correcao tecnica recomendada: reescrever metodos para CNC: selecionar programa, conferir dispositivo, fixar perfil, referenciar maquina, executar peca piloto, medir cotas criticas, liberar producao.

### Uso de Paquimetros 150 mm e 300 mm

Pontos fortes: tema correto e importante para inspecao dimensional.

Problemas principais: 38 nos sem detalhe, duplicidade de Paqui150/Paqui300, conteudo de serra/CNC misturado e ausencia de plano claro de amostragem por lote. O tema deve ser exclusivamente metrologia aplicada a perfis de aluminio e pecas acabadas.

Correcao tecnica recomendada: dividir por medicao externa, interna, profundidade, degrau, zeragem, conservacao, escolha 150/300 mm, erro de paralaxe, pressao de contato, registro e amostragem conforme plano definido.

### Procedimento Operacional Usinagem

Pontos fortes: nao tem nos sem detalhes e nao tem duplicidades relevantes.

Problemas principais: raiz com 20 filhos diretos; conteudo esta mais parecido com lista do que com procedimento hierarquico.

Correcao tecnica recomendada: transformar em procedimento guarda-chuva: PCP e documentos, recursos, seguranca, setup, execucao, inspecao, tratamento de desvio, registros e indicadores.

## Padrao Revisado Recomendado

Para todos os mapas, usar esta hierarquia base:

```text
1.0 Nome do processo
2.0 Entradas e requisitos
  2.1 OP / plano de producao
  2.2 Desenho tecnico vigente
  2.3 Material / perfil / lote
3.0 Seguranca operacional
  3.1 EPIs obrigatorios
  3.2 Condicoes de maquina e posto
4.0 Recursos
  4.1 Equipamento principal
  4.2 Ferramentas e instrumentos
  4.3 Dispositivos, gabaritos e registros
5.0 Preparacao
  5.1 Conferir documentos
  5.2 Preparar maquina/posto
  5.3 Validar primeira peca ou primeira montagem
6.0 Execucao
  6.1 Executar operacao padrao
  6.2 Monitorar pontos criticos
  6.3 Registrar producao
7.0 Inspecao e criterios OK/NOK
  7.1 Caracteristicas criticas
  7.2 Frequencia de inspecao
  7.3 Acao para desvio
8.0 Saidas
  8.1 Produto aprovado
  8.2 Produto segregado
  8.3 Registro preenchido
9.0 Indicadores
  9.1 Refugo
  9.2 Retrabalho
  9.3 Produtividade
  9.4 Conformidade dimensional
```

## Exemplo de Reescrita Profissional

Antes:

```text
Identificar serra em uso e seguir procedimento especifico.
```

Depois:

```text
Confirmar no roteiro da OP qual equipamento deve ser utilizado. Conferir se o codigo do programa, o desenho vigente e o dispositivo de apoio correspondem ao produto antes de liberar o inicio da operacao.
```

Antes:

```text
Validar processo.
```

Depois:

```text
Executar a primeira peca, medir as cotas criticas indicadas no desenho, registrar o resultado e liberar a producao somente quando todas as medidas estiverem dentro da tolerancia especificada.
```

Antes:

```text
Peças aprovadas.
```

Depois:

```text
Pecas aprovadas sao aquelas identificadas com lote/OP, sem avarias visuais e com todas as caracteristicas criticas dentro da tolerancia do desenho vigente. Devem seguir para a proxima etapa somente apos registro da inspecao.
```

## Proxima Acao Recomendada

Prioridade 1: limpar conteudo cruzado entre temas.

Prioridade 2: preencher detalhes e tarefas dos nos vazios.

Prioridade 3: consolidar duplicidades.

Prioridade 4: reorganizar mapas com mais de 8 filhos diretos no mesmo pai.

Prioridade 5: aplicar criterio OK/NOK em todas as inspecoes e saidas.

