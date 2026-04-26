'use server';

import { prisma } from '@nextpress/db';
import { getSession } from '@/lib/auth-session';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

// Admin Supabase client (service role) for user creation
function createAdminClient() {
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function register(formData: FormData) {
  const name = (formData.get('name') as string).trim();
  const email = (formData.get('email') as string).trim().toLowerCase();
  const password = formData.get('password') as string;

  if (!name || !email || !password || password.length < 6) {
    return { error: 'נא למלא את כל השדות (סיסמה לפחות 6 תווים)' };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: 'כתובת האימייל כבר רשומה' };

  const supabaseAdmin = createAdminClient();
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authData?.user) {
    return { error: 'שגיאה ביצירת החשבון' };
  }

  const uuid = authData.user.id;

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { id: uuid, email, name, role: 'CUSTOMER' },
    });
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
  const session = await getSession();
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
  const session = await getSession();
  if (!session?.user?.email) redirect('/login');

  const next = formData.get('next') as string;
  if (!next || next.length < 6) return { error: 'נא למלא את כל השדות' };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: next });
  if (error) return { error: 'שגיאה בעדכון הסיסמה' };

  return { success: true };
}
