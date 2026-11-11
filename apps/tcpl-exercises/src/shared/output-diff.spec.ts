import {
  describeFirstDifference,
  diffChars,
  diffOutput,
  DiffRow,
  foldRows,
  normalizeOutput,
  splitLines,
  toGlyphs,
  visibleDiff,
} from './output-diff';

const kinds = (rows: DiffRow[]) => rows.map((r) => r.kind);

describe('normalizeOutput', () => {
  it('keeps the final newline but drops whitespace after it', () => {
    expect(normalizeOutput('a \nb\n \t\n')).toBe('a \nb\n');
    expect(normalizeOutput('a\n\n\n')).toBe('a\n');
  });

  it('keeps spaces before the final newline, as on any other line', () => {
    expect(normalizeOutput('a \n')).toBe('a \n');
  });

  it('drops trailing whitespace when there is no newline in it', () => {
    expect(normalizeOutput('a  \t')).toBe('a');
    expect(normalizeOutput('a\nb')).toBe('a\nb');
    expect(normalizeOutput(' a')).toBe(' a');
  });

  it('returns a prefix of its input', () => {
    for (const text of ['a \nb\n \t\n', 'a  ', ' \n', '', 'x\n\ny']) {
      expect(text.startsWith(normalizeOutput(text))).toBe(true);
    }
  });
});

describe('splitLines', () => {
  it('ignores trailing whitespace like the grader does', () => {
    expect(splitLines('a\nb\n\n  \n')).toEqual([
      { text: 'a', newline: true },
      { text: 'b', newline: true },
    ]);
    expect(splitLines('a\nb')).toEqual([
      { text: 'a', newline: true },
      { text: 'b', newline: false },
    ]);
    expect(splitLines('  ')).toEqual([]);
    expect(splitLines('')).toEqual([]);
  });

  it('keeps blank lines and spaces inside the output', () => {
    expect(splitLines('a\n\n b\n').map((l) => l.text)).toEqual(['a', '', ' b']);
  });
});

describe('diffOutput', () => {
  it('matches identical output, ignoring blank lines after the final newline', () => {
    expect(kinds(diffOutput('1\n2\n', '1\n2\n\n'))).toEqual(['equal', 'equal']);
  });

  it('marks a line that differs only in its final newline', () => {
    const rows = diffOutput('1\n2\n', '1\n2');
    expect(kinds(rows)).toEqual(['equal', 'changed']);
    expect(rows[1]).toMatchObject({
      expected: { newline: true, newlineChanged: true },
      actual: { newline: false, newlineChanged: true },
    });
    expect(rows[0]).toMatchObject({ expected: { newlineChanged: false } });
  });

  it('pairs a wrong line and highlights the wrong characters', () => {
    const rows = diffOutput('1 1 1\n', '1 2 1\n');
    expect(kinds(rows)).toEqual(['changed']);

    const [row] = rows;
    if (row.kind !== 'changed') throw new Error();
    expect(row.expected.spans).toEqual([
      { text: '1 ', changed: false },
      { text: '1', changed: true },
      { text: ' 1', changed: false },
    ]);
    expect(row.actual.spans).toEqual([
      { text: '1 ', changed: false },
      { text: '2', changed: true },
      { text: ' 1', changed: false },
    ]);
  });

  it('keeps later lines aligned when a line is missing', () => {
    const rows = diffOutput('a\nb\nc\nd\n', 'a\nc\nd\n');
    expect(kinds(rows)).toEqual(['equal', 'missing', 'equal', 'equal']);
    expect(rows[2]).toMatchObject({
      expected: { number: 3 },
      actual: { number: 2 },
    });
  });

  it('marks extra lines', () => {
    expect(kinds(diffOutput('a\nb\n', 'a\nx\nb\ny\n'))).toEqual([
      'equal',
      'extra',
      'equal',
      'extra',
    ]);
  });

  it('handles empty output on either side', () => {
    expect(kinds(diffOutput('a\nb\n', ''))).toEqual(['missing', 'missing']);
    expect(kinds(diffOutput('', 'a\n'))).toEqual(['extra']);
    expect(diffOutput('', '')).toEqual([]);
  });
});

describe('diffChars', () => {
  it('keeps the rest of the line aligned after an inserted character', () => {
    expect(diffChars('abc', 'aXbc').actual).toEqual([
      { text: 'a', changed: false },
      { text: 'X', changed: true },
      { text: 'bc', changed: false },
    ]);
  });
});

