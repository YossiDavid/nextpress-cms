import { NextRequest } from 'next/server';
import { prisma } from '@nextpress/db';
import { authenticateRequest, successResponse, errorResponse, withErrorHandling } from '@/lib/api-auth';

interface Params { params: Promise<{ id: string }> }

export const PUT = withErrorHandling(async (req: NextRequest, { params }: Params) => {
  const authenticated = await authenticateRequest(req);
  if (!authenticated) return errorResponse('UNAUTHORIZED', 'Authentication required', 401);

  const { id } = await params;
  const body = await req.json() as Record<string, unknown>;

  const method = await prisma.shippingMethod.update({
    where: { id },
    data: {
      ...(body.name != null && { name: body.name as string }),
      ...(body.cost != null && { cost: body.cost as number }),
      ...(body.freeAbove != null && { freeAbove: body.freeAbove as number }),
      ...(body.isActive != null && { isActive: body.isActive as boolean }),
    },
  });
  return successResponse(method);
});

export const DELETE = withErrorHandling(async (req: NextRequest, { params }: Params) => {
  const authenticated = await authenticateRequest(req);
  if (!authenticated) return errorResponse('UNAUTHORIZED', 'Authentication required', 401);

  const { id } = await params;
  await prisma.shippingMethod.delete({ where: { id } });
  return successResponse({ id });
});
