import {
  HTTP_TRANSFER_CACHE_ORIGIN_MAP,
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { PLATFORM_ID, REQUEST, REQUEST_CONTEXT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { SsrRequestContext } from '@org/server';
import { WINDOW } from '@org/window';
import { provideSsrTransferCacheOrigins } from '../provide-auth';
import { absoluteUrlInterceptor } from './absolute-url.interceptor';
import { forwardCookieInterceptor } from './forward-cookie.interceptor';

const context: SsrRequestContext = {
  loopbackOrigin: 'http://localhost:8080',
  loopbackHeaders: { 'x-ssr-loopback-token': 'secret' },
  publicOrigin: 'https://app.example.com',
};

describe('forwardCookieInterceptor', () => {
  function setup(request: Request | null) {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([forwardCookieInterceptor])),
        provideHttpClientTesting(),
        { provide: REQUEST, useValue: request },
        { provide: REQUEST_CONTEXT, useValue: context },
      ],
    });
    return {
      http: TestBed.inject(HttpClient),
      backend: TestBed.inject(HttpTestingController),
    };
  }

  it('sends SSR calls to the loopback origin with the cookie and loopback token', () => {
    const { http, backend } = setup(
      new Request('https://app.example.com/', {
        headers: { cookie: '__session=abc' },
      }),
    );

    http.get('/api/session').subscribe();
    const req = backend.expectOne('http://localhost:8080/api/session');

    expect(req.request.headers.get('Cookie')).toBe('__session=abc');
    expect(req.request.headers.get('x-ssr-loopback-token')).toBe('secret');
  });

  it('leaves absolute URLs alone so the cookie never leaves the process', () => {
    const { http, backend } = setup(
      new Request('https://app.example.com/', {
        headers: { cookie: '__session=abc' },
      }),
    );

    http.get('https://other.example.com/api').subscribe();
    const req = backend.expectOne('https://other.example.com/api');

    expect(req.request.headers.has('Cookie')).toBe(false);
    expect(req.request.headers.has('x-ssr-loopback-token')).toBe(false);
  });

  it('does nothing outside a server render', () => {
    const { http, backend } = setup(null);

    http.get('/api/session').subscribe();

    backend.expectOne('/api/session');
  });
});

describe('absoluteUrlInterceptor', () => {
  function setup(platform: 'browser' | 'server') {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([absoluteUrlInterceptor])),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: platform },
        {
          provide: WINDOW,
          useValue: { location: { origin: 'https://app.example.com' } },
        },
      ],
    });
    return {
      http: TestBed.inject(HttpClient),
      backend: TestBed.inject(HttpTestingController),
    };
  }

  it('makes relative URLs absolute in the browser to match the transfer cache key', () => {
    const { http, backend } = setup('browser');

    http.get('/api/session').subscribe();

    backend.expectOne('https://app.example.com/api/session');
  });

  it('does nothing on the server', () => {
    const { http, backend } = setup('server');

    http.get('/api/session').subscribe();

    backend.expectOne('/api/session');
  });
});

describe('provideSsrTransferCacheOrigins', () => {
  it('maps the loopback origin to the public origin', () => {
    TestBed.configureTestingModule({
      providers: [
        provideSsrTransferCacheOrigins(),
        { provide: REQUEST_CONTEXT, useValue: context },
      ],
    });

    expect(TestBed.inject(HTTP_TRANSFER_CACHE_ORIGIN_MAP)).toEqual({
      'http://localhost:8080': 'https://app.example.com',
    });
  });

  it('maps nothing without a request context', () => {
    TestBed.configureTestingModule({
      providers: [provideSsrTransferCacheOrigins()],
    });

    expect(TestBed.inject(HTTP_TRANSFER_CACHE_ORIGIN_MAP)).toEqual({});
  });
});
