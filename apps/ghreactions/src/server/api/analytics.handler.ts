import { serializeError } from '@org/server';
import { RequestHandler } from 'express';
import * as logger from 'firebase-functions/logger';
import { analytics } from '../analytics/analytics';

export const analyticsHandler: RequestHandler = async (_req, res) => {
  try {
    res.json(await analytics.getStats());
  } catch (error) {
    logger.error('analytics', serializeError(error));
    res.status(500).json({ message: 'Internal server error' });
  }
};
