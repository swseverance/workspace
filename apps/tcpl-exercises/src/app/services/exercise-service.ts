import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { Exercise, ExercisesResponseBody } from '../../shared/models';

@Service()
export class ExerciseService {
  private readonly http = inject(HttpClient);

  getExercises(): Observable<ExercisesResponseBody> {
    return this.http.get<ExercisesResponseBody>('/api/exercises');
  }

  getExercise(exerciseId: string): Observable<Exercise> {
    return this.http.get<Exercise>(`/api/exercises/${exerciseId}`);
  }

  saveCode(exerciseId: string, code: string): Observable<Exercise> {
    return this.http.put<Exercise>(`/api/exercises/${exerciseId}/code`, {
      code,
    });
  }

  submitExercise(exerciseId: string, code: string): Observable<Exercise> {
    return this.http.post<Exercise>(`/api/exercises/${exerciseId}/submit`, {
      code,
    });
  }
}
