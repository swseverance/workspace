import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Profiles and rankings change at most a few times a day (refreshProfile
 * cycles through every user), so the CDN can serve them for an hour, and
 * stale for a day while it refetches. Browsers always revalidate.
 */
const CDN_CACHED = {
  'Cache-Control':
    'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
};

export const serverRoutes: ServerRoute[] = [
  { path: 'u/**', renderMode: RenderMode.Server, headers: CDN_CACHED },
  { path: 'users', renderMode: RenderMode.Server, headers: CDN_CACHED },
  { path: 'users/**', renderMode: RenderMode.Server, headers: CDN_CACHED },
  { path: '**', renderMode: RenderMode.Server },
];
