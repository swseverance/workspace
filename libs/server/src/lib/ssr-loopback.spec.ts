import type { Request } from 'express';
import {
  SSR_LOOPBACK_HEADER,
  SSR_LOOPBACK_TOKEN,
  ssrRequestContext,
} from './ssr-loopback';

function createRequest(headers: Record<string, string> = {}): Request {
  return {
    protocol: 'http',
    headers,
    socket: { localPort: 8080 },
    get: (name: string) => (name === 'host' ? 'localhost:4200' : undefined),
  } as unknown as Request;
}

describe('ssrRequestContext', () => {
  it('points SSR calls back at the port this request arrived on', () => {
    const context = ssrRequestContext(createRequest());

    expect(context.loopbackOrigin).toBe('http://localhost:8080');
    expect(context.loopbackHeaders).toEqual({
      [SSR_LOOPBACK_HEADER]: SSR_LOOPBACK_TOKEN,
    });
  });

  it('uses the Host header as the public origin when there is no proxy', () => {
    expect(ssrRequestContext(createRequest()).publicOrigin).toBe(
      'http://localhost:4200',
    );
  });

  it('takes the first forwarded host from a proxy', () => {
    const context = ssrRequestContext(
      createRequest({ 'x-forwarded-host': 'app.example.com, internal' }),
    );

    expect(context.publicOrigin).toBe('http://app.example.com');
  });

  it('always loops back over plain http, whatever the visitor used', () => {
    const req = { ...createRequest(), protocol: 'https' } as Request;

    expect(ssrRequestContext(req).loopbackOrigin).toBe('http://localhost:8080');
  });
});
