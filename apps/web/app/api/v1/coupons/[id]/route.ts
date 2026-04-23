import { NextRequest } from 'next/server';
import { prisma } from '@nextpress/db';
import { authenticateRequest, successResponse, errorResponse, withErrorHandling } from '@/lib/api-auth';

interface Params { params: Promise<{ id: string }> }

export const GET = withErrorHandling(async (req: NextRequest, { params }: Params) => {
  const authenticated = await authenticateRequest(req);
  if (!authenticated) return errorResponse('UNAUTHORIZED', 'Authentication required', 401);

  const { id } = await params;
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) return errorResponse('NOT_FOUND', 'Coupon not found', 404);
  return successResponse(coupon);
});

export const PUT = withErrorHandling(async (req: NextRequest, { params }: Params) => {
  const authenticated = await authenticateRequest(req);
  if (!authenticated) return errorResponse('UNAUTHORIZED', 'Authentication required', 401);

  const { id } = await params;
  const body = await req.json() as Record<string, unknown>;

  const coupon = await prisma.coupon.update({
    where: { id },
    data: {
      ...(body.code != null && { code: (body.code as string).toUpperCase() }),
      ...(body.type != null && { type: body.type as 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING' }),
      ...(body.value != null && { value: body.value as number }),
      ...(body.isActive != null && { isActive: body.isActive as boolean }),
      ...(body.minOrderAmount != null && { minOrderAmount: body.minOrderAmount as number }),
      ...(body.maxUsage != null && { maxUsage: body.maxUsage as number }),
      ...(body.expiresAt != null && { expiresAt: new Date(body.expiresAt as string) }),
    },
  });
  return successResponse(coupon);
});

export const DELETE = withErrorHandling(async (req: NextRequest, { params }: Params) => {
  const authenticated = await authenticateRequest(req);
  if (!authenticated) return errorResponse('UNAUTHORIZED', 'Authentication required', 401);

  const { id } = await params;
  await prisma.coupon.delete({ where: { id } });
  return successResponse({ id });
});
