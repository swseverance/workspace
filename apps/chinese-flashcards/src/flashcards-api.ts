import { NextFunction, Request, Response, Router } from 'express';
import { getAppCheck } from 'firebase-admin/app-check';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import {
  CreateFlashcardArgs,
  Flashcard,
  FlashcardType,
  UpdateFlashcardArgs,
} from './app/models';
import { serializeError } from './serialize-error';

type AuthedRequest = Request & { uid: string };

type WriteFlashcard = {
  chinese: string;
  pinyin: string;
  translation: string;
  notes: string;
  type: FlashcardType;
  uid: string;
  confidence: number;
  created: FieldValue;
  lastUpdated: FieldValue;
};

type ReadFlashcard = {
  chinese: string;
  pinyin: string;
  translation: string;
  notes: string;
  type: FlashcardType;
  uid: string;
  confidence: number;
  created: Timestamp;
  lastUpdated: Timestamp;
};

const toneMap: Record<string, string> = {
  ā: 'a',
  á: 'a',
  ǎ: 'a',
  à: 'a',
  ē: 'e',
  é: 'e',
  ě: 'e',
  è: 'e',
  ī: 'i',
  í: 'i',
  ǐ: 'i',
  ì: 'i',
  ō: 'o',
  ó: 'o',
  ǒ: 'o',
  ò: 'o',
  ū: 'u',
  ú: 'u',
  ǔ: 'u',
  ù: 'u',
  ǖ: 'u',
  ǘ: 'u',
  ǚ: 'u',
  ǜ: 'u',
  ü: 'u',
  Ā: 'A',
  Á: 'A',
  Ǎ: 'A',
  À: 'A',
  Ē: 'E',
  É: 'E',
  Ě: 'E',
  È: 'E',
  Ī: 'I',
  Í: 'I',
  Ǐ: 'I',
  Ì: 'I',
  Ō: 'O',
  Ó: 'O',
  Ǒ: 'O',
  Ò: 'O',
  Ū: 'U',
  Ú: 'U',
  Ǔ: 'U',
  Ù: 'U',
  Ǖ: 'U',
  Ǘ: 'U',
  Ǚ: 'U',
  Ǜ: 'U',
  Ü: 'U',
};

const toSearch = (pinyin: string) =>
  pinyin
    .toLocaleLowerCase()
    .split('')
    .map((char) => toneMap[char] ?? char)
    .join('');

const toFlashcard = (id: string, data: ReadFlashcard): Flashcard => {
  const { uid, ...rest } = data;
  return {
    ...rest,
    id,
    created: data.created.toDate().toISOString(),
    lastUpdated: data.lastUpdated.toDate().toISOString(),
    search: toSearch(data.pinyin),
  };
};

async function requireAppCheck(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.header('X-Firebase-AppCheck');

  if (!token) {
    res.status(401).json({ error: 'App Check token required' });
    return;
  }

  try {
    await getAppCheck().verifyToken(token);
    next();
  } catch (error) {
    logger.error('verifyToken()', serializeError(error));
    res.status(401).json({ error: 'App Check token required' });
  }
}

async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header('Authorization');
  const token = header?.startsWith('Bearer ')
    ? header.slice('Bearer '.length)
    : undefined;

  if (!token) {
    res.status(401).json({ error: 'Must be signed in' });
    return;
  }

  try {
    (req as unknown as AuthedRequest).uid = (
      await getAuth().verifyIdToken(token)
    ).uid;
    next();
  } catch (error) {
    logger.error('verifyIdToken()', serializeError(error));
    res.status(401).json({ error: 'Must be signed in' });
  }
}

