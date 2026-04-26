'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@nextpress/db';
import { getSession } from '@/lib/auth-session';
import { randomBytes } from 'node:crypto';

async function requireAdmin() {
  const session = await getSession();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
}

export async function createApiKey(name: string): Promise<{ key: string }> {
  await requireAdmin();
  const key = `np_${randomBytes(24).toString('hex')}`;
  await prisma.apiKey.create({ data: { name, key } });
  revalidatePath('/admin/api-keys');
  return { key };
}

export async function deleteApiKey(id: string): Promise<void> {
  await requireAdmin();
  await prisma.apiKey.delete({ where: { id } });
  revalidatePath('/admin/api-keys');
}
