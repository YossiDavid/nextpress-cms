import { auth } from '@/auth';
import { prisma } from '@nextpress/db';
import { NextRequest } from 'next/server';

export async function authenticateRequest(req: NextRequest): Promise<boolean> {
  // Check session first
  const session = await auth();
  if (session?.user) return true;

  // Check API key
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;

  const key = authHeader.slice(7);
  const apiKey = await prisma.apiKey.findUnique({ where: { key } });
  if (!apiKey) return false;

  // Update last used
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  return true;
}

export function successResponse<T>(data: T, meta?: { total: number; page: number; limit: number }) {
  return Response.json({ success: true, data, ...(meta ? { meta } : {}) });
}

export function errorResponse(code: string, message: string, status = 400) {
  return Response.json({ success: false, error: { code, message } }, { status });
}

type RouteHandler<C = unknown> = (req: NextRequest, ctx: C) => Promise<Response>;

export function withErrorHandling<C = unknown>(handler: RouteHandler<C>): RouteHandler<C> {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      console.error(`[API] ${req.method} ${req.nextUrl.pathname}`, err);
      return errorResponse('INTERNAL', 'Internal server error', 500);
    }
  };
}
