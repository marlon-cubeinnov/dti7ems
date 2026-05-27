import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { AuthService } from '../services/auth.service.js';

const REFRESH_COOKIE = 'dti_refresh_token';
const COOKIE_MAX_AGE = Number(process.env['JWT_REFRESH_TOKEN_EXPIRY_SECONDS'] ?? 604800);

const registerSchema = z.object({
  email:                z.string().email('Must be a valid email address'),
  password:             z.string().min(10, 'Password must be at least 10 characters')
                          .regex(/[A-Z]/, 'Must contain an uppercase letter')
                          .regex(/[0-9]/, 'Must contain a number'),
  firstName:            z.string().min(1).max(100),
  middleName:           z.string().max(100).optional().nullable(),
  lastName:             z.string().min(1).max(100),
  nameSuffix:           z.string().max(20).optional().nullable(),
  sex:                  z.enum(['MALE', 'FEMALE']).optional().nullable(),
  birthdate:            z.string().optional().nullable(), // ISO date string
  mobileNumber:         z.string().regex(/^(\+63|0)9\d{9}$/, 'Invalid PH mobile number').optional().nullable(),
  employmentCategory:   z.enum(['SELF_EMPLOYED', 'EMPLOYED_GOVT', 'EMPLOYED_PRIVATE', 'GENERAL_PUBLIC']).optional().nullable(),
  socialClassification: z.enum(['ABLED', 'PWD', 'FOUR_PS', 'YOUTH', 'SENIOR_CITIZEN', 'INDIGENOUS_PERSON', 'OFW', 'OTHERS']).optional().nullable(),
  // Address (personal)
  region:               z.string().max(100).optional().nullable(),
  province:             z.string().max(100).optional().nullable(),
  cityMunicipality:     z.string().max(100).optional().nullable(),
  // Employer/Company info (for EMPLOYED_GOVT / EMPLOYED_PRIVATE)
  companyName:          z.string().max(300).optional().nullable(),
  companyRegion:        z.string().max(100).optional().nullable(),
  companyProvince:      z.string().max(100).optional().nullable(),
  companyCityMunicipality: z.string().max(100).optional().nullable(),
  companyEmail:         z.string().email().optional().nullable(),
  companyPhone:         z.string().max(50).optional().nullable(),
  jobTitle:             z.string().max(200).optional().nullable(),
  dpaConsentGiven:      z.literal(true, { errorMap: () => ({ message: 'DPA consent is required' }) }),
});

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token:    z.string().min(1),
  password: z.string().min(10)
               .regex(/[A-Z]/, 'Must contain an uppercase letter')
               .regex(/[0-9]/, 'Must contain a number'),
});

const registerBusinessSchema = z.object({
  email:           z.string().email('Must be a valid email address'),
  password:        z.string().min(10, 'Password must be at least 10 characters')
                     .regex(/[A-Z]/, 'Must contain an uppercase letter')
                     .regex(/[0-9]/, 'Must contain a number'),
  firstName:       z.string().min(1).max(100),
  lastName:        z.string().min(1).max(100),
  mobileNumber:    z.string().regex(/^(\+63|0)9\d{9}$/, 'Invalid PH mobile number').optional().nullable(),
  dpaConsentGiven: z.literal(true, { errorMap: () => ({ message: 'DPA consent is required' }) }),
  enterprise: z.object({
    businessName:    z.string().min(1).max(300),
    industrySector:  z.string().min(1).max(200),
    tradeName:       z.string().max(300).optional().nullable(),
    registrationNo:  z.string().max(100).optional().nullable(),
    tinNumber:       z.string().max(20).optional().nullable(),
    stage:           z.enum(['IDEATION', 'VALIDATION', 'GROWTH', 'EXPANSION', 'MATURITY_EXIT']).default('VALIDATION'),
    employeeCount:   z.number().int().min(1).optional().nullable(),
    region:          z.string().max(100).optional().nullable(),
    province:        z.string().max(100).optional().nullable(),
    cityMunicipality: z.string().max(100).optional().nullable(),
  }),
  employees: z.array(z.object({
    email:     z.string().email(),
    firstName: z.string().min(1).max(100),
    lastName:  z.string().min(1).max(100),
    jobTitle:  z.string().max(200).optional().nullable(),
  })).max(50).default([]),
});

