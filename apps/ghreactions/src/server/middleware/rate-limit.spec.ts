import { beforeEach, describe, expect, it, vi } from 'vitest';
import { rateLimitMiddleware } from './rate-limit';

const { mockLimit } = vi.hoisted(() => ({ mockLimit: vi.fn() }));

vi.mock('@upstash/ratelimit', () => {
  class Ratelimit {
    limit = mockLimit;
    static slidingWindow = vi.fn();
  }
  return { Ratelimit };
});

vi.mock('@upstash/redis', () => ({
  Redis: { fromEnv: vi.fn().mockReturnValue({}) },
}));

function makeReq(token?: string) {
  return { headers: { 'x-firebase-appcheck': token } } as any;
}

function makeRes() {
  const res = { status: vi.fn(), json: vi.fn(), setHeader: vi.fn() } as any;
  res.status.mockReturnValue(res);
  return res;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('rateLimitMiddleware', () => {
  it('calls next() when under the limit', async () => {
    mockLimit.mockResolvedValue({
      success: true,
      limit: 100,
      remaining: 99,
      reset: 0,
    });
    const next = vi.fn();

    await rateLimitMiddleware(makeReq('token'), makeRes(), next);

    expect(mockLimit).toHaveBeenCalledWith('token');
    expect(next).toHaveBeenCalled();
  });

  it('returns 429 when over the limit', async () => {
    mockLimit.mockResolvedValue({
      success: false,
      limit: 100,
      remaining: 0,
      reset: 0,
    });
    const res = makeRes();
    const next = vi.fn();

    await rateLimitMiddleware(makeReq('token'), res, next);

    expect(res.setHeader).toHaveBeenCalledWith('Retry-After', 1);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Too many requests. Please try again later',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('fails open when Redis is unavailable', async () => {
    mockLimit.mockRejectedValue(new Error('Redis unavailable'));
    const next = vi.fn();

    await rateLimitMiddleware(makeReq('token'), makeRes(), next);

    expect(next).toHaveBeenCalled();
  });
});
