import { NextRequest } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

// Called by the Express API after mutations to revalidate Next.js cached pages.
// Protected by REVALIDATE_SECRET to prevent abuse.
export async function POST(req: NextRequest) {
  const { secret, tags, paths } = await req.json() as { secret: string; tags?: string[]; paths?: string[] };

  if (secret !== process.env['REVALIDATE_SECRET']) {
    return Response.json({ error: 'Invalid secret' }, { status: 401 });
  }

  for (const tag of tags ?? []) revalidateTag(tag);
  for (const path of paths ?? []) revalidatePath(path);

  return Response.json({ revalidated: true });
}
