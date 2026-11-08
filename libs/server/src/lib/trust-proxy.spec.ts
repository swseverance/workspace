// Runs the handlers in a real Express app over real HTTP, so the behaviour
// that depends on Express's `trust proxy` setting is pinned, not mocked.
import express from 'express';
import { request } from 'node:http';
import type { AddressInfo } from 'node:net';
import { createSessionHandler } from './session';
import { ssrRequestContext } from './ssr-loopback';

vi.mock('firebase-admin/auth', () => ({
  getAuth: () => ({ createSessionCookie: async () => 'session-cookie' }),
}));
vi.mock('firebase-functions/logger', () => ({ error: vi.fn() }));

async function serve(trustProxy: boolean) {
  const app = express();
  if (trustProxy) app.set('trust proxy', 1);
  app.use(express.json());
  app.get('/context', (req, res) => {
    res.json({ ...ssrRequestContext(req), secure: req.secure });
  });
  app.post('/session', createSessionHandler);

  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address() as AddressInfo;

  return {
    port,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

/** A minimal client that, unlike fetch, may set its own Host header. */
function send(
  port: number,
  path: string,
  {
    method = 'GET',
    headers = {},
    body,
  }: { method?: string; headers?: Record<string, string>; body?: unknown } = {},
): Promise<{ setCookie: string; json: Record<string, unknown> }> {
  return new Promise((resolve, reject) => {
    const req = request(
      {
        host: '127.0.0.1',
        port,
        path,
        method,
        headers: body
          ? { ...headers, 'content-type': 'application/json' }
          : headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () =>
          resolve({
            setCookie: (res.headers['set-cookie'] ?? []).join('\n'),
            json: data ? JSON.parse(data) : {},
          }),
        );
      },
    );
    req.on('error', reject);
    req.end(body ? JSON.stringify(body) : undefined);
  });
}

const behindProxy = {
  'x-forwarded-proto': 'https',
  'x-forwarded-host': 'app.example.com',
};

describe('with trust proxy', () => {
  let server: Awaited<ReturnType<typeof serve>>;

  beforeAll(async () => (server = await serve(true)));
  afterAll(() => server.close());

  it('reports the https public origin, but loops back over plain http', async () => {
    const { json: context } = await send(server.port, '/context', {
      headers: behindProxy,
    });

    expect(context.publicOrigin).toBe('https://app.example.com');
    expect(context.loopbackOrigin).toBe(`http://localhost:${server.port}`);
    expect(context.secure).toBe(true);
  });

  it('marks the session cookie Secure for https visitors', async () => {
    const { setCookie } = await send(server.port, '/session', {
      method: 'POST',
      headers: behindProxy,
      body: { idToken: 'id-token' },
    });

    expect(setCookie).toMatch(/;\s*Secure/i);
  });

  it('stays plain http locally, where there is no proxy', async () => {
    const { json: context } = await send(server.port, '/context', {
      headers: { host: 'localhost:4200' },
    });

    expect(context.publicOrigin).toBe('http://localhost:4200');
    expect(context.loopbackOrigin).toBe(`http://localhost:${server.port}`);
    expect(context.secure).toBe(false);
  });

  it('leaves the session cookie usable on http://localhost', async () => {
    const { setCookie } = await send(server.port, '/session', {
      method: 'POST',
      headers: { host: 'localhost:4200' },
      body: { idToken: 'id-token' },
    });

    expect(setCookie).toContain('__session=session-cookie');
    expect(setCookie).not.toMatch(/;\s*Secure/i);
  });
});

describe('without trust proxy', () => {
  let server: Awaited<ReturnType<typeof serve>>;

  beforeAll(async () => (server = await serve(false)));
  afterAll(() => server.close());

  // Why apps behind App Hosting must set it.
  it('cannot tell the visitor used https', async () => {
    const { json: context } = await send(server.port, '/context', {
      headers: behindProxy,
    });

    expect(context.publicOrigin).toBe('http://app.example.com');
    expect(context.secure).toBe(false);
  });
});
