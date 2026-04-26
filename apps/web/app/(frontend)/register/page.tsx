'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { register } from '@/app/actions/account';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/frontend/ui/card';
import { Input } from '@/components/frontend/ui/input';
import { Label } from '@/components/frontend/ui/label';
import { Button } from '@/components/frontend/ui/button';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fd = new FormData(e.currentTarget);
    const result = await register(fd);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    // Auto-login after registration
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: fd.get('email') as string,
      password: fd.get('password') as string,
    });
    if (authError) { setError('ההרשמה הצליחה אך ההתחברות נכשלה. נסה להתחבר ידנית.'); setLoading(false); return; }
    router.push('/account');
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">הרשמה</CardTitle>
          <CardDescription>צור חשבון חדש</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">שם מלא</Label>
              <Input id="name" name="name" required placeholder="ישראל ישראלי" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
              <Input id="email" name="email" type="email" required dir="ltr" placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <Input id="password" name="password" type="password" required dir="ltr" placeholder="לפחות 6 תווים" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'נרשם...' : 'הרשמה'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              כבר יש לך חשבון?{' '}
              <Link href="/login" className="text-foreground underline-offset-4 hover:underline">התחבר</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
