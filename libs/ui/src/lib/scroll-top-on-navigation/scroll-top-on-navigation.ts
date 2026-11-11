import { isPlatformBrowser } from '@angular/common';
import { Directive, ElementRef, inject, PLATFORM_ID } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

/**
 * Scrolls the element back to the top after each navigation. The router's
 * own scrollPositionRestoration only scrolls the window, and here the page
 * scrolls inside containers (nz-content, the exercise detail) instead.
 */
@Directive({ selector: '[libScrollTopOnNavigation]' })
export class ScrollTopOnNavigation {
  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) {
      return;
    }

    const element: HTMLElement = inject(ElementRef).nativeElement;

    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => element.scrollTo({ top: 0 }));
  }
}
