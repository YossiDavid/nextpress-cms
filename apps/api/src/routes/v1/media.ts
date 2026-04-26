import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import { prisma } from '@nextpress/db';
import { hooks } from '@nextpress/core';
import { requireAuth, ok, err } from '../../middleware/auth.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', requireAuth, async (req, res) => {
  const page = parseInt(req.query['page'] as string ?? '1');
  const limit = parseInt(req.query['limit'] as string ?? '40');
  const [media, total] = await Promise.all([
    prisma.media.findMany({ skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.media.count(),
  ]);
  ok(res, media, { total, page, limit });
});

router.post('/upload', requireAuth, upload.single('file'), async (req, res) => {
  if (!req.file) return err(res, 'VALIDATION', 'No file provided');

  const { storage } = await import('../../lib/storage.js');
  const ext = path.extname(req.file.originalname);
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const url = await storage.upload(req.file.buffer, filename, req.file.mimetype);

  const media = await prisma.media.create({
    data: { filename: req.file.originalname, mimeType: req.file.mimetype, size: req.file.size, url },
  });

  await hooks.doAction('media.uploaded', media);
  ok(res, media);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const media = await prisma.media.findUnique({ where: { id: req.params['id'] } });
  if (!media) return err(res, 'NOT_FOUND', 'Media not found', 404);

  const { storage } = await import('../../lib/storage.js');
  await storage.delete(media.url);
  await prisma.media.delete({ where: { id: req.params['id'] } });
  ok(res, { id: req.params['id'] });
});

export default router;
