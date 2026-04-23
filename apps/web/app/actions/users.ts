'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@nextpress/db';
import { auth } from '@/auth';

async function requireAdmin() {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
}

export async function updateUserRole(userId: string, role: 'ADMIN' | 'EDITOR' | 'VIEWER') {
  await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath('/admin/users');
}

export async function deleteUser(userId: string) {
  await requireAdmin();
  const session = await auth();
  const currentId = (session?.user as { id?: string } | undefined)?.id;
  if (userId === currentId) throw new Error('Cannot delete your own account');
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath('/admin/users');
}
