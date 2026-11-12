import { Route, UrlSegment } from '@angular/router';
import { PROFILE_TABS } from './components/profile/tabs';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./components/about/about').then((c) => c.About),
  },
  {
    path: 'search',
    loadComponent: () => import('./components/main/main').then((c) => c.Main),
  },
  // One page per type, so each is its own indexable URL. One route for all
  // three, so switching tabs keeps the component and its fetched profile.
  { path: 'u/:username', redirectTo: 'u/:username/issues', pathMatch: 'full' },
  {
    path: 'u/:username/:tab',
    canMatch: [
      (_route: Route, segments: UrlSegment[]) =>
        PROFILE_TABS.some((t) => t.path === segments[2]?.path),
    ],
    loadComponent: () =>
      import('./components/profile/profile').then((c) => c.Profile),
  },
  // Page 1 is /users; later pages /users/2, /users/3, ...
  { path: 'users/1', redirectTo: 'users', pathMatch: 'full' },
  {
    path: 'users',
    loadComponent: () =>
      import('./components/users/users').then((c) => c.Users),
  },
  {
    path: 'users/:page',
    canMatch: [
      (_route: Route, segments: UrlSegment[]) =>
        /^[1-9]\d*$/.test(segments[1]?.path ?? ''),
    ],
    loadComponent: () =>
      import('./components/users/users').then((c) => c.Users),
  },
  { path: '**', redirectTo: 'search' },
];
