import { NextRequest } from 'next/server';
import { prisma } from '@nextpress/db';
import { authenticateRequest, successResponse, errorResponse, withErrorHandling } from '@/lib/api-auth';

interface Params { params: Promise<{ id: string }> }

export const GET = withErrorHandling(async (req: NextRequest, { params }: Params) => {
  const authenticated = await authenticateRequest(req);
  if (!authenticated) return errorResponse('UNAUTHORIZED', 'Authentication required', 401);

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
  });
  if (!user) return errorResponse('NOT_FOUND', 'User not found', 404);
  return successResponse(user);
});

export const PUT = withErrorHandling(async (req: NextRequest, { params }: Params) => {
  const authenticated = await authenticateRequest(req);
  if (!authenticated) return errorResponse('UNAUTHORIZED', 'Authentication required', 401);

  const { id } = await params;
  const body = await req.json() as { name?: string; role?: string };

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(body.name != null && { name: body.name }),
      ...(body.role != null && { role: body.role as 'ADMIN' | 'EDITOR' | 'VIEWER' }),
    },
    select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
  });
  return successResponse(user);
});

export const DELETE = withErrorHandling(async (req: NextRequest, { params }: Params) => {
  const authenticated = await authenticateRequest(req);
  if (!authenticated) return errorResponse('UNAUTHORIZED', 'Authentication required', 401);

  const { id } = await params;
  await prisma.user.delete({ where: { id } });
  return successResponse({ id });
});
