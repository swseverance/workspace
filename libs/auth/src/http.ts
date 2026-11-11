// HttpClient setup for server-rendered apps, without the auth store, so apps
// with no login (like ghreactions) don't bundle NgRx. Also re-exported from
// the main @org/auth entry point.
export * from './lib/http/absolute-url.interceptor';
export * from './lib/http/app-check.backend';
export * from './lib/http/forward-cookie.interceptor';
export { provideNoAuth } from './lib/http/provide-http-client';
export * from './lib/http/ssr-transfer-cache-origins';
