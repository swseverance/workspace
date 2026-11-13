import type { RequestHandler } from 'express';
import { getAppCheck } from 'firebase-admin/app-check';
import * as logger from 'firebase-functions/logger';
import type { ErrorResponseBody } from './models';
import { serializeError } from './serialize-error';
import { isSsrLoopbackRequest } from './ssr-loopback';

/** Rejects requests without a valid App Check token. */
export const appCheckMiddleware: RequestHandler<
  unknown,
  ErrorResponseBody
> = async (req, res, next) => {
  // The SSR render's own API calls can't get an App Check token (that needs
  // the browser's reCAPTCHA), so they prove they're from this process instead.
  if (isSsrLoopbackRequest(req)) {
    next();
    return;
  }

  try {
    await getAppCheck().verifyToken(
      req.headers['x-firebase-appcheck'] as string,
    );
    next();
  } catch (err) {
    logger.error('[App Check] verifyToken failed', {
      error: serializeError(err),
    });
    res.status(401).json({ message: 'Unauthorized' });
  }
};

/**
 * For routes behind appCheckMiddleware that need a limited-use token (sent
 * with LIMITED_USE_APP_CHECK_TOKEN): verifies it again and consumes it, so
 * the same token can't be used twice.
 */
export const consumeAppCheckTokenMiddleware: RequestHandler<
  unknown,
  ErrorResponseBody
> = async (req, res, next) => {
  // Consuming calls Google's App Check API, which local developer
  // credentials can't use. Local requests carry a debug token anyway, so
  // there's nothing to protect; appCheckMiddleware has already checked it.
  if (process.env['ENVIRONMENT_NAME'] === 'local') {
    next();
    return;
  }

  try {
    const { alreadyConsumed } = await getAppCheck().verifyToken(
      req.headers['x-firebase-appcheck'] as string,
      { consume: true },
    );

    if (alreadyConsumed) {
      logger.warn('[App Check] token replayed');
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    next();
  } catch (err) {
    logger.error('[App Check] verifyToken (consume) failed', {
      error: serializeError(err),
    });
    res.status(401).json({ message: 'Unauthorized' });
  }
};
