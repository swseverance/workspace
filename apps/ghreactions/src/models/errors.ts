export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class RateLimitError extends Error {
  constructor() {
    super('Rate limited by GitHub');
  }
}

export class UserNotFoundError extends Error {
  constructor() {
    super('GitHub user not found');
  }
}
