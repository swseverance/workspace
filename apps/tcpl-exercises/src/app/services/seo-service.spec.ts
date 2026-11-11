import {
  DOCUMENT,
  makeStateKey,
  REQUEST_CONTEXT,
  TransferState,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { SeoService, SITE_NAME } from './seo-service';

const SITE_URL = 'https://example.test';

describe('SeoService', () => {
  let seo: SeoService;
  let document: Document;

  const meta = (selector: string) =>
    document.head.querySelector(`meta[${selector}]`)?.getAttribute('content');
  const canonical = () =>
    document.head.querySelector('link[rel="canonical"]')?.getAttribute('href');

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: REQUEST_CONTEXT, useValue: { siteUrl: SITE_URL } },
      ],
    });
    seo = TestBed.inject(SeoService);
    document = TestBed.inject(DOCUMENT);
  });

  afterEach(() => seo.setUnindexedPage('cleanup'));

  it('sets the title, description and canonical URL of an indexed page', () => {
    seo.setPage('Exercise 1-1', 'Say hello.', '/exercises/1-1');

    const url = `${SITE_URL}/exercises/1-1`;
    expect(TestBed.inject(Title).getTitle()).toBe(
      `Exercise 1-1 | ${SITE_NAME}`,
    );
    expect(meta('name="description"')).toBe('Say hello.');
    expect(meta('property="og:title"')).toBe(`Exercise 1-1 | ${SITE_NAME}`);
    expect(meta('property="og:description"')).toBe('Say hello.');
    expect(meta('property="og:url"')).toBe(url);
    expect(meta('name="robots"')).toBeUndefined();
    expect(canonical()).toBe(url);
  });

  it('titles the home page with the site name alone', () => {
    seo.setPage(null, 'Home.', '/');

    expect(TestBed.inject(Title).getTitle()).toBe(SITE_NAME);
  });

  it('reuses one canonical link across pages', () => {
    seo.setPage('A', 'a', '/a');
    seo.setPage('B', 'b', '/b');

    expect(
      document.head.querySelectorAll('link[rel="canonical"]'),
    ).toHaveLength(1);
    expect(canonical()).toBe(`${SITE_URL}/b`);
  });

  it('marks an unindexed page noindex and drops its canonical URL', () => {
    seo.setPage('A', 'a', '/a');
    seo.setUnindexedPage('Page not found');

    expect(TestBed.inject(Title).getTitle()).toBe(
      `Page not found | ${SITE_NAME}`,
    );
    expect(meta('name="robots"')).toBe('noindex');
    expect(meta('name="description"')).toBeUndefined();
    expect(meta('property="og:url"')).toBeUndefined();
    expect(canonical()).toBeUndefined();
  });

  it('points og:image at the preview image on the site', () => {
    expect(meta('property="og:image"')).toBe(`${SITE_URL}/og-image.png`);
  });

  it('hands the site URL on to the browser in the transfer state', () => {
    expect(
      TestBed.inject(TransferState).get(makeStateKey<string>('siteUrl'), ''),
    ).toBe(SITE_URL);
  });
});
