'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@nextpress/db';
import { auth } from '@/auth';
import { getCart, saveCart, calculateCart } from '@/lib/cart';

export async function applyCoupon(formData: FormData) {
  const code = (formData.get('couponCode') as string)?.trim().toUpperCase();
  if (!code) return;

  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon || !coupon.active) return;
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return;
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return;

  const cart = await getCart();
  let discount = 0;

  if (coupon.type === 'PERCENT') {
    discount = (cart.subtotal * Number(coupon.amount)) / 100;
  } else if (coupon.type === 'FIXED') {
    discount = Math.min(Number(coupon.amount), cart.subtotal);
  }

  await saveCart({ ...calculateCart(cart.items, discount), couponCode: code });
  revalidatePath('/cart');
}

export async function removeCoupon() {
  const cart = await getCart();
  await saveCart(calculateCart(cart.items, 0));
  revalidatePath('/cart');
}

export async function createCoupon(formData: FormData) {
  const session = await auth();
  if (!session) redirect('/admin/login');

  const type = formData.get('type') as 'PERCENT' | 'FIXED' | 'FREE_SHIPPING';
  const expiresAtStr = formData.get('expiresAt') as string;

  await prisma.coupon.create({
    data: {
      code: (formData.get('code') as string).trim().toUpperCase(),
      type,
      amount: Number(formData.get('amount')),
      usageLimit: formData.get('usageLimit') ? Number(formData.get('usageLimit')) : null,
      expiresAt: expiresAtStr ? new Date(expiresAtStr) : null,
      active: true,
    },
  });

  revalidatePath('/admin/coupons');
}

export async function toggleCoupon(id: string, active: boolean) {
  const session = await auth();
  if (!session) redirect('/admin/login');

  await prisma.coupon.update({ where: { id }, data: { active } });
  revalidatePath('/admin/coupons');
}

export async function deleteCoupon(id: string) {
  const session = await auth();
  if (!session) redirect('/admin/login');

  await prisma.coupon.delete({ where: { id } });
  revalidatePath('/admin/coupons');
}
