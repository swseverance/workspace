import { DOCUMENT, inject, InjectionToken } from '@angular/core';

export const WINDOW = new InjectionToken<Window>('WINDOW', {
  providedIn: 'root',
  factory: () => {
    const { defaultView } = inject(DOCUMENT);

    if (!defaultView) {
      throw new Error('Window is not available');
    }

    return defaultView;
  },
});
