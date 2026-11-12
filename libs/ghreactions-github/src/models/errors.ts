export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class RateLimitError extends Error {
  /** Epoch second after which it's OK to retry. */
  readonly retryAt: number;

  constructor(retryAt: number) {
    super('Rate limited by GitHub');
    this.retryAt = retryAt;
  }
}

export class UserNotFoundError extends Error {
  constructor() {
    super('GitHub user not found');
  }
}
