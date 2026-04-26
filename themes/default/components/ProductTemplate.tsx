'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Post, FieldValue, PostType } from '@prisma/client';
import { AddToCartButton } from '../../../apps/web/components/frontend/AddToCartButton';

interface ProductVariation {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  stock: number | null;
  options: Record<string, string>;
}

interface TaxItem { id: string; name: string; slug: string }

interface Props {
  post: Post & { fieldValues: FieldValue[]; postType: PostType };
  variations: ProductVariation[];
  categories?: TaxItem[];
  tags?: TaxItem[];
}

export function ProductTemplate({ post, variations, categories = [], tags = [] }: Props) {
  const getValue = (key: string) =>
    post.fieldValues.find((fv) => fv.fieldSlug === key)?.value;

  const price = getValue('price');
  const salePrice = getValue('sale_price');
  const images = getValue('images');
  const description = getValue('description') ?? getValue('content');
  const stock = getValue('stock');

  const basePrice = price ? Number(price) : 0;
  const salePriceNum = salePrice ? Number(salePrice) : null;
  const isOnSale = salePriceNum !== null && salePriceNum < basePrice;
  const defaultDisplayPrice = isOnSale && salePriceNum !== null ? salePriceNum : basePrice;

  const hasVariations = variations.length > 0;

  // Collect unique option keys across all variations
  const optionKeys = hasVariations
    ? Array.from(new Set(variations.flatMap((v) => Object.keys(v.options as Record<string, string>))))
    : [];

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    optionKeys.forEach((k) => { init[k] = ''; });
    return init;
  });

  const matchedVariation = hasVariations
    ? variations.find((v) => {
        const opts = v.options as Record<string, string>;
        return optionKeys.every((k) => !selectedOptions[k] || opts[k] === selectedOptions[k]);
      }) ?? null
    : null;

  const displayPrice = matchedVariation
    ? Number(matchedVariation.price)
    : defaultDisplayPrice;

  const displayStock = matchedVariation
    ? matchedVariation.stock
    : stock !== undefined && stock !== null ? Number(stock) : null;

  const isOutOfStock = displayStock !== null && displayStock !== undefined && displayStock <= 0;

  const cartItem: { productId: string; name: string; price: number; image?: string; variantId?: string; variantName?: string; sku?: string } = {
    productId: post.id,
    name: post.title,
    price: displayPrice,
  };
  if (images) cartItem.image = images;
  if (matchedVariation) {
    cartItem.variantId = matchedVariation.id;
    cartItem.variantName = matchedVariation.name;
    if (matchedVariation.sku) cartItem.sku = matchedVariation.sku;
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image */}
          <div>
            {images ? (
              <div className="relative w-full aspect-square rounded-xl overflow-hidden">
                <Image
                  src={images}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 500px"
                  priority
                />
              </div>
            ) : (
              <div className="w-full aspect-square bg-muted rounded-xl flex items-center justify-center text-6xl text-muted-foreground">
                
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold">{post.title}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold">₪{displayPrice.toFixed(2)}</span>
              {!matchedVariation && isOnSale && (
                <span className="text-xl text-muted-foreground line-through">
                  ₪{basePrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Stock */}
            {displayStock !== null && displayStock !== undefined && (
              <p className={`text-sm ${isOutOfStock ? 'text-destructive' : 'text-muted-foreground'}`}>
                {isOutOfStock ? 'אזל מהמלאי' : `במלאי: ${displayStock} יחידות`}
              </p>
            )}

            {/* Variation selectors */}
            {hasVariations && optionKeys.map((key) => {
              const values = Array.from(
                new Set(variations.map((v) => (v.options as Record<string, string>)[key]).filter(Boolean))
              );
              return (
                <div key={key} className="space-y-2">
                  <p className="text-sm font-medium capitalize">{key}</p>
                  <div className="flex flex-wrap gap-2">
                    {values.map((val) => {
                      const isSelected = selectedOptions[key] === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() =>
                            setSelectedOptions((prev) => Object.assign({}, prev, { [key]: isSelected ? '' : val }))
                          }
                          className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                            isSelected
                              ? 'border-foreground bg-foreground text-background'
                              : 'border-border hover:border-foreground'
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Description */}
            {description && (
              <div
                className="prose prose-neutral max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            )}

            {/* Categories & Tags */}
            {(categories.length > 0 || tags.length > 0) && (
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {categories.map((c) => (
                  <a key={c.id} href={`/shop?category=${c.slug}`} className="border border-border rounded px-2 py-0.5 hover:border-foreground transition-colors">
                    {c.name}
                  </a>
                ))}
                {tags.map((t) => (
                  <span key={t.id} className="bg-muted rounded px-2 py-0.5"># {t.name}</span>
                ))}
              </div>
            )}

            {/* Add to cart */}
            <div className="max-w-xs">
              <AddToCartButton item={cartItem} disabled={isOutOfStock} />
            </div>
          </div>
        </div>
    </div>
  );
}
