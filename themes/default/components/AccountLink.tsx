'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export function AccountLink() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <div className="w-16 h-4 bg-muted rounded animate-pulse" />;

  if (!session) {
    return (
      <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        כניסה
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/account" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        {session.user?.name ?? session.user?.email}
      </Link>
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        יציאה
      </button>
    </div>
  );
}
