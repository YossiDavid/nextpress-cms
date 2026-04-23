'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@nextpress/db';
import { auth } from '@/auth';

export async function createShippingMethod(formData: FormData) {
  const session = await auth();
  if (!session) redirect('/admin/login');

  const freeAboveStr = formData.get('freeAbove') as string;

  await prisma.shippingMethod.create({
    data: {
      name: (formData.get('name') as string).trim(),
      description: (formData.get('description') as string)?.trim() || null,
      cost: Number(formData.get('cost')),
      freeAbove: freeAboveStr ? Number(freeAboveStr) : null,
      order: Number(formData.get('order') ?? 0),
    },
  });
  revalidatePath('/admin/shipping');
}

export async function toggleShippingMethod(id: string, active: boolean) {
  const session = await auth();
  if (!session) redirect('/admin/login');

  await prisma.shippingMethod.update({ where: { id }, data: { active } });
  revalidatePath('/admin/shipping');
}

export async function deleteShippingMethod(id: string) {
  const session = await auth();
  if (!session) redirect('/admin/login');

  await prisma.shippingMethod.delete({ where: { id } });
  revalidatePath('/admin/shipping');
}

export async function saveTaxRate(formData: FormData) {
  const session = await auth();
  if (!session) redirect('/admin/login');

  const rate = Number(formData.get('taxRate'));
  if (isNaN(rate) || rate < 0 || rate > 100) return;

  await prisma.option.upsert({
    where: { key: 'tax_rate' },
    update: { value: String(rate) },
    create: { key: 'tax_rate', value: String(rate), autoload: true },
  });
  revalidatePath('/admin/shipping');
  revalidatePath('/checkout');
}
