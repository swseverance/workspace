import { Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { MAX_CODE_LENGTH, validCodeMiddleware } from './valid-code';

function run(body: unknown) {
  const req = { body } as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  const next = vi.fn();

  validCodeMiddleware(req, res, next);

  return { req, res, next };
}

describe('validCodeMiddleware', () => {
  it('calls next() for code of an allowed length', () => {
    const { res, next } = run({ code: 'x'.repeat(MAX_CODE_LENGTH) });

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('treats null code as empty', () => {
    const { req, next } = run({ code: null });

    expect(req.body.code).toBe('');
    expect(next).toHaveBeenCalledOnce();
  });

  it.each([
    ['no body', undefined],
    ['missing code', {}],
    ['code that is not a string', { code: 42 }],
  ])('answers 400 for %s', (_name, body) => {
    const { res, next } = run(body);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'code is required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('answers 400 for code that is too long', () => {
    const { res, next } = run({ code: 'x'.repeat(MAX_CODE_LENGTH + 1) });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: `code must be at most ${MAX_CODE_LENGTH} characters`,
    });
    expect(next).not.toHaveBeenCalled();
  });
});
