/**
 * A same-origin path like `/api/session` (not `//host/...`, not absolute).
 * Only these get rewritten by forwardCookieInterceptor/absoluteUrlInterceptor:
 * an absolute or cross-origin URL keeps going where it was actually pointed.
 */
export function isRelativeUrl(url: string): boolean {
  return url.startsWith('/') && !url.startsWith('//');
}
