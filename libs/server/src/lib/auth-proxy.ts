import type { RequestHandler } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

/**
 * Proxies Firebase Auth's `/__/auth/**` helper pages (used by
 * signInWithRedirect) from the project's firebaseapp.com domain, so the app's
 * own domain can be its `authDomain` and the sign-in redirect stays
 * first-party.
 */
export function firebaseAuthProxy(projectId: string): RequestHandler {
  return createProxyMiddleware({
    target: `https://${projectId}.firebaseapp.com`,
    changeOrigin: true,
    pathFilter: '/__/auth/**',
  });
}
