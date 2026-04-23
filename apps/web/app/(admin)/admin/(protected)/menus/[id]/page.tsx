import { prisma } from '@nextpress/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { addMenuItem, deleteMenuItem } from '@/app/actions/menus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Props { params: Promise<{ id: string }>; }

export default async function MenuDetailPage({ params }: Props) {
  const { id } = await params;
  const menu = await prisma.menu.findUnique({
    where: { id },
    include: { items: { orderBy: { order: 'asc' } } },
  });
  if (!menu) notFound();

  const addMenuItemForMenu = addMenuItem.bind(null, menu.id);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/menus">→ חזרה</Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{menu.name}</h1>
          <p className="text-muted-foreground text-xs font-mono" dir="ltr">{menu.slug}</p>
        </div>
      </div>

      {menu.items.length > 0 ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">תווית</TableHead>
                <TableHead className="text-right">כתובת URL</TableHead>
                <TableHead className="text-right">סדר</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menu.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.label}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground" dir="ltr">{item.url ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{item.order}</TableCell>
                  <TableCell>
                    <form action={deleteMenuItem.bind(null, item.id)}>
                      <Button type="submit" variant="ghost" size="sm" className="text-destructive hover:text-destructive">מחק</Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">אין פריטים עדיין — הוסף פריט למטה</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>הוסף פריט</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addMenuItemForMenu} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="label">תווית</Label>
                <Input id="label" name="label" required placeholder="בית" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="url">כתובת URL</Label>
                <Input id="url" name="url" placeholder="/" dir="ltr" />
              </div>
            </div>
            <Button type="submit">הוסף פריט</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
