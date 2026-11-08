import { DOCUMENT, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideTheme, ThemeConfig, themeScript } from './theme';
import { initTheme } from './theme-script';

const config: ThemeConfig = {
  storageKey: 'test-theme',
  classes: { light: 'test-light', dark: 'test-dark' },
};

describe('initTheme', () => {
  let light: HTMLLinkElement;
  let dark: HTMLLinkElement;

  function link(href: string) {
    const el = document.createElement('link');
    el.rel = 'stylesheet';
    el.setAttribute('href', href);
    document.head.append(el);
    return el;
  }

  function prefersDark(matches: boolean) {
    // jsdom doesn't implement matchMedia.
    vi.stubGlobal('matchMedia', () => ({ matches }));
  }

  beforeEach(() => {
    light = link('light-theme-ABC123.css');
    dark = link('dark-theme-DEF456.css');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    light.remove();
    dark.remove();
    document.body.classList.remove('test-light', 'test-dark');
    localStorage.clear();
    delete window.theme;
  });

  it('applies the saved theme', () => {
    localStorage.setItem('test-theme', 'dark');
    prefersDark(false);

    initTheme(config);

    expect(window.theme?.mode).toBe('dark');
    expect(document.body.classList).toContain('test-dark');
    expect(dark.disabled).toBe(false);
    expect(light.disabled).toBe(true);
  });

  it('falls back to the OS preference when nothing is saved', () => {
    prefersDark(true);

    initTheme(config);

    expect(window.theme?.mode).toBe('dark');
  });

  it('ignores an unrecognised saved value', () => {
    localStorage.setItem('test-theme', 'ghreactions-dark-theme');
    prefersDark(false);

    initTheme(config);

    expect(window.theme?.mode).toBe('light');
  });

  it('toggles, swaps body class and stylesheet, and saves the choice', () => {
    prefersDark(false);
    initTheme(config);

    window.theme?.toggle();

    expect(window.theme?.mode).toBe('dark');
    expect(document.body.classList).toContain('test-dark');
    expect(document.body.classList).not.toContain('test-light');
    expect(light.disabled).toBe(true);
    expect(dark.disabled).toBe(false);
    expect(localStorage.getItem('test-theme')).toBe('dark');
  });

  it('still applies the theme when storage is blocked', () => {
    prefersDark(false);
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    initTheme(config);

    window.theme?.toggle();

    expect(window.theme?.mode).toBe('dark');
    expect(document.body.classList).toContain('test-dark');
  });

  it('works when serialized and run on its own, as the inline script', () => {
    localStorage.setItem('test-theme', 'dark');
    prefersDark(false);

    new Function(themeScript(config))();

    expect(window.theme?.mode).toBe('dark');
    expect(document.body.classList).toContain('test-dark');
  });
});

describe('provideTheme', () => {
  function setup(platform: 'browser' | 'server') {
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: platform },
        provideTheme(config),
      ],
    });
    TestBed.inject(DOCUMENT); // instantiates the environment initializers
    return document.body.firstElementChild;
  }

  afterEach(() => {
    document.body.querySelectorAll('script').forEach((s) => s.remove());
  });

  it('inlines the script at the top of <body> on the server', () => {
    const first = setup('server');

    expect(first?.tagName).toBe('SCRIPT');
    expect(first?.textContent).toBe(themeScript(config));
  });

  it('adds nothing in the browser', () => {
    setup('browser');

    expect(document.body.querySelector('script')).toBeNull();
  });
});
