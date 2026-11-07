import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  MockInstance,
  vi,
} from 'vitest';
import { redis } from '../redis/redis';
import { getStats, recordSearch } from './analytics';

// Spy on the shared client rather than vi.mock('@upstash/redis'): the test
// runner doesn't isolate spec files, so another file may already have loaded
// the real module.
let mockIncr: MockInstance;
let mockPfadd: MockInstance;
let mockGet: MockInstance;
let mockPfcount: MockInstance;

beforeEach(() => {
  mockIncr = vi.spyOn(redis, 'incr').mockResolvedValue(1);
  mockPfadd = vi.spyOn(redis, 'pfadd').mockResolvedValue(1);
  mockGet = vi.spyOn(redis, 'get').mockResolvedValue(null);
  mockPfcount = vi.spyOn(redis, 'pfcount').mockResolvedValue(0);
  vi.stubEnv('FIREBASE_PROJECT_ID', 'proj');
  vi.stubEnv('ENVIRONMENT_NAME', 'test');
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
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
