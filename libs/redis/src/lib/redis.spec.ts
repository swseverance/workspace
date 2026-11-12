import { Redis } from '@upstash/redis';
import { redisProvider } from './redis';

vi.mock('@upstash/redis', () => ({ Redis: { fromEnv: vi.fn(() => ({})) } }));

describe('redisProvider', () => {
  afterEach(() => {
    redisProvider.reset();
  });

  it('builds the client with retries off', () => {
    redisProvider.get();
    expect(Redis.fromEnv).toHaveBeenCalledWith({ retry: { retries: 0 } });
  });
});
