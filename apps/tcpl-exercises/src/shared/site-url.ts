/**
 * What server.ts adds to the SSR render's REQUEST_CONTEXT, alongside
 * @org/server's SsrRequestContext.
 */
export type SiteUrlRequestContext = {
  /** Origin for canonical links, with no trailing slash. */
  siteUrl: string;
};
