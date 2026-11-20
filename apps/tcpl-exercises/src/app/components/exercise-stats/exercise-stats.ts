import { DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { ExerciseStats as Stats } from '../../../shared/models';
import { PassRatePipe } from '../../pipes/pass-rate-pipe';

/** How everyone's submissions to an exercise have fared. */
@Component({
  selector: 'app-exercise-stats',
  imports: [DecimalPipe, PassRatePipe],
  template: `
    <span class="stat" title="Submissions that passed every test">
      <span class="label">Accepted:</span>&ngsp;<strong>{{
        stats().passed | number
      }}</strong>
    </span>
    <span class="stat" title="Submissions that compiled">
      <span class="label">Submitted:</span>&ngsp;<strong>{{
        stats().compiled | number
      }}</strong>
    </span>
    <span class="stat" title="Accepted, as a share of submitted">
      <span class="label">Percentage:</span>&ngsp;<strong>{{
        stats() | passRate
      }}</strong>
    </span>
    <!-- The rest of the page is the reader's own tests and submissions. -->
    <span class="scope">*All users</span>
  `,
  styles: `
    @use 'breakpoints' as bp;

    :host {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 32px;
      font-size: 14px;

      // On a phone, one count to a line in two columns, so the values
      // line up, with the *All users label beside the first.
      @include bp.mobile {
        position: relative;
        display: grid;
        grid-template-columns: max-content max-content;
        gap: 4px 12px;
      }
    }

    .stat {
      white-space: nowrap;

      // Its label and value become the grid's cells.
      @include bp.mobile {
        display: contents;
      }
    }

    // At the right, apart from the counts.
    .scope {
      margin-left: auto;
      align-self: center;
      font-size: 12px;
      color: var(--tc-muted);
      white-space: nowrap;

      @include bp.mobile {
        position: absolute;
        top: 0;
        right: 0;
      }
    }

    // The blues of the line under the app's header (app.scss).
    strong {
      font-weight: 600;
      color: #1890ff;
    }

    :host-context(.tcpl-exercises-dark-theme) strong {
      color: #177ddc;
    }
  `,
})
export class ExerciseStats {
  stats = input.required<Stats>();
}
