import { Router } from 'express';
import { prisma } from '@nextpress/db';
import { requireAuth, ok, err } from '../../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (_req, res) => {
  const menus = await prisma.menu.findMany({ include: { items: { orderBy: { order: 'asc' } } } });
  ok(res, menus);
});

router.get('/:id', requireAuth, async (req, res) => {
  const menu = await prisma.menu.findUnique({ where: { id: req.params['id'] }, include: { items: { orderBy: { order: 'asc' } } } });
  if (!menu) return err(res, 'NOT_FOUND', 'Menu not found', 404);
  ok(res, menu);
});

router.post('/', requireAuth, async (req, res) => {
  const { name, slug } = req.body as { name: string; slug: string };
  if (!name || !slug) return err(res, 'VALIDATION', 'Name and slug are required');
  const menu = await prisma.menu.create({ data: { name, slug } });
  ok(res, menu);
});

router.put('/:id', requireAuth, async (req, res) => {
  const { name, items } = req.body as { name?: string; items?: { label: string; url: string; order: number; parentId?: string }[] };
  const menu = await prisma.menu.update({
    where: { id: req.params['id'] },
    data: {
      ...(name ? { name } : {}),
      ...(items ? { items: { deleteMany: { menuId: req.params['id'] }, create: items } } : {}),
    },
    include: { items: true },
  });
  ok(res, menu);
});

router.delete('/:id', requireAuth, async (req, res) => {
  await prisma.menu.delete({ where: { id: req.params['id'] } });
  ok(res, { id: req.params['id'] });
});

export default router;
