import { NextRequest } from 'next/server';
import { prisma } from '@nextpress/db';
import { authenticateRequest, successResponse, errorResponse, withErrorHandling } from '@/lib/api-auth';

export const GET = withErrorHandling(async (req: NextRequest) => {
  const authenticated = await authenticateRequest(req);
  if (!authenticated) return errorResponse('UNAUTHORIZED', 'Authentication required', 401);

  const menus = await prisma.menu.findMany({
    include: { items: { orderBy: { order: 'asc' } } },
    orderBy: { createdAt: 'asc' },
  });
  return successResponse(menus);
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const authenticated = await authenticateRequest(req);
  if (!authenticated) return errorResponse('UNAUTHORIZED', 'Authentication required', 401);

  const body = await req.json() as { name: string; slug: string };
  if (!body.name || !body.slug) return errorResponse('VALIDATION', 'name and slug are required');

  const menu = await prisma.menu.create({
    data: { name: body.name, slug: body.slug },
    include: { items: true },
  });
  return successResponse(menu);
});
