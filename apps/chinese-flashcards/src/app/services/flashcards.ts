import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, map, Observable } from 'rxjs';
import {
  CreateFlashcardArgs,
  Flashcard,
  FlashcardType,
  GetFlashcardsArgs,
  UpdateFlashcardArgs,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class Flashcards {
  private http = inject(HttpClient);

  addFlashcard(args: CreateFlashcardArgs): Promise<Flashcard> {
    return firstValueFrom(
      this.http.post<{ flashcard: Flashcard }>('/api/flashcards', args),
    ).then(({ flashcard }) => flashcard);
  }

  // Reads return Observables: subscribed to synchronously, a hydration-time
  // transfer cache hit lands before the first client render, so it matches
  // the server-rendered page.

  getGroups(
    type: FlashcardType,
  ): Observable<Array<{ confidence: number; count: number }>> {
    return this.http
      .get<{
        flashcards: Array<{ confidence: number; count: number }>;
      }>('/api/flashcards/groups', {
        params: new HttpParams({ fromObject: { type } }),
      })
      .pipe(map(({ flashcards }) => flashcards));
  }

  getFlashcards(args: GetFlashcardsArgs): Observable<Flashcard[]> {
    const params: Record<string, string> = {};

    if (args.type) params['type'] = args.type;
    if (args.confidence !== undefined)
      params['confidence'] = String(args.confidence);

    return this.http
      .get<{ flashcards: Flashcard[] }>('/api/flashcards', {
        params: new HttpParams({ fromObject: params }),
      })
      .pipe(map(({ flashcards }) => flashcards));
  }

  updateFlashcard(args: UpdateFlashcardArgs): Promise<Flashcard> {
    return firstValueFrom(
      this.http.patch<{ flashcard: Flashcard }>(
        `/api/flashcards/${args.id}`,
        args.updates,
      ),
    ).then(({ flashcard }) => flashcard);
  }

  deleteFlashcard(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`/api/flashcards/${id}`));
  }
}
