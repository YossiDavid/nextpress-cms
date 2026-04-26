import type { Request, Response, NextFunction } from 'express';
import { prisma } from '@nextpress/db';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'API key required' } });
    return;
  }

  const key = authHeader.slice(7);
  const apiKey = await prisma.apiKey.findUnique({ where: { key } });
  if (!apiKey) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid API key' } });
    return;
  }

  await prisma.apiKey.update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } });
  next();
}

export function ok<T>(res: Response, data: T, meta?: { total: number; page: number; limit: number }) {
  res.json({ success: true, data, ...(meta ? { meta } : {}) });
}

export function err(res: Response, code: string, message: string, status = 400) {
  res.status(status).json({ success: false, error: { code, message } });
}
