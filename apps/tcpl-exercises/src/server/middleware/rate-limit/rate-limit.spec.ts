import { redisProvider } from '@org/redis';
import { Redis } from '@upstash/redis';
import { Request, Response } from 'express';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

// Both limiters share this mock, so calls are told apart by their key.
const { limit } = vi.hoisted(() => ({ limit: vi.fn() }));
const { loggerWarn } = vi.hoisted(() => ({ loggerWarn: vi.fn() }));

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: class {
    static slidingWindow = vi.fn();
    limit = limit;
  },
}));

vi.mock('firebase-functions/logger', () => ({
  warn: loggerWarn,
}));

const {
  FORMAT_CODE_LIMITS,
  formatCodeRateLimitMiddleware,
  SUBMIT_EXERCISE_LIMITS,
  submitExerciseRateLimitMiddleware,
} = await import('./rate-limit');

// The limiters only pass the client on to the mocked Ratelimit, so an empty
// one will do. Spec files share their modules (the Angular unit-test builder
// runs Vitest with isolate off), so it is taken back out afterwards rather
// than left for the next spec to find.
beforeAll(() => {
  redisProvider.provide({} as Redis);
});

afterAll(() => {
  redisProvider.reset();
});

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
    expect(res.json).toHaveBeenCalledWith({
      message: SUBMIT_EXERCISE_LIMITS.user.message,
    });
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
    expect(res.json).toHaveBeenCalledWith({
      message: SUBMIT_EXERCISE_LIMITS.global.message,
    });
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
        message: SUBMIT_EXERCISE_LIMITS.signedOut.message,
      });
    });
  });
});

describe('formatCodeRateLimitMiddleware', () => {
  beforeEach(() => {
    limit.mockReset();
    loggerWarn.mockReset();
  });

  async function runFormat(uid?: string) {
    const res = createResponse();
    const next = vi.fn();

    await formatCodeRateLimitMiddleware(createRequest(uid), res, next);

    return { res, next };
  }

  it('calls next() when the request is within its limits', async () => {
    allow({ user: true, global: true });

    const { res, next } = await runFormat('user-123');

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it.each([
    ['user', 'user-123', { user: false, global: true }],
    ['global', 'user-123', { user: true, global: false }],
    ['signedOut', undefined, { user: false, global: true }],
  ] as const)(
    'responds 429 with its own message over the %s limit',
    async (limit, uid, limits) => {
      allow(limits);

      const { res, next } = await runFormat(uid);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({
        message: FORMAT_CODE_LIMITS[limit].message,
      });
    },
  );
});
