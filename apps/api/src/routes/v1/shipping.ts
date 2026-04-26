import { Router } from 'express';
import { prisma } from '@nextpress/db';
import { requireAuth, ok, err } from '../../middleware/auth.js';

const router = Router();

router.get('/methods', requireAuth, async (_req, res) => {
  const methods = await prisma.shippingMethod.findMany({ orderBy: { name: 'asc' } });
  ok(res, methods);
});

router.post('/methods', requireAuth, async (req, res) => {
  const { name, price, freeAbove } = req.body as { name: string; price: number; freeAbove?: number };
  if (!name) return err(res, 'VALIDATION', 'Name is required');
  const method = await prisma.shippingMethod.create({ data: { name, price, freeAbove } });
  ok(res, method);
});

router.put('/methods/:id', requireAuth, async (req, res) => {
  const body = req.body as Partial<{ name: string; price: number; freeAbove: number; active: boolean }>;
  const method = await prisma.shippingMethod.update({ where: { id: req.params['id'] }, data: body });
  ok(res, method);
});

router.delete('/methods/:id', requireAuth, async (req, res) => {
  await prisma.shippingMethod.delete({ where: { id: req.params['id'] } });
  ok(res, { id: req.params['id'] });
});

export default router;
