import { NextRequest } from 'next/server';
import { prisma } from '@nextpress/db';
import { authenticateRequest, successResponse, errorResponse, withErrorHandling } from '@/lib/api-auth';
import { hooks } from '@nextpress/core';

interface Params {
  params: Promise<{ id: string }>;
}

export const PUT = withErrorHandling(async (req: NextRequest, { params }: Params) => {
  const authenticated = await authenticateRequest(req);
  if (!authenticated) return errorResponse('UNAUTHORIZED', 'Authentication required', 401);

  const { id } = await params;
  const body = await req.json() as { status: string };

  const order = await prisma.order.update({
    where: { id },
    data: { status: body.status as 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED' | 'FAILED' },
  });

  await hooks.doAction('order.statusChanged', order);
  if (order.status === 'COMPLETED') await hooks.doAction('order.completed', order);
  if (order.status === 'REFUNDED') await hooks.doAction('order.refunded', order);

  return successResponse(order);
});
