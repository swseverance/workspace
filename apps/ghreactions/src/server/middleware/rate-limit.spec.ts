import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  MockInstance,
  vi,
} from 'vitest';
import { ratelimit, rateLimitMiddleware } from './rate-limit';

// Spy on the shared limiter rather than vi.mock('@upstash/ratelimit'): the
// test runner doesn't isolate spec files, so module mocks are order-dependent.
let mockLimit: MockInstance;

function makeReq(token?: string) {
  return { headers: { 'x-firebase-appcheck': token } } as any;
}

function makeRes() {
  const res = { status: vi.fn(), json: vi.fn(), setHeader: vi.fn() } as any;
  res.status.mockReturnValue(res);
  return res;
}

beforeEach(() => {
  mockLimit = vi.spyOn(ratelimit, 'limit');
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => vi.restoreAllMocks());

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
