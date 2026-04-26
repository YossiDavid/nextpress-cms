import { Router } from 'express';
import { prisma } from '@nextpress/db';
import { requireAuth, ok, err } from '../../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const page = parseInt(req.query['page'] as string ?? '1');
  const limit = parseInt(req.query['limit'] as string ?? '20');
  const [coupons, total] = await Promise.all([
    prisma.coupon.findMany({ skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.coupon.count(),
  ]);
  ok(res, coupons, { total, page, limit });
});

router.get('/:id', requireAuth, async (req, res) => {
  const coupon = await prisma.coupon.findUnique({ where: { id: req.params['id'] } });
  if (!coupon) return err(res, 'NOT_FOUND', 'Coupon not found', 404);
  ok(res, coupon);
});

router.post('/', requireAuth, async (req, res) => {
  const body = req.body as { code: string; type: string; value: number; minOrder?: number; maxUses?: number; expiresAt?: string };
  if (!body.code) return err(res, 'VALIDATION', 'Code is required');
  const coupon = await prisma.coupon.create({
    data: {
      code: body.code.toUpperCase(),
      type: body.type as 'PERCENT' | 'FIXED' | 'FREE_SHIPPING',
      value: body.value,
      minOrder: body.minOrder,
      maxUses: body.maxUses,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
    },
  });
  ok(res, coupon);
});

router.put('/:id', requireAuth, async (req, res) => {
  const body = req.body as Partial<{ code: string; type: string; value: number; active: boolean; minOrder: number; maxUses: number; expiresAt: string }>;
  const coupon = await prisma.coupon.update({
    where: { id: req.params['id'] },
    data: {
      ...(body.code ? { code: body.code.toUpperCase() } : {}),
      ...(body.type ? { type: body.type as 'PERCENT' | 'FIXED' | 'FREE_SHIPPING' } : {}),
      ...(body.value !== undefined ? { value: body.value } : {}),
      ...(body.active !== undefined ? { active: body.active } : {}),
      ...(body.minOrder !== undefined ? { minOrder: body.minOrder } : {}),
      ...(body.maxUses !== undefined ? { maxUses: body.maxUses } : {}),
      ...(body.expiresAt ? { expiresAt: new Date(body.expiresAt) } : {}),
    },
  });
  ok(res, coupon);
});

router.delete('/:id', requireAuth, async (req, res) => {
  await prisma.coupon.delete({ where: { id: req.params['id'] } });
  ok(res, { id: req.params['id'] });
});

export default router;
