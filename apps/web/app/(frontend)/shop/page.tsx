import type { Metadata } from 'next';
import { prisma } from '@nextpress/db';
import { notFound } from 'next/navigation';
import { ShopPage } from '@/components/frontend/ShopPage';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const description = 'עיינו בכל המוצרים שלנו';
  return {
    title: 'חנות',
    description,
    openGraph: { title: 'חנות', description, images: [{ url: '/api/og?title=%D7%97%D7%A0%D7%95%D7%AA', width: 1200, height: 630 }] },
  };
}

interface Props {
  searchParams: Promise<{ category?: string }>;
}

export default async function ShopPageRoute({ searchParams }: Props) {
  const { category } = await searchParams;

  const productType = await prisma.postType.findUnique({ where: { slug: 'product' } });
  if (!productType) notFound();

  const [products, categories] = await Promise.all([
    prisma.post.findMany({
      where: {
        postTypeId: productType.id,
        status: 'PUBLISHED',
        ...(category ? { categories: { some: { slug: category } } } : {}),
      },
      include: { fieldValues: true, categories: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.productCategory.findMany({ orderBy: { name: 'asc' } }),
  ]);

  const fieldValueMap = Object.fromEntries(products.map((p) => [p.id, p.fieldValues]));
  const categoryMap = Object.fromEntries(products.map((p) => [p.id, p.categories]));
  const plainProducts = products.map(({ fieldValues: _fv, categories: _c, ...p }) => p);

  return (
    <ShopPage
      posts={plainProducts}
      postType={productType}
      fieldValueMap={fieldValueMap}
      categoryMap={categoryMap}
      allCategories={categories}
      activeCategory={category}
    />
  );
}
