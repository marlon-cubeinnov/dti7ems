import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '@dti-ems/shared-errors';
import { ZodError } from 'zod';

export function errorHandler(
  error: FastifyError | Error,
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  // Operational app errors
  if (error instanceof AppError) {
    return reply.code(error.statusCode).send({
      success: false,
      error: { code: error.code, message: error.message },
    });
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    return reply.code(400).send({
      success: false,
      error: {
        code: 'VAL_001',
        message: 'Validation failed',
        details: error.flatten().fieldErrors,
      },
    });
  }

  // Fastify validation errors (JSON schema)
  const fastifyError = error as FastifyError;
  if (fastifyError.statusCode === 400 && fastifyError.validation) {
    return reply.code(400).send({
      success: false,
      error: { code: 'VAL_001', message: fastifyError.message },
    });
  }

  // Log unexpected errors, return generic response (don't leak internals)
  reply.log.error(error);
  return reply.code(500).send({
    success: false,
    error: { code: 'SRV_001', message: 'An unexpected error occurred.' },
  });
}
