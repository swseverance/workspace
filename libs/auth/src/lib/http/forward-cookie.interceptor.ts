import { HttpInterceptorFn } from '@angular/common/http';
import { inject, REQUEST, REQUEST_CONTEXT } from '@angular/core';
import type { SsrRequestContext } from '@org/server';
import { isRelativeUrl } from './relative-url';

/**
 * SSR only (REQUEST is null in the browser and during the build's route
 * extraction). A same-origin call made during SSR would otherwise resolve
 * against the incoming request's public hostname, leave the container, and
 * hairpin back in through the load balancer as a new request, which drops
 * the Cookie header on the way. Rewriting to the loopback origin keeps it in
 * this process.
 *
 * The loopback headers let appCheckMiddleware skip App Check for this call.
 * With `forwardCookie`, the incoming Cookie is attached by hand too, since
 * Node has no cookie jar. Only relative URLs qualify, so neither the cookie
 * nor the loopback token can ever be sent anywhere but back into this process.
 */
export const ssrLoopbackInterceptor =
  ({ forwardCookie }: { forwardCookie: boolean }): HttpInterceptorFn =>
  (req, next) => {
    const request = inject(REQUEST, { optional: true });
    const context = inject(REQUEST_CONTEXT, {
      optional: true,
    }) as Partial<SsrRequestContext> | null;

    if (!request || !context?.loopbackOrigin || !isRelativeUrl(req.url)) {
      return next(req);
    }

    const cookie = forwardCookie ? request.headers.get('cookie') : null;

    return next(
      req.clone({
        url: `${context.loopbackOrigin}${req.url}`,
        setHeaders: {
          ...context.loopbackHeaders,
          ...(cookie ? { Cookie: cookie } : {}),
        },
      }),
    );
  };

/** The loopback interceptor for apps with cookie sessions. */
export const forwardCookieInterceptor = ssrLoopbackInterceptor({
  forwardCookie: true,
});
