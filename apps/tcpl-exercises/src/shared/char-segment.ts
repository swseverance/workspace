export type SegmentKind = 'text' | 'tab' | 'newline' | 'space';

export type Segment = {
  text: string;
  kind: SegmentKind;
};

const ESCAPES: Partial<Record<string, Segment>> = {
  '\t': { text: 'T', kind: 'tab' },
  '\n': { text: 'N', kind: 'newline' },
  ' ': { text: 'S', kind: 'space' },
};

export function describeChar(char: string): Segment {
  return ESCAPES[char] ?? { text: char, kind: 'text' };
}
