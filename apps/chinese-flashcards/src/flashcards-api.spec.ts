import { describe, expect, it } from 'vitest';
import { FlashcardType } from './app/models';
import { parseUpdates } from './flashcards-api';

describe('parseUpdates', () => {
  it('keeps the editable fields', () => {
    const updates = {
      chinese: '你好',
      pinyin: 'nǐ hǎo',
      translation: 'hello',
      notes: '',
      type: FlashcardType.WORD,
      confidence: 3,
    };

    expect(parseUpdates(updates)).toEqual(updates);
  });

  it('drops fields a client may not edit', () => {
    expect(
      parseUpdates({
        confidence: 1,
        uid: 'someone-else',
        created: 'x',
        lastUpdated: 'x',
        isAdmin: true,
      }),
    ).toEqual({ confidence: 1 });
  });

  it.each([
    [null, 'Body must be an object'],
    [[], 'Body must be an object'],
    [{}, 'No editable fields given'],
    [{ uid: 'someone-else' }, 'No editable fields given'],
    [{ chinese: 42 }, 'chinese must be a string'],
    [{ chinese: '  ' }, 'chinese must not be empty'],
    [{ notes: { $gt: '' } }, 'notes must be a string'],
    [{ type: 'phrase' }, 'type must be one of word, sentence'],
    [{ confidence: -1 }, 'confidence must be a non-negative integer'],
    [{ confidence: 1.5 }, 'confidence must be a non-negative integer'],
    [{ confidence: '2' }, 'confidence must be a non-negative integer'],
  ])('rejects %o', (body, message) => {
    expect(parseUpdates(body)).toBe(message);
  });
});
