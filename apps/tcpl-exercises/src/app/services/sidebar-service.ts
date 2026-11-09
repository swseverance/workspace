import { Service, signal } from '@angular/core';

/** Keep in sync with $mobile-max in src/styles/_breakpoints.scss. */
const MOBILE_QUERY = '(max-width: 767px)';

/**
 * Shared between the exercises page, which owns the sidebar, and the header,
 * which holds its toggle button.
 */
@Service()
export class SidebarService {
  /**
   * `null` until the browser has rendered: the server can't know the screen
   * size, so CSS decides (open on desktop, closed on mobile) and
   * `resolveDefault` then sets the matching value.
   */
  readonly open = signal<boolean | null>(null);

  /** Set while a page with a sidebar is shown, so the header knows to offer the toggle. */
  readonly present = signal(false);

  /** Call after the first browser render. */
  resolveDefault(): void {
    if (this.open() === null) {
      this.open.set(!isMobile());
    }
  }

  toggle(): void {
    this.open.update((open) => !(open ?? !isMobile()));
  }

  /**
   * On mobile the open sidebar covers the whole page, so close it once an
   * exercise is picked.
   */
  closeOnMobile(): void {
    if (isMobile()) {
      this.open.set(false);
    }
  }
}

// Browser only: called from click handlers and after render.
function isMobile(): boolean {
  return matchMedia(MOBILE_QUERY).matches;
}
