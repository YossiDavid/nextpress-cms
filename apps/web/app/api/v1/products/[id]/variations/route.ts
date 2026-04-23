import { NextRequest } from 'next/server';
import { prisma } from '@nextpress/db';
import { authenticateRequest, successResponse, errorResponse, withErrorHandling } from '@/lib/api-auth';

interface Params { params: Promise<{ id: string }> }

export const GET = withErrorHandling(async (req: NextRequest, { params }: Params) => {
  const authenticated = await authenticateRequest(req);
  if (!authenticated) return errorResponse('UNAUTHORIZED', 'Authentication required', 401);

  const { id } = await params;
  const variations = await prisma.productVariation.findMany({
    where: { productId: id },
    orderBy: { createdAt: 'asc' },
  });
  return successResponse(variations);
});

export const POST = withErrorHandling(async (req: NextRequest, { params }: Params) => {
  const authenticated = await authenticateRequest(req);
  if (!authenticated) return errorResponse('UNAUTHORIZED', 'Authentication required', 401);

  const { id } = await params;
  const body = await req.json() as {
    name: string;
    sku?: string;
    price: number;
    stock?: number;
    options?: Record<string, string>;
  };

  if (!body.name || body.price === undefined) {
    return errorResponse('VALIDATION', 'name and price are required');
  }

  const variation = await prisma.productVariation.create({
    data: {
      productId: id,
      name: body.name,
      sku: body.sku,
      price: body.price,
      stock: body.stock,
      options: body.options ?? {},
    },
  });
  return successResponse(variation);
});
