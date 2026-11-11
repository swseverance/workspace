import { createAction, props } from '@ngrx/store';
import { Chapter } from '../../../shared/models';

export const loadChapters = createAction('Load Chapters');

export const chaptersLoaded = createAction(
  'Chapters Loaded',
  props<{ chapters: Chapter[] }>(),
);

export const loadChaptersFailed = createAction(
  'Load Chapters Failed',
  props<{ error: unknown }>(),
);
