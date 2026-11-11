import { Component, input } from '@angular/core';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { SmartLoader } from '../smart-loader/smart-loader';

@Component({
  selector: 'app-panel',
  template: `
    @if (heading()) {
      <div class="panel-header">
        @if (headingLevel() === 1) {
          <h1 class="panel-title">{{ heading() }}</h1>
        } @else {
          <h2 class="panel-title">{{ heading() }}</h2>
        }
        <div class="panel-extra">
          <ng-content select="[panel-extra]" />
        </div>
      </div>
    }
    <app-smart-loader [loading]="loading()">
      <nz-skeleton loader-skeleton [nzActive]="true" />
      <ng-content />
    </app-smart-loader>
  `,
  styleUrl: './panel.scss',
  imports: [NzSkeletonModule, SmartLoader],
})
export class Panel {
  heading = input<string>();
  /** 1 for the panel that heads the page. Styled the same either way. */
  headingLevel = input<1 | 2>(2);
  loading = input<boolean>();
}
