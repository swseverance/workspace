import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  convertToParamMap,
  RouterStateSnapshot,
} from '@angular/router';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { AuthActions } from '@org/auth';
import {
  firstValueFrom,
  Observable,
  of,
  Subject,
  throwError,
  toArray,
} from 'rxjs';
import { Exercise } from '../../shared/models';
import { ExerciseService } from '../services/exercise-service';
import {
  exerciseNavigationFailed,
  exerciseNavigationSucceeded,
} from '../store/exercise/exercise.actions';
import { exerciseResolver } from './exercise.resolver';

const EXERCISE = { id: '1-1' } as Exercise;
let actions$: Subject<Action>;

function resolve(getExercise: () => Observable<Exercise>) {
  actions$ = new Subject<Action>();
  TestBed.configureTestingModule({
    providers: [
      provideMockStore(),
      provideMockActions(() => actions$),
      { provide: ExerciseService, useValue: { getExercise } },
    ],
  });

  const store = TestBed.inject(MockStore);
  const dispatch = vi.spyOn(store, 'dispatch');
  const route = {
    paramMap: convertToParamMap({ id: '1-1' }),
  } as ActivatedRouteSnapshot;

  const result$ = TestBed.runInInjectionContext(() =>
    exerciseResolver(route, {} as RouterStateSnapshot),
  ) as Observable<boolean>;

  return { dispatch, emitted: firstValueFrom(result$.pipe(toArray())) };
}

describe('exerciseResolver', () => {
  it('resolves true and stores the exercise when it loads', async () => {
    const { dispatch, emitted } = resolve(() => of(EXERCISE));

    expect(await emitted).toEqual([true]);
    expect(dispatch).toHaveBeenCalledWith(
      exerciseNavigationSucceeded({ exercise: EXERCISE }),
    );
  });

  it('starts the request again when a session cookie is created mid-request', async () => {
    const stale = new Subject<Exercise>();
    const fresh = { id: '1-1', code: 'saved' } as Exercise;
    const getExercise = vi
      .fn<() => Observable<Exercise>>()
      .mockReturnValueOnce(stale)
      .mockReturnValueOnce(of(fresh));
    const { dispatch, emitted } = resolve(getExercise);

    actions$.next(AuthActions.cookieCreated({ user: { uid: 'alice' } }));
    stale.next({ id: '1-1', code: '' } as Exercise);

    expect(await emitted).toEqual([true]);
    expect(getExercise).toHaveBeenCalledTimes(2);
    expect(stale.observed).toBe(false);
    expect(dispatch).toHaveBeenCalledExactlyOnceWith(
      exerciseNavigationSucceeded({ exercise: fresh }),
    );
  });

  it('cancels the navigation when the restarted request fails', async () => {
    const stale = new Subject<Exercise>();
    const error = new HttpErrorResponse({ status: 500 });
    const getExercise = vi
      .fn<() => Observable<Exercise>>()
      .mockReturnValueOnce(stale)
      .mockReturnValueOnce(throwError(() => error));
    const { dispatch, emitted } = resolve(getExercise);

    actions$.next(AuthActions.cookieCreated({ user: { uid: 'alice' } }));

    expect(await emitted).toEqual([]);
    expect(stale.observed).toBe(false);
    expect(dispatch).toHaveBeenCalledExactlyOnceWith(
      exerciseNavigationFailed({ id: '1-1', error }),
    );

    // Done with: a later sign-in doesn't fetch again.
    actions$.next(AuthActions.cookieCreated({ user: { uid: 'alice' } }));
    expect(getExercise).toHaveBeenCalledTimes(2);
  });

  it('resolves false when the exercise does not exist', async () => {
    const error = new HttpErrorResponse({ status: 404 });
    const { dispatch, emitted } = resolve(() => throwError(() => error));

    expect(await emitted).toEqual([false]);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('cancels the navigation on any other failure', async () => {
    const error = new HttpErrorResponse({ status: 500 });
    const { dispatch, emitted } = resolve(() => throwError(() => error));

    expect(await emitted).toEqual([]);
    expect(dispatch).toHaveBeenCalledWith(
      exerciseNavigationFailed({ id: '1-1', error }),
    );
  });
});
