import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { ChaptersResponseBody, Exercise } from '../../shared/models';

@Service()
export class ExerciseService {
  private readonly http = inject(HttpClient);

  getChapters(): Observable<ChaptersResponseBody> {
    return this.http.get<ChaptersResponseBody>('/api/chapters');
  }

  getExercise(exerciseId: string): Observable<Exercise> {
    return this.http.get<Exercise>(`/api/exercises/${exerciseId}`);
  }

  submitExercise(exerciseId: string, code: string): Observable<Exercise> {
    return this.http.post<Exercise>(`/api/exercises/${exerciseId}/submit`, {
      code,
    });
  }
}
