'use server';

import { prisma } from '@nextpress/db';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

export async function register(formData: FormData) {
  const name = (formData.get('name') as string).trim();
  const email = (formData.get('email') as string).trim().toLowerCase();
  const password = formData.get('password') as string;

  if (!name || !email || !password || password.length < 6) {
    return { error: 'נא למלא את כל השדות (סיסמה לפחות 6 תווים)' };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: 'כתובת האימייל כבר רשומה' };

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email, name, passwordHash, role: 'CUSTOMER' },
    });
    // Link or create Customer record
    const existingCustomer = await tx.customer.findUnique({ where: { email } });
    if (existingCustomer) {
      await tx.customer.update({ where: { email }, data: { userId: user.id, name } });
    } else {
      await tx.customer.create({ data: { email, name, userId: user.id } });
    }
  });

  return { success: true };
}

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) redirect('/login');

  const name = (formData.get('name') as string).trim();
  const phone = (formData.get('phone') as string | null)?.trim() || null;

  await prisma.user.update({
    where: { email: session.user.email },
    data: { name },
  });
  await prisma.customer.update({
    where: { email: session.user.email },
    data: { name, ...(phone !== null ? { phone } : {}) },
  });
}

export async function changePassword(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) redirect('/login');

  const current = formData.get('current') as string;
  const next = formData.get('next') as string;
  if (!current || !next || next.length < 6) return { error: 'נא למלא את כל השדות' };

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user?.passwordHash) return { error: 'שגיאה' };

  const valid = await bcrypt.compare(current, user.passwordHash);
  if (!valid) return { error: 'הסיסמה הנוכחית שגויה' };

  await prisma.user.update({
    where: { email: session.user.email },
    data: { passwordHash: await bcrypt.hash(next, 12) },
  });
  return { success: true };
}
