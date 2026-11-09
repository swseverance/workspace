/** A run of characters that are either all changed or all unchanged. */
export type Span = { text: string; changed: boolean };

export type DiffLine = {
  /** 1-based line number within its own text. */
  number: number;
  spans: Span[];
  /** Whether a newline follows this line. */
  newline: boolean;
};

export type DiffRow =
  | { kind: 'equal'; expected: DiffLine; actual: DiffLine }
  | { kind: 'changed'; expected: DiffLine; actual: DiffLine }
  | { kind: 'missing'; expected: DiffLine }
  | { kind: 'extra'; actual: DiffLine };

export type DiffBlock =
  { kind: 'rows'; rows: DiffRow[] } | { kind: 'fold'; rows: DiffRow[] };

type Op = 'equal' | 'delete' | 'insert';

// Caps the LCS table so a huge, very different output can't hang the tab.
const MAX_LINE_CELLS = 4_000_000;
const MAX_CHAR_CELLS = 250_000;

/**
 * Edit script turning `a` into `b`, via LCS on whatever's left after
 * stripping the common prefix and suffix (usually very little).
 */
function editScript<T>(a: T[], b: T[], maxCells: number): Op[] {
  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) {
    start++;
  }

  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--;
    endB--;
  }

  const n = endA - start;
  const m = endB - start;
  const middle: Op[] = [];

  if (n * m > maxCells) {
    middle.push(...Array<Op>(n).fill('delete'), ...Array<Op>(m).fill('insert'));
  } else {
    // lcs[i * (m + 1) + j] = LCS length of a[start + i..] and b[start + j..].
    const width = m + 1;
    const lcs = new Uint32Array((n + 1) * width);

    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        lcs[i * width + j] =
          a[start + i] === b[start + j]
            ? lcs[(i + 1) * width + j + 1] + 1
            : Math.max(lcs[(i + 1) * width + j], lcs[i * width + j + 1]);
      }
    }

    let i = 0;
    let j = 0;
    while (i < n || j < m) {
      if (i < n && j < m && a[start + i] === b[start + j]) {
        middle.push('equal');
        i++;
        j++;
      } else if (
        j === m ||
        (i < n && lcs[(i + 1) * width + j] >= lcs[i * width + j + 1])
      ) {
        middle.push('delete');
        i++;
      } else {
        middle.push('insert');
        j++;
      }
    }
  }

  return [
    ...Array<Op>(start).fill('equal'),
    ...middle,
    ...Array<Op>(a.length - endA).fill('equal'),
  ];
}

function pushSpan(spans: Span[], text: string, changed: boolean): void {
  const last = spans.at(-1);

  if (last && last.changed === changed) {
    last.text += text;
  } else {
    spans.push({ text, changed });
  }
}

/** Character-level highlights for a pair of lines that differ. */
export function diffChars(
  expected: string,
  actual: string,
): { expected: Span[]; actual: Span[] } {
  const a = [...expected];
  const b = [...actual];
  const result = { expected: [] as Span[], actual: [] as Span[] };
  let i = 0;
  let j = 0;

  for (const op of editScript(a, b, MAX_CHAR_CELLS)) {
    if (op === 'equal') {
      pushSpan(result.expected, a[i++], false);
      pushSpan(result.actual, b[j++], false);
    } else if (op === 'delete') {
      pushSpan(result.expected, a[i++], true);
    } else {
      pushSpan(result.actual, b[j++], true);
    }
  }

  return result;
}

type RawLine = { text: string; newline: boolean };

/**
 * Splits output the way the grader sees it: trailing whitespace at the very
 * end is ignored, so it isn't shown or compared.
 */
export function splitLines(text: string): RawLine[] {
  const trimmed = text.trimEnd();

  if (trimmed === '') {
    return [];
  }

  const lines = trimmed.split('\n');

  return lines.map((line, i) => ({
    text: line,
    newline: i < lines.length - 1 || text[trimmed.length] === '\n',
  }));
}

function toLine(raw: RawLine, index: number, spans?: Span[]): DiffLine {
  return {
    number: index + 1,
    spans: spans ?? (raw.text ? [{ text: raw.text, changed: false }] : []),
    newline: raw.newline,
  };
}

/** Line-by-line comparison of expected and actual output. */
export function diffOutput(expected: string, actual: string): DiffRow[] {
  const a = splitLines(expected);
  const b = splitLines(actual);
  const ops = editScript(
    a.map((l) => l.text),
    b.map((l) => l.text),
    MAX_LINE_CELLS,
  );

  const rows: DiffRow[] = [];
  let i = 0;
  let j = 0;
  let k = 0;

  while (k < ops.length) {
    if (ops[k] === 'equal') {
      rows.push({
        kind: 'equal',
        expected: toLine(a[i], i),
        actual: toLine(b[j], j),
      });
      i++;
      j++;
      k++;
      continue;
    }

    // A run of deletes/inserts: pair them up as changed lines, the rest are
    // lines missing from or added to the output.
    const deleted: number[] = [];
    const inserted: number[] = [];
    for (; k < ops.length && ops[k] !== 'equal'; k++) {
      if (ops[k] === 'delete') {
        deleted.push(i++);
      } else {
        inserted.push(j++);
      }
    }

    const paired = Math.min(deleted.length, inserted.length);
    for (let p = 0; p < paired; p++) {
      const ei = deleted[p];
      const ai = inserted[p];
      const spans = diffChars(a[ei].text, b[ai].text);
      rows.push({
        kind: 'changed',
        expected: toLine(a[ei], ei, spans.expected),
        actual: toLine(b[ai], ai, spans.actual),
      });
    }
    for (const ei of deleted.slice(paired)) {
      rows.push({ kind: 'missing', expected: toLine(a[ei], ei) });
    }
    for (const ai of inserted.slice(paired)) {
      rows.push({ kind: 'extra', actual: toLine(b[ai], ai) });
    }
  }

  return rows;
}

