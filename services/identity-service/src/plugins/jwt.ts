import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import type { AuthTokenPayload } from '@dti-ems/shared-types';

declare module 'fastify' {
  interface FastifyInstance {
    verifyJwt: (request: import('fastify').FastifyRequest, reply: import('fastify').FastifyReply) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: Omit<AuthTokenPayload, 'iat' | 'exp'>;
    user: AuthTokenPayload;
  }
}

export const jwtPlugin = fp(async (app) => {
  const privateKeyB64 = process.env['JWT_PRIVATE_KEY_BASE64'];
  const publicKeyB64  = process.env['JWT_PUBLIC_KEY_BASE64'];

  if (!privateKeyB64 || !publicKeyB64) {
    throw new Error(
      'JWT_PRIVATE_KEY_BASE64 and JWT_PUBLIC_KEY_BASE64 must be set. ' +
      'Run: node scripts/generate-keys.js',
    );
  }

  const privateKey = Buffer.from(privateKeyB64, 'base64').toString('utf8');
  const publicKey  = Buffer.from(publicKeyB64,  'base64').toString('utf8');

  await app.register(fastifyJwt, {
    secret: { private: privateKey, public: publicKey },
    sign:   { algorithm: 'RS256', expiresIn: Number(process.env['JWT_ACCESS_TOKEN_EXPIRY_SECONDS'] ?? 900) },
    verify: { algorithms: ['RS256'] },
  });

  // Convenience hook — attach to routes that require auth
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