const acceptInviteSchema = z.object({
  token:           z.string().min(1),
  password:        z.string().min(10)
                     .regex(/[A-Z]/, 'Must contain an uppercase letter')
                     .regex(/[0-9]/, 'Must contain a number'),
  dpaConsentGiven: z.literal(true, { errorMap: () => ({ message: 'DPA consent is required' }) }),
});

export const authRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  const authService = new AuthService(app);

  // GET /auth/search-companies?q=...
  app.get('/search-companies', async (request, reply) => {
    const { q } = request.query as { q?: string };
    if (!q || q.trim().length < 2) return reply.send({ success: true, data: [] });
    const results = await app.prisma.enterpriseProfile.findMany({
      where: { businessName: { contains: q.trim(), mode: 'insensitive' } },
      select: { id: true, businessName: true, region: true, province: true, cityMunicipality: true },
      take: 10,
      orderBy: { businessName: 'asc' },
    });
    return reply.send({ success: true, data: results });
  });

  // POST /auth/register
  app.post('/register', async (request, reply) => {
    const body = registerSchema.parse(request.body);
    const user = await authService.register(body);
    return reply.code(201).send({
      success: true,
      data: { user },
      message: 'Account created. Please check your email to verify your address.',
    });
  });

  // POST /auth/register-business (kept for backwards compat)
  app.post('/register-business', async (request, reply) => {
    const body = registerBusinessSchema.parse(request.body);
    const result = await authService.registerBusiness(body);
    return reply.code(201).send({
      success: true,
      data: result,
      message: 'Business account created. Please check your email to verify your address.',
    });
  });

  // POST /auth/login
  app.post('/login', async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const result = await authService.login({
      ...body,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    });

    reply.setCookie(REFRESH_COOKIE, result.refreshToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      path: '/auth',
      maxAge: COOKIE_MAX_AGE,
    });

    return reply.send({
      success: true,
      data: { accessToken: result.accessToken, user: result.user },
    });
  });

  // POST /auth/refresh
  app.post('/refresh', async (request, reply) => {
    const refreshToken = request.cookies[REFRESH_COOKIE];
    if (!refreshToken) {
      return reply.code(401).send({
        success: false,
        error: { code: 'AUTH_005', message: 'No refresh token provided.' },
      });
    }

    const result = await authService.refresh(refreshToken);

    reply.setCookie(REFRESH_COOKIE, result.refreshToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      path: '/auth',
      maxAge: COOKIE_MAX_AGE,
    });

    return reply.send({ success: true, data: { accessToken: result.accessToken } });
  });

  // POST /auth/logout
  app.post('/logout', async (request, reply) => {
    const refreshToken = request.cookies[REFRESH_COOKIE];
    await authService.logout(refreshToken ?? '');
    reply.clearCookie(REFRESH_COOKIE, { path: '/auth' });
    return reply.send({ success: true, message: 'Logged out successfully.' });
  });

  // POST /auth/verify-email
  app.post('/verify-email', async (request, reply) => {
    const { token } = z.object({ token: z.string().min(1) }).parse(request.body);
    const result = await authService.verifyEmail(token);
    return reply.send({ success: true, ...result });
  });

  // POST /auth/forgot-password
  app.post('/forgot-password', async (request, reply) => {
    const { email } = forgotPasswordSchema.parse(request.body);
    const result = await authService.forgotPassword(email);
    return reply.send({ success: true, ...result });
  });

  // POST /auth/reset-password
  app.post('/reset-password', async (request, reply) => {
    const { token, password } = resetPasswordSchema.parse(request.body);
    const result = await authService.resetPassword(token, password);
    return reply.send({ success: true, ...result });
  });

  // POST /auth/accept-invite
  app.post('/accept-invite', async (request, reply) => {
    const body = acceptInviteSchema.parse(request.body);
    const result = await authService.acceptInvite(body);
    return reply.send({ success: true, ...result });
  });
};
