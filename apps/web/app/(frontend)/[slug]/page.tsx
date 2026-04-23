import type { Metadata } from 'next';
import { prisma } from '@nextpress/db';
import { notFound } from 'next/navigation';
import { PostTemplate, ProductTemplate } from '@nextpress/theme-default';
import { SlotRenderer } from '@/components/frontend/SlotRenderer';

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findFirst({
    where: { slug, status: 'PUBLISHED' },
    select: { title: true, postType: { select: { name: true } } },
  });
  if (!post) return {};

  const description = post.title;
  const ogImage = `/api/og?title=${encodeURIComponent(post.title)}&type=${encodeURIComponent(post.postType.name)}`;

  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title: post.title, description },
  };
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params;

  const post = await prisma.post.findFirst({
    where: { slug, status: 'PUBLISHED' },
    include: { fieldValues: true, postType: true },
  });

  if (!post) notFound();

  const isProduct = post.postType.slug === 'product';

  if (isProduct) {
    const [variations, productWithTax, showSidebarOpt] = await Promise.all([
      prisma.productVariation.findMany({
        where: { productId: post.id },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.post.findUnique({
        where: { id: post.id },
        include: { categories: true, tags: true },
      }),
      prisma.option.findUnique({ where: { key: 'theme_default_show_sidebar' } }),
    ]);
    const showSidebar = showSidebarOpt?.value === 'true';

    const productEl = (
      <ProductTemplate
        post={post}
        variations={variations.map((v) => ({
          ...v,
          price: Number(v.price),
          options: v.options as Record<string, string>,
        }))}
        categories={productWithTax?.categories ?? []}
        tags={productWithTax?.tags ?? []}
      />
    );

    return (
      <main className="min-h-screen py-12 px-6">
        <SlotRenderer slot="product-single-before" className="max-w-5xl mx-auto mb-6" />
        <div className="max-w-5xl mx-auto">
          {showSidebar ? (
            <div className="grid grid-cols-3 gap-8">
              <div className="col-span-2">{productEl}</div>
              <aside className="col-span-1">
                <SlotRenderer slot="sidebar" className="space-y-6" />
              </aside>
            </div>
          ) : productEl}
        </div>
        <SlotRenderer slot="product-single-after" className="max-w-5xl mx-auto mt-8" />
      </main>
    );
  }

  return <PostTemplate post={post} />;
}
