import { AsyncPipe } from '@angular/common';
import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Theme } from '@org/theme';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { CodeEditor } from '../../components/code-editor/code-editor';
import { ExerciseDescription } from '../../components/exercise-description/exercise-description';
import { Panel } from '../../components/panel/panel';
import { TestCases } from '../../components/test-cases/test-cases';
import { ExerciseFacade } from '../../store/exercise/exercise.facade';

@Component({
  selector: 'app-exercise-detail',
  imports: [
    NzButtonModule,
    NzTabsModule,
    NzBadgeModule,
    CodeEditor,
    AsyncPipe,
    TestCases,
    Panel,
    ExerciseDescription,
  ],
  templateUrl: './exercise-detail.html',
  styleUrl: './exercise-detail.scss',
})
export class ExerciseDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  @ViewChild(CodeEditor) private editor!: CodeEditor;

  protected readonly facade = inject(ExerciseFacade);
  protected readonly theme$ = inject(Theme).mode$;
  protected readonly exercise$ = this.facade.exercise$;
  protected readonly exerciseLoading$ = this.facade.exerciseLoading$;
  protected readonly submissionPending$ = this.facade.submissionPending$;
  protected readonly selectedTabIndex = signal(0);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((paramMap) =>
        this.facade.selectExercise(paramMap.get('id') as string),
      );
  }

  protected onCodeChange(code: string): void {
    this.facade.codeEdited(code);
  }

  protected onSubmit(): void {
    this.facade.submitExercise(this.editor.getCode());
  }
}
