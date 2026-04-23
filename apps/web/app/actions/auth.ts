'use server';

import { prisma } from '@nextpress/db';
import { randomBytes } from 'node:crypto';
import { sendEmail } from '@nextpress/email';
import bcrypt from 'bcryptjs';

export async function requestPasswordReset(email: string): Promise<{ success: boolean }> {
  // Always return success to avoid email enumeration
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { success: true };

  // Invalidate previous tokens
  await prisma.passwordResetToken.deleteMany({ where: { email } });

  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({ data: { token, email, expiresAt } });

  const siteTitle = (await prisma.option.findUnique({ where: { key: 'site_title' } }))?.value ?? 'NextPress';
  const baseUrl = process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000';
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: `איפוס סיסמה — ${siteTitle}`,
    html: `<p>לחץ על הקישור לאיפוס הסיסמה (בתוקף שעה אחת):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    text: `איפוס סיסמה:\n${resetUrl}\n\nהקישור בתוקף שעה אחת.`,
  });

  return { success: true };
}

export async function resetPassword(
  token: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  if (newPassword.length < 8) return { success: false, error: 'הסיסמה חייבת להכיל לפחות 8 תווים' };

  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!record || record.expiresAt < new Date()) {
    return { success: false, error: 'הקישור אינו תקף או פג תוקפו' };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { email: record.email }, data: { passwordHash } });
  await prisma.passwordResetToken.delete({ where: { token } });

  return { success: true };
}
