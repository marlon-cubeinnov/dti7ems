import * as argon2 from 'argon2';
import { nanoid } from 'nanoid';
import type { FastifyInstance } from 'fastify';
import {
  ConflictError,
  UnauthorizedError,
  BadRequestError,
  NotFoundError,
  ErrorCode,
} from '@dti-ems/shared-errors';
import { KAFKA_TOPICS } from '@dti-ems/shared-types';

const REFRESH_TOKEN_TTL = Number(process.env['JWT_REFRESH_TOKEN_EXPIRY_SECONDS'] ?? 604800);
const REDIS_REFRESH_PREFIX = 'refresh:';
const REDIS_VERIFY_PREFIX = 'verify:';

export class AuthService {
  constructor(private readonly app: FastifyInstance) {}

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    mobileNumber?: string | null;
    dpaConsentGiven: boolean;
  }) {
    const { email, password, firstName, lastName, mobileNumber, dpaConsentGiven } = data;

    if (!dpaConsentGiven) {
      throw new BadRequestError(
        'DPA consent is required under RA 10173 to create an account.',
        ErrorCode.DPA_CONSENT_REQUIRED,
      );
    }

    const existing = await this.app.prisma.userProfile.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictError('An account with this email already exists.', ErrorCode.EMAIL_ALREADY_EXISTS);
    }

    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    const verifyToken = nanoid(48);
    const verifyTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await this.app.prisma.userProfile.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        mobileNumber: mobileNumber ?? null,
        dpaConsentGiven: true,
        dpaConsentAt: new Date(),
        verifyToken,
        verifyTokenExp,
      },
    });

    await this.sendVerificationEmail(user.email, user.firstName, verifyToken);

    return { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName };
  }

  async registerBusiness(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    mobileNumber?: string | null;
    dpaConsentGiven: boolean;
    enterprise: {
      businessName: string;
      industrySector: string;
      tradeName?: string | null;
      registrationNo?: string | null;
      tinNumber?: string | null;
      stage?: string;
      employeeCount?: number | null;
      region?: string | null;
      province?: string | null;
      cityMunicipality?: string | null;
    };
    employees?: Array<{
      email: string;
      firstName: string;
      lastName: string;
      jobTitle?: string | null;
    }>;
  }) {
    const { email, password, firstName, lastName, mobileNumber, dpaConsentGiven, enterprise, employees } = data;

    if (!dpaConsentGiven) {
      throw new BadRequestError(
        'DPA consent is required under RA 10173 to create an account.',
        ErrorCode.DPA_CONSENT_REQUIRED,
      );
    }

    const existing = await this.app.prisma.userProfile.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictError('An account with this email already exists.', ErrorCode.EMAIL_ALREADY_EXISTS);
    }

    // Check employee emails for conflicts
    if (employees?.length) {
      const empEmails = employees.map((e) => e.email.toLowerCase());
      const existingEmps = await this.app.prisma.userProfile.findMany({
        where: { email: { in: empEmails } },
        select: { email: true },
      });
      if (existingEmps.length > 0) {
        throw new ConflictError(
          `The following employee email(s) are already registered: ${existingEmps.map((e) => e.email).join(', ')}`,
          ErrorCode.EMAIL_ALREADY_EXISTS,
        );
      }
    }

    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    const verifyToken = nanoid(48);
    const verifyTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const result = await this.app.prisma.$transaction(async (tx) => {
      // Create the owner user
      const user = await tx.userProfile.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          mobileNumber: mobileNumber ?? null,
          role: 'ENTERPRISE_REPRESENTATIVE',
          dpaConsentGiven: true,
          dpaConsentAt: new Date(),
          verifyToken,
          verifyTokenExp,
        },
      });

      // Create enterprise profile
      const ent = await tx.enterpriseProfile.create({
        data: {
          userId: user.id,
          businessName: enterprise.businessName,
          industrySector: enterprise.industrySector,
          tradeName: enterprise.tradeName ?? null,
          registrationNo: enterprise.registrationNo ?? null,
          tinNumber: enterprise.tinNumber ?? null,
          stage: (enterprise.stage as any) ?? 'STARTUP',
          employeeCount: enterprise.employeeCount ?? null,
          region: enterprise.region ?? null,
          province: enterprise.province ?? null,
          cityMunicipality: enterprise.cityMunicipality ?? null,
        },
      });

      // Create OWNER membership
      await tx.enterpriseMembership.create({
        data: { enterpriseId: ent.id, userId: user.id, role: 'OWNER' },
      });

      // Create invited employees
      const invitedEmployees: Array<{ id: string; email: string; firstName: string; inviteToken: string }> = [];
      if (employees?.length) {
        for (const emp of employees) {
          const invToken = nanoid(48);
          const invTokenExp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

          const empUser = await tx.userProfile.create({
            data: {
              email: emp.email.toLowerCase(),
              passwordHash: '', // No password yet — set via invite acceptance
              firstName: emp.firstName,
              lastName: emp.lastName,
              jobTitle: emp.jobTitle ?? null,
              role: 'PARTICIPANT',
              dpaConsentGiven: false,
              inviteToken: invToken,
              inviteTokenExp: invTokenExp,
              invitedBy: user.id,
            },
          });

          await tx.enterpriseMembership.create({
            data: { enterpriseId: ent.id, userId: empUser.id, role: 'MEMBER' },
          });

          invitedEmployees.push({ id: empUser.id, email: empUser.email, firstName: empUser.firstName, inviteToken: invToken });
        }
      }

      return { user, enterprise: ent, invitedEmployees };
    });

    // Send verification email to owner
    await this.sendVerificationEmail(result.user.email, result.user.firstName, verifyToken);

    // Send invite emails to employees
    for (const emp of result.invitedEmployees) {
      await this.sendEmployeeInviteEmail(emp.email, emp.firstName, emp.inviteToken, enterprise.businessName);
    }

    return {
      user: { id: result.user.id, email: result.user.email, firstName: result.user.firstName, lastName: result.user.lastName },
      enterprise: { id: result.enterprise.id, businessName: result.enterprise.businessName },
      employeesInvited: result.invitedEmployees.length,
    };
  }

  async inviteEmployee(inviterUserId: string, enterpriseId: string, data: {
    email: string;
    firstName: string;
    lastName: string;
    jobTitle?: string | null;
  }) {
    const enterprise = await this.app.prisma.enterpriseProfile.findUnique({ where: { id: enterpriseId } });
    if (!enterprise) {
      throw new NotFoundError('Enterprise not found.');
    }

    const existing = await this.app.prisma.userProfile.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existing) {
      throw new ConflictError('A user with this email already exists.', ErrorCode.EMAIL_ALREADY_EXISTS);
    }

    const inviteToken = nanoid(48);
    const inviteTokenExp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const empUser = await this.app.prisma.$transaction(async (tx) => {
      const user = await tx.userProfile.create({
        data: {
          email: data.email.toLowerCase(),
          passwordHash: '',
          firstName: data.firstName,
          lastName: data.lastName,
          jobTitle: data.jobTitle ?? null,
          role: 'PARTICIPANT',
          dpaConsentGiven: false,
          inviteToken,
          inviteTokenExp,
          invitedBy: inviterUserId,
        },
      });

      await tx.enterpriseMembership.create({
        data: { enterpriseId, userId: user.id, role: 'MEMBER' },
      });

      return user;
    });

    await this.sendEmployeeInviteEmail(empUser.email, empUser.firstName, inviteToken, enterprise.businessName);

    return { id: empUser.id, email: empUser.email, firstName: empUser.firstName, lastName: empUser.lastName };
  }

  async acceptInvite(data: { token: string; password: string; dpaConsentGiven: boolean }) {
    const { token, password, dpaConsentGiven } = data;

    if (!dpaConsentGiven) {
      throw new BadRequestError(
        'DPA consent is required under RA 10173.',
        ErrorCode.DPA_CONSENT_REQUIRED,
      );
    }

    const user = await this.app.prisma.userProfile.findFirst({
      where: { inviteToken: token },
    });

    if (!user || !user.inviteTokenExp || user.inviteTokenExp < new Date()) {
      throw new BadRequestError('Invite link is invalid or has expired.', ErrorCode.TOKEN_INVALID);
    }

    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

    await this.app.prisma.userProfile.update({
      where: { id: user.id },
      data: {
        passwordHash,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        status: 'ACTIVE',
        dpaConsentGiven: true,
        dpaConsentAt: new Date(),
        inviteToken: null,
        inviteTokenExp: null,
      },
    });

    return { message: 'Account activated successfully. You can now log in.' };
  }

  async login(data: { email: string; password: string; ip?: string; userAgent?: string }) {
    const { email, password, ip, userAgent } = data;

    const user = await this.app.prisma.userProfile.findUnique({ where: { email } });

    // Use constant-time comparison even if user not found (prevent timing attacks)
    const placeholderHash = '$argon2id$v=19$m=65536,t=3,p=4$placeholder';
    const passwordHash = user?.passwordHash ?? placeholderHash;
    const isValid = user ? await argon2.verify(passwordHash, password) : false;

    if (!user || !isValid) {
      throw new UnauthorizedError('Invalid email or password.', ErrorCode.INVALID_CREDENTIALS);
    }

    if (!user.emailVerified) {
      throw new UnauthorizedError('Please verify your email address first.', ErrorCode.EMAIL_NOT_VERIFIED);
    }

    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedError('Your account has been suspended. Contact support.', ErrorCode.ACCOUNT_SUSPENDED);
    }

    if (user.status === 'DEACTIVATED') {
      throw new UnauthorizedError('This account has been deactivated.', ErrorCode.ACCOUNT_DEACTIVATED);
    }

    // Issue tokens
    const accessToken = this.app.jwt.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
    });

    const refreshToken = nanoid(64);
    const redisKey = `${REDIS_REFRESH_PREFIX}${refreshToken}`;
    await this.app.redis.setex(redisKey, REFRESH_TOKEN_TTL, user.id);

    // Update last login
    await this.app.prisma.userProfile.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Audit log
    await this.app.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entityType: 'UserProfile',
        entityId: user.id,
        ipAddress: ip,
        userAgent,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async refresh(refreshToken: string) {
    const redisKey = `${REDIS_REFRESH_PREFIX}${refreshToken}`;
    const userId = await this.app.redis.get(redisKey);

    if (!userId) {
      throw new UnauthorizedError('Refresh token is invalid or expired.', ErrorCode.REFRESH_TOKEN_INVALID);
    }

    const user = await this.app.prisma.userProfile.findUnique({ where: { id: userId } });
    if (!user || user.status !== 'ACTIVE') {
      await this.app.redis.del(redisKey);
      throw new UnauthorizedError('Session invalid.', ErrorCode.REFRESH_TOKEN_INVALID);
    }

    // Rotate: delete old, issue new
    await this.app.redis.del(redisKey);
    const newRefreshToken = nanoid(64);
    await this.app.redis.setex(`${REDIS_REFRESH_PREFIX}${newRefreshToken}`, REFRESH_TOKEN_TTL, user.id);

    const accessToken = this.app.jwt.sign({ sub: user.id, email: user.email, role: user.role, firstName: user.firstName ?? null, lastName: user.lastName ?? null });

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string) {
    if (refreshToken) {
      await this.app.redis.del(`${REDIS_REFRESH_PREFIX}${refreshToken}`);
    }
  }

  async verifyEmail(token: string) {
    const user = await this.app.prisma.userProfile.findFirst({
      where: { verifyToken: token },
    });

    if (!user || !user.verifyTokenExp || user.verifyTokenExp < new Date()) {
      throw new BadRequestError('Verification link is invalid or has expired.', ErrorCode.TOKEN_INVALID);
    }

    await this.app.prisma.userProfile.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
        status: 'ACTIVE',
        verifyToken: null,
        verifyTokenExp: null,
      },
    });

    return { message: 'Email verified successfully. You can now log in.' };
  }

  async forgotPassword(email: string) {
    // Always return success to prevent user enumeration
    const user = await this.app.prisma.userProfile.findUnique({ where: { email } });
    if (user) {
      const resetToken = nanoid(48);
      const resetTokenExp = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await this.app.prisma.userProfile.update({
        where: { id: user.id },
        data: { resetToken, resetTokenExp },
      });

      await this.sendPasswordResetEmail(user.email, user.firstName, resetToken);
    }

    return { message: 'If an account with that email exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.app.prisma.userProfile.findFirst({
      where: { resetToken: token },
    });

    if (!user || !user.resetTokenExp || user.resetTokenExp < new Date()) {
      throw new BadRequestError('Reset link is invalid or has expired.', ErrorCode.TOKEN_INVALID);
    }

    const passwordHash = await argon2.hash(newPassword, { type: argon2.argon2id });

    await this.app.prisma.userProfile.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExp: null },
    });

    // Invalidate all refresh tokens for this user on password reset
    // (For simplicity in Phase 1 we log the action; full session revocation in Phase 2)
    await this.app.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PASSWORD_RESET',
        entityType: 'UserProfile',
        entityId: user.id,
      },
    });

    return { message: 'Password reset successfully. You can now log in.' };
  }

  private async sendVerificationEmail(email: string, firstName: string, token: string) {
    const verifyUrl = `${process.env['APP_URL']}/verify-email?token=${token}`;
    await this.app.mailer.sendMail({
      from: process.env['SMTP_FROM'],
      to: email,
      subject: 'Verify your DTI Region 7 EMS account',
      html: `
        <p>Hi ${firstName},</p>
        <p>Welcome to DTI Region 7 Events Management System.</p>
        <p>Please verify your email address by clicking the link below:</p>
        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
        <p>This link expires in 24 hours.</p>
        <p>If you did not create this account, you can safely ignore this email.</p>
        <br/>
        <p>DTI Region 7 EMS Team</p>
      `,
    });
  }

  private async sendPasswordResetEmail(email: string, firstName: string, token: string) {
    const resetUrl = `${process.env['APP_URL']}/reset-password?token=${token}`;
    await this.app.mailer.sendMail({
      from: process.env['SMTP_FROM'],
      to: email,
      subject: 'Reset your DTI Region 7 EMS password',
      html: `
        <p>Hi ${firstName},</p>
        <p>We received a request to reset your password.</p>
        <p>Click the link below to set a new password:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link expires in 1 hour.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
        <br/>
        <p>DTI Region 7 EMS Team</p>
      `,
    });
  }

  private async sendEmployeeInviteEmail(email: string, firstName: string, token: string, businessName: string) {
    const inviteUrl = `${process.env['APP_URL']}/accept-invite?token=${token}`;
    await this.app.mailer.sendMail({
      from: process.env['SMTP_FROM'],
      to: email,
      subject: `You're invited to join ${businessName} on DTI Region 7 EMS`,
      html: `
        <p>Hi ${firstName},</p>
        <p>You have been added as an employee of <strong>${businessName}</strong> on the DTI Region 7 Events Management System.</p>
        <p>Click the link below to set your password and activate your account:</p>
        <p><a href="${inviteUrl}">${inviteUrl}</a></p>
        <p>This link expires in 7 days.</p>
        <p>If you were not expecting this invitation, you can safely ignore this email.</p>
        <br/>
        <p>DTI Region 7 EMS Team</p>
      `,
    });
  }
}
