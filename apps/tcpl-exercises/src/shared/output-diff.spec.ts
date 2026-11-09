import {
  describeFirstDifference,
  diffChars,
  diffOutput,
  DiffRow,
  foldRows,
  splitLines,
  toGlyphs,
} from './output-diff';

const kinds = (rows: DiffRow[]) => rows.map((r) => r.kind);

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
    expect(splitLines(' \n')).toEqual([]);
  });

  it('keeps blank lines and spaces inside the output', () => {
    expect(splitLines('a\n\n b\n').map((l) => l.text)).toEqual(['a', '', ' b']);
  });
});

describe('diffOutput', () => {
  it('matches identical output', () => {
    expect(kinds(diffOutput('1\n2\n', '1\n2'))).toEqual(['equal', 'equal']);
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
