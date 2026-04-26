'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

function ResetPasswordForm() {
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError('הסיסמאות אינן תואמות'); return; }
    if (password.length < 8) { setError('הסיסמה חייבת להכיל לפחות 8 תווים'); return; }
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error: authError } = await supabase.auth.updateUser({ password });
    if (authError) {
      setError('הקישור אינו תקף או פג תוקפו');
      setLoading(false);
    } else {
      router.push('/login?reset=1');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="סיסמה חדשה (לפחות 8 תווים)"
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <input
        type="password"
        required
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="אמת סיסמה"
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-foreground text-background py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? 'מאפס...' : 'אפס סיסמה'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">איפוס סיסמה</h1>
          <p className="text-sm text-muted-foreground">בחר סיסמה חדשה לחשבונך</p>
        </div>
        <Suspense fallback={<p className="text-center text-sm text-muted-foreground">טוען...</p>}>
          <ResetPasswordForm />
        </Suspense>
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="hover:underline">חזרה להתחברות</Link>
        </p>
      </div>
    </main>
  );
}
