import { ExerciseNamePipe } from './exercise-name-pipe';

describe('ExerciseNamePipe', () => {
  const pipe = new ExerciseNamePipe();

  it('names an exercise by its chapter and number', () => {
    expect(pipe.transform({ chapter: 2, number: 6 })).toBe('Exercise 2-6');
  });

  it('adds the suffix of a split exercise', () => {
    expect(pipe.transform({ chapter: 1, number: 13, suffix: 'a' })).toBe(
      'Exercise 1-13a',
    );
  });
});
