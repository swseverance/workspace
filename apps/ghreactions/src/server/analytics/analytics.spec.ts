import { redisProvider } from '@org/redis';
import { Redis } from '@upstash/redis';
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { getStats, recordSearch } from './analytics';

// Provide a fake client so no real Upstash client is ever built.
let mockIncr: Mock;
let mockPfadd: Mock;
let mockGet: Mock;
let mockPfcount: Mock;

beforeEach(() => {
  mockIncr = vi.fn().mockResolvedValue(1);
  mockPfadd = vi.fn().mockResolvedValue(1);
  mockGet = vi.fn().mockResolvedValue(null);
  mockPfcount = vi.fn().mockResolvedValue(0);
  redisProvider.provide({
    incr: mockIncr,
    pfadd: mockPfadd,
    get: mockGet,
    pfcount: mockPfcount,
  } as unknown as Redis);
  vi.stubEnv('PROJECT_ID', 'proj');
  vi.stubEnv('ENVIRONMENT_NAME', 'test');
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  redisProvider.reset();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('recordSearch', () => {
  it('counts the search and the lowercased username, per environment', async () => {
    mockIncr.mockResolvedValue(1);
    mockPfadd.mockResolvedValue(1);

    await recordSearch('Swseverance');

    expect(mockIncr).toHaveBeenCalledWith('proj:test:analytics:searches');
    expect(mockPfadd).toHaveBeenCalledWith(
      'proj:test:analytics:profiles',
      'swseverance',
    );
  });

  it('never throws when Redis is unavailable', async () => {
    mockIncr.mockRejectedValue(new Error('unavailable'));
    mockPfadd.mockResolvedValue(1);

    await expect(recordSearch('sam')).resolves.toBeUndefined();
  });
});

describe('getStats', () => {
  it('returns both totals', async () => {
    mockGet.mockResolvedValue(12480);
    mockPfcount.mockResolvedValue(3215);

    await expect(getStats()).resolves.toEqual({
      searches: 12480,
      profiles: 3215,
    });
    expect(mockGet).toHaveBeenCalledWith('proj:test:analytics:searches');
    expect(mockPfcount).toHaveBeenCalledWith('proj:test:analytics:profiles');
  });

  it('reports zero searches before the first one', async () => {
    mockGet.mockResolvedValue(null);
    mockPfcount.mockResolvedValue(0);

    await expect(getStats()).resolves.toEqual({ searches: 0, profiles: 0 });
  });
});
