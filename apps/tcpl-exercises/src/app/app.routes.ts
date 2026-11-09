import { Route } from '@angular/router';
import { exerciseResolver } from './resolvers/exercise.resolver';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'exercises',
    loadComponent: () =>
      import('./pages/exercises/exercises').then((m) => m.Exercises),
    children: [
      { path: '', redirectTo: '1-1', pathMatch: 'full' },
      {
        path: ':id',
        resolve: { exerciseReady: exerciseResolver },
        loadComponent: () =>
          import('./pages/exercise-detail/exercise-detail').then(
            (m) => m.ExerciseDetail,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
