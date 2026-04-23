import { NextRequest } from 'next/server';
import { prisma } from '@nextpress/db';
import { authenticateRequest, successResponse, errorResponse, withErrorHandling } from '@/lib/api-auth';

interface Params { params: Promise<{ id: string }> }

export const PUT = withErrorHandling(async (req: NextRequest, { params }: Params) => {
  const authenticated = await authenticateRequest(req);
  if (!authenticated) return errorResponse('UNAUTHORIZED', 'Authentication required', 401);

  const { id } = await params;
  const body = await req.json() as { tagIds: string[] };

  await prisma.post.update({
    where: { id },
    data: {
      tags: {
        set: body.tagIds.map((tid) => ({ id: tid })),
      },
    },
  });
  return successResponse({ updated: true });
});
