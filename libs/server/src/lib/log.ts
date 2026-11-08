import type { RequestHandler } from 'express';
import * as logger from 'firebase-functions/logger';
import type { ErrorResponseBody, LogLevel, LogRequestBody } from './models';

const LOG_LEVELS: readonly LogLevel[] = ['debug', 'info', 'warn', 'error'];

function isLogLevel(value: unknown): value is LogLevel {
  return typeof value === 'string' && LOG_LEVELS.includes(value as LogLevel);
}

/**
 * Writes a log sent by @org/logger's Logger to Cloud Logging, tagged with
 * the user when signed in. Open to signed-out users so sign-in failures get
 * reported; App Check keeps it to the real app.
 */
export const logHandler: RequestHandler<
  unknown,
  ErrorResponseBody,
  Partial<Record<keyof LogRequestBody, unknown>> | undefined
> = (req, res) => {
  const { level, message, data } = req.body ?? {};

  if (!isLogLevel(level)) {
    res
      .status(400)
      .json({ message: 'level must be one of debug, info, warn, error' });
    return;
  }

  if (typeof message !== 'string') {
    res.status(400).json({ message: 'message is required' });
    return;
  }

  logger[level](message, { uid: req.user?.uid, data });
  res.status(204).end();
};
