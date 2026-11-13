import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { LIMITED_USE_APP_CHECK_TOKEN } from '@org/auth';
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
    // Submitting runs code in a paid sandbox, signed in or not: a one-time
    // App Check token means a script can't replay one attestation for many
    // submissions.
    return this.http.post<Exercise>(
      `/api/exercises/${exerciseId}/submit`,
      { code },
      { context: new HttpContext().set(LIMITED_USE_APP_CHECK_TOKEN, true) },
    );
  }
}
