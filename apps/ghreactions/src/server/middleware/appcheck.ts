import { RequestHandler } from 'express';
import { getAppCheck } from 'firebase-admin/app-check';

export const appCheckMiddleware: RequestHandler = async (req, res, next) => {
  try {
    await getAppCheck().verifyToken(
      req.headers['x-firebase-appcheck'] as string,
    );
    next();
  } catch (err) {
    console.error('[App Check] verifyToken failed:', err);
    res.status(401).json({ message: 'Unauthorized' });
  }
};
