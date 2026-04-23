'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@nextpress/db';
import { auth } from '@/auth';

export async function togglePlugin(pluginId: string, active: boolean) {
  const session = await auth();
  if (!session) redirect('/admin/login');

  await prisma.option.upsert({
    where: { key: `plugin_active_${pluginId}` },
    create: { key: `plugin_active_${pluginId}`, value: active ? 'true' : 'false' },
    update: { value: active ? 'true' : 'false' },
  });

  revalidatePath('/admin/plugins');
}
