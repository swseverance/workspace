import {
  FetchBackend,
  HttpBackend,
  HttpEvent,
  HttpRequest,
} from '@angular/common/http';
import {
  EnvironmentProviders,
  inject,
  Injectable,
  makeEnvironmentProviders,
} from '@angular/core';
import { FIREBASE_APP_CHECK } from '@org/firebase';
import { WINDOW } from '@org/window';
import { getToken } from 'firebase/app-check';
import { from, Observable, switchMap } from 'rxjs';

/**
 * Attaches the App Check token at the backend, not in an interceptor:
 * interceptors run before Angular's transfer cache, so an interceptor would
 * await getToken() even for requests the cache answers. That makes
 * hydration-time cache hits async and leaves the store empty during the
 * first client render. The backend only runs for requests that actually go
 * to the network.
 *
 * Extends FetchBackend (rather than wrapping it) so Angular's SSR check that
 * HttpClient uses fetch still passes. Provide it with provideAppCheckBackend.
 */
@Injectable()
export class AppCheckBackend extends FetchBackend {
  // Null on the server.
  private readonly appCheck = inject(FIREBASE_APP_CHECK);
  private readonly window = this.appCheck ? inject(WINDOW) : null;

  override handle(req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
    const appCheck = this.appCheck;
    const origin = this.window?.location.origin;

    // Cross-origin requests never get the token.
    if (!appCheck || !origin || new URL(req.url, origin).origin !== origin) {
      return super.handle(req);
    }

    return from(getToken(appCheck)).pipe(
      switchMap(({ token }) =>
        super.handle(
          req.clone({ setHeaders: { 'X-Firebase-AppCheck': token } }),
        ),
      ),
    );
  }
}

/**
 * Sends the App Check token on same-origin requests that reach the network.
 * Must come after provideHttpClient(withFetch()) so it overrides that backend.
 */
export function provideAppCheckBackend(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: HttpBackend, useClass: AppCheckBackend },
  ]);
}
