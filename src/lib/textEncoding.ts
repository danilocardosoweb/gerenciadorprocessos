const WINDOWS_1252_BYTES: Record<number, number> = {
  0x20ac: 0x80,
  0x201a: 0x82,
  0x0192: 0x83,
  0x201e: 0x84,
  0x2026: 0x85,
  0x2020: 0x86,
  0x2021: 0x87,
  0x02c6: 0x88,
  0x2030: 0x89,
  0x0160: 0x8a,
  0x2039: 0x8b,
  0x0152: 0x8c,
  0x017d: 0x8e,
  0x2018: 0x91,
  0x2019: 0x92,
  0x201c: 0x93,
  0x201d: 0x94,
  0x2022: 0x95,
  0x2013: 0x96,
  0x2014: 0x97,
  0x02dc: 0x98,
  0x2122: 0x99,
  0x0161: 0x9a,
  0x203a: 0x9b,
  0x0153: 0x9c,
  0x017e: 0x9e,
  0x0178: 0x9f,
};

const MOJIBAKE_MARKERS = /(?:Ã[\u0080-\u00bf]|Â[\u0080-\u00bf]|â[\u0080-\u00bf\u0152\u0153\u0160\u0161\u0178\u017d\u017e\u0192\u02c6\u02dc\u2013\u2014\u2018\u2019\u201a\u201c\u201d\u201e\u2020\u2021\u2022\u2026\u2030\u2039\u203a\u20ac\u2122]|ï¿½|\uFFFD)/;

const badTextScore = (value: string) => {
  const matches = value.match(/(?:Ã[\u0080-\u00bf]|Â[\u0080-\u00bf]|â[\u0080-\u00bf\u0152\u0153\u0160\u0161\u0178\u017d\u017e\u0192\u02c6\u02dc\u2013\u2014\u2018\u2019\u201a\u201c\u201d\u201e\u2020\u2021\u2022\u2026\u2030\u2039\u203a\u20ac\u2122]|ï¿½|\uFFFD)/g);
  return matches?.length || 0;
};

const decodeWindows1252AsUtf8 = (value: string) => {
  const bytes: number[] = [];

  for (const character of value) {
    const code = character.codePointAt(0) || 0;
    if (code <= 0xff) {
      bytes.push(code);
    } else if (WINDOWS_1252_BYTES[code] !== undefined) {
      bytes.push(WINDOWS_1252_BYTES[code]);
    } else {
      return value;
    }
  }

  return new TextDecoder('utf-8', { fatal: false }).decode(Uint8Array.from(bytes));
};

/** Repairs UTF-8 text that was previously decoded as Windows-1252. */
export const repairMojibake = (value: string) => {
  if (!value || !MOJIBAKE_MARKERS.test(value)) return value || '';

  let current = value;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const decoded = decodeWindows1252AsUtf8(current);
    if (decoded === current || badTextScore(decoded) >= badTextScore(current)) break;
    current = decoded;
  }

  return current;
};

export const toCleanText = (value: unknown) =>
  typeof value === 'string' ? repairMojibake(value).trim() : '';
