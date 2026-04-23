import { NextRequest } from 'next/server';
import { prisma } from '@nextpress/db';
import { authenticateRequest, successResponse, errorResponse, withErrorHandling } from '@/lib/api-auth';

export const GET = withErrorHandling(async (req: NextRequest) => {
  const authenticated = await authenticateRequest(req);
  if (!authenticated) return errorResponse('UNAUTHORIZED', 'Authentication required', 401);

  const tags = await prisma.productTag.findMany({ orderBy: { name: 'asc' } });
  return successResponse(tags);
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const authenticated = await authenticateRequest(req);
  if (!authenticated) return errorResponse('UNAUTHORIZED', 'Authentication required', 401);

  const body = await req.json() as { name: string; slug?: string };
  if (!body.name) return errorResponse('VALIDATION', 'name is required');

  const slug = body.slug || body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\u0590-\u05ffa-z0-9-]/g, '');

  const tag = await prisma.productTag.create({ data: { name: body.name, slug } });
  return successResponse(tag);
});
