'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/frontend/ui/card';
import { Input } from '@/components/frontend/ui/input';
import { Label } from '@/components/frontend/ui/label';
import { Button } from '@/components/frontend/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fd = new FormData(e.currentTarget);
    const result = await signIn('credentials', {
      email: fd.get('email'),
      password: fd.get('password'),
      redirect: false,
    });
    if (result?.error) {
      setError('אימייל או סיסמה שגויים');
      setLoading(false);
    } else {
      router.push('/account');
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">כניסה</CardTitle>
          <CardDescription>התחבר לחשבונך</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
              <Input id="email" name="email" type="email" required dir="ltr" placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <Input id="password" name="password" type="password" required dir="ltr" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'מתחבר...' : 'כניסה'}
            </Button>
            <div className="flex justify-between text-sm text-muted-foreground">
              <Link href="/forgot-password" className="hover:underline">שכחת סיסמה?</Link>
              <span>
                אין לך חשבון?{' '}
                <Link href="/register" className="text-foreground underline-offset-4 hover:underline">הרשמה</Link>
              </span>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
