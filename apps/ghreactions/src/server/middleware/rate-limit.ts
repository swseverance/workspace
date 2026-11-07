import { rateLimit } from 'express-rate-limit';

export const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  keyGenerator: (req) => req.headers['x-firebase-appcheck'] as string,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_, res) =>
    res
      .status(429)
      .json({ message: 'Too many requests. Please try again later' }),
});
