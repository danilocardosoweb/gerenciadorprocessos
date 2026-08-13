import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const ROOT = process.cwd();
const SOURCE_ROOT = join(ROOT, 'src');
const ALLOWED_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.html', '.md']);
const IGNORED_FILES = new Set([join(SOURCE_ROOT, 'lib', 'textEncoding.ts')]);

const mojibakePattern = /(?:Ã[\u0080-\u00bf]|Â[\u0080-\u00bf]|â[\u0080-\u00bf\u0152\u0153\u0160\u0161\u0178\u017d\u017e\u0192\u02c6\u02dc\u2013\u2014\u2018\u2019\u201a\u201c\u201d\u201e\u2020\u2021\u2022\u2026\u2030\u2039\u203a\u20ac\u2122]|ï¿½|\uFFFD)/;
const knownBrokenWords = /(?<![\p{L}\p{N}_])(?:Faa|Usurio|Usurios|Voc|questes|administrao|instalao|produo|aprovao|inspeo|padro|Tolerncia|tolerncia|vedao|legvel|configurao|permisso|permisses|visualizao|edio|alteraes|notificaes|disponveis|reviso|conteno|histrico|verses|tcnico|tcnicos|crtico|crticos|alumnio|paqumetro|paqumetros|pea|peas|medio|medies|especificao|especificaes|referncia|referncias|frequncia|sequncia|mquina|lmina|cdigo|documentao|liberao|expedio|rastrevel)(?![\p{L}\p{N}_])/u;
const lostAccentPattern = /[\p{L}\p{N}_]+\?+[\p{L}\p{N}_]+/u;

const walk = (directory) => readdirSync(directory).flatMap((entry) => {
  const path = join(directory, entry);
  return statSync(path).isDirectory() ? walk(path) : [path];
});

const issues = [];

for (const file of walk(SOURCE_ROOT)) {
  if (!ALLOWED_EXTENSIONS.has(extname(file)) || IGNORED_FILES.has(file)) continue;

  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, index) => {
    const isUrl = /https?:\/\//.test(line);
    if (!mojibakePattern.test(line) && !knownBrokenWords.test(line) && (isUrl || !lostAccentPattern.test(line))) return;
    issues.push(`${relative(ROOT, file)}:${index + 1}  ${line.trim().slice(0, 180)}`);
  });
}

if (issues.length > 0) {
  console.error('Foram encontrados textos com codificação ou ortografia corrompida:\n');
  console.error(issues.join('\n'));
  console.error('\nCorrija os textos antes de compilar o aplicativo.');
  process.exit(1);
}

console.log('Verificação de textos concluída sem problemas.');
