import { ErrorResponseBody, serializeError } from '@org/server';
import { RequestHandler } from 'express';
import * as logger from 'firebase-functions/logger';
import { AnalyticsResponseBody } from '../../shared/models';
import { getStats } from '../analytics/analytics';

export const getAnalyticsHandler: RequestHandler<
  unknown,
  AnalyticsResponseBody | ErrorResponseBody
> = async (_req, res) => {
  // Express 4 doesn't catch rejected promises from async handlers.
  try {
    res.json(await getStats());
  } catch (err) {
    logger.error('[analytics] get failed:', serializeError(err));
    res.status(500).json({ message: 'Failed to load analytics' });
  }
};
