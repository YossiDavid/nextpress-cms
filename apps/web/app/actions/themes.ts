'use server';

import { prisma } from '@nextpress/db';
import { revalidatePath } from 'next/cache';

export async function setActiveTheme(themeId: string): Promise<void> {
  await prisma.option.upsert({
    where: { key: 'active_theme' },
    update: { value: themeId },
    create: { key: 'active_theme', value: themeId, autoload: true },
  });
  revalidatePath('/admin/settings');
  revalidatePath('/');
}

export async function saveThemeSettings(
  themeId: string,
  settings: Record<string, string>,
): Promise<void> {
  await Promise.all(
    Object.entries(settings).map(([key, value]) => {
      const optionKey = `theme_${themeId}_${key}`;
      return prisma.option.upsert({
        where: { key: optionKey },
        update: { value },
        create: { key: optionKey, value, autoload: false },
      });
    }),
  );
  revalidatePath('/admin/settings');
  revalidatePath('/');
}
