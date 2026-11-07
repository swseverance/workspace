import { beforeEach, describe, expect, it, vi } from 'vitest';
import { analytics } from '../analytics/analytics';
import { analyticsHandler } from './analytics.handler';

function makeRes() {
  const res = { status: vi.fn(), json: vi.fn() } as any;
  res.status.mockReturnValue(res);
  return res;
}

describe('analyticsHandler', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('returns search and profile totals', async () => {
    analytics.getStats = vi
      .fn()
      .mockResolvedValue({ searches: 12480, profiles: 3215 });
    const res = makeRes();

    await analyticsHandler({} as any, res, vi.fn());

    expect(res.json).toHaveBeenCalledWith({ searches: 12480, profiles: 3215 });
  });

  it('returns 500 when Redis is unavailable', async () => {
    analytics.getStats = vi.fn().mockRejectedValue(new Error('unavailable'));
    const res = makeRes();

    await analyticsHandler({} as any, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });
});
