import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// ─── Simple in-memory rate limiter ───────────────────────────────────────────
// Keyed by IP + route group; entries expire after their window.
const hits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (entry.count >= limit) return true;
  entry.count++;
  return false;
}

// Clean up stale entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of hits) {
    if (now > v.resetAt) hits.delete(k);
  }
}, 5 * 60 * 1000);

function rateLimitResponse() {
  return new NextResponse(
    JSON.stringify({ success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests' } }),
    { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '60' } }
  );
}

// ─── Middleware ───────────────────────────────────────────────────────────────
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';

  // Rate limit: public API — 60 req / 1 min per IP
  if (pathname.startsWith('/api/v1')) {
    if (isRateLimited(`api:${ip}`, 60, 60_000)) return rateLimitResponse();
  }

  // Rate limit: auth pages — 10 attempts / 5 min per IP
  if (pathname === '/login' || pathname === '/register' || pathname === '/admin/login') {
    if (isRateLimited(`auth:${ip}`, 10, 5 * 60_000)) return rateLimitResponse();
  }

  // Refresh Supabase session cookies and get current user
  const { supabaseResponse, user } = await updateSession(req);

  // Admin routes — require auth; role is enforced in each page
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!user) return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  // Frontend account routes — redirect unauthenticated users to /login
  if (pathname.startsWith('/account')) {
    if (!user) return NextResponse.redirect(new URL('/login', req.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|uploads).*)'],
};
