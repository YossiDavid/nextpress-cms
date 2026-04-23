import type { MetadataRoute } from 'next';
import { prisma } from '@nextpress/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl =
    (await prisma.option.findUnique({ where: { key: 'site_url' } }))?.value ??
    process.env.NEXT_PUBLIC_URL ??
    'http://localhost:3000';

  const base = siteUrl.replace(/\/$/, '');

  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${base}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${base}/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...postRoutes];
}
