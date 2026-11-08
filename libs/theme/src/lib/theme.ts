import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import {
  DOCUMENT,
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  PLATFORM_ID,
  provideEnvironmentInitializer,
  Service,
} from '@angular/core';
import { WINDOW } from '@org/window';
import { BehaviorSubject } from 'rxjs';
import { initTheme } from './theme-script';

export type ThemeMode = 'light' | 'dark';

export type ThemeConfig = {
  /** localStorage key the user's choice is saved under. */
  storageKey: string;
  /** Class put on <body> for each mode, used by component styles. */
  classes: Record<ThemeMode, string>;
};

/** What `initTheme` puts on `window.theme`. */
export type ThemeController = {
  readonly mode: ThemeMode;
  set(mode: ThemeMode): void;
  toggle(): void;
};

declare global {
  interface Window {
    theme?: ThemeController;
  }
}

/**
 * Angular-facing wrapper around the controller the inlined script sets up
 * before bootstrap. The script does the work; this exposes it as an observable.
 */
@Service()
export class Theme {
  // The server renders against a stub window where the script never ran.
  private readonly controller = isPlatformBrowser(inject(PLATFORM_ID))
    ? (inject(WINDOW)?.theme ?? null)
    : null;

  private readonly mode = new BehaviorSubject<ThemeMode>(
    this.controller?.mode ?? 'light',
  );
  readonly mode$ = this.mode.asObservable();

  toggle(): void {
    if (!this.controller) return;

    this.controller.toggle();
    this.mode.next(this.controller.mode);
  }

  set(mode: ThemeMode): void {
    if (!this.controller) return;

    this.controller.set(mode);
    this.mode.next(this.controller.mode);
  }
}

/** The inline script's source: `initTheme` called with this app's config. */
export function themeScript(config: ThemeConfig): string {
  return `(${initTheme})(${JSON.stringify(config)});`;
}

/**
 * While server rendering, inlines the theme script at the top of <body> so
 * the saved theme is applied before the browser first paints.
 */
export function provideTheme(config: ThemeConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      if (!isPlatformServer(inject(PLATFORM_ID))) return;

      const document = inject(DOCUMENT);
      const script = document.createElement('script');
      script.textContent = themeScript(config);
      document.body.insertBefore(script, document.body.firstChild);
    }),
  ]);
}
