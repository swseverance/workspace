import { type ErrorResponseBody, serializeError } from '@org/server';
import type { RequestHandler } from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import type {
  ListWeightsResponseBody,
  UpsertWeightRequestBody,
  WeightEntry,
} from '../../app/models';

// These handlers expect requireUserMiddleware in front of them, so req.user
// is always set.

type DateParams = { date: string };

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const MIN_WEIGHT = 1;
const MAX_WEIGHT = 2000;

/** A real calendar date in YYYY-MM-DD form (rejects e.g. 2025-02-30). */
export function isValidDate(value: unknown): value is string {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

function isValidWeight(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= MIN_WEIGHT &&
    value <= MAX_WEIGHT
  );
}

function weightsCollection(uid: string) {
  return getFirestore().collection('users').doc(uid).collection('weights');
}

export const listWeightsHandler: RequestHandler<
  unknown,
  ListWeightsResponseBody | ErrorResponseBody
> = async (req, res) => {
  try {
    const snapshot = await weightsCollection(req.user!.uid)
      .orderBy('date', 'desc')
      .get();

    const entries = snapshot.docs.map((doc): WeightEntry => {
      const { date, weight } = doc.data() as Omit<WeightEntry, 'id'>;
      return { id: doc.id, date, weight };
    });

    res.json({ entries });
  } catch (error) {
    logger.error('[weights] list failed', { error: serializeError(error) });
    res.status(500).json({ message: 'Failed to load weights' });
  }
};

/** Creates or replaces the entry for a date; one entry per day. */
export const upsertWeightHandler: RequestHandler<
  DateParams,
  WeightEntry | ErrorResponseBody,
  Partial<Record<keyof UpsertWeightRequestBody, unknown>> | undefined
> = async (req, res) => {
  const { date } = req.params;
  const weight = req.body?.weight;

  if (!isValidDate(date)) {
    res.status(400).json({ message: 'date must be YYYY-MM-DD' });
    return;
  }

  if (!isValidWeight(weight)) {
    res.status(400).json({
      message: `weight must be a number from ${MIN_WEIGHT} to ${MAX_WEIGHT}`,
    });
    return;
  }

  const entry: WeightEntry = { id: date, date, weight };

  try {
    await weightsCollection(req.user!.uid).doc(date).set(entry);
    res.json(entry);
  } catch (error) {
    logger.error('[weights] upsert failed', { error: serializeError(error) });
    res.status(500).json({ message: 'Failed to save weight' });
  }
};

export const deleteWeightHandler: RequestHandler<
  DateParams,
  ErrorResponseBody
> = async (req, res) => {
  const { date } = req.params;

  if (!isValidDate(date)) {
    res.status(400).json({ message: 'date must be YYYY-MM-DD' });
    return;
  }

  try {
    await weightsCollection(req.user!.uid).doc(date).delete();
    res.status(204).end();
  } catch (error) {
    logger.error('[weights] delete failed', { error: serializeError(error) });
    res.status(500).json({ message: 'Failed to delete weight' });
  }
};
