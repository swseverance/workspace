import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  ListWeightsResponseBody,
  UpsertWeightRequestBody,
  WeightEntry,
} from '../models';

/** The signed-in user's weights, via the server's /api/weights. */
@Injectable({
  providedIn: 'root',
})
export class Weights {
  private http = inject(HttpClient);

  getEntries(): Observable<WeightEntry[]> {
    return this.http
      .get<ListWeightsResponseBody>('/api/weights')
      .pipe(map(({ entries }) => entries));
  }

  upsertEntry(date: string, weight: number): Observable<WeightEntry> {
    return this.http.put<WeightEntry>(this.url(date), {
      weight,
    } satisfies UpsertWeightRequestBody);
  }

  deleteEntry(date: string): Observable<void> {
    return this.http.delete<void>(this.url(date));
  }

  private url(date: string): string {
    return `/api/weights/${encodeURIComponent(date)}`;
  }
}
