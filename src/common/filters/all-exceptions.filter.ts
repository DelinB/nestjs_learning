// src/common/filters/all-exceptions.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Catch() // The empty decorator catches everything
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const errorId = uuidv4(); // Generate a unique ID for traceability

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred.';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string' ? exceptionResponse : (exceptionResponse as any).message;
    }

    // Log the full internal error for debugging (never send this to the client)
    this.logger.error({
      errorId,
      path: request.url,
      status,
      message: exception instanceof Error ? exception.message : 'Unknown',
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    // Send a sanitized response to the client
    response.status(status).json({
      statusCode: status,
      message, // For known HttpExceptions, this is safe
      errorId, // Helps support teams trace the error
      path: request.url,
    });
  }
}