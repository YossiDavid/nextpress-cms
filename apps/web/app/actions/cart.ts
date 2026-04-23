'use server';

import { revalidatePath } from 'next/cache';
import { getCart, saveCart, calculateCart } from '@/lib/cart';
import { hooks } from '@nextpress/core';
import type { CartItem } from '@nextpress/types';

export async function addToCart(item: Omit<CartItem, 'quantity'> & { quantity?: number }) {
  const cart = await getCart();
  const qty = item.quantity ?? 1;
  const existing = cart.items.find(
    (i) => i.productId === item.productId && i.variantId === item.variantId
  );

  if (existing) {
    existing.quantity += qty;
  } else {
    cart.items.push({ ...item, quantity: qty });
  }

  const updated = calculateCart(cart.items, cart.discount);
  await saveCart(updated);
  await hooks.doAction('cart.updated', updated);
  revalidatePath('/cart');
}

export async function removeFromCart(productId: string) {
  const cart = await getCart();
  const items = cart.items.filter((i) => i.productId !== productId);
  const updated = calculateCart(items, cart.discount);
  await saveCart(updated);
  await hooks.doAction('cart.updated', updated);
  revalidatePath('/cart');
}

export async function updateQuantity(productId: string, quantity: number) {
  const cart = await getCart();
  if (quantity <= 0) {
    cart.items = cart.items.filter((i) => i.productId !== productId);
  } else {
    const item = cart.items.find((i) => i.productId === productId);
    if (item) item.quantity = quantity;
  }
  const updated = calculateCart(cart.items, cart.discount);
  await saveCart(updated);
  await hooks.doAction('cart.updated', updated);
  revalidatePath('/cart');
}

export async function clearCart() {
  await saveCart({ items: [], subtotal: 0, discount: 0, total: 0 });
  revalidatePath('/cart');
}
