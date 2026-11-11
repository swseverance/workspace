import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { AuthActions } from '@org/auth';
import { Logger } from '@org/logger';
import { NzMessageService } from 'ng-zorro-antd/message';
import { firstValueFrom, Observable, of } from 'rxjs';
import type { Exercise, ExerciseTestCase } from '../../../shared/models';
import { ExerciseService } from '../../services/exercise-service';
import {
  exercisesReset,
  exerciseSubmitted,
  submitExercise,
  submitExerciseFailed,
} from './exercise.actions';
import { ExerciseEffects } from './exercise.effects';

describe('ExerciseEffects.sessionEnded$', () => {
  it('goes home and then resets the exercise state', async () => {
    const order: string[] = [];
    const navigateByUrl = vi.fn(async (url: string) => {
      order.push(`navigate ${url}`);
      return true;
    });
    const actions$: Observable<Action> = of(
      AuthActions.sessionEnded({ user: { uid: 'alice' } }),
    );

    TestBed.configureTestingModule({
      providers: [
        ExerciseEffects,
        provideMockStore(),
        provideMockActions(() => actions$),
        { provide: Router, useValue: { navigateByUrl } },
        { provide: ExerciseService, useValue: {} },
        { provide: NzMessageService, useValue: {} },
        { provide: Logger, useValue: {} },
      ],
    });

    const action = await firstValueFrom(
      TestBed.inject(ExerciseEffects).sessionEnded$,
    );
    order.push(action.type);

    expect(order).toEqual(['navigate /', exercisesReset().type]);
  });
});

describe('ExerciseEffects submission messages', () => {
  const message = { info: vi.fn(), success: vi.fn(), error: vi.fn() };
  const logger = { error: vi.fn() };

  function setup(action: Action) {
    TestBed.configureTestingModule({
      providers: [
        ExerciseEffects,
        provideMockStore(),
        provideMockActions(() => of(action)),
        { provide: Router, useValue: {} },
        { provide: ExerciseService, useValue: {} },
        { provide: NzMessageService, useValue: message },
        { provide: Logger, useValue: logger },
      ],
    });
    return TestBed.inject(ExerciseEffects);
  }

  function submitted(
    statuses: ExerciseTestCase['status'][],
    compilationError = '',
  ) {
    const exercise = {
      compilationError,
      tests: statuses.map((status) => ({ status })),
    } as Exercise;
    return exerciseSubmitted({ exercise });
  }

  beforeEach(() => vi.clearAllMocks());

  it('shows a pending message while the tests run', async () => {
    await firstValueFrom(
      setup(submitExercise({ code: '' })).displayPendingMessage$,
    );

    expect(message.info).toHaveBeenCalledWith('Running Tests...');
  });

  it('reports a compilation error instead of test results', async () => {
    await firstValueFrom(
      setup(submitted(['failed'], 'main.c:1: error')).exerciseSubmitted$,
    );

    expect(message.error).toHaveBeenCalledWith('Compilation Error');
    expect(message.success).not.toHaveBeenCalled();
  });

  it('counts the failed tests', async () => {
    await firstValueFrom(
      setup(submitted(['passed', 'failed', 'failed'])).exerciseSubmitted$,
    );

    expect(message.error).toHaveBeenCalledWith('2/3 Tests Failed');
  });

  it('reports success when every test passed, ignoring ones not run', async () => {
    await firstValueFrom(
      setup(submitted(['passed', 'passed', 'indeterminate']))
        .exerciseSubmitted$,
    );

    expect(message.success).toHaveBeenCalledWith('2/2 Tests Passed');
    expect(message.error).not.toHaveBeenCalled();
  });

  it('tells a rate-limited user to wait', async () => {
    const error = new HttpErrorResponse({ status: 429 });

    await firstValueFrom(
      setup(submitExerciseFailed({ id: '1-1', error })).submitExerciseFailed$,
    );

    expect(logger.error).toHaveBeenCalledWith(
      '[exercise] submit failed:',
      error,
    );
    expect(message.error).toHaveBeenCalledWith(
      'Too many submissions. Please wait a moment and try again.',
    );
  });

  it.each([
    ['another HTTP error', new HttpErrorResponse({ status: 500 })],
    ['a non-HTTP error', new Error('boom')],
  ])('reports a generic failure for %s', async (_name, error) => {
    await firstValueFrom(
      setup(submitExerciseFailed({ id: '1-1', error })).submitExerciseFailed$,
    );

    expect(logger.error).toHaveBeenCalledWith(
      '[exercise] submit failed:',
      error,
    );
    expect(message.error).toHaveBeenCalledWith('Failed to Submit Exercise');
  });
});
