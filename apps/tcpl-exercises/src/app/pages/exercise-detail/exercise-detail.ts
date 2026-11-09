import { AsyncPipe } from '@angular/common';
import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Theme } from '@org/theme';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { CodeEditor } from '../../components/code-editor/code-editor';
import { ExerciseDescription } from '../../components/exercise-description/exercise-description';
import { Panel } from '../../components/panel/panel';
import { TestCases } from '../../components/test-cases/test-cases';
import { VisibleText } from '../../components/visible-text/visible-text';
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
    VisibleText,
    Panel,
    ExerciseDescription,
  ],
  templateUrl: './exercise-detail.html',
  styleUrl: './exercise-detail.scss',
})
export class ExerciseDetail {
  @ViewChild(CodeEditor) private editor!: CodeEditor;

  protected readonly facade = inject(ExerciseFacade);
  protected readonly theme$ = inject(Theme).mode$;
  protected readonly exercise$ = this.facade.exercise$;
  // The resolver holds each navigation until its exercise has loaded, so a
  // navigation in progress means the next exercise is loading. The router
  // also clears this when a navigation is cancelled or skipped.
  private readonly router = inject(Router);
  protected readonly exerciseLoading = computed(
    () => this.router.currentNavigation() !== null,
  );
  protected readonly submissionPending$ = this.facade.submissionPending$;
  protected readonly selectedTabIndex = signal(0);

  protected onCodeChange(code: string): void {
    this.facade.codeEdited(code);
  }

  protected onSubmit(): void {
    this.facade.submitExercise(this.editor.getCode());
  }
}
