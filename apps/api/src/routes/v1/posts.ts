import { Router } from 'express';
import { prisma } from '@nextpress/db';
import { hooks } from '@nextpress/core';
import { requireAuth, ok, err } from '../../middleware/auth.js';

const router = Router();

// GET /api/v1/posts/:type
router.get('/:type', requireAuth, async (req, res) => {
  const { type } = req.params;
  const page = parseInt(req.query['page'] as string ?? '1');
  const limit = parseInt(req.query['limit'] as string ?? '20');
  const status = req.query['status'] as string | undefined;
  const search = req.query['search'] as string | undefined;

  const postType = await prisma.postType.findUnique({ where: { slug: type } });
  if (!postType) return err(res, 'NOT_FOUND', 'Post type not found', 404);

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

  ok(res, enriched, { total, page, limit });
});

// GET /api/v1/posts/:type/:id
router.get('/:type/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: { fieldValues: true, author: { select: { id: true, name: true, email: true } } },
  });
  if (!post) return err(res, 'NOT_FOUND', 'Post not found', 404);
  ok(res, post);
});

// POST /api/v1/posts/:type
router.post('/:type', requireAuth, async (req, res) => {
  const { type } = req.params;
  const body = req.body as { title: string; slug?: string; status?: string; publishedAt?: string; fields?: Record<string, unknown> };

  if (!body.title) return err(res, 'VALIDATION', 'Title is required');

  const postType = await prisma.postType.findUnique({ where: { slug: type } });
  if (!postType) return err(res, 'NOT_FOUND', 'Post type not found', 404);

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
  await revalidate(req, ['posts', `posts-${type}`], ['/', '/shop']);

  ok(res, post);
});

// PUT /api/v1/posts/:type/:id
router.put('/:type/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const body = req.body as { title?: string; slug?: string; status?: string; publishedAt?: string; fields?: Record<string, unknown> };

  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return err(res, 'NOT_FOUND', 'Post not found', 404);

  await hooks.doAction('post.beforeSave', { id, body });

  const post = await prisma.post.update({
    where: { id },
    data: {
      ...(body.title ? { title: body.title } : {}),
      ...(body.slug ? { slug: body.slug } : {}),
      ...(body.status ? { status: body.status as 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'TRASH' } : {}),
      ...(body.publishedAt ? { publishedAt: new Date(body.publishedAt) } : {}),
      ...(body.fields ? {
        fieldValues: {
          deleteMany: { postId: id },
          create: Object.entries(body.fields).map(([fieldSlug, value]) => ({
            fieldSlug,
            value: String(value),
          })),
        },
      } : {}),
    },
    include: { fieldValues: true },
  });

  await hooks.doAction('post.afterSave', post);
  await revalidate(req, ['posts'], ['/', '/shop']);

  ok(res, post);
});

// DELETE /api/v1/posts/:type/:id
router.delete('/:type/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return err(res, 'NOT_FOUND', 'Post not found', 404);

  await hooks.doAction('post.beforeDelete', existing);
  await prisma.post.update({ where: { id }, data: { status: 'TRASH' } });
  await hooks.doAction('post.afterDelete', existing);
  await revalidate(req, ['posts'], ['/']);

  ok(res, { id });
});

// Notify Next.js to revalidate cached pages after mutations
async function revalidate(req: Parameters<typeof router.get>[1], tags: string[], paths: string[]) {
  const nextUrl = process.env['NEXTJS_URL'] ?? 'http://localhost:3000';
  const secret = process.env['REVALIDATE_SECRET'];
  if (!secret) return;
  try {
    await fetch(`${nextUrl}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, tags, paths }),
    });
  } catch {
    // Non-fatal — revalidation is best-effort
  }
}

export default router;
