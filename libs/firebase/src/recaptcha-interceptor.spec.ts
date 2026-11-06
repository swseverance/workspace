import { HttpRequest } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { getToken } from 'firebase/app-check';
import { firstValueFrom, of } from 'rxjs';
import { FIREBASE_APP_CHECK } from './index';
import { recaptchaInterceptor } from './recaptcha-interceptor';

vi.mock('firebase/app-check', () => ({ getToken: vi.fn() }));

describe('recaptchaInterceptor', () => {
  const req = new HttpRequest('GET', '/api/flashcards');

  it('passes the request through unchanged when App Check is unavailable', async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: FIREBASE_APP_CHECK, useValue: null }],
    });

    const next = vi.fn((r: HttpRequest<unknown>) => of(r));

    await firstValueFrom(
      TestBed.runInInjectionContext(() => recaptchaInterceptor(req, next)),
    );

    expect(next).toHaveBeenCalledWith(req);
  });

  it('attaches the App Check token header', async () => {
    vi.mocked(getToken).mockResolvedValue({
      token: 'app-check-token',
    } as never);

    TestBed.configureTestingModule({
      providers: [{ provide: FIREBASE_APP_CHECK, useValue: {} }],
    });

    const next = vi.fn((r: HttpRequest<unknown>) => of(r));

    await firstValueFrom(
      TestBed.runInInjectionContext(() => recaptchaInterceptor(req, next)),
    );

    const forwarded = next.mock.calls[0][0];
    expect(forwarded.headers.get('X-Firebase-AppCheck')).toBe(
      'app-check-token',
    );
  });
});
