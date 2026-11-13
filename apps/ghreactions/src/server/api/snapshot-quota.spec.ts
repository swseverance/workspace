import { redisProvider } from '@org/redis';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MAX_NEW_SNAPSHOTS_PER_DAY, snapshotQuota } from './snapshot-quota';

vi.mock('firebase-functions/logger', () => ({ error: vi.fn() }));

function useRedis(redis: object) {
  vi.spyOn(redisProvider, 'get').mockReturnValue(redis as never);
}

describe('snapshotQuota.take', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it("counts against the day's key, which it sets to expire on first use", async () => {
    vi.useFakeTimers({ now: new Date('2026-11-13T23:59:00Z') });
    vi.stubEnv('PROJECT_ID', 'proj');
    vi.stubEnv('ENVIRONMENT_NAME', 'dev');
    const redis = { incr: vi.fn().mockResolvedValue(1), expire: vi.fn() };
    useRedis(redis);

    expect(await snapshotQuota.take()).toBe(true);

    expect(redis.incr).toHaveBeenCalledWith('proj:dev:snapshots:2026-11-13');
    expect(redis.expire).toHaveBeenCalledWith(
      'proj:dev:snapshots:2026-11-13',
      172800,
    );
  });

  it('allows the last one of the day and refuses the next', async () => {
    const redis = { incr: vi.fn(), expire: vi.fn() };
    useRedis(redis);

    redis.incr.mockResolvedValue(MAX_NEW_SNAPSHOTS_PER_DAY);
    expect(await snapshotQuota.take()).toBe(true);

    redis.incr.mockResolvedValue(MAX_NEW_SNAPSHOTS_PER_DAY + 1);
    expect(await snapshotQuota.take()).toBe(false);
    expect(redis.expire).not.toHaveBeenCalled();
  });

  it('allows the snapshot when Redis is unavailable', async () => {
    useRedis({ incr: vi.fn().mockRejectedValue(new Error('down')) });

    expect(await snapshotQuota.take()).toBe(true);
  });
});
