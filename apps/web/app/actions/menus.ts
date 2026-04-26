'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@nextpress/db';
import { getSession } from '@/lib/auth-session';

export async function createMenu(formData: FormData) {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;

  await prisma.menu.create({ data: { name, slug } });
  revalidatePath('/admin/menus');
}

export async function deleteMenu(id: string) {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  await prisma.menu.delete({ where: { id } });
  revalidatePath('/admin/menus');
}

export async function addMenuItem(menuId: string, formData: FormData) {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  const label = formData.get('label') as string;
  const url = (formData.get('url') as string) || undefined;

  const existing = await prisma.menuItem.findMany({ where: { menuId }, orderBy: { order: 'asc' } });
  const maxOrder = existing.length > 0 ? Math.max(...existing.map((i) => i.order)) : -1;

  await prisma.menuItem.create({
    data: { menuId, label, url, order: maxOrder + 1 },
  });

  revalidatePath('/admin/menus');
  revalidatePath(`/admin/menus/${menuId}`);
}

export async function deleteMenuItem(itemId: string) {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  const item = await prisma.menuItem.delete({ where: { id: itemId } });
  revalidatePath('/admin/menus');
  revalidatePath(`/admin/menus/${item.menuId}`);
}
