import { AsyncPipe } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  effect,
  inject,
  linkedSignal,
  signal,
  ViewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthFacade } from '@org/auth';
import { Theme } from '@org/theme';
import { ScrollTopOnNavigation, SeoService } from '@org/ui';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { map } from 'rxjs';
import { Exercise } from '../../../shared/models';
import { CodeEditor } from '../../components/code-editor/code-editor';
import { ExerciseDescription } from '../../components/exercise-description/exercise-description';
import { ExerciseStats } from '../../components/exercise-stats/exercise-stats';
import { Panel } from '../../components/panel/panel';
import { Submissions } from '../../components/submissions/submissions';
import { TestCases } from '../../components/test-cases/test-cases';
import { VisibleText } from '../../components/visible-text/visible-text';
import { exerciseName } from '../../pipes/exercise-name-pipe';
import { ExerciseFacade } from '../../store/exercise/exercise.facade';
import { NotFound } from '../not-found/not-found';

@Component({
  selector: 'app-exercise-detail',
  imports: [
    NzAlertModule,
    NzButtonModule,
    NzTabsModule,
    NzBadgeModule,
    CodeEditor,
    AsyncPipe,
    TestCases,
    VisibleText,
    Panel,
    ExerciseDescription,
    ExerciseStats,
    Submissions,
    NotFound,
    ScrollTopOnNavigation,
  ],
  templateUrl: './exercise-detail.html',
  styleUrl: './exercise-detail.scss',
})
export class ExerciseDetail {
  @ViewChild(CodeEditor) private editor!: CodeEditor;

  protected readonly facade = inject(ExerciseFacade);
  protected readonly theme$ = inject(Theme).mode$;
  protected readonly auth = inject(AuthFacade);
  protected readonly authStatus$ = this.auth.status$;
  protected readonly exercise$ = this.facade.exercise$;
  // The resolver holds each navigation until its exercise has loaded, so a
  // navigation in progress means the next exercise is loading. The router
  // also clears this when a navigation is cancelled or skipped.
  private readonly router = inject(Router);
  protected readonly exerciseLoading = computed(
    () => this.router.currentNavigation() !== null,
  );
  protected readonly submissionPending$ = this.facade.submissionPending$;

  // The server never renders the signed-out alert (without a session cookie
  // it reports noSession), but Firebase can report signedOut before this lazy
  // page hydrates. Rendering the alert then breaks hydration, so wait until
  // the page has hydrated.
  protected readonly hydrated = signal(false);

  // False when the URL names no exercise; the store then still holds the
  // previous one, so the template shows the 404 page instead.
  protected readonly exerciseFound = toSignal(
    inject(ActivatedRoute).data.pipe(
      map((data) => data['exerciseFound'] as boolean),
    ),
    { requireSync: true },
  );

  private readonly exercise = toSignal(this.exercise$, { requireSync: true });

  private readonly exerciseId = computed(() => this.exercise()?.id);

  /** The Solution tab's position among the tabs. */
  protected readonly SOLUTION_TAB = 2;

  // Each exercise opens on the Code tab.
  protected readonly selectedTabIndex = linkedSignal({
    source: this.exerciseId,
    computation: () => 0,
  });

  // Changes only with the exercise's id, not on every edit to its code.
  private readonly seoExercise = computed(() => this.exercise(), {
    equal: (a, b) => a?.id === b?.id,
  });

  constructor() {
    const seo = inject(SeoService);

    afterNextRender(() => this.hydrated.set(true));

    effect(() => {
      const exercise = this.seoExercise();

      if (this.exerciseFound() && exercise) {
        seo.setPage(
          // The book's name first: it's what people search for, and search
          // results cut a long title off at the end.
          `The C Programming Language, ${this.exerciseHeading(exercise)}`,
          exercise.summary,
          `/exercises/${exercise.id}`,
        );
      }
    });
  }

  protected exerciseHeading(
    exercise: Pick<Exercise, 'chapter' | 'number' | 'suffix' | 'title'>,
  ): string {
    return `${exerciseName(exercise)}: ${exercise.title}`;
  }

  protected onCodeChange(code: string): void {
    this.facade.codeEdited(code);
  }

  protected onFormat(): void {
    this.facade.formatCode(this.editor.getCode());
  }

  protected onSubmit(): void {
    this.facade.submitExercise(this.editor.getCode());
  }
}
