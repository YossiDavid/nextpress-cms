'use client';

import { useState } from 'react';
import Link from 'next/link';
import { requestPasswordReset } from '@/app/actions/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await requestPasswordReset(email);
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center space-y-4">
          <p className="text-4xl">📧</p>
          <h1 className="text-xl font-semibold">בדוק את תיבת הדואר</h1>
          <p className="text-sm text-muted-foreground">
            אם הכתובת קיימת במערכת, שלחנו קישור לאיפוס סיסמה.
          </p>
          <Link href="/login" className="text-sm text-primary hover:underline">
            חזרה להתחברות
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">שכחת סיסמה?</h1>
          <p className="text-sm text-muted-foreground">נשלח לך קישור לאיפוס</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="כתובת אימייל"
            dir="ltr"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-foreground text-background py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'שולח...' : 'שלח קישור לאיפוס'}
          </button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="hover:underline">חזרה להתחברות</Link>
        </p>
      </div>
    </main>
  );
}
