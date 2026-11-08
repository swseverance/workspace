import type { Request } from 'express';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import type { IncomingMessage } from 'node:http';
import type { SsrRequestContext } from './models';

/** Header the SSR render puts on its own API calls back into this process. */
export const SSR_LOOPBACK_HEADER = 'x-ssr-loopback-token';

/**
 * Generated fresh per process and only ever handed to the SSR render via
 * REQUEST_CONTEXT (server-only, never serialized into the page), so nothing
 * outside this process can know it.
 */
export const SSR_LOOPBACK_TOKEN = randomBytes(32).toString('hex');

const LOOPBACK_ADDRESSES = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);

/**
 * True only for the SSR render calling back into this same process: the
 * connection must come from a loopback address AND carry this process's
 * secret. Either alone isn't enough to skip App Check.
 */
export function isSsrLoopbackRequest(req: IncomingMessage): boolean {
  if (!LOOPBACK_ADDRESSES.has(req.socket.remoteAddress ?? '')) {
    return false;
  }

  const token = req.headers[SSR_LOOPBACK_HEADER];

  if (typeof token !== 'string') {
    return false;
  }

  const expected = Buffer.from(SSR_LOOPBACK_TOKEN);
  const actual = Buffer.from(token);

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/**
 * The REQUEST_CONTEXT to hand `angularApp.handle(req, context)` so SSR-time
 * API calls stay in this process and match the browser's transfer cache keys.
 *
 * Behind a TLS-terminating proxy (Firebase App Hosting), the app must set
 * Express's `trust proxy` so `req.protocol` reports the browser's https.
 */
export function ssrRequestContext(req: Request): SsrRequestContext {
  return {
    loopbackOrigin: loopbackOrigin(req),
    loopbackHeaders: { [SSR_LOOPBACK_HEADER]: SSR_LOOPBACK_TOKEN },
    publicOrigin: publicOrigin(req),
  };
}

/**
 * The port this request actually arrived on, so SSR-time API calls go
 * straight back into this process instead of hairpinning out through the
 * load balancer (which drops the Cookie header). Works under both the
 * compiled server (PORT) and the dev server, which doesn't set PORT.
 *
 * Always plain http, never `req.protocol`: TLS ends at the proxy, so the
 * process itself only speaks http, even when the browser used https.
 */
function loopbackOrigin(req: Request): string {
  return `http://localhost:${req.socket.localPort}`;
}

/**
 * The origin the browser sees. The host comes from the headers rather than
 * `req.hostname`, which drops the port (local dev runs on localhost:4200).
 * Angular's own trustProxyHeaders is deliberately left off: it also changes
 * which host Angular validates against allowedHosts. This only affects
 * whether this render's transfer cache entries match the browser's
 * requests, nothing cross-user.
 */
function publicOrigin(req: Request): string {
  const host =
    firstValue(req.headers['x-forwarded-host']) ?? req.get('host') ?? '';

  return `${req.protocol}://${host}`;
}

function firstValue(header: string | string[] | undefined): string | undefined {
  const value = Array.isArray(header) ? header[0] : header;
  return value?.split(',')[0]?.trim();
}
