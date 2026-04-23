import { NextRequest } from 'next/server';
import { prisma } from '@nextpress/db';
import { authenticateRequest, successResponse, errorResponse, withErrorHandling } from '@/lib/api-auth';

interface Params { params: Promise<{ id: string }> }

export const GET = withErrorHandling(async (req: NextRequest, { params }: Params) => {
  const authenticated = await authenticateRequest(req);
  if (!authenticated) return errorResponse('UNAUTHORIZED', 'Authentication required', 401);

  const { id } = await params;
  const menu = await prisma.menu.findUnique({
    where: { id },
    include: { items: { orderBy: { order: 'asc' } } },
  });
  if (!menu) return errorResponse('NOT_FOUND', 'Menu not found', 404);
  return successResponse(menu);
});

export const PUT = withErrorHandling(async (req: NextRequest, { params }: Params) => {
  const authenticated = await authenticateRequest(req);
  if (!authenticated) return errorResponse('UNAUTHORIZED', 'Authentication required', 401);

  const { id } = await params;
  const body = await req.json() as {
    name?: string;
    items?: { label: string; url: string; order: number; parentId?: string }[];
  };

  const menu = await prisma.menu.update({
    where: { id },
    data: {
      ...(body.name != null && { name: body.name }),
      ...(body.items != null && {
        items: {
          deleteMany: {},
          create: body.items.map((item) => ({
            label: item.label,
            url: item.url,
            order: item.order,
            parentId: item.parentId,
          })),
        },
      }),
    },
    include: { items: { orderBy: { order: 'asc' } } },
  });
  return successResponse(menu);
});

export const DELETE = withErrorHandling(async (req: NextRequest, { params }: Params) => {
  const authenticated = await authenticateRequest(req);
  if (!authenticated) return errorResponse('UNAUTHORIZED', 'Authentication required', 401);

  const { id } = await params;
  await prisma.menu.delete({ where: { id } });
  return successResponse({ id });
});
