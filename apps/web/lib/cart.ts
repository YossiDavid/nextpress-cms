import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import type { Cart, CartItem } from '@nextpress/types';

const SESSION_OPTIONS = {
  password: process.env['AUTH_SECRET'] ?? 'dev-secret-min-32-chars-long-here!!',
  cookieName: 'nextpress-cart',
  cookieOptions: {
    secure: process.env['NODE_ENV'] === 'production',
  },
};

export async function getCart(): Promise<Cart> {
  const cookieStore = await cookies();
  const session = await getIronSession<{ cart?: Cart }>(cookieStore, SESSION_OPTIONS);
  return session.cart ?? { items: [], couponCode: undefined, subtotal: 0, discount: 0, total: 0 };
}

export async function saveCart(cart: Cart): Promise<void> {
  const cookieStore = await cookies();
  const session = await getIronSession<{ cart?: Cart }>(cookieStore, SESSION_OPTIONS);
  session.cart = cart;
  await session.save();
}

export function calculateCart(items: CartItem[], discount = 0): Cart {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = Math.max(0, subtotal - discount);
  return { items, subtotal, discount, total };
}
