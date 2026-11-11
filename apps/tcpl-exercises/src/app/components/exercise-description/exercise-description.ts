import { Component, input } from '@angular/core';

@Component({
  selector: 'app-exercise-description',
  // Angular sanitizes [innerHTML], stripping scripts and event handlers.
  template: `<div class="description" [innerHTML]="description()"></div>`,
  styleUrl: './exercise-description.scss',
})
export class ExerciseDescription {
  /** HTML converted from the exercise's markdown on the server. */
  description = input.required<string>();
}
