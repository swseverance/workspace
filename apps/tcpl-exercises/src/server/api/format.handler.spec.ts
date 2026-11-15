import { Request, Response } from 'express';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { CLANG_FORMAT_STYLE, formatCodeHandler } from './format.handler';

function run(body: unknown) {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;

  formatCodeHandler({ body } as Request, res, vi.fn());

  return res;
}

describe('formatCodeHandler', () => {
  it('formats code the way the reference solutions are formatted', () => {
    const res = run({ code: 'int main(){int x=1;\nreturn x;}\n' });

    expect(res.json).toHaveBeenCalledWith({
      code: 'int main() {\n  int x = 1;\n  return x;\n}\n',
    });
  });

  it("formats what it can of code that wouldn't compile", async () => {
    const res = run({ code: 'int main( {\nreturn' });

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledOnce();
  });
});

describe('CLANG_FORMAT_STYLE', () => {
  it('matches the .clang-format that formats the reference solutions', () => {
    const settings = readFileSync(
      resolve(process.cwd(), '.clang-format'),
      'utf8',
    )
      .split('\n')
      .filter((line) => line.trim() !== '' && !line.startsWith('#'))
      .map((line) => line.split(':').map((part) => part.trim()));

    expect(Object.fromEntries(settings)).toEqual(CLANG_FORMAT_STYLE);
  });
});
