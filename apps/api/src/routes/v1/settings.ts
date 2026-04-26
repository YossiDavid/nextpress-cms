import { Router } from 'express';
import { prisma } from '@nextpress/db';
import { requireAuth, ok, err } from '../../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (_req, res) => {
  const options = await prisma.option.findMany({ where: { autoload: true } });
  ok(res, Object.fromEntries(options.map((o) => [o.key, o.value])));
});

router.post('/', requireAuth, async (req, res) => {
  const { key, value } = req.body as { key: string; value: string };
  if (!key) return err(res, 'VALIDATION', 'Key is required');
  const option = await prisma.option.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
  ok(res, option);
});

export default router;
