import { RequestHandler } from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import { AnalyticsResponse } from '../../models/analytics';

export const analyticsHandler: RequestHandler = async (_req, res) => {
  try {
    const snapshot = await getFirestore().collection('users').count().get();
    const response: AnalyticsResponse = { users: snapshot.data().count };
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
