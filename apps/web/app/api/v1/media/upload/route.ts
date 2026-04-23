import { NextRequest } from 'next/server';
import { prisma } from '@nextpress/db';
import { authenticateRequest, successResponse, errorResponse, withErrorHandling } from '@/lib/api-auth';
import { hooks } from '@nextpress/core';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const POST = withErrorHandling(async (req: NextRequest) => {
  const authenticated = await authenticateRequest(req);
  if (!authenticated) return errorResponse('UNAUTHORIZED', 'Authentication required', 401);

  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) return errorResponse('VALIDATION', 'No file provided');

  const uploadDir = process.env['UPLOAD_DIR'] ?? './uploads';
  await mkdir(uploadDir, { recursive: true });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = path.extname(file.name);
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const filepath = path.join(uploadDir, filename);

  await writeFile(filepath, buffer);

  const baseUrl = process.env['UPLOAD_URL'] ?? 'http://localhost:3000/uploads';
  const url = `${baseUrl}/${filename}`;

  const media = await prisma.media.create({
    data: {
      filename: file.name,
      mimeType: file.type,
      size: file.size,
      url,
    },
  });

  await hooks.doAction('media.uploaded', media);

  return successResponse(media);
});
