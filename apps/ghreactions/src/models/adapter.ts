import { HttpErrorResponse } from '@angular/common/http';

export interface Adapter {
  onServerSuccess(): void;
  onServerError(error: HttpErrorResponse): void;
}
