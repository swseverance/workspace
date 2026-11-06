import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
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

  getGroups(
    type: FlashcardType,
  ): Promise<Array<{ confidence: number; count: number }>> {
    return firstValueFrom(
      this.http.get<{
        flashcards: Array<{ confidence: number; count: number }>;
      }>('/api/flashcards/groups', {
        params: new HttpParams({ fromObject: { type } }),
      }),
    ).then(({ flashcards }) => flashcards);
  }

  getFlashcards(args: GetFlashcardsArgs): Promise<Flashcard[]> {
    const params: Record<string, string> = {};

    if (args.type) params['type'] = args.type;
    if (args.confidence !== undefined)
      params['confidence'] = String(args.confidence);

    return firstValueFrom(
      this.http.get<{ flashcards: Flashcard[] }>('/api/flashcards', {
        params: new HttpParams({ fromObject: params }),
      }),
    ).then(({ flashcards }) => flashcards);
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
