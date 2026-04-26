import { Router } from 'express';
import { prisma } from '@nextpress/db';
import { requireAuth, ok, err } from '../../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const page = parseInt(req.query['page'] as string ?? '1');
  const limit = parseInt(req.query['limit'] as string ?? '20');
  const [users, total] = await Promise.all([
    prisma.user.findMany({ select: { id: true, email: true, name: true, role: true, createdAt: true }, skip: (page - 1) * limit, take: limit }),
    prisma.user.count(),
  ]);
  ok(res, users, { total, page, limit });
});

router.put('/:id', requireAuth, async (req, res) => {
  const { role } = req.body as { role?: string };
  const user = await prisma.user.update({
    where: { id: req.params['id'] },
    data: { ...(role ? { role: role as 'ADMIN' | 'EDITOR' | 'VIEWER' | 'CUSTOMER' } : {}) },
    select: { id: true, email: true, name: true, role: true },
  });
  ok(res, user);
});

router.delete('/:id', requireAuth, async (req, res) => {
  await prisma.user.delete({ where: { id: req.params['id'] } });
  ok(res, { id: req.params['id'] });
});

export default router;
