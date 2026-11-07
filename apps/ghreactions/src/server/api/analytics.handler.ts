import { RequestHandler } from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { AnalyticsResponse } from '../../models/analytics';
import { serializeError } from '../serialize-error';

export const analyticsHandler: RequestHandler = async (_req, res) => {
  try {
    const snapshot = await getFirestore().collection('users').count().get();
    const response: AnalyticsResponse = { users: snapshot.data().count };
    res.json(response);
  } catch (error) {
    logger.error('analytics', serializeError(error));
    res.status(500).json({ message: 'Internal server error' });
  }
};
