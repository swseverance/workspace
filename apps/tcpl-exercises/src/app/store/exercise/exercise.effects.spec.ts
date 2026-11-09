import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { AuthActions } from '@org/auth';
import { Logger } from '@org/logger';
import { NzMessageService } from 'ng-zorro-antd/message';
import { firstValueFrom, Observable, of } from 'rxjs';
import { ExerciseService } from '../../services/exercise-service';
import { exercisesReset } from './exercise.actions';
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
