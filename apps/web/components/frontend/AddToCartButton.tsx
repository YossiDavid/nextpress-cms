'use client';

import { useTransition } from 'react';
import { addToCart } from '@/app/actions/cart';
import type { CartItem } from '@nextpress/types';

interface Props {
  item: Omit<CartItem, 'quantity'>;
  label?: string;
  disabled?: boolean;
}

export function AddToCartButton({ item, label = 'הוסף לעגלה', disabled }: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => addToCart(item))}
      disabled={isPending || disabled}
      className="w-full bg-foreground text-background py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? 'מוסיף...' : disabled ? 'אזל מהמלאי' : label}
    </button>
  );
}
