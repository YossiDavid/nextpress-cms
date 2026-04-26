'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';

type Profile = { name: string | null; role: string };

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

export function AccountLink() {
  const router = useRouter();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const supabase = getSupabase();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) { setProfile(null); return; }
    fetch('/api/v1/me')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setProfile(data?.data ?? null))
      .catch(() => setProfile(null));
  }, [user]);

  if (user === undefined) return <div className="w-16 h-4 bg-muted rounded animate-pulse" />;

  if (!user) {
    return (
      <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        כניסה
      </Link>
    );
  }

  const isAdmin = profile?.role === 'ADMIN';

  async function handleSignOut() {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    router.push('/');
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/account" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        {profile?.name ?? user.email}
      </Link>
      {isAdmin && (
        <Link href="/admin" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          ניהול
        </Link>
      )}
      <button
        onClick={handleSignOut}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        יציאה
      </button>
    </div>
  );
}
