import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    // Profiles change at most a few times a day (refreshProfile cycles
    // through every user), so the CDN can serve them for an hour, and stale
    // for a day while it refetches. Browsers always revalidate.
    path: 'u/**',
    renderMode: RenderMode.Server,
    headers: {
      'Cache-Control':
        'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
