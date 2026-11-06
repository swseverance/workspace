import { Route } from '@angular/router';
import { authGuard } from './guards/auth/auth-guard';

export const appRoutes: Route[] = [
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login').then((c) => c.Login),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/dashboard/dashboard').then((c) => c.Dashboard),
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./components/create/create').then((c) => c.Create),
      },
      {
        path: 'study/:type',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./components/study/study').then((c) => c.Study),
          },
          {
            path: ':confidence',
            loadComponent: () =>
              import('./components/session/session').then((c) => c.Session),
          },
        ],
      },
      {
        path: 'search',
        loadComponent: () =>
          import('./components/search/search').then((c) => c.Search),
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
