import { Redis } from '@upstash/redis';
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { redisProvider } from '../redis';
import { getStats, recordSubmission } from './analytics';

vi.mock('firebase-functions/logger', () => ({ error: vi.fn() }));

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
  vi.stubEnv('FIREBASE_PROJECT_ID', 'proj');
  vi.stubEnv('ENVIRONMENT_NAME', 'test');
});

afterEach(() => {
  redisProvider.reset();
  vi.unstubAllEnvs();
});

describe('recordSubmission', () => {
  it('counts the submission and the user, per environment', async () => {
    await recordSubmission('uid-1');

    expect(mockIncr).toHaveBeenCalledWith('proj:test:analytics:submissions');
    expect(mockPfadd).toHaveBeenCalledWith(
      'proj:test:analytics:users',
      'uid-1',
    );
  });

  it('never throws when Redis is unavailable', async () => {
    mockIncr.mockRejectedValue(new Error('unavailable'));

    await expect(recordSubmission('uid-1')).resolves.toBeUndefined();
  });
});

describe('getStats', () => {
  it('returns both totals', async () => {
    mockGet.mockResolvedValue(1000);
    mockPfcount.mockResolvedValue(400);

    await expect(getStats()).resolves.toEqual({
      submissions: 1000,
      users: 400,
    });
    expect(mockGet).toHaveBeenCalledWith('proj:test:analytics:submissions');
    expect(mockPfcount).toHaveBeenCalledWith('proj:test:analytics:users');
  });

  it('reports zero before the first submission', async () => {
    await expect(getStats()).resolves.toEqual({ submissions: 0, users: 0 });
  });
});
