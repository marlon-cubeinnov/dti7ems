import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

/**
 * Public Enterprise Directory — no authentication required.
 * Only exposes enterprises that have opted in via isPubliclyListed = true.
 */
export const directoryRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {

  // GET /directory/enterprises — public enterprise search (no auth)
  app.get('/enterprises', async (request, reply) => {
    const query = z.object({
      page:   z.coerce.number().min(1).default(1),
      limit:  z.coerce.number().min(1).max(50).default(12),
      search: z.string().optional(),
      sector: z.string().optional(),
      stage:  z.string().optional(),
      region: z.string().optional(),
    }).parse(request.query);

    const { page, limit, search, sector, stage, region } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      isPubliclyListed: true,
      isVerified: true,
    };

    if (sector) where['industrySector'] = { contains: sector, mode: 'insensitive' };
    if (stage)  where['stage'] = stage;
    if (region) where['region'] = { contains: region, mode: 'insensitive' };
    if (search) {
      where['OR'] = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { tradeName:    { contains: search, mode: 'insensitive' } },
        { industrySector: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, enterprises] = await Promise.all([
      app.prisma.enterpriseProfile.count({ where }),
      app.prisma.enterpriseProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { businessName: 'asc' },
        select: {
          id: true,
          businessName: true,
          tradeName: true,
          industrySector: true,
          industryTags: true,
          stage: true,
          employeeCount: true,
          region: true,
          province: true,
          cityMunicipality: true,
          createdAt: true,
        },
      }),
    ]);

    return reply.send({
      success: true,
      data: enterprises,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  });

  // GET /directory/sectors — list all distinct sectors for filtering
  app.get('/sectors', async (_request, reply) => {
    const sectors = await app.prisma.enterpriseProfile.groupBy({
      by: ['industrySector'],
      where: { isPubliclyListed: true, isVerified: true },
      _count: true,
      orderBy: { _count: { industrySector: 'desc' } },
    });

    return reply.send({
      success: true,
      data: sectors
        .filter(s => s.industrySector)
        .map(s => ({ sector: s.industrySector, count: s._count })),
    });
  });

  // GET /directory/stats — public directory summary stats
  app.get('/stats', async (_request, reply) => {
    const [totalListed, stageCounts, regionCounts] = await Promise.all([
      app.prisma.enterpriseProfile.count({ where: { isPubliclyListed: true, isVerified: true } }),
      app.prisma.enterpriseProfile.groupBy({
        by: ['stage'],
        where: { isPubliclyListed: true, isVerified: true },
        _count: true,
      }),
      app.prisma.enterpriseProfile.groupBy({
        by: ['region'],
        where: { isPubliclyListed: true, isVerified: true, region: { not: null } },
        _count: true,
        orderBy: { _count: { region: 'desc' } },
      }),
    ]);

    return reply.send({
      success: true,
      data: {
        totalListed,
        byStage: Object.fromEntries(stageCounts.map(s => [s.stage, s._count])),
        byRegion: regionCounts.map(r => ({ region: r.region, count: r._count })),
      },
    });
  });
};
