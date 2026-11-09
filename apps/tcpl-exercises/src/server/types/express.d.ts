import { ExerciseSource } from '../../models/exercise';

// `user` is declared by @org/server's session middleware.
declare global {
  namespace Express {
    interface Request {
      /** Set by exerciseExistsMiddleware. */
      exercise?: ExerciseSource;
    }
  }
}

export {};