export function createFlashcardsRouter(): Router {
  const router = Router();

  router.use(requireAppCheck, requireAuth);

  router.post('/', async (req, res) => {
    const { uid } = req as unknown as AuthedRequest;
    const { chinese, pinyin, translation, notes, type } =
      req.body as CreateFlashcardArgs;

    try {
      const db = getFirestore();
      const ref = await db.collection('flashcards').add({
        chinese,
        pinyin,
        translation,
        notes,
        type,
        uid,
        confidence: 0,
        created: FieldValue.serverTimestamp(),
        lastUpdated: FieldValue.serverTimestamp(),
      } satisfies WriteFlashcard);

      const snap = await ref.get();

      res.json({
        flashcard: toFlashcard(ref.id, snap.data() as ReadFlashcard),
      });
    } catch (error) {
      logger.error('create flashcard', serializeError(error));
      res.status(500).json({ error: 'Failed to create flashcard' });
    }
  });

  router.get('/groups', async (req, res) => {
    const { uid } = req as unknown as AuthedRequest;
    const type = req.query['type'] as FlashcardType;

    try {
      const db = getFirestore();
      const snap = await db
        .collection('flashcards')
        .where('uid', '==', uid)
        .where('type', '==', type)
        .get();

      const map = new Map<number, number>();

      for (const { confidence } of snap.docs.map((doc) =>
        toFlashcard(doc.id, doc.data() as ReadFlashcard),
      )) {
        map.set(confidence, (map.get(confidence) ?? 0) + 1);
      }

      res.json({
        flashcards: Array.from(map.entries())
          .map(([confidence, count]) => ({ confidence, count }))
          .sort((a, b) => a.confidence - b.confidence),
      });
    } catch (error) {
      logger.error('get groups', serializeError(error));
      res.status(500).json({ error: 'Failed to load flashcards' });
    }
  });

  router.get('/', async (req, res) => {
    const { uid } = req as unknown as AuthedRequest;
    const type = req.query['type'] as FlashcardType | undefined;
    const confidence =
      req.query['confidence'] !== undefined
        ? Number(req.query['confidence'])
        : undefined;

    try {
      const db = getFirestore();
      let query = db.collection('flashcards').where('uid', '==', uid);

      if (type) {
        query = query.where('type', '==', type);
      }

      if (confidence !== undefined) {
        query = query.where('confidence', '==', confidence);
      }

      const snap = await query.get();

      res.json({
        flashcards: snap.docs.map((doc) =>
          toFlashcard(doc.id, doc.data() as ReadFlashcard),
        ),
      });
    } catch (error) {
      logger.error('get flashcards', serializeError(error));
      res.status(500).json({ error: 'Failed to load flashcards' });
    }
  });

  router.patch('/:id', async (req, res) => {
    const { uid } = req as unknown as AuthedRequest;
    const { id } = req.params;
    const updates = req.body as UpdateFlashcardArgs['updates'];

    try {
      const db = getFirestore();
      const ref = db.collection('flashcards').doc(id);
      const snap = await ref.get();

      if (!snap.exists) {
        res.status(404).json({ error: 'Flashcard not found' });
        return;
      }

      if ((snap.data() as ReadFlashcard).uid !== uid) {
        res.status(403).json({ error: 'Not your flashcard' });
        return;
      }

      await ref.set(
        {
          ...updates,
          lastUpdated: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      const updated = await ref.get();

      res.json({ flashcard: toFlashcard(id, updated.data() as ReadFlashcard) });
    } catch (error) {
      logger.error('update flashcard', serializeError(error));
      res.status(500).json({ error: 'Failed to update flashcard' });
    }
  });

  router.delete('/:id', async (req, res) => {
    const { uid } = req as unknown as AuthedRequest;
    const { id } = req.params;

    try {
      const db = getFirestore();
      const ref = db.collection('flashcards').doc(id);
      const snap = await ref.get();

      if (!snap.exists) {
        res.status(404).json({ error: 'Flashcard not found' });
        return;
      }

      if ((snap.data() as ReadFlashcard).uid !== uid) {
        res.status(403).json({ error: 'Not your flashcard' });
        return;
      }

      await ref.delete();

      res.status(204).end();
    } catch (error) {
      logger.error('delete flashcard', serializeError(error));
      res.status(500).json({ error: 'Failed to delete flashcard' });
    }
  });

  return router;
}
