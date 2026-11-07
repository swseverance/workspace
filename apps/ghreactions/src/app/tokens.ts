import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { isPlatformBrowser } from '@angular/common';
import { inject, InjectionToken, PLATFORM_ID } from '@angular/core';
import { WINDOW } from '@org/window';

type ThemeServiceType = {
  theme: 'ghreactions-light-theme' | 'ghreactions-dark-theme';
  toggle(): void;
};

declare global {
  interface Window {
    themeService: ThemeServiceType;
  }
}

export const ThemeService = new InjectionToken<ThemeServiceType | null>(
  'ThemeService',
  {
    providedIn: 'root',
    factory: () =>
      isPlatformBrowser(inject(PLATFORM_ID))
        ? inject(WINDOW).themeService
        : null,
  },
);

export const IS_MOBILE = new InjectionToken<boolean>('IS_MOBILE', {
  providedIn: 'root',
  factory: () => inject(BreakpointObserver).isMatched([Breakpoints.XSmall]),
});
