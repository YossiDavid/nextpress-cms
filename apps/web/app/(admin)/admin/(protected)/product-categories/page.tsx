import { prisma } from '@nextpress/db';
import { TaxonomyManager } from '@/components/admin/TaxonomyManager';

export default async function ProductCategoriesPage() {
  const categories = await prisma.productCategory.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">קטגוריות מוצרים</h1>
      <TaxonomyManager
        type="category"
        initial={categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug, count: c._count.products }))}
        createEndpoint="/api/v1/product-categories"
        deleteEndpoint="/api/v1/product-categories"
      />
    </div>
  );
}
