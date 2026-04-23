import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@nextpress/db';

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export const revalidate = 0; // search is always dynamic

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `חיפוש: ${q}` : 'חיפוש' };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? '';

  const results = query.length >= 2
    ? await prisma.post.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { fieldValues: { some: { value: { contains: query, mode: 'insensitive' } } } },
          ],
        },
        include: { postType: true, fieldValues: { where: { fieldSlug: { in: ['excerpt', 'featured_image'] } } } },
        orderBy: { publishedAt: 'desc' },
        take: 30,
      })
    : [];

  return (
    <main className="min-h-screen py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">
          {query ? `תוצאות עבור "${query}"` : 'חיפוש'}
        </h1>

        {query.length >= 2 && (
          <p className="text-sm text-muted-foreground mb-8">
            {results.length === 0 ? 'לא נמצאו תוצאות' : `${results.length} תוצאות`}
          </p>
        )}

        {query.length > 0 && query.length < 2 && (
          <p className="text-muted-foreground">הכנס לפחות 2 תווים לחיפוש.</p>
        )}

        {results.length > 0 && (
          <ul className="divide-y divide-border">
            {results.map((post) => {
              const excerpt = post.fieldValues.find((fv) => fv.fieldSlug === 'excerpt')?.value;
              const image = post.fieldValues.find((fv) => fv.fieldSlug === 'featured_image')?.value;
              return (
                <li key={post.id}>
                  <Link href={`/${post.slug}`} className="flex gap-4 py-5 hover:bg-muted/30 -mx-4 px-4 rounded-lg transition-colors">
                    {image && (
                      <img src={image} alt={post.title} className="w-20 h-20 object-cover rounded-md flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          {post.postType.name}
                        </span>
                      </div>
                      <h2 className="font-semibold text-base leading-snug mb-1">
                        {highlight(post.title, query)}
                      </h2>
                      {excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{excerpt}</p>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}

/** Wraps matched text in <mark> tags (server-safe, returns JSX) */
function highlight(text: string, query: string): React.ReactNode {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 dark:bg-yellow-800 text-inherit rounded px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}
