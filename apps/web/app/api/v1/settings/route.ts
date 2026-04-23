import { NextRequest } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { prisma } from '@nextpress/db';
import { authenticateRequest, successResponse, errorResponse, withErrorHandling } from '@/lib/api-auth';

export const GET = withErrorHandling(async (req: NextRequest) => {
  const authenticated = await authenticateRequest(req);
  if (!authenticated) return errorResponse('UNAUTHORIZED', 'Authentication required', 401);

  const options = await prisma.option.findMany({ where: { autoload: true } });
  const data = Object.fromEntries(options.map((o) => [o.key, o.value]));
  return successResponse(data);
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const authenticated = await authenticateRequest(req);
  if (!authenticated) return errorResponse('UNAUTHORIZED', 'Authentication required', 401);

  const body = await req.json() as { key: string; value: string };
  if (!body.key) return errorResponse('VALIDATION', 'Key is required');

  const option = await prisma.option.upsert({
    where: { key: body.key },
    update: { value: body.value },
    create: { key: body.key, value: body.value },
  });

  revalidateTag('settings');
  revalidatePath('/', 'layout');

  return successResponse(option);
});
