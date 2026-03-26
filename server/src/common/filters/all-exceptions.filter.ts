import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const basePayload = {
      timestamp: new Date().toISOString(),
      path: request?.url,
      method: request?.method,
    };

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const res = exception.getResponse();

      // Nest often returns either a string or an object like:
      // { statusCode, message: string[] | string, error: string }
      let message: unknown = undefined;
      let error: unknown = undefined;

      if (typeof res === 'string') {
        message = res;
      } else if (res && typeof res === 'object') {
        const maybe = res as Record<string, unknown>;
        message = maybe.message ?? undefined;
        error = maybe.error ?? undefined;
      }

      this.logger.warn(
        `${statusCode} ${request?.method ?? ''} ${request?.url ?? ''}`,
      );

      response.status(statusCode).json({
        ...basePayload,
        statusCode,
        error: error ?? exception.name,
        message,
      });
      return;
    }

    this.logger.error(
      `Unhandled exception for ${request?.method ?? ''} ${request?.url ?? ''}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      ...basePayload,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'Internal server error',
    });
  }
}
