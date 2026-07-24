import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { ForbiddenError, NotFoundError, BadRequestError, ErrorCode } from '@dti-ems/shared-errors';
import { notifyCertificateIssued } from '../lib/notify.js';

const normalizeRole = (role: unknown): string =>
  String(role ?? '').trim().toUpperCase().replace(/[\s-]+/g, '_');

export const certificateRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  const isGovernmentParticipant = async (userId: string) => {
    const rows = await app.prisma.$queryRawUnsafe<Array<{ client_type: string | null; employment_category: string | null }>>(
      `SELECT client_type, employment_category
       FROM identity_schema.user_profiles
       WHERE id = $1
       LIMIT 1`,
      userId,
    );

    const profile = rows[0];
    if (!profile) return false;
    return profile.client_type === 'GOVERNMENT' || profile.employment_category === 'EMPLOYED_GOVT';
  };

  const toOrdinal = (n: number) => {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return `${n}st`;
    if (mod10 === 2 && mod100 !== 12) return `${n}nd`;
    if (mod10 === 3 && mod100 !== 13) return `${n}rd`;
    return `${n}th`;
  };

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
    const appearanceEligible = await isGovernmentParticipant(request.user.sub);

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

    return reply.send({
      success: true,
      data: certs.map(c => ({ ...c, appearanceEligible })),
    });
  });

  // POST /certificates/:participationId/issue — organizer marks certificate issued
  app.post('/:participationId/issue', async (request, reply) => {
    const role = normalizeRole(request.user.role);
    if (!['EVENT_ORGANIZER', 'PROGRAM_MANAGER', 'SYSTEM_ADMIN', 'SUPER_ADMIN', 'DTI_EMPLOYEE'].includes(role)) {
      throw new ForbiddenError('Only organizers can issue certificates.');
    }

    const { participationId } = z.object({ participationId: z.string() }).parse(request.params);

    const participation = await app.prisma.eventParticipation.findUnique({
      where: { id: participationId },
      select: { id: true, userId: true, eventId: true, status: true, participantName: true, participantEmail: true, event: { select: { title: true, assignedOrganizerId: true } } },
    });

    if (!participation) throw new NotFoundError('Participation not found');
    if (role === 'DTI_EMPLOYEE' && participation.event?.assignedOrganizerId !== request.user.sub) {
      throw new ForbiddenError('Only the assigned event lead can issue certificates for this event.');
    }

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

    const appearanceEligible = await isGovernmentParticipant(participation.userId);
    const message = appearanceEligible
      ? 'Attendance certificate issued. Participant is from government and may also download a Certificate of Appearance.'
      : 'Attendance certificate issued.';

    return reply.code(201).send({ success: true, data: cert, message });
  });

  // POST /certificates/bulk-issue/:eventId — issue all eligible certs for an event
  app.post('/bulk-issue/:eventId', async (request, reply) => {
    const role = normalizeRole(request.user.role);
    if (!['EVENT_ORGANIZER', 'PROGRAM_MANAGER', 'SYSTEM_ADMIN', 'SUPER_ADMIN', 'DTI_EMPLOYEE'].includes(role)) {
      throw new ForbiddenError('Only organizers can issue certificates.');
    }

    const { eventId } = z.object({ eventId: z.string() }).parse(request.params);

    if (role === 'DTI_EMPLOYEE') {
      const evCheck = await app.prisma.event.findUnique({ where: { id: eventId }, select: { assignedOrganizerId: true } });
      if (!evCheck || evCheck.assignedOrganizerId !== request.user.sub) {
        throw new ForbiddenError('Only the assigned event lead can issue certificates.');
      }
    }

    // Get all attended participants without an ISSUED/GENERATED certificate
    const eligible = await app.prisma.eventParticipation.findMany({
      where: {
        eventId,
        status: { in: ['ATTENDED', 'COMPLETED'] },
        OR: [
          { certificate: null },
          { certificate: { status: 'PENDING' } },
        ],
      },
      select: { id: true, userId: true, eventId: true },
    });

    const now = new Date();
    const issued: string[] = [];

    const govEligibleIds = new Set<string>();
    if (eligible.length > 0) {
      const userIds = eligible.map(p => p.userId);
      const placeholders = userIds.map((_, i) => `$${i + 1}`).join(',');
      const govRows = await app.prisma.$queryRawUnsafe<Array<{ id: string; client_type: string | null; employment_category: string | null }>>(
        `SELECT id, client_type, employment_category
         FROM identity_schema.user_profiles
         WHERE id IN (${placeholders})`,
        ...userIds,
      );
      govRows.forEach((r) => {
        if (r.client_type === 'GOVERNMENT' || r.employment_category === 'EMPLOYED_GOVT') {
          govEligibleIds.add(r.id);
        }
      });
    }

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

    const govEligibleCount = eligible.filter(p => govEligibleIds.has(p.userId)).length;

    return reply.send({
      success: true,
      data: { issued: issued.length, appearanceEligible: govEligibleCount },
      message: govEligibleCount > 0
        ? `${issued.length} attendance certificate(s) issued. ${govEligibleCount} government participant(s) can also download a Certificate of Appearance.`
        : `${issued.length} attendance certificate(s) issued.`,
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
              select: { id: true, title: true, startDate: true, endDate: true, venue: true, deliveryMode: true, assignedOrganizerId: true },
            },
          },
        },
      },
    });

    if (!cert) throw new NotFoundError('Certificate not found');

    const role = normalizeRole(request.user.role);
    const isOwner  = cert.participation.userId === request.user.sub;
    const isAdmin  = ['SYSTEM_ADMIN', 'SUPER_ADMIN'].includes(role);
    const isAssignedLead = cert.participation.event?.assignedOrganizerId === request.user.sub;
    if (!isOwner && !isAdmin && !isAssignedLead) throw new ForbiddenError('Access denied.');

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
            participantName: true,
            participantEmail: true,
            event: {
              select: { title: true, startDate: true, endDate: true, venue: true, deliveryMode: true, onlineLink: true, assignedOrganizerId: true },
            },
          },
        },
      },
    });

    if (!cert) throw new NotFoundError('Certificate not found');
    if (cert.status === 'REVOKED') throw new BadRequestError('This certificate has been revoked.', ErrorCode.VALIDATION_ERROR);

    const role = normalizeRole(request.user.role);
    const isOwner = cert.participation.userId === request.user.sub;
    const isAdmin = ['SYSTEM_ADMIN', 'SUPER_ADMIN'].includes(role);
    const isAssignedLead = cert.participation.event?.assignedOrganizerId === request.user.sub;
    if (!isOwner && !isAdmin && !isAssignedLead) throw new ForbiddenError('Access denied.');

    const participantName = cert.participation.participantName ?? cert.participation.participantEmail ?? 'Participant';

    const event = cert.participation.event;
    const start = new Date(event.startDate);
    const end   = new Date(event.endDate);
    const dateFmt = (d: Date) => d.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' });
    const eventDate = start.toDateString() === end.toDateString()
      ? dateFmt(start)
      : `${dateFmt(start)} – ${dateFmt(end)}`;

    const eventChannel = (() => {
      if (event.deliveryMode === 'ONLINE') {
        if ((event.onlineLink ?? '').toLowerCase().includes('zoom')) return 'via Zoom.';
        return 'via online platform.';
      }
      if (event.deliveryMode === 'HYBRID') {
        if (event.venue) return `via hybrid setup at ${event.venue}.`;
        return 'via hybrid setup.';
      }
      if (event.venue) return `at ${event.venue}.`;
      return '';
    })();

    // Generate PDF
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0, autoFirstPage: true });

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    await new Promise<void>((resolve, reject) => {
      doc.on('end', () => resolve());
      doc.on('error', reject);

      const W = doc.page.width;   // ~842
      const H = doc.page.height;  // ~595
      const C = W / 2;

      // ── Colors ────────────────────────────────────────────
      const navy      = '#1e3a8a';
      const blue      = '#1e40af';
      const lightBlue = '#bfdbfe';
      const medBlue   = '#3b82f6';
      const dark      = '#111827';
      const gray      = '#6b7280';
      const lightGray = '#9ca3af';
      const darkGray  = '#4b5563';
      const charcoal  = '#374151';

      // ── Outer double border ────────────────────────────────
      doc.rect(20, 20, W - 40, H - 40).lineWidth(1.5).strokeColor(navy).stroke();
      doc.rect(25, 25, W - 50, H - 50).lineWidth(0.75).strokeColor(navy).stroke();
      // Inner accent line
      doc.rect(35, 35, W - 70, H - 70).lineWidth(0.5).strokeColor(lightBlue).stroke();

      // ── Header: logo + DTI text ────────────────────────────
      const logoPath = path.join(process.cwd(), '..', '..', 'apps', 'web-public', 'src', 'assets', 'dti-bp-logo.png');
      const headerY  = 48;
      const textX    = C - 60;

      try {
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, C - 140, headerY, { fit: [52, 52] });
        }
      } catch { /* skip logo if unavailable */ }

      doc.fillColor(navy).font('Helvetica-Bold').fontSize(6.5)
        .text('REPUBLIC OF THE PHILIPPINES', textX, headerY + 2, { characterSpacing: 1 });
      doc.fillColor(navy).font('Helvetica-Bold').fontSize(11)
        .text('Department of Trade and Industry', textX, headerY + 16);
      doc.fillColor(blue).font('Helvetica').fontSize(8)
        .text('Regional Office VII \u2013 Central Visayas', textX, headerY + 31);

      // ── Title bar ─────────────────────────────────────────
      const titleTop = 113;
      const titleBot = 153;
      doc.moveTo(50, titleTop).lineTo(W - 50, titleTop).lineWidth(0.5).strokeColor(lightBlue).stroke();
      doc.moveTo(50, titleBot).lineTo(W - 50, titleBot).lineWidth(0.5).strokeColor(lightBlue).stroke();
      doc.fillColor(navy).font('Helvetica-Bold').fontSize(26)
        .text('CERTIFICATE OF ATTENDANCE', 50, titleTop + 7, { width: W - 100, align: 'center', characterSpacing: 2.5 });

      // ── Body ──────────────────────────────────────────────
      let y = 165;

      doc.fillColor(gray).font('Helvetica-Oblique').fontSize(11)
        .text('This is to certify that', 50, y, { width: W - 100, align: 'center' });
      y += 22;

      // Recipient name
      doc.fillColor(dark).font('Helvetica-Bold').fontSize(28)
        .text(participantName, 100, y, { width: W - 200, align: 'center' });
      const nameLineCount = Math.ceil(doc.widthOfString(participantName, { width: W - 200 }) / (W - 200)) || 1;
      const nameBlockH = 34 * nameLineCount;
      const underlineY = y + nameBlockH;
      doc.moveTo(C - 180, underlineY).lineTo(C + 180, underlineY)
        .lineWidth(1.5).strokeColor(medBlue).stroke();
      y = underlineY + 14;

      doc.fillColor(gray).font('Helvetica').fontSize(10.5)
        .text('has successfully attended the', 50, y, { width: W - 100, align: 'center' });
      y += 20;

      doc.fillColor(blue).font('Helvetica-Bold').fontSize(15)
        .text(event.title, 100, y, { width: W - 200, align: 'center' });
      // Advance y past event title (may wrap)
      y = doc.y + 8;

      if (event.venue) {
        doc.fillColor(lightGray).font('Helvetica').fontSize(9)
          .text(event.venue, 100, y, { width: W - 200, align: 'center' });
        y = doc.y + 4;
      }
      doc.fillColor(lightGray).font('Helvetica').fontSize(9)
        .text(eventDate, 100, y, { width: W - 200, align: 'center' });

      // ── Footer ────────────────────────────────────────────
      const sigLineY   = H - 72;
      const sigTextY   = H - 68;
      const sigX       = 60;
      const sigW       = 115;

      doc.moveTo(sigX, sigLineY).lineTo(sigX + sigW, sigLineY)
        .lineWidth(0.5).strokeColor(lightGray).stroke();
      doc.fillColor(charcoal).font('Helvetica-Bold').fontSize(8.5)
        .text('Regional Director', sigX, sigTextY, { width: sigW, align: 'center' });
      doc.fillColor(gray).font('Helvetica').fontSize(7.5)
        .text('DTI Region VII', sigX, sigTextY + 13, { width: sigW, align: 'center' });

      const verifyW = 250;
      const verifyX = W - 55 - verifyW;
      doc.fillColor(lightGray).font('Helvetica').fontSize(6.5)
        .text('VERIFICATION CODE', verifyX, sigLineY - 12, { width: verifyW, align: 'right', characterSpacing: 0.8 });
      doc.fillColor(darkGray).font('Courier-Bold').fontSize(8.5)
        .text(cert.verificationCode, verifyX, sigTextY, { width: verifyW, align: 'right', characterSpacing: 2 });
      if (cert.issuedAt) {
        const issuedDateStr = new Date(cert.issuedAt).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' });
        doc.fillColor(lightGray).font('Helvetica').fontSize(6.5)
          .text(`Issued: ${issuedDateStr}`, verifyX, sigTextY + 13, { width: verifyW, align: 'right' });
      }

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

  // GET /certificates/:participationId/appearance/pdf — government-only certificate of appearance
  app.get('/:participationId/appearance/pdf', async (request, reply) => {
    const { participationId } = z.object({ participationId: z.string() }).parse(request.params);

    const cert = await app.prisma.certificate.findUnique({
      where: { participationId },
      include: {
        participation: {
          select: {
            userId: true,
            participantName: true,
            participantEmail: true,
            enterpriseName: true,
            event: {
              select: { title: true, startDate: true, endDate: true, venue: true, assignedOrganizerId: true },
            },
          },
        },
      },
    });

    if (!cert) throw new NotFoundError('Certificate not found');
    if (cert.status === 'REVOKED') throw new BadRequestError('This certificate has been revoked.', ErrorCode.VALIDATION_ERROR);

    const role = normalizeRole(request.user.role);
    const isOwner = cert.participation.userId === request.user.sub;
    const isAdmin = ['SYSTEM_ADMIN', 'SUPER_ADMIN'].includes(role);
    const isAssignedLead = cert.participation.event?.assignedOrganizerId === request.user.sub;
    if (!isOwner && !isAdmin && !isAssignedLead) throw new ForbiddenError('Access denied.');

    const appearanceEligible = await isGovernmentParticipant(cert.participation.userId);
    if (!appearanceEligible) {
      throw new BadRequestError('Certificate of Appearance is only available to government attendees.', ErrorCode.VALIDATION_ERROR);
    }

    const participantName = cert.participation.participantName ?? cert.participation.participantEmail ?? 'Participant';
    const officeName = cert.participation.enterpriseName ?? 'Government Agency';

    const event = cert.participation.event;
    const start = new Date(event.startDate);
    const end   = new Date(event.endDate);
    const dateFmt = (d: Date) => d.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' });
    const dateRange = start.toDateString() === end.toDateString()
      ? dateFmt(start)
      : `${dateFmt(start)} – ${dateFmt(end)}`;

    const dailyRows: Date[] = [];
    const rowCursor = new Date(start);
    while (rowCursor <= end && dailyRows.length < 4) {
      dailyRows.push(new Date(rowCursor));
      rowCursor.setDate(rowCursor.getDate() + 1);
    }
    if (dailyRows.length === 0) dailyRows.push(start);

    const issueDateObj = cert.issuedAt ? new Date(cert.issuedAt) : new Date();
    const issueLine = `This certificate is issued this ${toOrdinal(issueDateObj.getDate())} day of ${issueDateObj.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}, Cebu City, Philippines.`;

    const chunks: Buffer[] = [];
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 60 });
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    await new Promise<void>((resolve, reject) => {
      doc.on('end', () => resolve());
      doc.on('error', reject);

      const W = doc.page.width;
      const H = doc.page.height;

      doc.rect(24, 24, W - 48, H - 48).lineWidth(1).strokeColor('#111111').stroke();

      doc.rect(24, 24, W - 48, 88).lineWidth(1).strokeColor('#111111').stroke();
      doc.moveTo(250, 24).lineTo(250, 112).strokeColor('#111111').lineWidth(1).stroke();
      doc.moveTo(W - 180, 24).lineTo(W - 180, 112).strokeColor('#111111').lineWidth(1).stroke();

      doc.fillColor('#1a1a1a').font('Helvetica-Bold').fontSize(26).text('dti', 66, 54, { width: 80 });
      doc.fontSize(14).text('BAGONG PILIPINAS', 124, 79, { width: 120 });

      doc.fillColor('#111111').font('Helvetica').fontSize(16)
        .text('Republic of the Philippines', 0, 48, { align: 'center' });
      doc.font('Helvetica-Bold').fontSize(36 / 2)
        .text('DEPARTMENT OF TRADE AND INDUSTRY', 0, 68, { align: 'center' });
      doc.font('Helvetica').fontSize(17)
        .text('Region 7 – Central Visayas', 0, 90, { align: 'center' });

      doc.fillColor('#111111').font('Helvetica-Bold').fontSize(38 / 2)
        .text('CERTIFICATE OF APPEARANCE', 0, 130, { align: 'center' });

      doc.font('Helvetica').fontSize(13.5)
        .text('This is to certify that the staff/official whose name appeared below appeared before this Office on the date and purpose stated herein:', 34, 178, { width: W - 68, align: 'left' });

      const labelX = 68;
      const valueX = 220;
      const lineRight = W - 78;
      const fieldTop = 236;
      const rowGap = 24;

      doc.font('Helvetica-Bold').fontSize(16 / 1.2)
        .text('NAME', labelX, fieldTop)
        .text('OFFICE', labelX, fieldTop + rowGap)
        .text('PURPOSE', labelX, fieldTop + rowGap * 2)
        .text('DATE', labelX, fieldTop + rowGap * 5);

      doc.font('Helvetica').fontSize(12)
        .text(participantName, valueX, fieldTop - 1, { width: lineRight - valueX - 5 })
        .text(officeName, valueX, fieldTop + rowGap - 1, { width: lineRight - valueX - 5 })
        .text(event.title, valueX, fieldTop + rowGap * 2 - 1, { width: lineRight - valueX - 5 })
        .text(dateRange, valueX, fieldTop + rowGap * 5 - 1, { width: lineRight - valueX - 5 });

      doc.moveTo(valueX, fieldTop + 14).lineTo(lineRight, fieldTop + 14).strokeColor('#222222').lineWidth(0.8).stroke();
      doc.moveTo(valueX, fieldTop + rowGap + 14).lineTo(lineRight, fieldTop + rowGap + 14).strokeColor('#222222').lineWidth(0.8).stroke();
      doc.moveTo(valueX, fieldTop + rowGap * 2 + 14).lineTo(lineRight, fieldTop + rowGap * 2 + 14).strokeColor('#222222').lineWidth(0.8).stroke();
      doc.moveTo(valueX, fieldTop + rowGap * 3 + 14).lineTo(lineRight, fieldTop + rowGap * 3 + 14).strokeColor('#222222').lineWidth(0.8).stroke();
      doc.moveTo(valueX, fieldTop + rowGap * 4 + 14).lineTo(lineRight, fieldTop + rowGap * 4 + 14).strokeColor('#222222').lineWidth(0.8).stroke();
      doc.moveTo(valueX, fieldTop + rowGap * 5 + 14).lineTo(lineRight, fieldTop + rowGap * 5 + 14).strokeColor('#222222').lineWidth(0.8).stroke();

      doc.font('Helvetica').fontSize(13.5)
        .text('Further, this is to certify that we have provided the following during his / her participation to the aforementioned activity:', 34, 370, { width: W - 68, align: 'left' });

      const tableX = 54;
      const tableY = 406;
      const tableW = W - 108;
      const colXs = [tableX, tableX + tableW * 0.29, tableX + tableW * 0.46, tableX + tableW * 0.63, tableX + tableW * 0.80, tableX + tableW];
      const rowH = 22;

      doc.rect(tableX, tableY, tableW, rowH).lineWidth(0.8).strokeColor('#222222').stroke();
      for (let i = 1; i < colXs.length - 1; i++) {
        doc.moveTo(colXs[i], tableY).lineTo(colXs[i], tableY + rowH).strokeColor('#222222').lineWidth(0.8).stroke();
      }

      doc.font('Helvetica-Bold').fontSize(10.5)
        .text('Inclusive Dates', colXs[0] + 8, tableY + 6)
        .text('Breakfast', colXs[1] + 30, tableY + 6)
        .text('Lunch', colXs[2] + 30, tableY + 6)
        .text('Dinner', colXs[3] + 32, tableY + 6)
        .text('Accommodation', colXs[4] + 18, tableY + 6);

      dailyRows.slice(0, 2).forEach((d, idx) => {
        const y = tableY + rowH * (idx + 1);
        doc.rect(tableX, y, tableW, rowH).lineWidth(0.7).strokeColor('#222222').stroke();
        for (let i = 1; i < colXs.length - 1; i++) {
          doc.moveTo(colXs[i], y).lineTo(colXs[i], y + rowH).strokeColor('#222222').lineWidth(0.7).stroke();
        }

        const dTxt = d.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' });
        doc.font('Helvetica').fontSize(10.5)
          .text(dTxt, colXs[0] + 8, y + 6)
          .text('☐', colXs[1] + 58, y + 5)
          .text('☐', colXs[2] + 52, y + 5)
          .text('☐', colXs[3] + 52, y + 5)
          .text('☐', colXs[4] + 68, y + 5);
      });

      doc.font('Helvetica').fontSize(16 / 1.2)
        .text(issueLine, 34, 472, { width: W - 68, align: 'left' });

      doc.font('Helvetica-Bold').fontSize(18 / 1.2)
        .text('ESPERANZA T. L. MELGAR', 0, H - 86, { align: 'center' });
      doc.font('Helvetica').fontSize(17 / 1.2)
        .text('Acting Regional Director', 0, H - 66, { align: 'center' });

      doc.font('Helvetica').fontSize(8).fillColor('#666666')
        .text(`Based on attendance record verification code: ${cert.verificationCode}`, 34, H - 24, { width: W - 68, align: 'left' });

      doc.end();
    });

    const pdfBuffer = Buffer.concat(chunks);
    const safeTitle = event.title.replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '_').substring(0, 50);

    return reply
      .header('Content-Type', 'application/pdf')
      .header('Content-Disposition', `attachment; filename="DTI-Certificate_Appearance_${safeTitle}.pdf"`)
      .header('Content-Length', String(pdfBuffer.length))
      .send(pdfBuffer);
  });

  // PATCH /certificates/:participationId/revoke — admin revoke
  app.patch('/:participationId/revoke', async (request, reply) => {
    if (!['SYSTEM_ADMIN', 'SUPER_ADMIN'].includes(normalizeRole(request.user.role))) {
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
