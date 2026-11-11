import { ssrRequestContext } from '@org/server';
import { Ratelimit } from '@upstash/ratelimit';
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { rateLimitMiddleware, ratelimitProvider } from './rate-limit';

// Provide a fake limiter so no real Upstash client is ever built.
let mockLimit: Mock;

function makeReq(token?: string) {
  return {
    headers: { 'x-firebase-appcheck': token },
    socket: { remoteAddress: '203.0.113.7' },
  } as any;
}

// A request carrying this process's real loopback token, as SSR sends it.
function makeLoopbackReq() {
  const { loopbackHeaders } = ssrRequestContext({
    socket: { localPort: 4000 },
    headers: {},
    protocol: 'http',
    get: () => 'localhost:4000',
  } as any);
  return {
    headers: loopbackHeaders,
    socket: { remoteAddress: '127.0.0.1' },
  } as any;
}

function makeRes() {
  const res = { status: vi.fn(), json: vi.fn(), setHeader: vi.fn() } as any;
  res.status.mockReturnValue(res);
  return res;
}

beforeEach(() => {
  mockLimit = vi.fn();
  ratelimitProvider.provide({ limit: mockLimit } as unknown as Ratelimit);
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  ratelimitProvider.reset();
  vi.restoreAllMocks();
});

describe('rateLimitMiddleware', () => {
  it("skips SSR's own loopback calls without touching the limiter", async () => {
    const next = vi.fn();
    await rateLimitMiddleware(makeLoopbackReq(), makeRes(), next);
    expect(next).toHaveBeenCalled();
    expect(mockLimit).not.toHaveBeenCalled();
  });

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
