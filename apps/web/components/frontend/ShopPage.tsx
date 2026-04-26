import Link from 'next/link';
import Image from 'next/image';
import type { Post, FieldValue, PostType } from '@prisma/client';
import { Badge } from '@/components/frontend/ui/badge';

interface Category { id: string; name: string; slug: string }

interface Props {
  posts: Post[];
  postType: PostType;
  fieldValueMap: Record<string, FieldValue[]>;
  categoryMap: Record<string, Category[]>;
  allCategories: Category[];
  activeCategory?: string;
}

function getPrice(fieldValues: FieldValue[]) {
  const price = fieldValues.find((fv) => fv.fieldSlug === 'price')?.value;
  const salePrice = fieldValues.find((fv) => fv.fieldSlug === 'sale_price')?.value;
  const p = price ? Number(price) : null;
  const s = salePrice ? Number(salePrice) : null;
  const isOnSale = p !== null && s !== null && s < p;
  return { price: p, salePrice: isOnSale ? s : null };
}

export function ShopPage({ posts, postType, fieldValueMap, categoryMap, allCategories, activeCategory }: Props) {
  return (
    <main className="min-h-screen py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{postType.name}</h1>

        {/* Category filter */}
        {allCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Link href="/shop">
              <Badge variant={!activeCategory ? 'default' : 'outline'} className="cursor-pointer">
                הכל
              </Badge>
            </Link>
            {allCategories.map((cat) => (
              <Link key={cat.id} href={`/shop?category=${cat.slug}`}>
                <Badge variant={activeCategory === cat.slug ? 'default' : 'outline'} className="cursor-pointer">
                  {cat.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {posts.length === 0 ? (
          <p className="text-muted-foreground text-center py-16">אין מוצרים להצגה</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const fieldValues = fieldValueMap[post.id] ?? [];
              const image =
                fieldValues.find((fv) => fv.fieldSlug === 'images')?.value ??
                fieldValues.find((fv) => fv.fieldSlug === 'featured_image')?.value;
              const { price, salePrice } = getPrice(fieldValues);
              const cats = categoryMap[post.id] ?? [];

              return (
                <Link
                  key={post.id}
                  href={`/${post.slug}`}
                  className="block border border-border rounded-xl overflow-hidden bg-card hover:bg-muted/50 transition-colors"
                >
                  {image ? (
                    <div className="relative w-full h-48">
                      <Image
                        src={image}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-muted flex items-center justify-center text-3xl text-muted-foreground">

                    </div>
                  )}
                  <div className="p-4 space-y-2">
                    <h2 className="font-semibold text-lg leading-tight">{post.title}</h2>
                    {price !== null && (
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold">
                          ₪{(salePrice ?? price).toFixed(2)}
                        </span>
                        {salePrice !== null && (
                          <span className="text-sm text-muted-foreground line-through">
                            ₪{price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    )}
                    {cats.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {cats.map((c) => (
                          <Badge key={c.id} variant="secondary" className="text-xs">{c.name}</Badge>
                        ))}
                      </div>
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
