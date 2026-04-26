import { prisma } from '@nextpress/db';
import Link from 'next/link';
import { createMenu, deleteMenu } from '@/app/actions/menus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/ui/card';
import { Button } from '@/components/admin/ui/button';
import { Input } from '@/components/admin/ui/input';
import { Label } from '@/components/admin/ui/label';
import { Badge } from '@/components/admin/ui/badge';

export default async function MenusPage() {
  const menus = await prisma.menu.findMany({
    include: { _count: { select: { items: true } } },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">תפריטים</h1>
        <p className="text-muted-foreground text-sm mt-1">ניהול תפריטי הניווט</p>
      </div>

      <div className="grid gap-3">
        {menus.map((menu) => (
          <Card key={menu.id} className="hover:bg-accent/50 transition-colors">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{menu.name}</p>
                <p className="text-xs text-muted-foreground font-mono" dir="ltr">{menu.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{menu._count.items} פריטים</Badge>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/menus/${menu.id}`}>עריכה</Link>
                </Button>
                <form action={deleteMenu.bind(null, menu.id)}>
                  <Button type="submit" variant="ghost" size="sm" className="text-destructive hover:text-destructive">מחק</Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
        {menus.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">אין תפריטים עדיין</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>תפריט חדש</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createMenu} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">שם התפריט</Label>
                <Input id="name" name="name" required placeholder="תפריט ראשי" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="slug">מזהה (slug)</Label>
                <Input id="slug" name="slug" required placeholder="main" dir="ltr" />
              </div>
            </div>
            <Button type="submit">צור תפריט</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
