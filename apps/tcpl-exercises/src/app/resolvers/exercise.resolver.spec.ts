import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  convertToParamMap,
  RedirectCommand,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { firstValueFrom, Observable, of, throwError, toArray } from 'rxjs';
import { Exercise } from '../../shared/models';
import { ExerciseService } from '../services/exercise-service';
import {
  exerciseNavigationFailed,
  exerciseNavigationSucceeded,
} from '../store/exercise/exercise.actions';
import { exerciseResolver } from './exercise.resolver';

const EXERCISE = { id: '1-1' } as Exercise;

function resolve(getExercise: () => Observable<Exercise>) {
  TestBed.configureTestingModule({
    providers: [
      provideMockStore(),
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
  ) as Observable<boolean | RedirectCommand>;

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

  it('redirects to /exercises when the exercise does not exist', async () => {
    const error = new HttpErrorResponse({ status: 404 });
    const { dispatch, emitted } = resolve(() => throwError(() => error));

    const [result] = await emitted;

    expect(result).toBeInstanceOf(RedirectCommand);
    expect(
      TestBed.inject(Router).serializeUrl(
        (result as RedirectCommand).redirectTo,
      ),
    ).toBe('/exercises');
    expect(dispatch).toHaveBeenCalledWith(
      exerciseNavigationFailed({ id: '1-1', error }),
    );
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
