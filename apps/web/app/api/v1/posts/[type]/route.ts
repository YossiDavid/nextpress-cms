import { NextRequest } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { prisma } from '@nextpress/db';
import { authenticateRequest, successResponse, errorResponse, withErrorHandling } from '@/lib/api-auth';
import { hooks } from '@nextpress/core';

interface Params {
  params: Promise<{ type: string }>;
}

export const GET = withErrorHandling(async (req: NextRequest, { params }: Params) => {
  const authenticated = await authenticateRequest(req);
  if (!authenticated) return errorResponse('UNAUTHORIZED', 'Authentication required', 401);

  const { type } = await params;
  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = parseInt(searchParams.get('limit') ?? '20');
  const status = searchParams.get('status') ?? undefined;
  const search = searchParams.get('search') ?? undefined;

  const postType = await prisma.postType.findUnique({ where: { slug: type } });
  if (!postType) return errorResponse('NOT_FOUND', 'Post type not found', 404);

  const where = {
    postTypeId: postType.id,
    ...(status ? { status: status as 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'TRASH' } : {}),
    ...(search ? { title: { contains: search, mode: 'insensitive' as const } } : {}),
  };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: { fieldValues: true, author: { select: { id: true, name: true, email: true } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.post.count({ where }),
  ]);

  // Apply product.price filter for product post type
  let enriched = await hooks.applyFilters('api.response', posts);
  if (type === 'product') {
    enriched = await Promise.all(
      (enriched as typeof posts).map(async (post) => {
        const priceField = post.fieldValues.find((fv) => fv.fieldSlug === 'price');
        if (!priceField?.value) return post;
        const filteredPrice = await hooks.applyFilters('product.price', Number(priceField.value), post);
        if (filteredPrice === Number(priceField.value)) return post;
        return {
          ...post,
          fieldValues: post.fieldValues.map((fv) =>
            fv.fieldSlug === 'price' ? { ...fv, value: String(filteredPrice) } : fv
          ),
        };
      })
    );
  }

  return successResponse(enriched, { total, page, limit });
});

export const POST = withErrorHandling(async (req: NextRequest, { params }: Params) => {
  const authenticated = await authenticateRequest(req);
  if (!authenticated) return errorResponse('UNAUTHORIZED', 'Authentication required', 401);

  const { type } = await params;
  const body = await req.json() as {
    title: string;
    slug?: string;
    status?: string;
    publishedAt?: string;
    fields?: Record<string, unknown>;
  };

  if (!body.title) return errorResponse('VALIDATION', 'Title is required');

  const postType = await prisma.postType.findUnique({ where: { slug: type } });
  if (!postType) return errorResponse('NOT_FOUND', 'Post type not found', 404);

  const slug = body.slug ?? body.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

  await hooks.doAction('post.beforeSave', { type, body });

  const post = await prisma.post.create({
    data: {
      postTypeId: postType.id,
      title: body.title,
      slug,
      status: (body.status as 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'TRASH') ?? 'DRAFT',
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : (body.status === 'PUBLISHED' ? new Date() : undefined),
      fieldValues: {
        create: Object.entries(body.fields ?? {}).map(([fieldSlug, value]) => ({
          fieldSlug,
          value: String(value),
        })),
      },
    },
    include: { fieldValues: true },
  });

  await hooks.doAction('post.afterSave', post);

  revalidateTag('posts');
  revalidateTag(`posts-${type}`);
  revalidatePath('/');
  revalidatePath('/shop');

  return successResponse(post);
});
