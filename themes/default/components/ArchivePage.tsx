import Link from 'next/link';
import type { Post, FieldValue, PostType } from '@prisma/client';

interface Props {
  posts: Post[];
  postType: PostType;
  fieldValueMap: Record<string, FieldValue[]>;
}

export function ArchivePage({ posts, postType, fieldValueMap }: Props) {
  return (
    <main className="min-h-screen py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{postType.name}</h1>

        {posts.length === 0 ? (
          <p className="text-muted-foreground text-center py-16">אין פריטים להצגה</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const fieldValues = fieldValueMap[post.id] ?? [];
              const excerpt = fieldValues.find((fv) => fv.fieldSlug === 'excerpt')?.value;
              const image =
                fieldValues.find((fv) => fv.fieldSlug === 'featured_image')?.value ??
                fieldValues.find((fv) => fv.fieldSlug === 'images')?.value;

              return (
                <Link
                  key={post.id}
                  href={`/${post.slug}`}
                  className="block border border-border rounded-xl overflow-hidden bg-card hover:bg-muted/50 transition-colors"
                >
                  {image ? (
                    <img
                      src={image}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-muted flex items-center justify-center text-3xl text-muted-foreground">
                      📄
                    </div>
                  )}
                  <div className="p-4">
                    <h2 className="font-semibold text-lg mb-1">{post.title}</h2>
                    {excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-3">{excerpt}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
