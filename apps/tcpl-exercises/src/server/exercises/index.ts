import { ChapterSource, ExerciseSource } from '../../models/exercise';
import { renderMarkdown } from '../markdown';
import { exercise1_1 } from './1/1/exercise';
import { exercise1_10 } from './1/10/exercise';
import { exercise1_11 } from './1/11/exercise';
import { exercise1_12 } from './1/12/exercise';
import { exercise1_13 } from './1/13/exercise';
import { exercise1_14 } from './1/14/exercise';
import { exercise1_15 } from './1/15/exercise';
import { exercise1_16 } from './1/16/exercise';
import { exercise1_17 } from './1/17/exercise';
import { exercise1_18 } from './1/18/exercise';
import { exercise1_19 } from './1/19/exercise';
import { exercise1_2 } from './1/2/exercise';
import { exercise1_20 } from './1/20/exercise';
import { exercise1_21 } from './1/21/exercise';
import { exercise1_22 } from './1/22/exercise';
import { exercise1_23 } from './1/23/exercise';
import { exercise1_24 } from './1/24/exercise';
import { exercise1_3 } from './1/3/exercise';
import { exercise1_4 } from './1/4/exercise';
import { exercise1_5 } from './1/5/exercise';
import { exercise1_6 } from './1/6/exercise';
import { exercise1_7 } from './1/7/exercise';
import { exercise1_8 } from './1/8/exercise';
import { exercise1_9 } from './1/9/exercise';
import { exercise2_1 } from './2/1/exercise';
import { exercise2_10 } from './2/10/exercise';
import { exercise2_2 } from './2/2/exercise';
import { exercise2_3 } from './2/3/exercise';
import { exercise2_4 } from './2/4/exercise';
import { exercise2_5 } from './2/5/exercise';
import { exercise2_6 } from './2/6/exercise';
import { exercise2_7 } from './2/7/exercise';
import { exercise2_8 } from './2/8/exercise';
import { exercise2_9 } from './2/9/exercise';
import { exercise3_1 } from './3/1/exercise';
import { exercise3_2 } from './3/2/exercise';
import { exercise3_3 } from './3/3/exercise';
import { exercise3_4 } from './3/4/exercise';
import { exercise3_5 } from './3/5/exercise';
import { exercise3_6 } from './3/6/exercise';
import { exercise4_1 } from './4/1/exercise';
import { exercise4_10 } from './4/10/exercise';
import { exercise4_11 } from './4/11/exercise';
import { exercise4_12 } from './4/12/exercise';
import { exercise4_13 } from './4/13/exercise';
import { exercise4_14 } from './4/14/exercise';
import { exercise4_2 } from './4/2/exercise';
import { exercise4_3 } from './4/3/exercise';
import { exercise4_4 } from './4/4/exercise';
import { exercise4_5 } from './4/5/exercise';
import { exercise4_6 } from './4/6/exercise';
import { exercise4_7 } from './4/7/exercise';
import { exercise4_8 } from './4/8/exercise';
import { exercise5_1 } from './5/1/exercise';
import { exercise5_10 } from './5/10/exercise';
import { exercise5_11 } from './5/11/exercise';
import { exercise5_12 } from './5/12/exercise';
import { exercise5_13 } from './5/13/exercise';
import { exercise5_14 } from './5/14/exercise';
import { exercise5_15 } from './5/15/exercise';
import { exercise5_16 } from './5/16/exercise';
import { exercise5_17 } from './5/17/exercise';
import { exercise5_18 } from './5/18/exercise';
import { exercise5_19 } from './5/19/exercise';
import { exercise5_2 } from './5/2/exercise';
import { exercise5_20 } from './5/20/exercise';
import { exercise5_3 } from './5/3/exercise';
import { exercise5_4 } from './5/4/exercise';
import { exercise5_5 } from './5/5/exercise';
import { exercise5_6 } from './5/6/exercise';
import { exercise5_7 } from './5/7/exercise';
import { exercise5_8 } from './5/8/exercise';
import { exercise5_9 } from './5/9/exercise';
import { exercise6_1 } from './6/1/exercise';
import { exercise6_2 } from './6/2/exercise';
import { exercise6_3 } from './6/3/exercise';
import { exercise6_4 } from './6/4/exercise';
import { exercise6_5 } from './6/5/exercise';
import { exercise6_6 } from './6/6/exercise';

// Descriptions are written in markdown and served as HTML.
export const EXERCISES: ExerciseSource[] = [
  exercise1_1,
  exercise1_2,
  exercise1_3,
  exercise1_4,
  exercise1_5,
  exercise1_6,
  exercise1_7,
  exercise1_8,
  exercise1_9,
  exercise1_10,
  exercise1_11,
  exercise1_12,
  exercise1_13,
  exercise1_14,
  exercise1_15,
  exercise1_16,
  exercise1_17,
  exercise1_18,
  exercise1_19,
  exercise1_20,
  exercise1_21,
  exercise1_22,
  exercise1_23,
  exercise1_24,
  exercise2_1,
  exercise2_2,
  exercise2_3,
  exercise2_4,
  exercise2_5,
  exercise2_6,
  exercise2_7,
  exercise2_8,
  exercise2_9,
  exercise2_10,
  exercise3_1,
  exercise3_2,
  exercise3_3,
  exercise3_4,
  exercise3_5,
  exercise3_6,
  exercise4_1,
  exercise4_2,
  exercise4_3,
  exercise4_4,
  exercise4_5,
  exercise4_6,
  exercise4_7,
  exercise4_8,
  exercise4_10,
  exercise4_11,
  exercise4_12,
  exercise4_13,
  exercise4_14,
  exercise5_1,
  exercise5_2,
  exercise5_3,
  exercise5_4,
  exercise5_5,
  exercise5_6,
  exercise5_7,
  exercise5_8,
  exercise5_9,
  exercise5_10,
  exercise5_11,
  exercise5_12,
  exercise5_13,
  exercise5_14,
  exercise5_15,
  exercise5_16,
  exercise5_17,
  exercise5_18,
  exercise5_19,
  exercise5_20,
  exercise6_1,
  exercise6_2,
  exercise6_3,
  exercise6_4,
  exercise6_5,
  exercise6_6,
].map((exercise) => ({
  ...exercise,
  description: renderMarkdown(exercise.description),
}));

export const CHAPTERS: ChapterSource[] = Array.from(
  EXERCISES.reduce((chapters, exercise) => {
    const exercises = chapters.get(exercise.chapter) ?? [];
    exercises.push(exercise);
    chapters.set(exercise.chapter, exercises);
    return chapters;
  }, new Map<number, ExerciseSource[]>()),
  ([number, exercises]) => ({ number, exercises }),
).sort((a, b) => a.number - b.number);

export const EXERCISES_BY_ID: Record<string, ExerciseSource> =
  Object.fromEntries(EXERCISES.map((exercise) => [exercise.id, exercise]));
