import { Router } from 'express';
import { prisma } from '@nextpress/db';
import { hooks } from '@nextpress/core';
import { requireAuth, ok, err } from '../../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const page = parseInt(req.query['page'] as string ?? '1');
  const limit = parseInt(req.query['limit'] as string ?? '20');
  const [orders, total] = await Promise.all([
    prisma.order.findMany({ include: { items: true }, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.order.count(),
  ]);
  ok(res, orders, { total, page, limit });
});

router.get('/:id', requireAuth, async (req, res) => {
  const order = await prisma.order.findUnique({ where: { id: req.params['id'] }, include: { items: true } });
  if (!order) return err(res, 'NOT_FOUND', 'Order not found', 404);
  ok(res, order);
});

router.put('/:id/status', requireAuth, async (req, res) => {
  const { status } = req.body as { status: string };
  if (!status) return err(res, 'VALIDATION', 'Status is required');

  const existing = await prisma.order.findUnique({ where: { id: req.params['id'] } });
  if (!existing) return err(res, 'NOT_FOUND', 'Order not found', 404);

  const order = await prisma.order.update({
    where: { id: req.params['id'] },
    data: { status: status as 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED' | 'FAILED' },
  });

  await hooks.doAction('order.statusChanged', { order, previousStatus: existing.status });
  if (status === 'COMPLETED') await hooks.doAction('order.completed', order);

  ok(res, order);
});

export default router;
