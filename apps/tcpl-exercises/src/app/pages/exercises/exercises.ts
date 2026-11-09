import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { Chapter } from '../../../shared/models';
import { ExerciseFacade } from '../../store/exercise/exercise.facade';

type ExerciseStatus = Chapter['exercises'][number]['status'];

@Component({
  selector: 'app-exercises',
  imports: [RouterLink, RouterOutlet, NzMenuModule, AsyncPipe, NzTagModule],
  styleUrl: './exercises.scss',
  templateUrl: './exercises.html',
})
export class Exercises implements OnInit {
  protected readonly facade = inject(ExerciseFacade);
  protected readonly chapters$ = this.facade.chapters$;

  protected readonly statusLabels: Record<ExerciseStatus, string> = {
    passed: 'Passed',
    failed: 'Failed',
    pending: 'Pending',
    indeterminate: '—',
  };

  protected readonly statusColors: Record<ExerciseStatus, string | undefined> =
    {
      passed: 'success',
      failed: 'error',
      pending: 'processing',
      indeterminate: undefined,
    };

  // During hydration this is answered synchronously from the transfer
  // cache, so the sidebar's first client render matches the SSR markup.
  ngOnInit(): void {
    this.facade.loadExercises();
  }
}
