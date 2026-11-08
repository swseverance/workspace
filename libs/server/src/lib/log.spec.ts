import type { Request, Response } from 'express';
import { logHandler } from './log';

const logger = vi.hoisted(() => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}));

vi.mock('firebase-functions/logger', () => logger);

function createResponse() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    end: vi.fn().mockReturnThis(),
  };
  return res as typeof res & Response;
}

function call(body: unknown, user: { uid: string } | null = { uid: 'u1' }) {
  const res = createResponse();
  logHandler(
    { body, user: user ?? undefined } as unknown as Request,
    res,
    vi.fn(),
  );
  return res;
}

beforeEach(() => vi.clearAllMocks());

describe('logHandler', () => {
  it('writes the log at its level, tagged with the user', () => {
    const res = call({ level: 'warn', message: 'careful', data: { a: 1 } });

    expect(logger.warn).toHaveBeenCalledWith('careful', {
      uid: 'u1',
      data: { a: 1 },
    });
    expect(res.status).toHaveBeenCalledWith(204);
  });

  it('accepts logs from signed-out users', () => {
    const res = call({ level: 'error', message: 'sign in failed' }, null);

    expect(logger.error).toHaveBeenCalledWith('sign in failed', {
      uid: undefined,
      data: undefined,
    });
    expect(res.status).toHaveBeenCalledWith(204);
  });

  it('400s on an unknown level', () => {
    const res = call({ level: 'fatal', message: 'x' });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('400s without a message', () => {
    expect(call({ level: 'info' }).status).toHaveBeenCalledWith(400);
  });
});
