import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./components/about/about').then((c) => c.About),
    title: 'GitHub Reactions – Search Issues, PRs & Comments by User',
  },
  {
    path: 'search',
    loadComponent: () => import('./components/main/main').then((c) => c.Main),
    title: 'Search – GitHub Reactions',
  },
  { path: '**', redirectTo: 'search' },
];
