import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { AnalyticsResponseBody } from '../../shared/models';

@Service()
export class AnalyticsService {
  private readonly http = inject(HttpClient);

  getStats(): Observable<AnalyticsResponseBody> {
    return this.http.get<AnalyticsResponseBody>('/api/analytics');
  }
}
