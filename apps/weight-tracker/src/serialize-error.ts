type SerializedError =
  { name: string; message: string; stack: string | undefined } | string;

export function serializeError(error: unknown): SerializedError {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }

  return String(error);
}
