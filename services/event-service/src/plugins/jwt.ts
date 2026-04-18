import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import type { AuthTokenPayload } from '@dti-ems/shared-types';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: AuthTokenPayload;
    user: AuthTokenPayload;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    verifyJwt: (request: import('fastify').FastifyRequest, reply: import('fastify').FastifyReply) => Promise<void>;
  }
}

export const jwtPlugin = fp(async (app) => {
  const publicKeyB64 = process.env['JWT_PUBLIC_KEY_BASE64'];
  if (!publicKeyB64) throw new Error('JWT_PUBLIC_KEY_BASE64 must be set in event-service .env');

  const publicKey = Buffer.from(publicKeyB64, 'base64').toString('utf8');

  // Event service only verifies tokens — it does not sign them
  await app.register(fastifyJwt, {
    secret: { private: '', public: publicKey },
    verify: { algorithms: ['RS256'] },
  });

  app.decorate('verifyJwt', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      reply.code(401).send({
        success: false,
        error: { code: 'AUTH_003', message: 'Access token is invalid or expired.' },
      });
    }
  });
});
