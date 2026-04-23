'use client';

import { useState, useTransition } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TaxItem { id: string; name: string; slug: string }

interface Props {
  productId: string;
  allCategories: TaxItem[];
  allTags: TaxItem[];
  selectedCategoryIds: string[];
  selectedTagIds: string[];
}

export function ProductTaxonomySelector({
  productId,
  allCategories,
  allTags,
  selectedCategoryIds: initCats,
  selectedTagIds: initTags,
}: Props) {
  const [catIds, setCatIds] = useState<string[]>(initCats);
  const [tagIds, setTagIds] = useState<string[]>(initTags);
  const [isPending, startTransition] = useTransition();

  const toggle = (
    id: string,
    current: string[],
    setter: (v: string[]) => void,
    endpoint: string,
    payloadKey: string
  ) => {
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    setter(next);
    startTransition(async () => {
      await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [payloadKey]: next }),
      });
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Categories */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">קטגוריות</CardTitle>
        </CardHeader>
        <CardContent>
          {allCategories.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              אין קטגוריות. <a href="/admin/product-categories" className="underline">הוסף קטגוריות</a>.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {allCategories.map((cat) => {
                const selected = catIds.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      toggle(
                        cat.id, catIds, setCatIds,
                        `/api/v1/products/${productId}/categories`,
                        'categoryIds'
                      )
                    }
                    className="focus:outline-none"
                  >
                    <Badge variant={selected ? 'default' : 'outline'} className="cursor-pointer">
                      {cat.name}
                    </Badge>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">תגיות</CardTitle>
        </CardHeader>
        <CardContent>
          {allTags.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              אין תגיות. <a href="/admin/product-tags" className="underline">הוסף תגיות</a>.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => {
                const selected = tagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      toggle(
                        tag.id, tagIds, setTagIds,
                        `/api/v1/products/${productId}/tags`,
                        'tagIds'
                      )
                    }
                    className="focus:outline-none"
                  >
                    <Badge variant={selected ? 'default' : 'outline'} className="cursor-pointer">
                      {tag.name}
                    </Badge>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
