import { Component, computed, input } from '@angular/core';
import { describeChar, Segment } from '../../../shared/char-segment';

export type TestCaseIoRow = {
  label: string;
  text: string;
  pending?: boolean;
};

@Component({
  selector: 'app-test-case-io',
  template: `
    <table class="io-table">
      <thead>
        <tr>
          <th scope="col"></th>
          @for (i of ruler(); track i) {
            <th scope="col" class="char-cell">{{ i }}</th>
          }
        </tr>
      </thead>
      <tbody>
        @for (row of rows(); track row.label) {
          <tr>
            <th scope="row">{{ row.label }}</th>
            @if (row.pending) {
              <td class="empty" [attr.colspan]="ruler().length || 1">—</td>
            } @else if (row.text) {
              @for (cell of chars(row.text); track $index) {
                <td class="char-cell">
                  <span [class]="cell.kind">{{ cell.text }}</span>
                </td>
              }
            } @else {
              <td class="empty" [attr.colspan]="ruler().length || 1">(none)</td>
            }
          </tr>
        }
        @if (matches(); as cells) {
          <tr>
            <th scope="row">match</th>
            @for (m of cells; track $index) {
              <td
                class="char-cell match-cell"
                [class.match]="m"
                [class.mismatch]="!m"
              >
                {{ m ? '✓' : '✗' }}
              </td>
            }
          </tr>
        }
      </tbody>
    </table>
  `,
  styleUrl: './test-case-io.scss',
})
export class TestCaseIo {
  rows = input.required<TestCaseIoRow[]>();

  compare = input(false);

  protected readonly ruler = computed(() => {
    const length = Math.max(0, ...this.rows().map((row) => row.text.length));

    return Array.from({ length }, (_, i) => i);
  });

  protected readonly matches = computed(() => {
    const [a, b] = this.rows();

    if (!this.compare() || !a || !b || b.pending) {
      return null;
    }

    const length = Math.max(a.text.length, b.text.length);

    return Array.from({ length }, (_, i) => a.text[i] === b.text[i]);
  });

  protected chars(text: string): Segment[] {
    return [...text].map(describeChar);
  }
}
