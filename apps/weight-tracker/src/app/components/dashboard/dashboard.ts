import { ScrollingModule } from '@angular/cdk/scrolling';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { WeightEntry } from '../../models';
import { Weights } from '../../services/weights';
import { Page } from '../page/page';
import { WeightForm } from '../weight-form/weight-form';

const WEEK_DAYS = 7;

type ViewMode = 'daily' | 'weekly';

type DisplayEntry = WeightEntry & { rangeStart?: string };

@Component({
  selector: 'app-dashboard',
  imports: [
    Page,
    ScrollingModule,
    FormsModule,
    NzListModule,
    NzButtonModule,
    NzIconModule,
    NzModalModule,
    NzSegmentedModule,
    NzSpinModule,
    DatePipe,
    DecimalPipe,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private weights = inject(Weights);
  private modal = inject(NzModalService);
  private message = inject(NzMessageService);

  loading = signal(true);
  entries = signal<WeightEntry[]>([]);
  viewMode = signal<ViewMode>('daily');

  viewOptions = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly Avg', value: 'weekly' },
  ];

  displayEntries = computed<DisplayEntry[]>(() => {
    const entries = this.entries();

    return this.viewMode() === 'weekly'
      ? this.withWeeklyAverages(entries)
      : entries;
  });

  ngOnInit(): void {
    this.loadEntries();
  }

  trackById(_index: number, entry: DisplayEntry): string {
    return entry.id;
  }

  addTodaysWeight(): void {
    const date = new Date().toISOString().slice(0, 10);
    const existing = this.entries().find((entry) => entry.date === date);

    this.openForm(date, existing?.weight ?? null);
  }

  editEntry(entry: WeightEntry): void {
    this.openForm(entry.date, entry.weight);
  }

  private openForm(date: string, weight: number | null): void {
    const modalRef = this.modal.create({
      nzTitle: weight === null ? "Add Today's Weight" : 'Amend Weight',
      nzContent: WeightForm,
      nzData: { date, weight },
      nzFooter: null,
    });

    modalRef.afterClose.subscribe((result: unknown) => {
      if (result) this.loadEntries();
    });
  }

  private withWeeklyAverages(entries: WeightEntry[]): DisplayEntry[] {
    // entries are sorted newest-first; bucket into non-overlapping 7-day
    // periods counting back from today, e.g. [today-6, today], [today-13, today-7], ...
    const today = new Date().toISOString().slice(0, 10);
    const buckets: DisplayEntry[] = [];

    let bucketIndex: number | null = null;
    let sum = 0;
    let count = 0;

    const flush = (): void => {
      if (bucketIndex === null || count === 0) return;

      const end = this.addDays(today, -WEEK_DAYS * bucketIndex);
      const start = this.addDays(end, -(WEEK_DAYS - 1));

      buckets.push({
        id: `weekly-${end}`,
        date: end,
        weight: sum / count,
        rangeStart: start,
      });
    };

    for (const entry of entries) {
      const daysAgo = this.daysBetween(today, entry.date);
      const index = Math.floor(daysAgo / WEEK_DAYS);

      if (index !== bucketIndex) {
        flush();
        bucketIndex = index;
        sum = 0;
        count = 0;
      }

      sum += entry.weight;
      count++;
    }
    flush();

    return buckets;
  }

  private daysBetween(date: string, earlierDate: string): number {
    const msPerDay = 24 * 60 * 60 * 1000;

    return Math.round(
      (new Date(date).getTime() - new Date(earlierDate).getTime()) / msPerDay,
    );
  }

  private addDays(date: string, delta: number): string {
    const d = new Date(date);
    d.setUTCDate(d.getUTCDate() + delta);

    return d.toISOString().slice(0, 10);
  }

  private async loadEntries(): Promise<void> {
    this.loading.set(true);

    try {
      this.entries.set(await this.weights.getEntries());
    } catch (error) {
      console.error('getEntries()', error);

      this.message.error('Failed to load weights');
    } finally {
      this.loading.set(false);
    }
  }
}
