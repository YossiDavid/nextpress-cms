'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { updateProfile, changePassword } from '@/app/actions/account';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/frontend/ui/card';
import { Input } from '@/components/frontend/ui/input';
import { Label } from '@/components/frontend/ui/label';
import { Button } from '@/components/frontend/ui/button';
import { Separator } from '@/components/frontend/ui/separator';

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [profileMsg, setProfileMsg] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  async function handleProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg('');
    await updateProfile(new FormData(e.currentTarget));
    await update();
    setProfileMsg('הפרטים עודכנו!');
    setProfileLoading(false);
  }

  async function handlePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPwLoading(true);
    setPwMsg('');
    const result = await changePassword(new FormData(e.currentTarget));
    setPwMsg(result?.error ?? 'הסיסמה שונתה!');
    setPwLoading(false);
    if (!result?.error) (e.target as HTMLFormElement).reset();
  }

  return (
    <main className="min-h-screen py-12 px-6">
      <div className="max-w-lg mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/account" className="text-muted-foreground hover:text-foreground text-sm">← חזרה</Link>
          <h1 className="text-2xl font-bold">פרטים אישיים</h1>
        </div>

        {/* Profile */}
        <Card>
          <CardHeader><CardTitle className="text-base">פרטי חשבון</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">שם מלא</Label>
                <Input id="name" name="name" defaultValue={session?.user?.name ?? ''} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-display">אימייל</Label>
                <Input id="email-display" value={session?.user?.email ?? ''} disabled dir="ltr" className="opacity-60" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">טלפון</Label>
                <Input id="phone" name="phone" type="tel" dir="ltr" placeholder="050-0000000" />
              </div>
              {profileMsg && <p className="text-sm text-green-500">{profileMsg}</p>}
              <Button type="submit" disabled={profileLoading}>{profileLoading ? 'שומר...' : 'שמור שינויים'}</Button>
            </form>
          </CardContent>
        </Card>

        <Separator />

        {/* Password */}
        <Card>
          <CardHeader><CardTitle className="text-base">שינוי סיסמה</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handlePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current">סיסמה נוכחית</Label>
                <Input id="current" name="current" type="password" required dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="next">סיסמה חדשה</Label>
                <Input id="next" name="next" type="password" required dir="ltr" placeholder="לפחות 6 תווים" />
              </div>
              {pwMsg && (
                <p className={`text-sm ${pwMsg.includes('שגויה') || pwMsg.includes('מלא') ? 'text-destructive' : 'text-green-500'}`}>
                  {pwMsg}
                </p>
              )}
              <Button type="submit" variant="outline" disabled={pwLoading}>{pwLoading ? 'שומר...' : 'שנה סיסמה'}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
