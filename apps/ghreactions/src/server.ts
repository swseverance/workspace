import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import { EnvironmentName, RequestContext } from '@org/environment';
import {
  appCheckMiddleware,
  noindexOutsideProdMiddleware,
  robotsHandler,
  sitemapHandler,
  siteUrl,
  SiteUrlRequestContext,
  SsrRequestContext,
  ssrRequestContext,
} from '@org/server';
import express from 'express';
import { initializeApp } from 'firebase-admin/app';
import * as logger from 'firebase-functions/logger';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { profileHandler } from './server/api/profile.handler';
import { tableHandler } from './server/api/table.handler';
import { usersHandler } from './server/api/users.handler';
import { rateLimitMiddleware } from './server/middleware/rate-limit';
import { sitemapPaths } from './server/seo/sitemap-paths';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

initializeApp({ projectId: process.env['PROJECT_ID'] });

const app = express();

/**
 * TLS ends at App Hosting's proxy, so trust the one hop in front of it for
 * X-Forwarded-Proto. ssrRequestContext needs that to report the browser's
 * https origin. A hop count rather than `true` keeps a client-supplied
 * X-Forwarded-For from setting req.ip.
 */
app.set('trust proxy', 1);
const angularApp = new AngularNodeAppEngine();

app.use(noindexOutsideProdMiddleware);

app.use('/api/', (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});
app.use('/api/', appCheckMiddleware);
app.use('/api/', rateLimitMiddleware);

app.get('/api/table', tableHandler);
app.get('/api/profile/:username', profileHandler);
app.get('/api/users', usersHandler);

app.get('/robots.txt', robotsHandler);
app.get('/sitemap.xml', sitemapHandler(sitemapPaths));

// The about page moved to /. A 301 tells crawlers the move is permanent;
// otherwise Angular's catch-all would send it to /search with a 302.
app.get('/about', (_req, res) => res.redirect(301, '/'));

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use('/**', (req, res, next) => {
  const requestContext: RequestContext &
    SsrRequestContext &
    SiteUrlRequestContext = {
    ...ssrRequestContext(req),
    environmentName: process.env['ENVIRONMENT_NAME'] as EnvironmentName,
    siteUrl: siteUrl(),
  };

  angularApp
    .handle(req, requestContext)
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

    logger.info(`Node Express server listening on http://localhost:${port}`);
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
