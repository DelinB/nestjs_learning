import { Logger } from '@nestjs/common';
import { EventEmitter } from 'events';
import { LoggerMiddleware } from './logger.middleware';

describe('LoggerMiddleware', () => {
  let middleware: LoggerMiddleware;
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    middleware = new LoggerMiddleware();
  });

  afterEach(() => jest.restoreAllMocks());

  const makeRes = (statusCode = 200) => {
    const res = new EventEmitter() as any;
    res.statusCode = statusCode;
    res.writableEnded = false;
    return res;
  };

  it('calls next() exactly once', () => {
    const next = jest.fn();
    middleware.use({ method: 'GET', originalUrl: '/songs' } as any, makeRes(), next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('does NOT log before the response finishes', () => {
    middleware.use(
      { method: 'GET', originalUrl: '/songs' } as any,
      makeRes(),
      jest.fn(),
    );
    expect(logSpy).not.toHaveBeenCalled();
  });

  it('logs method, url, status and duration on finish', () => {
    const res = makeRes(404);
    middleware.use(
      { method: 'GET', originalUrl: '/songs/999' } as any,
      res,
      jest.fn(),
    );

    res.emit('finish');

    expect(logSpy).toHaveBeenCalledTimes(1);
    const msg = logSpy.mock.calls[0][0];
    expect(msg).toContain('GET');
    expect(msg).toContain('/songs/999');
    expect(msg).toContain('404');
    expect(msg).toMatch(/\d+ms$/);
  });
});