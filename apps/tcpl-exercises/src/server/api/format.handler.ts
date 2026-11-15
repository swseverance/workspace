import { format } from '@wasm-fmt/clang-format';
import { RequestHandler } from 'express';
import * as logger from 'firebase-functions/logger';
import { FormatCodeBody } from '../../shared/models';

/**
 * The same settings as the workspace's .clang-format, which formats the
 * reference solutions (format.handler.spec.ts checks the two agree).
 */
export const CLANG_FORMAT_STYLE: Record<string, string> = {
  BasedOnStyle: 'LLVM',
  SortIncludes: 'Never',
  AllowShortFunctionsOnASingleLine: 'None',
  AlignEscapedNewlines: 'Left',
};

const STYLE = `{${Object.entries(CLANG_FORMAT_STYLE)
  .map(([key, value]) => `${key}: ${value}`)
  .join(', ')}}`;

/**
 * Formats C the way the reference solutions are formatted. The formatter is
 * clang-format compiled to WebAssembly: it runs inside this process, with no
 * binary to install. validCodeMiddleware runs first.
 */
export const formatCodeHandler: RequestHandler<
  unknown,
  unknown,
  FormatCodeBody
> = (req, res) => {
  try {
    const body: FormatCodeBody = {
      code: format(req.body.code, 'main.c', STYLE),
    };

    res.json(body);
  } catch (err) {
    logger.error('[format] failed', err);
    res.status(500).json({ message: 'Failed to format code' });
  }
};
