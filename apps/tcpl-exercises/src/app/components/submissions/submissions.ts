import { Component, input, output } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzListModule } from 'ng-zorro-antd/list';
import { ExerciseStatus, ExerciseSubmission } from '../../../shared/models';
import { LocalDatePipe } from '../../pipes/local-date-pipe';
import { Status, StatusColor } from '../status/status';

const STATUS_TAGS: Partial<
  Record<ExerciseStatus, { label: string; color: StatusColor }>
> = {
  passed: { label: 'Passed', color: 'success' },
  failed: { label: 'Failed', color: 'error' },
};

@Component({
  selector: 'app-submissions',
  imports: [LocalDatePipe, NzButtonModule, NzListModule, Status],
  templateUrl: './submissions.html',
  styleUrl: './submissions.scss',
})
export class Submissions {
  submissions = input.required<ExerciseSubmission[]>();

  view = output<ExerciseSubmission>();

  protected tagFor(submission: ExerciseSubmission) {
    return STATUS_TAGS[submission.status];
  }
}
