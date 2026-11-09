import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { AuthActions } from '@org/auth';
import { Logger } from '@org/logger';
import { NzMessageService } from 'ng-zorro-antd/message';
import { firstValueFrom, Observable, of, toArray } from 'rxjs';
import { Exercise } from '../../../shared/models';
import { ExerciseService } from '../../services/exercise-service';
import { loadChapters } from './chapters.actions';
import { ChaptersEffects } from './chapters.effects';
import { exerciseRefreshed } from './exercise.actions';
import { ExerciseEffects } from './exercise.effects';
import { initialExerciseState } from './exercise.state';

const EXERCISE = { id: '1-1' } as Exercise;
const cookieCreated = AuthActions.cookieCreated({ user: { uid: 'alice' } });

function setup(exerciseState: Partial<typeof initialExerciseState>) {
  const service = {
    getExercise: vi.fn(() => of(EXERCISE)),
  };
  const actions$: Observable<Action> = of(cookieCreated);

  TestBed.configureTestingModule({
    providers: [
      ExerciseEffects,
      ChaptersEffects,
      provideMockActions(() => actions$),
      provideMockStore({
        initialState: {
          exercise: { ...initialExerciseState, ...exerciseState },
        },
      }),
      { provide: ExerciseService, useValue: service },
      { provide: Router, useValue: {} },
      { provide: NzMessageService, useValue: {} },
      { provide: Logger, useValue: {} },
    ],
  });

  return {
    service,
    exerciseEffects: TestBed.inject(ExerciseEffects),
    chaptersEffects: TestBed.inject(ChaptersEffects),
  };
}

describe('refetching after a session cookie is created', () => {
  it('refetches the shown exercise', async () => {
    const { service, exerciseEffects } = setup({ id: '1-1' });

    const action = await firstValueFrom(exerciseEffects.refreshExercise$);

    expect(service.getExercise).toHaveBeenCalledWith('1-1');
    expect(action).toEqual(exerciseRefreshed({ exercise: EXERCISE }));
  });

  it('skips the exercise when none is shown', async () => {
    const { service, exerciseEffects } = setup({ id: '' });

    const actions = await firstValueFrom(
      exerciseEffects.refreshExercise$.pipe(toArray()),
    );

    expect(actions).toEqual([]);
    expect(service.getExercise).not.toHaveBeenCalled();
  });

  it('reloads the chapters', async () => {
    const { chaptersEffects } = setup({});

    const action = await firstValueFrom(
      chaptersEffects.reloadChaptersOnSignIn$,
    );

    expect(action).toEqual(loadChapters());
  });
});
