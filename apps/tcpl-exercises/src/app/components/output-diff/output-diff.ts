import { Component, computed, input, signal } from '@angular/core';
import { DiffRow, foldRows, visibleDiff } from '../../../shared/output-diff';
import { VisibleText } from '../visible-text/visible-text';

/**
 * Expected and actual output side by side, aligned line by line, with the
 * characters that differ highlighted and long matching stretches folded.
 */
@Component({
  selector: 'app-output-diff',
  imports: [VisibleText],
  template: `
    <div class="grid" role="table" aria-label="Expected and actual output">
      <div class="heading expected" role="columnheader">Expected</div>
      <div class="heading actual" role="columnheader">Your output</div>

      @for (item of view().items; track $index) {
        @if (item.kind === 'fold') {
          @if (item.expandable) {
            <button type="button" class="fold" (click)="expand(item.block)">
              ⋯ Show {{ item.count }} matching lines
            </button>
          } @else {
            <div class="fold">⋯ {{ item.count }} matching lines</div>
          }
        } @else {
          @let row = item.row;
          @let expected = row.kind === 'extra' ? null : row.expected;
          @let actual = row.kind === 'missing' ? null : row.actual;

          <div class="row {{ row.kind }}" role="row">
            @if (expected) {
              <span class="number expected">{{ expected.number }}</span>
              <app-visible-text
                class="line expected"
                role="cell"
                [text]="expected.spans"
                [newline]="expected.newline"
                [newlineChanged]="expected.newlineChanged"
              />
            } @else {
              <span class="number blank"></span>
              <span class="line blank" role="cell"></span>
            }

            @if (actual) {
              <span class="number actual">{{ actual.number }}</span>
              <app-visible-text
                class="line actual"
                role="cell"
                [text]="actual.spans"
                [newline]="actual.newline"
                [newlineChanged]="actual.newlineChanged"
              />
            } @else {
              <span class="number blank"></span>
              <span class="line blank" role="cell"></span>
            }
          </div>
        }
      }

      @if (view().hidden > 0) {
        <div class="hidden-lines">
          {{ view().hidden }} more
          {{ view().hidden === 1 ? 'line' : 'lines' }} hidden
        </div>
      }
    </div>
  `,
  styleUrl: './output-diff.scss',
})
export class OutputDiff {
  rows = input.required<DiffRow[]>();

  protected readonly blocks = computed(() => foldRows(this.rows()));

  protected readonly expanded = signal(new Set<number>());

  protected readonly view = computed(() =>
    visibleDiff(this.blocks(), this.expanded()),
  );

  protected expand(block: number): void {
    this.expanded.update((set) => new Set(set).add(block));
  }
}
