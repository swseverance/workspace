import { Pipe, PipeTransform } from '@angular/core';
import { Exercise } from '../../shared/models';

type NamedExercise = Pick<Exercise, 'chapter' | 'number' | 'suffix'>;

/** An exercise's name as the book numbers it, e.g. "Exercise 1-13a". */
export function exerciseName(exercise: NamedExercise): string {
  const { chapter, number, suffix } = exercise;

  return `Exercise ${chapter}-${number}${suffix ?? ''}`;
}

/** exerciseName(), for templates. */
@Pipe({ name: 'exerciseName' })
export class ExerciseNamePipe implements PipeTransform {
  transform(exercise: NamedExercise): string {
    return exerciseName(exercise);
  }
}