/**
 * Collapses long runs of matching lines, keeping `context` lines next to
 * each difference. Output with no differences isn't folded.
 */
export function foldRows(rows: DiffRow[], context = 3): DiffBlock[] {
  if (rows.every((row) => row.kind === 'equal')) {
    return rows.length ? [{ kind: 'rows', rows }] : [];
  }

  const blocks: DiffBlock[] = [];
  const pushRows = (slice: DiffRow[]) => {
    const last = blocks.at(-1);
    if (last?.kind === 'rows') {
      last.rows.push(...slice);
    } else if (slice.length) {
      blocks.push({ kind: 'rows', rows: [...slice] });
    }
  };

  let k = 0;
  while (k < rows.length) {
    let end = k;
    while (end < rows.length && rows[end].kind === 'equal') {
      end++;
    }

    if (end === k) {
      pushRows([rows[k++]]);
      continue;
    }

    const run = rows.slice(k, end);
    const keepBefore = k === 0 ? 0 : context;
    const keepAfter = end === rows.length ? 0 : context;
    const hidden = run.length - keepBefore - keepAfter;

    // Folding away one or two lines saves nothing.
    if (hidden < 3) {
      pushRows(run);
    } else {
      pushRows(run.slice(0, keepBefore));
      blocks.push({
        kind: 'fold',
        rows: run.slice(keepBefore, run.length - keepAfter),
      });
      pushRows(run.slice(run.length - keepAfter));
    }
    k = end;
  }

  return blocks;
}

function lineText(line: DiffLine): string {
  return line.spans.map((s) => s.text).join('');
}

/** Names a character the way a student would say it. */
export function describeChar(char: string | undefined): string {
  if (char === undefined) {
    return 'the end of the line';
  }
  if (char === ' ') {
    return 'a space';
  }
  if (char === '\t') {
    return 'a tab';
  }

  return `"${visibleChar(char) ?? char}"`;
}

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

/** One sentence pointing at the first place the output goes wrong. */
export function describeFirstDifference(rows: DiffRow[]): string | null {
  const first = rows.findIndex((row) => row.kind !== 'equal');

  if (first === -1) {
    return null;
  }

  const row = rows[first];

  if (row.kind === 'changed') {
    const a = [...lineText(row.expected)];
    const b = [...lineText(row.actual)];
    let col = 0;
    while (col < a.length && col < b.length && a[col] === b[col]) {
      col++;
    }

    return (
      `Line ${row.actual.number}, column ${col + 1}: ` +
      `expected ${describeChar(a[col])} but got ${describeChar(b[col])}.`
    );
  }

  let count = 0;
  while (rows[first + count]?.kind === row.kind) {
    count++;
  }

  if (row.kind === 'missing') {
    if (rows.every((r) => r.kind === 'missing')) {
      return 'Your program printed nothing.';
    }

    return `Your output is missing ${plural(count, 'line')}, starting at expected line ${row.expected.number}.`;
  }

  if (rows.every((r) => r.kind === 'extra')) {
    return `Expected no output, but your program printed ${plural(count, 'line')}.`;
  }

  return `Your output has ${plural(count, 'extra line')}, starting at line ${row.actual.number}.`;
}

export type GlyphKind = 'text' | 'space' | 'tab' | 'control';

export type Glyph = { text: string; kind: GlyphKind };

const CONTROL_NAMES: Record<string, string> = {
  '\0': '\\0',
  '\b': '\\b',
  '\f': '\\f',
  '\r': '\\r',
  '\v': '\\v',
  '\x1b': '\\e',
};

/** How an invisible character is drawn, or null for an ordinary one. */
function visibleChar(char: string): string | null {
  if (char === ' ') {
    return '·';
  }
  if (char === '\t') {
    return '→';
  }

  const code = char.codePointAt(0) ?? 0;
  if (code < 0x20 || code === 0x7f) {
    return CONTROL_NAMES[char] ?? `\\x${code.toString(16).padStart(2, '0')}`;
  }
  if (char === '�') {
    // What invalid UTF-8 (e.g. printing an uninitialised char) decodes to.
    return '�';
  }

  return null;
}

/** Splits text into runs of ordinary text and drawn whitespace/control chars. */
export function toGlyphs(text: string): Glyph[] {
  const glyphs: Glyph[] = [];

  for (const char of text) {
    const drawn = visibleChar(char);
    const kind: GlyphKind =
      drawn === null || char === '�'
        ? 'text'
        : char === ' '
          ? 'space'
          : char === '\t'
            ? 'tab'
            : 'control';
    const shown = drawn ?? char;
    const last = glyphs.at(-1);

    if (last && last.kind === kind && kind !== 'control') {
      last.text += shown;
    } else {
      glyphs.push({ text: shown, kind });
    }
  }

  return glyphs;
}
