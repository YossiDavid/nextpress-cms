import type { MetadataRoute } from 'next';
import { prisma } from '@nextpress/db';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrl =
    (await prisma.option.findUnique({ where: { key: 'site_url' } }))?.value ??
    process.env.NEXT_PUBLIC_URL ??
    'http://localhost:3000';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${siteUrl.replace(/\/$/, '')}/sitemap.xml`,
  };
}
