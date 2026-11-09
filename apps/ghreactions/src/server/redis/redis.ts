import { createProvider } from '@org/server';
import { Redis } from '@upstash/redis';

/**
 * The shared Upstash client. Built on first use, so unit tests that provide
 * a fake never construct a real one.
 */
export const redisProvider = createProvider(() => Redis.fromEnv());
