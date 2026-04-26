import { getSession } from '@/lib/auth-session';
import { successResponse, errorResponse } from '@/lib/api-auth';

export async function GET() {
  const session = await getSession();
  if (!session) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401);
  return successResponse(session.user);
}
