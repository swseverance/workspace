import {
  FetchBackend,
  HttpContext,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { FIREBASE_APP_CHECK } from '@org/firebase';
import { WINDOW } from '@org/window';
import { firstValueFrom, of } from 'rxjs';
import {
  AppCheckBackend,
  LIMITED_USE_APP_CHECK_TOKEN,
} from './app-check.backend';

const appCheckSdk = vi.hoisted(() => ({
  getToken: vi.fn(),
  getLimitedUseToken: vi.fn(),
}));

vi.mock('firebase/app-check', () => appCheckSdk);

describe('AppCheckBackend', () => {
  const appCheck = {};
  let sent: HttpRequest<unknown>[];

  function setup() {
    TestBed.configureTestingModule({
      providers: [
        AppCheckBackend,
        { provide: FIREBASE_APP_CHECK, useValue: appCheck },
        {
          provide: WINDOW,
          useValue: { location: { origin: 'https://example.com' } },
        },
      ],
    });
    return TestBed.inject(AppCheckBackend);
  }

  beforeEach(() => {
    vi.clearAllMocks();
    sent = [];
    vi.spyOn(FetchBackend.prototype, 'handle').mockImplementation((req) => {
      sent.push(req);
      return of(new HttpResponse());
    });
    appCheckSdk.getToken.mockResolvedValue({ token: 'reusable' });
    appCheckSdk.getLimitedUseToken.mockResolvedValue({ token: 'one-time' });
  });

  it('sends the usual token', async () => {
    await firstValueFrom(setup().handle(new HttpRequest('GET', '/api/x')));

    expect(sent[0].headers.get('X-Firebase-AppCheck')).toBe('reusable');
    expect(appCheckSdk.getLimitedUseToken).not.toHaveBeenCalled();
  });

  it('sends a limited-use token when the request asks for one', async () => {
    const req = new HttpRequest('POST', '/api/x', null, {
      context: new HttpContext().set(LIMITED_USE_APP_CHECK_TOKEN, true),
    });

    await firstValueFrom(setup().handle(req));

    expect(sent[0].headers.get('X-Firebase-AppCheck')).toBe('one-time');
    expect(appCheckSdk.getLimitedUseToken).toHaveBeenCalledWith(appCheck);
    expect(appCheckSdk.getToken).not.toHaveBeenCalled();
  });

  it('sends no token cross-origin', async () => {
    await firstValueFrom(
      setup().handle(new HttpRequest('GET', 'https://other.com/x')),
    );

    expect(sent[0].headers.has('X-Firebase-AppCheck')).toBe(false);
  });
});
