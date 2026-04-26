import { createClient } from '@/lib/supabase/server';
import { prisma } from '@nextpress/db';
import type { UserRole } from '@nextpress/db';

export type AppSession = {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
  };
};

export async function getSession(): Promise<AppSession | null> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!dbUser) return null;

  return { user: dbUser };
}
