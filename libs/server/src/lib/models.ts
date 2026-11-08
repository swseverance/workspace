// The HTTP contract between these handlers and @org/auth. Types only, so the
// Angular side can `import type` them without pulling server code into the
// browser bundle.

export type SessionUser = {
  uid: string;
};

export type CreateSessionRequestBody = {
  idToken: string;
};

export type CreateSessionResponseBody = {
  status: 'valid' | 'created';
};

export type SessionResponseBody = {
  user: SessionUser | null;
};

export type ErrorResponseBody = {
  message: string;
};

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogRequestBody = {
  level: LogLevel;
  message: string;
  data?: unknown;
};

/**
 * Passed to the SSR render as REQUEST_CONTEXT (see `ssrRequestContext`).
 * Only carries what the SSR HTTP plumbing in @org/auth needs; page data
 * itself is fetched over HTTP like it is in the browser.
 */
export type SsrRequestContext = {
  /** Where SSR-time API calls are sent so they stay in-process. */
  loopbackOrigin: string;
  /**
   * Headers that let those calls skip App Check (see isSsrLoopbackRequest).
   * Server-only: REQUEST_CONTEXT is never serialized into the page.
   */
  loopbackHeaders: Record<string, string>;
  /** The origin the browser sees, so both sides compute the same transfer cache key. */
  publicOrigin: string;
};
