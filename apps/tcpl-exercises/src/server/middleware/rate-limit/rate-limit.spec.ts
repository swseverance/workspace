import { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

const { submitExerciseRateLimitMiddleware } = await import('./rate-limit');

function createRequest(uid: string): Request {
  return { user: { uid } } as Request;
}

function createResponse(): Response {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
}

describe('submitExerciseRateLimitMiddleware', () => {
  beforeEach(() => {
    limit.mockReset();
    loggerWarn.mockReset();
  });

  it('calls next() when the request is within the limit', async () => {
    limit.mockResolvedValue({ success: true });
    const req = createRequest('user-123');
    const res = createResponse();
    const next = vi.fn();

    await submitExerciseRateLimitMiddleware(req, res, next);

    expect(limit).toHaveBeenCalledWith('user-123');
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
    expect(loggerWarn).not.toHaveBeenCalled();
  });

  it('responds 429 and does not call next() when the limit is exceeded', async () => {
    limit.mockResolvedValue({ success: false });
    const req = createRequest('user-123');
    const res = createResponse();
    const next = vi.fn();

    await submitExerciseRateLimitMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({ message: 'Too Many Requests' });
  });

  it('passes the error to next() when the limiter fails', async () => {
    const error = new Error('redis down');
    limit.mockRejectedValue(error);
    const req = createRequest('user-123');
    const res = createResponse();
    const next = vi.fn();

    await submitExerciseRateLimitMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('logs a warning with the uid when the limit is exceeded', async () => {
    limit.mockResolvedValue({ success: false });
    const req = createRequest('user-123');
    const res = createResponse();
    const next = vi.fn();

    await submitExerciseRateLimitMiddleware(req, res, next);

    expect(loggerWarn).toHaveBeenCalledWith('[rate-limit] request rejected', {
      uid: 'user-123',
    });
  });
});
