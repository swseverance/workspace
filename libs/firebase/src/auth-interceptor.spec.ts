import { HttpRequest } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { authInterceptor } from './auth-interceptor';
import { AUTH } from './index';

describe('authInterceptor', () => {
  const req = new HttpRequest('GET', '/api/flashcards');

  it('passes the request through unchanged when there is no signed-in user', async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: AUTH, useValue: null }],
    });

    const next = vi.fn((r: HttpRequest<unknown>) => of(r));

    await firstValueFrom(
      TestBed.runInInjectionContext(() => authInterceptor(req, next)),
    );

    expect(next).toHaveBeenCalledWith(req);
  });

  it('attaches the ID token as a bearer header', async () => {
    const getIdToken = vi.fn().mockResolvedValue('id-token');

    TestBed.configureTestingModule({
      providers: [{ provide: AUTH, useValue: { currentUser: { getIdToken } } }],
    });

    const next = vi.fn((r: HttpRequest<unknown>) => of(r));

    await firstValueFrom(
      TestBed.runInInjectionContext(() => authInterceptor(req, next)),
    );

    const forwarded = next.mock.calls[0][0];
    expect(forwarded.headers.get('Authorization')).toBe('Bearer id-token');
  });
});
