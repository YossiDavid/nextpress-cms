'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@nextpress/db';
import { auth } from '@/auth';

export async function createPostType(formData: FormData) {
  const session = await auth();
  if (!session) redirect('/admin/login');

  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const description = (formData.get('description') as string) || undefined;
  const icon = (formData.get('icon') as string) || undefined;
  const hasArchive = formData.get('hasArchive') === 'on';

  await prisma.postType.create({
    data: { name, slug, description, icon, hasArchive },
  });

  revalidatePath('/admin/post-types');
  redirect('/admin/post-types');
}

export async function updatePostType(id: string, formData: FormData) {
  const session = await auth();
  if (!session) redirect('/admin/login');

  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const description = (formData.get('description') as string) || undefined;
  const icon = (formData.get('icon') as string) || undefined;
  const hasArchive = formData.get('hasArchive') === 'on';

  await prisma.postType.update({
    where: { id },
    data: { name, slug, description, icon, hasArchive },
  });

  revalidatePath('/admin/post-types');
}

export async function deletePostType(id: string) {
  const session = await auth();
  if (!session) redirect('/admin/login');

  await prisma.postType.delete({ where: { id } });
  revalidatePath('/admin/post-types');
  redirect('/admin/post-types');
}

export async function addField(postTypeId: string, formData: FormData) {
  const session = await auth();
  if (!session) redirect('/admin/login');

  const label = formData.get('label') as string;
  const slug = formData.get('slug') as string;
  const type = formData.get('type') as string;
  const required = formData.get('required') === 'on';

  const existing = await prisma.fieldDefinition.findMany({ where: { postTypeId }, orderBy: { order: 'asc' } });
  const maxOrder = existing.length > 0 ? Math.max(...existing.map((f) => f.order)) : -1;

  await prisma.fieldDefinition.create({
    data: {
      postTypeId,
      label,
      slug,
      type: type as never,
      required,
      order: maxOrder + 1,
    },
  });

  const postType = await prisma.postType.findUnique({ where: { id: postTypeId } });
  if (postType) {
    revalidatePath(`/admin/post-types/${postType.slug}/fields`);
  }
}

export async function updateField(fieldId: string, formData: FormData) {
  const session = await auth();
  if (!session) redirect('/admin/login');

  const label = formData.get('label') as string;
  const slug = formData.get('slug') as string;
  const required = formData.get('required') === 'on';

  const field = await prisma.fieldDefinition.update({
    where: { id: fieldId },
    data: { label, slug, required },
    include: { postType: true },
  });

  revalidatePath(`/admin/post-types/${field.postType.slug}/fields`);
}

export async function deleteField(fieldId: string) {
  const session = await auth();
  if (!session) redirect('/admin/login');

  const field = await prisma.fieldDefinition.delete({
    where: { id: fieldId },
    include: { postType: true },
  });

  revalidatePath(`/admin/post-types/${field.postType.slug}/fields`);
}

export async function reorderFields(postTypeId: string, fieldIds: string[]) {
  const session = await auth();
  if (!session) redirect('/admin/login');

  await Promise.all(
    fieldIds.map((id, index) =>
      prisma.fieldDefinition.update({ where: { id }, data: { order: index } })
    )
  );

  const postType = await prisma.postType.findUnique({ where: { id: postTypeId } });
  if (postType) {
    revalidatePath(`/admin/post-types/${postType.slug}/fields`);
  }
}
