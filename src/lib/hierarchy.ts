type HierarchyToken =
  | { kind: 'number'; raw: string; value: number }
  | { kind: 'alpha'; raw: string; value: number }
  | { kind: 'text'; raw: string; value: string };

export type HierarchyNumberingMode = 'numeric' | 'alpha' | 'manual';

function isNumericToken(value: string) {
  return /^\d+$/.test(value);
}

function isAlphaToken(value: string) {
  return /^[A-Za-z]+$/.test(value);
}

function alphaToNumber(value: string) {
  return value
    .toUpperCase()
    .split('')
    .reduce((sum, char) => sum * 26 + (char.charCodeAt(0) - 64), 0);
}

function numberToAlpha(value: number) {
  if (value <= 0) return 'A';

  let current = value;
  let result = '';

  while (current > 0) {
    const remainder = (current - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    current = Math.floor((current - 1) / 26);
  }

  return result;
}

function toHierarchyToken(rawToken: string): HierarchyToken {
  const token = String(rawToken || '').trim();

  if (isNumericToken(token)) {
    return {
      kind: 'number',
      raw: token,
      value: Number(token),
    };
  }

  if (isAlphaToken(token)) {
    return {
      kind: 'alpha',
      raw: token.toUpperCase(),
      value: alphaToNumber(token),
    };
  }

  return {
    kind: 'text',
    raw: token,
    value: token.toUpperCase(),
  };
}

function tokenKindWeight(token: HierarchyToken) {
  if (token.kind === 'number') return 0;
  if (token.kind === 'alpha') return 1;
  return 2;
}

export function splitHierarchyCode(code: string): string[] {
  return String(code || '')
    .split('.')
    .map((part) => part.trim())
    .filter(Boolean);
}

export function parseHierarchyCode(code: string): HierarchyToken[] {
  return splitHierarchyCode(code).map(toHierarchyToken);
}

export function compareHierarchyCodes(a: string, b: string) {
  const partsA = parseHierarchyCode(a);
  const partsB = parseHierarchyCode(b);
  const max = Math.max(partsA.length, partsB.length);

  for (let index = 0; index < max; index += 1) {
    const partA = partsA[index];
    const partB = partsB[index];

    if (!partA && !partB) break;
    if (!partA) return -1;
    if (!partB) return 1;

    const kindDelta = tokenKindWeight(partA) - tokenKindWeight(partB);
    if (kindDelta !== 0) return kindDelta;

    if (partA.value !== partB.value) {
      return partA.value > partB.value ? 1 : -1;
    }
  }

  return String(a || '').localeCompare(String(b || ''), undefined, {
    numeric: true,
    sensitivity: 'base',
  });
}

export function getHierarchyDepth(code: string) {
  const parts = splitHierarchyCode(code);
  if (!parts.length) return 0;
  if (parts.length === 2 && parts[0] === '1' && parts[1] === '0') return 0;
  if (parts.length === 1) return 1;
  if (parts.length === 2) return parts[1] === '0' ? 1 : 2;
  return parts.length;
}

export function getParentHierarchyCandidates(code: string) {
  const parts = splitHierarchyCode(code);
  if (parts.length <= 1) return [];

  const candidates: string[] = [];

  for (let index = parts.length - 1; index >= 2; index -= 1) {
    candidates.push(parts.slice(0, index).join('.'));
  }

  if (parts.length >= 2 && parts[1] !== '0') {
    candidates.push(`${parts[0]}.0`);
  }

  return Array.from(new Set(candidates));
}

function getDirectChildSuffixes(parentCode: string, siblingCodes: string[]) {
  const parentParts = splitHierarchyCode(parentCode);

  return siblingCodes
    .map((code) => splitHierarchyCode(code))
    .filter((parts) => {
      if (parts.length !== parentParts.length + 1) return false;
      return parentParts.every((part, index) => parts[index] === part);
    })
    .map((parts) => parts[parts.length - 1]);
}

export function getNextHierarchyCode(
  parentCode: string,
  siblingCodes: string[],
  mode: Exclude<HierarchyNumberingMode, 'manual'> = 'numeric',
) {
  const normalizedParent = String(parentCode || '1.0').trim() || '1.0';
  const parentParts = splitHierarchyCode(normalizedParent);

  if (normalizedParent === '1.0' || (parentParts.length === 2 && parentParts[1] === '0' && parentParts[0] === '1')) {
    const topLevelValues = siblingCodes
      .map((code) => splitHierarchyCode(code))
      .filter((parts) => parts.length >= 2 && parts[1] === '0' && isNumericToken(parts[0]))
      .map((parts) => Number(parts[0]));
    const nextMajor = (topLevelValues.length ? Math.max(...topLevelValues) : 1) + 1;
    return `${nextMajor}.0`;
  }

  if (parentParts.length === 2 && parentParts[1] === '0') {
    const childValues = getDirectChildSuffixes(normalizedParent, siblingCodes)
      .filter(isNumericToken)
      .map((token) => Number(token));
    const nextNumber = (childValues.length ? Math.max(...childValues) : 0) + 1;
    return `${parentParts[0]}.${nextNumber}`;
  }

  const directSuffixes = getDirectChildSuffixes(normalizedParent, siblingCodes);

  if (mode === 'alpha') {
    const alphaValues = directSuffixes
      .filter(isAlphaToken)
      .map((token) => alphaToNumber(token));
    const nextAlpha = (alphaValues.length ? Math.max(...alphaValues) : 0) + 1;
    return `${normalizedParent}.${numberToAlpha(nextAlpha)}`;
  }

  const numericValues = directSuffixes
    .filter(isNumericToken)
    .map((token) => Number(token));
  const nextNumber = (numericValues.length ? Math.max(...numericValues) : 0) + 1;
  return `${normalizedParent}.${nextNumber}`;
}
