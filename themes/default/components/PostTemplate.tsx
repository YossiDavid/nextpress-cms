import type { Post, FieldValue, PostType } from '@prisma/client';
import Image from 'next/image';
import { prisma } from '@nextpress/db';
import { SlotRenderer } from '../../../apps/web/components/frontend/SlotRenderer';

interface Props {
  post: Post & { fieldValues: FieldValue[]; postType: PostType };
}

export async function PostTemplate({ post }: Props) {
  const getValue = (key: string) =>
    post.fieldValues.find((fv) => fv.fieldSlug === key)?.value;

  const content = getValue('content');
  const image = getValue('featured_image') ?? getValue('images');

  const showSidebarOpt = await prisma.option.findUnique({
    where: { key: 'theme_default_show_sidebar' },
  });
  const showSidebar = showSidebarOpt?.value === 'true';

  return (
    <main className="min-h-screen py-12 px-6">
      <SlotRenderer slot="post-single-before" className="max-w-5xl mx-auto mb-6" />
      <div className={`max-w-5xl mx-auto ${showSidebar ? 'grid grid-cols-3 gap-8' : ''}`}>
        <article className={showSidebar ? 'col-span-2' : 'max-w-3xl mx-auto'}>
          {image && (
            <div className="relative w-full h-80 rounded-xl overflow-hidden mb-8">
              <Image
                src={image}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 800px"
                priority
              />
            </div>
          )}
          <h1 className="text-4xl font-bold mb-3">{post.title}</h1>
          {post.publishedAt && (
            <p className="text-sm text-muted-foreground mb-8">
              {new Date(post.publishedAt).toLocaleDateString('he-IL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}
          {content && (
            <div
              className="prose prose-neutral max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </article>

        {showSidebar && (
          <aside className="col-span-1">
            <SlotRenderer slot="sidebar" className="space-y-6" />
          </aside>
        )}
      </div>
      <SlotRenderer slot="post-single-after" className="max-w-5xl mx-auto mt-8" />
    </main>
  );
}
