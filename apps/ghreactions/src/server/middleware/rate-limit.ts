import { createProvider, redisKey, serializeError } from '@org/server';
import { Ratelimit } from '@upstash/ratelimit';
import { RequestHandler } from 'express';
import * as logger from 'firebase-functions/logger';
import { redisProvider } from '../redis/redis';

export const ratelimitProvider = createProvider(
  () =>
    new Ratelimit({
      redis: redisProvider.get(),
      limiter: Ratelimit.slidingWindow(100, '15 m'),
      prefix: redisKey('ratelimit'),
    }),
);

export const rateLimitMiddleware: RequestHandler = async (req, res, next) => {
  const identifier = req.headers['x-firebase-appcheck'] as string;

  try {
    const { success, limit, remaining, reset } = await ratelimitProvider
      .get()
      .limit(identifier);

    // `reset` is an epoch in ms; RateLimit-Reset and Retry-After are both
    // "seconds from now".
    const secondsUntilReset = Math.max(
      1,
      Math.ceil((reset - Date.now()) / 1000),
    );

    res.setHeader('RateLimit-Limit', limit);
    res.setHeader('RateLimit-Remaining', remaining);
    res.setHeader('RateLimit-Reset', secondsUntilReset);

    if (!success) {
      res.setHeader('Retry-After', secondsUntilReset);
      res
        .status(429)
        .json({ message: 'Too many requests. Please try again later' });
      return;
    }

    next();
  } catch (err) {
    logger.error('[Rate Limit] Redis unavailable:', serializeError(err));
    next();
  }
};
