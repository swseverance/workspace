import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { WINDOW } from '@org/window';
import { isRelativeUrl } from './relative-url';

/**
 * Browser only. The transfer cache keys a response by its literal request
 * URL. The SSR call's key is its loopback URL mapped to the public origin
 * (provideSsrTransferCacheOrigins), so the browser's request has to be that
 * same absolute string to find it.
 */
export const absoluteUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isPlatformBrowser(inject(PLATFORM_ID)) || !isRelativeUrl(req.url)) {
    return next(req);
  }

  return next(
    req.clone({ url: `${inject(WINDOW)!.location.origin}${req.url}` }),
  );
};
