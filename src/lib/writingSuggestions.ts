import { repairMojibake } from './textEncoding';

export interface WritingSuggestion {
  value: string;
  insertText: string;
  kind: 'palavra' | 'continuação';
}

const BASE_SENTENCES = [
  'conferir a ordem de produção antes de iniciar a operação',
  'confirmar o código do produto e a quantidade programada',
  'consultar o desenho técnico vigente e verificar as tolerâncias dimensionais',
  'separar a matéria-prima conforme o lote informado na ordem de produção',
  'verificar as condições de segurança antes de ligar a máquina',
  'utilizar os equipamentos de proteção individual obrigatórios',
  'confirmar que as proteções e os dispositivos de emergência estão operantes',
  'preparar a máquina conforme os parâmetros definidos na documentação vigente',
  'carregar o programa correspondente ao item da ordem de produção',
  'realizar o primeiro corte e inspecionar as dimensões críticas',
  'medir a peça com instrumento calibrado e adequado à tolerância',
  'comparar o resultado da medição com o desenho técnico vigente',
  'registrar os resultados da inspeção e identificar o lote produzido',
  'liberar a produção somente após a aprovação da primeira peça',
  'acompanhar o processo durante a produção e repetir a inspeção na frequência definida',
  'em caso de não conformidade parar a máquina e segregar o lote',
  'identificar as peças não conformes e comunicar a qualidade',
  'corrigir o ajuste e realizar uma nova inspeção antes de liberar a produção',
  'registrar a ocorrência e manter a rastreabilidade das ações executadas',
  'paletizar o produto conforme o padrão de embalagem definido',
  'realizar a inspeção final antes de encaminhar o produto para expedição',
  'manter a área de trabalho limpa organizada e segura',
  'finalizar a ordem de produção e registrar as quantidades produzidas',
  'acionar a liderança quando houver dúvida divergência ou risco operacional',
];

const TECHNICAL_TERMS = [
  'acabamento', 'aprovação', 'auditoria', 'calibração', 'característica', 'comprimento',
  'conformidade', 'contenção', 'dimensional', 'documentação', 'emergência', 'equipamento',
  'especificação', 'evidência', 'expedição', 'frequência', 'inspeção', 'instrumento',
  'liberação', 'manutenção', 'matéria-prima', 'medição', 'não conformidade', 'operação',
  'operador', 'ordem de produção', 'paletização', 'parâmetro', 'peça', 'procedimento',
  'produção', 'programação', 'qualidade', 'rastreabilidade', 'registro', 'regulagem',
  'retrabalho', 'segregação', 'segurança', 'tolerância', 'treinamento', 'verificação',
];

const normalize = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLocaleLowerCase('pt-BR');

const cleanCorpus = (corpus: string[]) => [...BASE_SENTENCES, ...corpus]
  .map((sentence) => repairMojibake(sentence || '').replace(/\s+/g, ' ').trim())
  .filter((sentence) => sentence.length >= 4);

const currentLine = (value: string) => value.slice(Math.max(value.lastIndexOf('\n'), value.lastIndexOf('.'), value.lastIndexOf(';')) + 1);

export function getWritingSuggestions(value: string, corpus: string[], limit = 3): WritingSuggestion[] {
  const line = currentLine(value);
  const trimmedLine = line.trimStart();
  if (!trimmedLine && !value.endsWith('\n')) return [];

  const endsWithSpace = /\s$/.test(value);
  const words = trimmedLine.split(/\s+/).filter(Boolean);
  const partial = endsWithSpace ? '' : (words.at(-1) || '');
  const completedWords = partial ? words.slice(0, -1) : words;
  const previous = completedWords.at(-1) || '';
  const sentenceCorpus = cleanCorpus(corpus);
  const candidates = new Map<string, { score: number; kind: WritingSuggestion['kind'] }>();

  const addCandidate = (candidate: string, score: number, kind: WritingSuggestion['kind']) => {
    const cleanCandidate = candidate.replace(/^[,.;:\s]+|\s+/g, ' ').trim();
    if (!cleanCandidate || cleanCandidate.length < 2) return;
    const key = normalize(cleanCandidate);
    const existing = candidates.get(key);
    if (!existing || score > existing.score) candidates.set(cleanCandidate, { score, kind });
  };

  if (partial.length >= 2) {
    const normalizedPartial = normalize(partial);
    TECHNICAL_TERMS.forEach((term) => {
      if (normalize(term).startsWith(normalizedPartial) && normalize(term) !== normalizedPartial) {
        addCandidate(term, 120 - term.length, 'palavra');
      }
    });

    sentenceCorpus.forEach((sentence) => {
      sentence.split(/[^\p{L}\p{N}+-]+/u).filter(Boolean).forEach((word) => {
        if (normalize(word).startsWith(normalizedPartial) && normalize(word) !== normalizedPartial) {
          addCandidate(word, 100 - word.length, 'palavra');
        }
      });
    });
  }

  const contextWords = words.slice(-3).map(normalize);
  sentenceCorpus.forEach((sentence) => {
    const sentenceWords = sentence.split(/\s+/).filter(Boolean);
    const normalizedWords = sentenceWords.map(normalize);
    for (let contextSize = Math.min(3, contextWords.length); contextSize >= 1; contextSize -= 1) {
      const context = contextWords.slice(-contextSize);
      for (let index = 0; index <= normalizedWords.length - contextSize; index += 1) {
        if (context.every((word, offset) => normalizedWords[index + offset] === word)) {
          const continuation = sentenceWords.slice(index + contextSize, index + contextSize + 5).join(' ');
          if (continuation) addCandidate(continuation, 80 + contextSize * 20, 'continuação');
        }
      }
    }

    if (!partial && trimmedLine.length >= 4 && normalize(sentence).startsWith(normalize(trimmedLine))) {
      const continuation = sentence.slice(trimmedLine.length).trimStart();
      if (continuation) addCandidate(continuation, 150, 'continuação');
    }
  });

  if (!previous && partial.length < 2) {
    ['Conferir', 'Verificar', 'Registrar', 'Realizar', 'Confirmar'].forEach((word, index) => addCandidate(word, 50 - index, 'palavra'));
  }

  return [...candidates.entries()]
    .sort(([, a], [, b]) => b.score - a.score)
    .slice(0, limit)
    .map(([candidate, meta]) => {
      const isWordCompletion = meta.kind === 'palavra' && partial.length >= 2;
      return {
        value: candidate,
        insertText: isWordCompletion ? candidate.slice(partial.length) : `${endsWithSpace || !value ? '' : ' '}${candidate}`,
        kind: meta.kind,
      };
    });
}
