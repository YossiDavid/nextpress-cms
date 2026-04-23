'use client';

import { useTransition } from 'react';
import { addToCart } from '@/app/actions/cart';
import type { CartItem } from '@nextpress/types';

interface Props {
  item: Omit<CartItem, 'quantity'>;
  label?: string;
}

export function AddToCart({ item, label = 'הוסף לעגלה' }: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => addToCart(item))}
      disabled={isPending}
      className="w-full bg-foreground text-background py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? 'מוסיף...' : label}
    </button>
  );
}