describe('visibleDiff', () => {
  const lines = (n: number, from = 0) =>
    Array.from({ length: n }, (_, i) => `line ${from + i}`).join('\n');

  it('shows everything up to the limit', () => {
    const blocks = foldRows(diffOutput(lines(5), lines(5)));
    const view = visibleDiff(blocks, new Set(), 5);

    expect(view.items).toHaveLength(5);
    expect(view.hidden).toBe(0);
  });

  it('counts the rows past the limit instead of showing them', () => {
    const blocks = foldRows(diffOutput(lines(10), lines(10)));
    const view = visibleDiff(blocks, new Set(), 4);

    expect(view.items).toHaveLength(4);
    expect(view.hidden).toBe(6);
  });

  it("doesn't count an unexpanded fold towards the limit", () => {
    // 20 matching lines, then 10 that all differ.
    const blocks = foldRows(
      diffOutput(
        `${lines(20)}\n${lines(10, 100)}`,
        `${lines(20)}\n${lines(10, 200)}`,
      ),
    );
    const view = visibleDiff(blocks, new Set(), 5);

    expect(view.items.map((item) => item.kind)).toEqual([
      'fold',
      'row',
      'row',
      'row',
      'row',
      'row',
    ]);
    expect(view.hidden).toBe(8);
  });

  it('counts an expanded fold like any other rows', () => {
    const blocks = foldRows(
      diffOutput(`${lines(20)}\nend`, `${lines(20)}\nEND`),
    );
    const fold = blocks.findIndex((b) => b.kind === 'fold');
    const view = visibleDiff(blocks, new Set([fold]), 10);

    expect(view.items.every((item) => item.kind === 'row')).toBe(true);
    expect(view.items).toHaveLength(10);
    expect(view.hidden).toBe(11);
  });

  it('lets a fold expand only if all its rows would then fit', () => {
    // A fold of 17 matching lines, then 4 rows: 3 matching and 1 changed.
    const blocks = foldRows(
      diffOutput(`${lines(20)}\nend`, `${lines(20)}\nEND`),
    );
    const fold = (max: number) => visibleDiff(blocks, new Set(), max).items[0];

    expect(fold(21)).toMatchObject({ kind: 'fold', expandable: true });
    expect(fold(20)).toMatchObject({ kind: 'fold', expandable: false });
  });

  it("won't expand a fold when rows are already hidden", () => {
    // A fold of 17, then 13 rows, with room for 5.
    const blocks = foldRows(
      diffOutput(
        `${lines(20)}\n${lines(10, 100)}`,
        `${lines(20)}\n${lines(10, 200)}`,
      ),
    );

    expect(visibleDiff(blocks, new Set(), 5).items[0]).toMatchObject({
      kind: 'fold',
      expandable: false,
    });
  });

  it('counts a fold past the limit as hidden rows', () => {
    // 10 differing lines, then 20 matching ones that fold.
    const blocks = foldRows(
      diffOutput(
        `${lines(10, 100)}\n${lines(20)}`,
        `${lines(10, 200)}\n${lines(20)}`,
      ),
    );
    const view = visibleDiff(blocks, new Set(), 5);

    // Shown: 5 of the 10 changed rows. Hidden: the other 5, the 3
    // matching rows kept beside them, and the 17 folded after those.
    expect(view.items).toHaveLength(5);
    expect(view.hidden).toBe(5 + 3 + 17);
  });
});

describe('foldRows', () => {
  const lines = (n: number) =>
    Array.from({ length: n }, (_, i) => `line ${i}`).join('\n');

  it('folds long runs of matching lines around a difference', () => {
    const blocks = foldRows(
      diffOutput(`${lines(20)}\nend`, `${lines(20)}\nEND`),
    );
    expect(blocks.map((b) => [b.kind, b.rows.length])).toEqual([
      ['fold', 17],
      ['rows', 4],
    ]);
  });

  it('does not fold output with no differences', () => {
    const blocks = foldRows(diffOutput(lines(20), lines(20)));
    expect(blocks.map((b) => b.kind)).toEqual(['rows']);
  });

  it('does not fold away just a line or two', () => {
    const blocks = foldRows(diffOutput('a\nb\nc\nd\nx', 'a\nb\nc\nd\ny'));
    expect(blocks.map((b) => b.kind)).toEqual(['rows']);
  });
});

describe('describeFirstDifference', () => {
  it('points at the first wrong character', () => {
    expect(
      describeFirstDifference(diffOutput('ok\n1 1 1\n', 'ok\n1 2 1\n')),
    ).toBe('Line 2, column 3: expected "1" but got "2".');
  });

  it('names whitespace and line ends', () => {
    expect(describeFirstDifference(diffOutput('a b', 'a\tb'))).toBe(
      'Line 1, column 2: expected a space but got a tab.',
    );
    expect(describeFirstDifference(diffOutput('ab', 'ab '))).toBeNull();
    expect(describeFirstDifference(diffOutput('ab\nc', 'ab \nc'))).toBe(
      'Line 1, column 3: expected the end of the line but got a space.',
    );
  });

  it('names a missing or unexpected final newline', () => {
    expect(
      describeFirstDifference(diffOutput('hello, world\n', 'hello, world')),
    ).toBe('Line 1: expected a newline at the end.');
    expect(describeFirstDifference(diffOutput('abc', 'abc\n'))).toBe(
      'Line 1: expected no newline at the end.',
    );
  });

  it('describes missing and extra lines', () => {
    expect(describeFirstDifference(diffOutput('a\nb\nc\n', 'a\n'))).toBe(
      'Your output is missing 2 lines, starting at expected line 2.',
    );
    expect(describeFirstDifference(diffOutput('a\n', 'a\nb\n'))).toBe(
      'Your output has 1 extra line, starting at line 2.',
    );
    expect(describeFirstDifference(diffOutput('a\n', ''))).toBe(
      'Your program printed nothing.',
    );
    expect(describeFirstDifference(diffOutput('', 'a\n'))).toBe(
      'Expected no output, but your program printed 1 line.',
    );
  });
});

describe('toGlyphs', () => {
  it('draws whitespace and control characters', () => {
    expect(toGlyphs('a  b\tc\r')).toEqual([
      { text: 'a', kind: 'text' },
      { text: '··', kind: 'space' },
      { text: 'b', kind: 'text' },
      { text: '→', kind: 'tab' },
      { text: 'c', kind: 'text' },
      { text: '\\r', kind: 'control' },
    ]);
  });
});
