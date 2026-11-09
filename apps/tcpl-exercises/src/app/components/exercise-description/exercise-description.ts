import { Component, input } from '@angular/core';

@Component({
  selector: 'app-exercise-description',
  template: `<p>{{ description() }}</p>`,
  styleUrl: './exercise-description.scss',
})
export class ExerciseDescription {
  description = input.required<string>();
}
