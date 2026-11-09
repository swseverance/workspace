import { Component, input } from '@angular/core';
import type { NzStatusColor } from 'ng-zorro-antd/core/color';
import { NzTagModule } from 'ng-zorro-antd/tag';

export type StatusColor = NzStatusColor;

export type StatusSize = 'large' | 'small';

/** A status tag, the same width at each size so lists of them line up. */
@Component({
  selector: 'app-status',
  imports: [NzTagModule],
  template: `<nz-tag [nzColor]="color()"><ng-content /></nz-tag>`,
  host: { '[class.small]': "size() === 'small'" },
  styles: `
    :host {
      display: inline-flex;
    }

    nz-tag {
      min-width: 140px;
      margin-inline-end: 0;
      text-align: center;
    }

    :host(.small) nz-tag {
      min-width: 64px;
      padding-inline: 4px;
      font-size: 11px;
      line-height: 18px;
    }
  `,
})
export class Status {
  color = input<StatusColor>('default');

  size = input<StatusSize>('large');
}
