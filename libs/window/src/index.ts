import { DOCUMENT, inject, InjectionToken } from '@angular/core';

export const WINDOW = new InjectionToken<Window | null>('WINDOW', {
  providedIn: 'root',
  factory: () => inject(DOCUMENT).defaultView,
});
