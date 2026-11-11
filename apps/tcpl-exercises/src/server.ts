import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import {
  appCheckMiddleware,
  createSessionHandler,
  deleteSessionHandler,
  firebaseAuthProxy,
  getSessionHandler,
  logHandler,
  requireUserMiddleware,
  ssrRequestContext,
  verifySessionCookieMiddleware,
  type SsrRequestContext,
} from '@org/server';
import cookieParser from 'cookie-parser';
import express from 'express';
import { initializeApp } from 'firebase-admin/app';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getAnalyticsHandler } from './server/api/analytics.handler';
import { getChaptersHandler } from './server/api/chapters.handler';
import {
  getExerciseHandler,
  saveExerciseCodeHandler,
  submitExerciseHandler,
} from './server/api/exercise.handler';
import { exerciseExistsMiddleware } from './server/middleware/exercise-exists/exercise-exists';
import { submitExerciseRateLimitMiddleware } from './server/middleware/rate-limit/rate-limit';
import {
  exercisesIndexRedirectHandler,
  noindexOutsideProdMiddleware,
  robotsHandler,
  siteUrl,
  sitemapHandler,
} from './server/seo/seo';
import type { SiteUrlRequestContext } from './shared/site-url';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const projectId = process.env['PROJECT_ID'] as string;

initializeApp({ projectId });

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * TLS ends at App Hosting's proxy, so trust the one hop directly in front
 * for X-Forwarded-Proto. That makes req.secure true for https visitors,
 * which puts the Secure flag on the session cookie. Locally there's no
 * proxy and no such header, so requests stay plain http. A hop count rather
 * than `true` keeps a client-supplied X-Forwarded-For from setting req.ip.
 */
app.set('trust proxy', 1);

app.use(noindexOutsideProdMiddleware);

/**
 * Firebase Auth's sign-in redirect helpers, served from this domain.
 */
app.use(firebaseAuthProxy(projectId));

/**
 * Serve static files from /browser. Matched requests are handled here and
 * never reach the cookie parsing and verification below.
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

app.use('/api', (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});
app.use('/api', express.json({ limit: '64kb' }));
app.use('/api', appCheckMiddleware);

/**
 * Sets req.user for API calls. Page renders don't need it: they learn the
 * user through their own /api/session call.
 */
app.use('/api', cookieParser());
app.use('/api', verifySessionCookieMiddleware);

app.get('/api/session', getSessionHandler);
app.post('/api/session', createSessionHandler);
app.delete('/api/session', deleteSessionHandler);

app.post('/api/logs', logHandler);

app.get('/api/analytics', getAnalyticsHandler);
app.get('/api/chapters', getChaptersHandler);
app.get('/api/exercises/:id', exerciseExistsMiddleware, getExerciseHandler);
app.put(
  '/api/exercises/:id/code',
  requireUserMiddleware,
  exerciseExistsMiddleware,
  saveExerciseCodeHandler,
);
// Submitting runs code in a paid Vercel Sandbox, hence the rate limit.
app.post(
  '/api/exercises/:id/submit',
  requireUserMiddleware,
  exerciseExistsMiddleware,
  submitExerciseRateLimitMiddleware,
  submitExerciseHandler,
);

app.get('/robots.txt', robotsHandler);
app.get('/sitemap.xml', sitemapHandler);
app.get('/exercises', exercisesIndexRedirectHandler);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use('/**', (req, res, next) => {
  const context: SsrRequestContext & SiteUrlRequestContext = {
    ...ssrRequestContext(req),
    siteUrl: siteUrl(),
  };

  angularApp
    .handle(req, context)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  const server = app.listen(port, async (error?: Error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
    // Set when Nx waits for this server to be ready
    if (process.env['NX_READY_SIGNAL_SOCKET']) {
      try {
        // Function keeps TypeScript and bundlers from rewriting or bundling the import
        const load = new Function('s', 'return import(s)') as (
          s: string,
        ) => Promise<{ emitReadySignal(server: unknown): boolean }>;
        (await load('@nx/js/ready-signal')).emitReadySignal(server);
      } catch {
        // @nx/js isn't installed
      }
    }
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
