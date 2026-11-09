import { Component, input } from '@angular/core';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { SmartLoader } from '../smart-loader/smart-loader';

@Component({
  selector: 'app-panel',
  template: `
    @if (heading()) {
      <div class="panel-header">
        <h2 class="panel-title">{{ heading() }}</h2>
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
  loading = input<boolean>();
}
