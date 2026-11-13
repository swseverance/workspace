import { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Both limiters share this mock, so calls are told apart by their key.
const { limit } = vi.hoisted(() => ({ limit: vi.fn() }));
const { loggerWarn } = vi.hoisted(() => ({ loggerWarn: vi.fn() }));

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: class {
    static slidingWindow = vi.fn();
    limit = limit;
  },
}));

// A package mock: the Angular unit-test builder rejects vi.mock on relative paths.
vi.mock('@upstash/redis', () => ({ Redis: { fromEnv: () => ({}) } }));

vi.mock('firebase-functions/logger', () => ({
  warn: loggerWarn,
}));

const {
  GLOBAL_LIMIT_MESSAGE,
  SIGNED_OUT_LIMIT_MESSAGE,
  USER_LIMIT_MESSAGE,
  submitExerciseRateLimitMiddleware,
} = await import('./rate-limit');

function createRequest(uid?: string): Request {
  return (uid ? { user: { uid } } : {}) as Request;
}

function createResponse(): Response {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
}

/** Makes the per-user and global limiters allow or reject the request. */
function allow({ user, global }: { user: boolean; global: boolean }) {
  limit.mockImplementation(async (key: string) => ({
    success: key === 'global' ? global : user,
  }));
}

// null: signed out.
async function run(uid: string | null = 'user-123') {
  const req = createRequest(uid ?? undefined);
  const res = createResponse();
  const next = vi.fn();

  await submitExerciseRateLimitMiddleware(req, res, next);

  return { res, next };
}

describe('submitExerciseRateLimitMiddleware', () => {
  beforeEach(() => {
    limit.mockReset();
    loggerWarn.mockReset();
  });

  it('calls next() when the request is within both limits', async () => {
    allow({ user: true, global: true });

    const { res, next } = await run();

    expect(limit).toHaveBeenCalledWith('user-123');
    expect(limit).toHaveBeenCalledWith('global');
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
    expect(loggerWarn).not.toHaveBeenCalled();
  });

  it('responds 429 with the per-user message when the user limit is exceeded', async () => {
    allow({ user: false, global: true });

    const { res, next } = await run();

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({ message: USER_LIMIT_MESSAGE });
    expect(loggerWarn).toHaveBeenCalledWith('[rate-limit] request rejected', {
      uid: 'user-123',
    });
  });

  it("doesn't use up the global limit for a user over their own limit", async () => {
    allow({ user: false, global: true });

    await run();

    expect(limit).not.toHaveBeenCalledWith('global');
  });

  it('responds 429 with the global message when the global limit is exceeded', async () => {
    allow({ user: true, global: false });

    const { res, next } = await run();

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({ message: GLOBAL_LIMIT_MESSAGE });
    expect(loggerWarn).toHaveBeenCalledWith(
      '[rate-limit] request rejected by global limit',
      { uid: 'user-123' },
    );
  });

  it('passes the error to next() when a limiter fails', async () => {
    const error = new Error('redis down');
    limit.mockRejectedValue(error);

    const { res, next } = await run();

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
  });

  describe('signed out', () => {
    it('calls next() within the signed-out limit, without touching the others', async () => {
      limit.mockResolvedValue({ success: true });

      const { res, next } = await run(null);

      expect(limit).toHaveBeenCalledExactlyOnceWith('signed-out');
      expect(next).toHaveBeenCalledOnce();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('responds 429 suggesting sign-in when the signed-out limit is exceeded', async () => {
      limit.mockResolvedValue({ success: false });

      const { res, next } = await run(null);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({
        message: SIGNED_OUT_LIMIT_MESSAGE,
      });
    });
  });
});
