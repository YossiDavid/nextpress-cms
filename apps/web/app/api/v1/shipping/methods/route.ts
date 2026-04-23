import { NextRequest } from 'next/server';
import { prisma } from '@nextpress/db';
import { authenticateRequest, successResponse, errorResponse, withErrorHandling } from '@/lib/api-auth';

export const GET = withErrorHandling(async (req: NextRequest) => {
  const authenticated = await authenticateRequest(req);
  if (!authenticated) return errorResponse('UNAUTHORIZED', 'Authentication required', 401);

  const methods = await prisma.shippingMethod.findMany({ orderBy: { name: 'asc' } });
  return successResponse(methods);
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const authenticated = await authenticateRequest(req);
  if (!authenticated) return errorResponse('UNAUTHORIZED', 'Authentication required', 401);

  const body = await req.json() as { name: string; cost: number; freeAbove?: number; isActive?: boolean };
  if (!body.name || body.cost == null) {
    return errorResponse('VALIDATION', 'name and cost are required');
  }

  const method = await prisma.shippingMethod.create({
    data: {
      name: body.name,
      cost: body.cost,
      freeAbove: body.freeAbove,
      isActive: body.isActive ?? true,
    },
  });
  return successResponse(method);
});
