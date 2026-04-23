import { prisma } from '@nextpress/db';
import { notFound } from 'next/navigation';
import { PostEditor } from '@/components/admin/PostEditor';
import { ProductVariationsEditor } from '@/components/admin/ProductVariationsEditor';
import { ProductTaxonomySelector } from '@/components/admin/ProductTaxonomySelector';

interface Props { params: Promise<{ type: string; id: string }>; }

export default async function EditPostPage({ params }: Props) {
  const { type, id } = await params;
  const postType = await prisma.postType.findUnique({
    where: { slug: type },
    include: { fields: { orderBy: { order: 'asc' } } },
  });
  if (!postType) notFound();

  const [post, variations, allCategories, allTags] = await Promise.all([
    prisma.post.findUnique({
      where: { id },
      include: { fieldValues: true, categories: true, tags: true },
    }),
    type === 'product'
      ? prisma.productVariation.findMany({ where: { productId: id }, orderBy: { createdAt: 'asc' } })
      : Promise.resolve([]),
    type === 'product' ? prisma.productCategory.findMany({ orderBy: { name: 'asc' } }) : Promise.resolve([]),
    type === 'product' ? prisma.productTag.findMany({ orderBy: { name: 'asc' } }) : Promise.resolve([]),
  ]);
  if (!post) notFound();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">עריכת {post.title}</h1>
      <PostEditor postType={postType} fields={postType.fields} post={post} fieldValues={post.fieldValues} />
      {type === 'product' && (
        <>
          <ProductTaxonomySelector
            productId={id}
            allCategories={allCategories}
            allTags={allTags}
            selectedCategoryIds={post.categories.map((c) => c.id)}
            selectedTagIds={post.tags.map((t) => t.id)}
          />
          <ProductVariationsEditor
            productId={id}
            initial={variations.map((v) => ({
              ...v,
              price: Number(v.price),
              options: v.options as Record<string, string>,
            }))}
          />
        </>
      )}
    </div>
  );
}
