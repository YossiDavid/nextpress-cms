import { NextRequest } from 'next/server';
import { prisma } from '@nextpress/db';
import { unlink } from 'node:fs/promises';
import path from 'node:path';
import { authenticateRequest, successResponse, errorResponse, withErrorHandling } from '@/lib/api-auth';

interface Params { params: Promise<{ id: string }> }

export const DELETE = withErrorHandling(async (req: NextRequest, { params }: Params) => {
  const authenticated = await authenticateRequest(req);
  if (!authenticated) return errorResponse('UNAUTHORIZED', 'Authentication required', 401);

  const { id } = await params;
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) return errorResponse('NOT_FOUND', 'Media not found', 404);

  // Delete physical file if it's a local upload
  const uploadDir = process.env['UPLOAD_DIR'] ?? './uploads';
  const filename = path.basename(media.url);
  try {
    await unlink(path.join(uploadDir, filename));
  } catch {
    // File may already be gone — continue with DB deletion
  }

  await prisma.media.delete({ where: { id } });
  return successResponse({ id });
});
