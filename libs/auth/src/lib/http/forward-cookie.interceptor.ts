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
 * this process; the Cookie is attached by hand since Node has no cookie jar.
 *
 * The loopback headers let appCheckMiddleware skip App Check for this call.
 * Only relative URLs qualify, so neither the cookie nor the loopback token
 * can ever be sent anywhere but back into this process.
 */
export const forwardCookieInterceptor: HttpInterceptorFn = (req, next) => {
  const request = inject(REQUEST, { optional: true });
  const context = inject(REQUEST_CONTEXT, {
    optional: true,
  }) as Partial<SsrRequestContext> | null;

  if (!request || !context?.loopbackOrigin || !isRelativeUrl(req.url)) {
    return next(req);
  }

  const cookie = request.headers.get('cookie');

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
