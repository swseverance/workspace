export enum FlashcardType {
  WORD = 'word',
  SENTENCE = 'sentence',
}

export enum SortStrategy {
  CONFIDENCE = 'confidence',
  RANDOM = 'random',
}

export type CreateFlashcardArgs = {
  chinese: string;
  pinyin: string;
  translation: string;
  notes: string;
  type: FlashcardType;
};

export type GetFlashcardsArgs = {
  type?: FlashcardType;
  confidence?: number;
};

export type UpdateFlashcardArgs = {
  id: string;
  updates: {
    chinese?: string;
    pinyin?: string;
    translation?: string;
    notes?: string;
    type?: FlashcardType;
    confidence?: number;
  };
};

export type Flashcard = {
  chinese: string;
  pinyin: string;
  search: string;
  translation: string;
  notes: string;
  type: FlashcardType;
  confidence: number;
  created: string;
  lastUpdated: string;
  id: string;
};
