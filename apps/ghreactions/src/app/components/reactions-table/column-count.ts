import { Directive, effect, inject, input } from '@angular/core';
import { NzTableStyleService } from 'ng-zorro-antd/table';

/**
 * Tells nz-table how many columns there are, so its empty/error row spans them
 * all. nz-table normally learns this from its own thead component, which our
 * thead keeps off for hydration (see the comment in the template).
 */
@Directive({ selector: 'thead[appColumnCount]' })
export class ColumnCount {
  count = input.required<number>({ alias: 'appColumnCount' });

  constructor() {
    const style = inject(NzTableStyleService);
    effect(() => style.columnCount$.next(this.count()));
  }
}
