import { formatPercent } from '@angular/common';
import { inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { ExerciseStats } from '../../shared/models';

/**
 * Accepted submissions as a percentage of submitted ones, e.g. "62%". A
 * dash when there is no percentage to show: nothing submitted yet, or the
 * counts couldn't be loaded.
 */
@Pipe({ name: 'passRate' })
export class PassRatePipe implements PipeTransform {
  private readonly locale = inject(LOCALE_ID);

  transform(stats: ExerciseStats | null): string {
    return stats && stats.compiled > 0
      ? formatPercent(stats.passed / stats.compiled, this.locale)
      : '–';
  }
}
