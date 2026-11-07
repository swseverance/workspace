import { Ratelimit } from '@upstash/ratelimit';
import { RequestHandler } from 'express';
import * as logger from 'firebase-functions/logger';
import { redis } from '../redis/redis';
import { serializeError } from '../serialize-error';

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '15 m'),
});

export const rateLimitMiddleware: RequestHandler = async (req, res, next) => {
  const identifier = req.headers['x-firebase-appcheck'] as string;

  try {
    const { success, limit, remaining, reset } =
      await ratelimit.limit(identifier);

    res.setHeader('RateLimit-Limit', limit);
    res.setHeader('RateLimit-Remaining', remaining);
    res.setHeader('RateLimit-Reset', reset);

    if (!success) {
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
