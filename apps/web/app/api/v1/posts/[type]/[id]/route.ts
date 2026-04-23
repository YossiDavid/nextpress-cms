import { NextRequest } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { prisma } from '@nextpress/db';
import { authenticateRequest, successResponse, errorResponse, withErrorHandling } from '@/lib/api-auth';
import { hooks } from '@nextpress/core';

interface Params {
  params: Promise<{ type: string; id: string }>;
}

export const GET = withErrorHandling(async (req: NextRequest, { params }: Params) => {
  const authenticated = await authenticateRequest(req);
  if (!authenticated) return errorResponse('UNAUTHORIZED', 'Authentication required', 401);

  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: { fieldValues: true, postType: true, author: { select: { id: true, name: true } } },
  });

  if (!post) return errorResponse('NOT_FOUND', 'Post not found', 404);
  return successResponse(post);
});

export const PUT = withErrorHandling(async (req: NextRequest, { params }: Params) => {
  const authenticated = await authenticateRequest(req);
  if (!authenticated) return errorResponse('UNAUTHORIZED', 'Authentication required', 401);

  const { id } = await params;
  const body = await req.json() as {
    title?: string;
    slug?: string;
    status?: string;
    publishedAt?: string | null;
    fields?: Record<string, unknown>;
  };

  await hooks.doAction('post.beforeSave', { id, body });

  const post = await prisma.post.update({
    where: { id },
    data: {
      ...(body.title ? { title: body.title } : {}),
      ...(body.slug ? { slug: body.slug } : {}),
      ...(body.status ? { status: body.status as 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'TRASH' } : {}),
      ...(body.status === 'PUBLISHED' && !body.publishedAt ? { publishedAt: new Date() } : {}),
      ...(body.publishedAt != null ? { publishedAt: body.publishedAt ? new Date(body.publishedAt) : null } : {}),
    },
  });

  if (body.fields) {
    for (const [fieldSlug, value] of Object.entries(body.fields)) {
      await prisma.fieldValue.upsert({
        where: { postId_fieldSlug: { postId: id, fieldSlug } },
        update: { value: String(value) },
        create: { postId: id, fieldSlug, value: String(value) },
      });
    }
  }

  await hooks.doAction('post.afterSave', post);

  revalidateTag('posts');
  revalidateTag(`post-${post.slug}`);
  revalidatePath('/');
  revalidatePath('/shop');

  return successResponse(post);
});

export const DELETE = withErrorHandling(async (req: NextRequest, { params }: Params) => {
  const authenticated = await authenticateRequest(req);
  if (!authenticated) return errorResponse('UNAUTHORIZED', 'Authentication required', 401);

  const { id } = await params;
  await hooks.doAction('post.beforeDelete', { id });

  const post = await prisma.post.update({
    where: { id },
    data: { status: 'TRASH' },
  });

  await hooks.doAction('post.afterDelete', post);

  revalidateTag('posts');
  revalidateTag(`post-${post.slug}`);
  revalidatePath('/');
  revalidatePath('/shop');

  return successResponse(post);
});
