import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import PDFDocument from 'pdfkit';
import { ForbiddenError, NotFoundError, BadRequestError, ErrorCode } from '@dti-ems/shared-errors';
import { notifyCertificateIssued } from '../lib/notify.js';

export const certificateRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // ── Public: verify a certificate by code ─────────────────────────────────
  // GET /certificates/verify/:code — no auth required
  app.get('/verify/:code', async (request, reply) => {
    const { code } = z.object({ code: z.string().min(1) }).parse(request.params);

    const cert = await app.prisma.certificate.findUnique({
      where: { verificationCode: code.toUpperCase() },
      include: {
        participation: {
          select: {
            userId: true,
            registeredAt: true,
            event: {
              select: { id: true, title: true, startDate: true, endDate: true, venue: true, deliveryMode: true },
            },
          },
        },
      },
    });

    if (!cert) throw new NotFoundError('Certificate not found. The verification code may be invalid.');
    if (cert.status === 'REVOKED') {
      return reply.send({ success: true, data: { valid: false, reason: 'This certificate has been revoked.' } });
    }

    return reply.send({
      success: true,
      data: {
        valid: true,
        certificate: {
          verificationCode: cert.verificationCode,
          issuedAt: cert.issuedAt,
          status: cert.status,
          event: cert.participation.event,
        },
      },
    });
  });

  // ── Authenticated routes ──────────────────────────────────────────────────
  app.addHook('preHandler', async (request, reply) => {
    // Allow verify route above to be unauthenticated — handled by route-level above
    if (request.url.includes('/verify/')) return;
    await app.verifyJwt(request, reply);
  });

  // GET /certificates/my — list my certificates
  app.get('/my', async (request, reply) => {
    const certs = await app.prisma.certificate.findMany({
      where: { userId: request.user.sub, status: { in: ['GENERATED', 'ISSUED'] } },
      include: {
        participation: {
          select: {
            event: {
              select: { id: true, title: true, startDate: true, endDate: true, venue: true },
            },
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });

    return reply.send({ success: true, data: certs });
  });

  // POST /certificates/:participationId/issue — organizer marks certificate issued
  app.post('/:participationId/issue', async (request, reply) => {
    const role = request.user.role;
    if (!['EVENT_ORGANIZER', 'PROGRAM_MANAGER', 'SYSTEM_ADMIN', 'SUPER_ADMIN'].includes(role)) {
      throw new ForbiddenError('Only organizers can issue certificates.');
    }

    const { participationId } = z.object({ participationId: z.string() }).parse(request.params);

    const participation = await app.prisma.eventParticipation.findUnique({
      where: { id: participationId },
      select: { id: true, userId: true, eventId: true, status: true, participantName: true, participantEmail: true, event: { select: { title: true } } },
    });

    if (!participation) throw new NotFoundError('Participation not found');

    if (!['ATTENDED', 'COMPLETED'].includes(participation.status)) {
      throw new BadRequestError(
        'Participant must have attended the event before a certificate can be issued.',
        ErrorCode.VALIDATION_ERROR,
      );
    }

    const verificationCode = randomBytes(12).toString('hex').toUpperCase();
    const now = new Date();

    const cert = await app.prisma.certificate.upsert({
      where: { participationId },
      create: {
        participationId,
        userId: participation.userId,
        eventId: participation.eventId,
        status: 'ISSUED',
        verificationCode,
        generatedAt: now,
        issuedAt: now,
      },
      update: {
        status: 'ISSUED',
        issuedAt: now,
        generatedAt: now,
      },
    });

    // Mark participation as COMPLETED
    await app.prisma.eventParticipation.update({
      where: { id: participationId },
      data: { status: 'COMPLETED', completedAt: now },
    });

    // Fire-and-forget: certificate issued email
    notifyCertificateIssued({
      to: participation.participantEmail ?? '',
      participantName: participation.participantName ?? 'Participant',
      eventTitle: participation.event?.title ?? 'Event',
      verificationCode: cert.verificationCode,
    }).catch(() => { /* best effort */ });

    return reply.code(201).send({ success: true, data: cert, message: 'Certificate issued.' });
  });

  // POST /certificates/bulk-issue/:eventId — issue all eligible certs for an event
  app.post('/bulk-issue/:eventId', async (request, reply) => {
    const role = request.user.role;
    if (!['EVENT_ORGANIZER', 'PROGRAM_MANAGER', 'SYSTEM_ADMIN', 'SUPER_ADMIN'].includes(role)) {
      throw new ForbiddenError('Only organizers can issue certificates.');
    }

    const { eventId } = z.object({ eventId: z.string() }).parse(request.params);

    // Get all attended participants without a certificate
    const eligible = await app.prisma.eventParticipation.findMany({
      where: {
        eventId,
        status: { in: ['ATTENDED', 'COMPLETED'] },
        certificate: null,
      },
      select: { id: true, userId: true, eventId: true },
    });

    const now = new Date();
    const issued: string[] = [];

    for (const p of eligible) {
      const verificationCode = randomBytes(12).toString('hex').toUpperCase();
      await app.prisma.certificate.upsert({
        where: { participationId: p.id },
        create: {
          participationId: p.id,
          userId: p.userId,
          eventId: p.eventId,
          status: 'ISSUED',
          verificationCode,
          generatedAt: now,
          issuedAt: now,
        },
        update: { status: 'ISSUED', issuedAt: now, generatedAt: now },
      });
      await app.prisma.eventParticipation.update({
        where: { id: p.id },
        data: { status: 'COMPLETED', completedAt: now },
      });
      issued.push(p.id);
    }

    return reply.send({
      success: true,
      data: { issued: issued.length },
      message: `${issued.length} certificate(s) issued.`,
    });
  });

  // GET /certificates/:participationId — get cert info for a participation (participant or organizer)
  app.get('/:participationId', async (request, reply) => {
    const { participationId } = z.object({ participationId: z.string() }).parse(request.params);

    const cert = await app.prisma.certificate.findUnique({
      where: { participationId },
      include: {
        participation: {
          select: {
            userId: true,
            event: {
              select: { id: true, title: true, startDate: true, endDate: true, venue: true, deliveryMode: true },
            },
          },
        },
      },
    });

    if (!cert) throw new NotFoundError('Certificate not found');

    const isOwner  = cert.participation.userId === request.user.sub;
    const isStaff  = ['EVENT_ORGANIZER', 'PROGRAM_MANAGER', 'SYSTEM_ADMIN', 'SUPER_ADMIN'].includes(request.user.role);
    if (!isOwner && !isStaff) throw new ForbiddenError('Access denied.');

    return reply.send({ success: true, data: cert });
  });

  // GET /certificates/:participationId/pdf — download certificate as PDF
  app.get('/:participationId/pdf', async (request, reply) => {
    const { participationId } = z.object({ participationId: z.string() }).parse(request.params);

    const cert = await app.prisma.certificate.findUnique({
      where: { participationId },
      include: {
        participation: {
          select: {
            userId: true,
            event: {
              select: { title: true, startDate: true, endDate: true, venue: true },
            },
          },
        },
      },
    });

    if (!cert) throw new NotFoundError('Certificate not found');
    if (cert.status === 'REVOKED') throw new BadRequestError('This certificate has been revoked.', ErrorCode.VALIDATION_ERROR);

    const isOwner = cert.participation.userId === request.user.sub;
    const isStaff = ['EVENT_ORGANIZER', 'PROGRAM_MANAGER', 'SYSTEM_ADMIN', 'SUPER_ADMIN'].includes(request.user.role);
    if (!isOwner && !isStaff) throw new ForbiddenError('Access denied.');

    // Resolve participant name from JWT payload
    const firstName = request.user.firstName ?? '';
    const lastName  = request.user.lastName  ?? '';
    const participantName = `${firstName} ${lastName}`.trim() || request.user.email;

    const event = cert.participation.event;
    const start = new Date(event.startDate);
    const end   = new Date(event.endDate);
    const dateFmt = (d: Date) => d.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' });
    const dateRange = start.toDateString() === end.toDateString()
      ? dateFmt(start)
      : `${dateFmt(start)} – ${dateFmt(end)}`;

    const issuedDate = cert.issuedAt
      ? new Date(cert.issuedAt).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })
      : dateFmt(new Date());

    // Generate PDF
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 60 });

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    await new Promise<void>((resolve, reject) => {
      doc.on('end', () => resolve());
      doc.on('error', reject);

      const W = doc.page.width;   // ~841 landscape
      const H = doc.page.height;  // ~595 landscape

      // Background border
      doc.rect(20, 20, W - 40, H - 40).lineWidth(4).strokeColor('#1a3a6c').stroke();
      doc.rect(28, 28, W - 56, H - 56).lineWidth(1.5).strokeColor('#b0c4de').stroke();

      // Republic of the Philippines header
      doc.fillColor('#1a3a6c').font('Helvetica').fontSize(9).text('Republic of the Philippines', 0, 50, { align: 'center' });
      doc.fontSize(12).font('Helvetica-Bold').text('Department of Trade and Industry', 0, 64, { align: 'center' });
      doc.fontSize(9).font('Helvetica').text('Regional Office VII – Central Visayas', 0, 80, { align: 'center' });

      // Horizontal rule
      doc.moveTo(70, 100).lineTo(W - 70, 100).strokeColor('#b0c4de').lineWidth(1).stroke();

      // Title
      doc.fillColor('#1a3a6c').font('Helvetica-Bold').fontSize(30)
        .text('CERTIFICATE OF COMPLETION', 0, 120, { align: 'center', characterSpacing: 2 });

      // Body text
      doc.fillColor('#444444').font('Helvetica').fontSize(12)
        .text('This is to certify that', 0, 180, { align: 'center' });

      // Participant name
      doc.fillColor('#111111').font('Helvetica-Bold').fontSize(24)
        .text(participantName, 0, 200, { align: 'center' });
      doc.moveTo(W / 2 - 160, 232).lineTo(W / 2 + 160, 232).strokeColor('#1a3a6c').lineWidth(1).stroke();

      // Event description
      doc.fillColor('#444444').font('Helvetica').fontSize(12)
        .text('has successfully completed the', 0, 246, { align: 'center' });

      doc.fillColor('#1a3a6c').font('Helvetica-Bold').fontSize(16)
        .text(event.title, 70, 268, { align: 'center', width: W - 140 });

      const afterTitle = 268 + Math.ceil(event.title.length / 60) * 22;

      if (event.venue) {
        doc.fillColor('#666666').font('Helvetica').fontSize(11)
          .text(event.venue, 0, afterTitle + 6, { align: 'center' });
      }

      doc.fillColor('#555555').font('Helvetica').fontSize(11)
        .text(dateRange, 0, afterTitle + (event.venue ? 22 : 8), { align: 'center' });

      // Footer: signature + verification code
      const footerY = H - 110;
      doc.moveTo(70, footerY).lineTo(W - 70, footerY).strokeColor('#b0c4de').lineWidth(1).stroke();

      // Left: Signature line
      doc.fillColor('#111111').font('Helvetica').fontSize(10);
      doc.moveTo(80, footerY + 40).lineTo(250, footerY + 40).strokeColor('#555555').lineWidth(0.5).stroke();
      doc.text('Regional Director, DTI Region VII', 80, footerY + 44, { width: 170, align: 'center' });

      // Right: verification code + issued date
      doc.fillColor('#555555').font('Helvetica').fontSize(9)
        .text('Verification Code', W - 260, footerY + 20, { width: 200, align: 'right' });
      doc.fillColor('#111111').font('Helvetica-Bold').fontSize(11)
        .text(cert.verificationCode, W - 260, footerY + 33, { width: 200, align: 'right', characterSpacing: 2 });
      doc.fillColor('#888888').font('Helvetica').fontSize(9)
        .text(`Issued: ${issuedDate}`, W - 260, footerY + 52, { width: 200, align: 'right' });
      doc.fillColor('#aaaaaa').font('Helvetica').fontSize(8)
        .text(`Verify at: ${process.env['FRONTEND_URL'] ?? 'https://ems.dti7.gov.ph'}/verify/${cert.verificationCode}`, W - 260, footerY + 66, { width: 200, align: 'right' });

      doc.end();
    });

    const pdfBuffer = Buffer.concat(chunks);
    const safeTitle = event.title.replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '_').substring(0, 50);

    return reply
      .header('Content-Type', 'application/pdf')
      .header('Content-Disposition', `attachment; filename="DTI-Certificate_${safeTitle}.pdf"`)
      .header('Content-Length', String(pdfBuffer.length))
      .send(pdfBuffer);
  });

  // PATCH /certificates/:participationId/revoke — admin revoke
  app.patch('/:participationId/revoke', async (request, reply) => {
    if (!['SYSTEM_ADMIN', 'SUPER_ADMIN'].includes(request.user.role)) {
      throw new ForbiddenError('Only administrators can revoke certificates.');
    }

    const { participationId } = z.object({ participationId: z.string() }).parse(request.params);

    const cert = await app.prisma.certificate.findUnique({ where: { participationId } });
    if (!cert) throw new NotFoundError('Certificate not found');

    const updated = await app.prisma.certificate.update({
      where: { participationId },
      data: { status: 'REVOKED' },
    });

    return reply.send({ success: true, data: updated, message: 'Certificate revoked.' });
  });
};
