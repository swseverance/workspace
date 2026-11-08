import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Logger } from './logger';

describe('Logger', () => {
  function setup(platform: 'browser' | 'server') {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: platform },
      ],
    });
    return {
      logger: TestBed.inject(Logger),
      backend: TestBed.inject(HttpTestingController),
    };
  }

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(console, 'info').mockImplementation(() => undefined);
  });

  afterEach(() => vi.restoreAllMocks());

  it('sends browser logs to /api/logs with errors serialized', () => {
    const { logger, backend } = setup('browser');
    const error = new Error('boom');

    logger.error('[auth] failed', error);

    const req = backend.expectOne('/api/logs');
    expect(req.request.body).toEqual({
      level: 'error',
      message: '[auth] failed',
      data: { name: 'Error', message: 'boom', stack: error.stack },
    });
    expect(console.error).toHaveBeenCalledWith('[auth] failed', {
      name: 'Error',
      message: 'boom',
      stack: error.stack,
    });
  });

  it('sends extra args as data', () => {
    const { logger, backend } = setup('browser');

    logger.info('hello', 1, 'two');

    expect(backend.expectOne('/api/logs').request.body).toEqual({
      level: 'info',
      message: 'hello',
      data: [1, 'two'],
    });
  });

  it('only logs to the console on the server', () => {
    const { logger, backend } = setup('server');

    logger.error('server side');

    backend.expectNone('/api/logs');
    expect(console.error).toHaveBeenCalledWith('server side');
  });
});
