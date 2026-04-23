import { unstable_cache } from 'next/cache';
import { prisma } from '@nextpress/db';

/** Site-wide settings — cached with 'settings' tag, busted on option change */
export const getCachedSettings = unstable_cache(
  async () => {
    const opts = await prisma.option.findMany({ where: { autoload: true } });
    return Object.fromEntries(opts.map((o) => [o.key, o.value]));
  },
  ['settings'],
  { tags: ['settings'], revalidate: 3600 },
);

/** Published posts for a given post type slug */
export const getCachedPostsByType = (typeSlug: string) =>
  unstable_cache(
    async () =>
      prisma.post.findMany({
        where: { postType: { slug: typeSlug }, status: 'PUBLISHED' },
        include: { fieldValues: true },
        orderBy: { publishedAt: 'desc' },
      }),
    [`posts-${typeSlug}`],
    { tags: ['posts', `posts-${typeSlug}`], revalidate: 300 },
  )();

/** Single published post by slug */
export const getCachedPost = (slug: string) =>
  unstable_cache(
    async () =>
      prisma.post.findFirst({
        where: { slug, status: 'PUBLISHED' },
        include: { fieldValues: true, postType: true },
      }),
    [`post-${slug}`],
    { tags: ['posts', `post-${slug}`], revalidate: 300 },
  )();
