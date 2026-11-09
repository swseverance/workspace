import { inject, Service } from '@angular/core';
import { Store } from '@ngrx/store';
import { loadAnalytics } from './analytics.actions';
import { selectAnalytics } from './analytics.selectors';

/** What components use for usage stats. */
@Service()
export class AnalyticsFacade {
  private readonly store = inject(Store);

  readonly analytics$ = this.store.select(selectAnalytics);

  loadAnalytics(): void {
    this.store.dispatch(loadAnalytics());
  }
}
