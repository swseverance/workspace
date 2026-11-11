import { formatDate, isPlatformBrowser } from '@angular/common';
import {
  inject,
  LOCALE_ID,
  Pipe,
  PipeTransform,
  PLATFORM_ID,
} from '@angular/core';

/**
 * Formats a date in the viewer's time zone. The server can't know that zone,
 * so it renders nothing and the browser fills the date in after hydration.
 */
@Pipe({ name: 'localDate' })
export class LocalDatePipe implements PipeTransform {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly locale = inject(LOCALE_ID);

  transform(
    value: string | number | Date | null | undefined,
    format = 'medium',
  ): string {
    if (!this.isBrowser || value == null) {
      return '';
    }

    return formatDate(value, format, this.locale);
  }
}
