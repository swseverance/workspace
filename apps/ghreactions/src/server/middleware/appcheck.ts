import { RequestHandler } from 'express';
import { getAppCheck } from 'firebase-admin/app-check';
import * as logger from 'firebase-functions/logger';
import { serializeError } from '../serialize-error';

export const appCheckMiddleware: RequestHandler = async (req, res, next) => {
  try {
    await getAppCheck().verifyToken(
      req.headers['x-firebase-appcheck'] as string,
    );
    next();
  } catch (err) {
    logger.error('[App Check] verifyToken failed:', serializeError(err));
    res.status(401).json({ message: 'Unauthorized' });
  }
};
