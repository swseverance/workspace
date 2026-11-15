import { RequestHandler } from 'express';

export const MAX_CODE_LENGTH = 20_000;

/**
 * For routes that take code in the request body. Answers 400 unless
 * `req.body.code` is a string of a reasonable length, so the handler after
 * it can rely on that. A null code counts as empty.
 */
export const validCodeMiddleware: RequestHandler = (req, res, next) => {
  const code: unknown = req.body?.code === null ? '' : req.body?.code;

  if (typeof code !== 'string') {
    res.status(400).json({ message: 'code is required' });
    return;
  }

  if (code.length > MAX_CODE_LENGTH) {
    res
      .status(400)
      .json({ message: `code must be at most ${MAX_CODE_LENGTH} characters` });
    return;
  }

  req.body.code = code;
  next();
};
