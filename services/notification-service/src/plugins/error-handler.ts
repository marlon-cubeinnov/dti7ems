import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '@dti-ems/shared-errors';
import { ZodError } from 'zod';

export function errorHandler(error: FastifyError | Error, _request: FastifyRequest, reply: FastifyReply) {
  if (error instanceof AppError) {
    return reply.code(error.statusCode).send({
      success: false,
      error: { code: error.code, message: error.message },
    });
  }

  if (error instanceof ZodError) {
    return reply.code(400).send({
      success: false,
      error: { code: 'VAL_001', message: 'Validation failed', details: error.flatten().fieldErrors },
    });
  }

  reply.log.error(error);
  return reply.code(500).send({
    success: false,
    error: { code: 'SRV_001', message: 'An unexpected error occurred.' },
  });
}
