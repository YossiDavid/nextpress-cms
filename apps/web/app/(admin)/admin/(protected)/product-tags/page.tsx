import { prisma } from '@nextpress/db';
import { TaxonomyManager } from '@/components/admin/TaxonomyManager';

export default async function ProductTagsPage() {
  const tags = await prisma.productTag.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">תגיות מוצרים</h1>
      <TaxonomyManager
        type="tag"
        initial={tags.map((t) => ({ id: t.id, name: t.name, slug: t.slug, count: t._count.products }))}
        createEndpoint="/api/v1/product-tags"
        deleteEndpoint="/api/v1/product-tags"
      />
    </div>
  );
}
