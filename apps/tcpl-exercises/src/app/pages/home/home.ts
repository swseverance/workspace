import { AsyncPipe, DecimalPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '@org/ui';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { ExerciseNamePipe } from '../../pipes/exercise-name-pipe';
import { PassRatePipe } from '../../pipes/pass-rate-pipe';
import { ExerciseFacade } from '../../store/exercise/exercise.facade';

/** The book's chapter titles, by chapter number. */
const CHAPTER_TITLES: Record<number, string> = {
  1: 'A Tutorial Introduction',
  2: 'Types, Operators, and Expressions',
  3: 'Control Flow',
  4: 'Functions and Program Structure',
  5: 'Pointers and Arrays',
  6: 'Structures',
  7: 'Input and Output',
  8: 'The UNIX System Interface',
};

@Component({
  selector: 'app-home',
  imports: [
    AsyncPipe,
    DecimalPipe,
    ExerciseNamePipe,
    PassRatePipe,
    RouterLink,
    NzButtonModule,
    NzCollapseModule,
    NzTypographyModule,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private readonly facade = inject(ExerciseFacade);
  protected readonly chapters$ = this.facade.chapters$;
  protected readonly chapterTitles = CHAPTER_TITLES;

  constructor() {
    inject(SeoService).setPage(
      'The C Programming Language exercises',
      'Work through the exercises from Kernighan and Ritchie’s The C Programming Language (K&R) in your browser. Write C, run it against tests, and compare with a reference solution.',
      '/',
    );
  }

  // Rendered on the server, so every exercise is linked, by name, from the
  // home page's HTML. During hydration the transfer cache answers this.
  ngOnInit(): void {
    this.facade.loadChapters();
  }
}
