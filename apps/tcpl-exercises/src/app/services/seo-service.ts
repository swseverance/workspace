import {
  DOCUMENT,
  inject,
  makeStateKey,
  REQUEST_CONTEXT,
  Service,
  TransferState,
} from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import type { SiteUrlRequestContext } from '../../shared/site-url';

export const SITE_NAME = 'K&R Exercises';

const SITE_URL_KEY = makeStateKey<string>('siteUrl');

/**
 * Sets each page's title, description and canonical URL. Set during SSR, so
 * crawlers get them in the HTML; set again in the browser on navigation.
 */
@Service()
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly siteUrl = this.resolveSiteUrl();

  constructor() {
    // The same image on every page; the rest of its tags are in index.html.
    this.meta.updateTag({
      property: 'og:image',
      content: `${this.siteUrl}/og-image.png`,
    });
  }

  /**
   * A page search engines should index. `title` goes before the site name;
   * null for the home page, which is titled with the site name alone.
   */
  setPage(title: string | null, description: string, path: string): void {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const url = `${this.siteUrl}${path}`;

    this.title.setTitle(fullTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.removeTag('name="robots"');
    this.setCanonical(url);
  }

  /** A page search engines should leave out, such as the 404 page. */
  setUnindexedPage(title: string): void {
    const fullTitle = `${title} | ${SITE_NAME}`;

    this.title.setTitle(fullTitle);
    this.meta.removeTag('name="description"');
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.removeTag('property="og:description"');
    this.meta.removeTag('property="og:url"');
    this.meta.updateTag({ name: 'robots', content: 'noindex' });
    this.setCanonical(null);
  }

  /**
   * The server passes SITE_URL in through REQUEST_CONTEXT, and this hands it
   * on to the browser in the page's transfer state. Without it, the browser
   * would put its own origin in the canonical link after hydration, which is
   * wrong on any domain but the main one.
   */
  private resolveSiteUrl(): string {
    const transferState = inject(TransferState);
    const context = inject(REQUEST_CONTEXT, {
      optional: true,
    }) as Partial<SiteUrlRequestContext> | null;

    if (context?.siteUrl) {
      transferState.set(SITE_URL_KEY, context.siteUrl);
      return context.siteUrl;
    }

    return transferState.get(SITE_URL_KEY, this.document.location.origin);
  }

  private setCanonical(url: string | null): void {
    const head = this.document.head;
    let link = head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

    if (url === null) {
      link?.remove();
      return;
    }

    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      head.appendChild(link);
    }

    link.setAttribute('href', url);
  }
}
