import Link from 'next/link';
import { createPostType } from '@/app/actions/post-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function NewPostTypePage() {
  return (
    <div className="p-6 space-y-6 max-w-xl">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/post-types">→ חזרה</Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">סוג תוכן חדש</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>פרטי סוג התוכן</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createPostType} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">שם</Label>
              <Input id="name" name="name" required placeholder="מאמרים" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="slug">מזהה (slug)</Label>
              <Input id="slug" name="slug" required placeholder="article" dir="ltr" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">תיאור</Label>
              <Input id="description" name="description" placeholder="תיאור קצר..." />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="icon">אייקון (אמוג&apos;י)</Label>
              <Input id="icon" name="icon" placeholder="📄" className="w-24 text-center text-xl" />
            </div>

            <div className="flex items-center gap-2">
              <input id="hasArchive" name="hasArchive" type="checkbox" defaultChecked className="h-4 w-4" />
              <Label htmlFor="hasArchive">עמוד ארכיון</Label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit">צור סוג תוכן</Button>
              <Button asChild variant="outline">
                <Link href="/admin/post-types">ביטול</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
