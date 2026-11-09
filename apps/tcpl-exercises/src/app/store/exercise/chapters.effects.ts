import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Logger } from '@org/logger';
import { NzMessageService } from 'ng-zorro-antd/message';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { ExerciseService } from '../../services/exercise-service';
import {
  chaptersLoaded,
  loadChapters,
  loadChaptersFailed,
} from './chapters.actions';

@Injectable()
export class ChaptersEffects {
  private actions$ = inject(Actions);
  private exercise = inject(ExerciseService);
  private message = inject(NzMessageService);
  private logger = inject(Logger);

  loadChapters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadChapters),
      switchMap(() =>
        this.exercise.getChapters().pipe(
          map(({ chapters }) => chaptersLoaded({ chapters })),
          catchError((error) => of(loadChaptersFailed({ error }))),
        ),
      ),
    ),
  );

  loadChaptersFailed$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loadChaptersFailed),
        tap(({ error }) => {
          this.logger.error('[chapters] load failed:', error);
          this.message.error('Failed to Load Chapters');
        }),
      ),
    { dispatch: false },
  );
}
