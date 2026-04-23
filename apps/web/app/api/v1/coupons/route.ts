import { NextRequest } from 'next/server';
import { prisma } from '@nextpress/db';
import { authenticateRequest, successResponse, errorResponse, withErrorHandling } from '@/lib/api-auth';

export const GET = withErrorHandling(async (req: NextRequest) => {
  const authenticated = await authenticateRequest(req);
  if (!authenticated) return errorResponse('UNAUTHORIZED', 'Authentication required', 401);

  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  return successResponse(coupons);
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const authenticated = await authenticateRequest(req);
  if (!authenticated) return errorResponse('UNAUTHORIZED', 'Authentication required', 401);

  const body = await req.json() as {
    code: string; type: string; value: number;
    minOrderAmount?: number; maxUsage?: number; expiresAt?: string;
  };

  if (!body.code || !body.type || body.value == null) {
    return errorResponse('VALIDATION', 'code, type, and value are required');
  }

  const coupon = await prisma.coupon.create({
    data: {
      code: body.code.toUpperCase(),
      type: body.type as 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING',
      value: body.value,
      minOrderAmount: body.minOrderAmount,
      maxUsage: body.maxUsage,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
    },
  });
  return successResponse(coupon);
});
