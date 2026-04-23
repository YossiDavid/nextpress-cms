import { NextRequest } from 'next/server';
import { prisma } from '@nextpress/db';
import { authenticateRequest, successResponse, errorResponse, withErrorHandling } from '@/lib/api-auth';

interface Params { params: Promise<{ id: string; varId: string }> }

export const PUT = withErrorHandling(async (req: NextRequest, { params }: Params) => {
  const authenticated = await authenticateRequest(req);
  if (!authenticated) return errorResponse('UNAUTHORIZED', 'Authentication required', 401);

  const { varId } = await params;
  const body = await req.json() as {
    name?: string;
    sku?: string;
    price?: number;
    stock?: number;
    options?: Record<string, string>;
  };

  const variation = await prisma.productVariation.update({
    where: { id: varId },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.sku !== undefined ? { sku: body.sku } : {}),
      ...(body.price !== undefined ? { price: body.price } : {}),
      ...(body.stock !== undefined ? { stock: body.stock } : {}),
      ...(body.options !== undefined ? { options: body.options } : {}),
    },
  });
  return successResponse(variation);
});

export const DELETE = withErrorHandling(async (req: NextRequest, { params }: Params) => {
  const authenticated = await authenticateRequest(req);
  if (!authenticated) return errorResponse('UNAUTHORIZED', 'Authentication required', 401);

  const { varId } = await params;
  await prisma.productVariation.delete({ where: { id: varId } });
  return successResponse({ deleted: true });
});
