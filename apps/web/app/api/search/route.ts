import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@nextpress/db';
import { withErrorHandling } from '@/lib/api-auth';

export const GET = withErrorHandling(async (req: NextRequest) => {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';

  if (q.length < 2) {
    return NextResponse.json([]);
  }

  const results = await prisma.post.findMany({
    where: {
      status: 'PUBLISHED',
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { fieldValues: { some: { value: { contains: q, mode: 'insensitive' } } } },
      ],
    },
    select: {
      slug: true,
      title: true,
      postType: { select: { name: true } },
    },
    take: 5,
    orderBy: { publishedAt: 'desc' },
  });

  return NextResponse.json(results);
});
