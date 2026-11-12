import { redisKey } from './redis-key';

describe('redisKey', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('prefixes the key with the Firebase project and environment', () => {
    vi.stubEnv('PROJECT_ID', 'proj');
    vi.stubEnv('ENVIRONMENT_NAME', 'dev');

    expect(redisKey('ratelimit:github')).toBe('proj:dev:ratelimit:github');
  });
});
