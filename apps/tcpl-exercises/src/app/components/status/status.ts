import { Component, input } from '@angular/core';
import type { NzStatusColor } from 'ng-zorro-antd/core/color';
import { NzTagModule } from 'ng-zorro-antd/tag';

export type StatusColor = NzStatusColor;

/** A status tag, the same width everywhere so lists of them line up. */
@Component({
  selector: 'app-status',
  imports: [NzTagModule],
  template: `<nz-tag [nzColor]="color()"><ng-content /></nz-tag>`,
  styles: `
    :host {
      display: inline-flex;
    }

    nz-tag {
      min-width: 110px;
      margin-inline-end: 0;
      text-align: center;
    }
  `,
})
export class Status {
  color = input<StatusColor>('default');
}
