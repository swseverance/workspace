import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID, Service } from '@angular/core';
import type { LogLevel, LogRequestBody } from '@org/server';

type SerializedError =
  | { status: number; message: string; body: unknown }
  | { name: string; message: string; stack: string | undefined }
  | string;

function serializeError(error: unknown): SerializedError {
  if (error instanceof HttpErrorResponse) {
    return { status: error.status, message: error.message, body: error.error };
  }

  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }

  return String(error);
}

/**
 * Logs to the console and, in the browser, to the server's /api/logs (see
 * logHandler in @org/server) so client errors reach Cloud Logging.
 */
@Service()
export class Logger {
  private readonly http = inject(HttpClient);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  debug(message: string, ...args: unknown[]): void {
    console.debug(message, ...args);
    this.send('debug', message, args.length ? args : undefined);
  }

  info(message: string, ...args: unknown[]): void {
    console.info(message, ...args);
    this.send('info', message, args.length ? args : undefined);
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(message, ...args);
    this.send('warn', message, args.length ? args : undefined);
  }

  error(message: string, error?: unknown): void {
    if (error === undefined) {
      console.error(message);
      this.send('error', message);
      return;
    }

    const serialized = serializeError(error);
    console.error(message, serialized);
    this.send('error', message, serialized);
  }

  private send(level: LogLevel, message: string, data?: unknown): void {
    // On the server, console output already lands in Cloud Logging.
    if (!this.isBrowser) {
      return;
    }

    this.http
      .post('/api/logs', { level, message, data } satisfies LogRequestBody)
      .subscribe({
        error: (error: unknown) =>
          console.error(
            '[logger] failed to send log to server:',
            serializeError(error),
          ),
      });
  }
}
