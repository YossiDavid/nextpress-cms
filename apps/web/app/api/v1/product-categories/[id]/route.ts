import { NextRequest } from 'next/server';
import { prisma } from '@nextpress/db';
import { authenticateRequest, successResponse, errorResponse, withErrorHandling } from '@/lib/api-auth';

interface Params { params: Promise<{ id: string }> }

export const PUT = withErrorHandling(async (req: NextRequest, { params }: Params) => {
  const authenticated = await authenticateRequest(req);
  if (!authenticated) return errorResponse('UNAUTHORIZED', 'Authentication required', 401);

  const { id } = await params;
  const body = await req.json() as { name?: string; slug?: string; description?: string };

  const category = await prisma.productCategory.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.slug !== undefined ? { slug: body.slug } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
    },
  });
  return successResponse(category);
});

export const DELETE = withErrorHandling(async (req: NextRequest, { params }: Params) => {
  const authenticated = await authenticateRequest(req);
  if (!authenticated) return errorResponse('UNAUTHORIZED', 'Authentication required', 401);

  const { id } = await params;
  await prisma.productCategory.delete({ where: { id } });
  return successResponse({ deleted: true });
});
