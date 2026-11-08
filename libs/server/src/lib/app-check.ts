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
