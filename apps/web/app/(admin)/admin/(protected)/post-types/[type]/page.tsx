import { prisma } from '@nextpress/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/admin/ui/button';
import { Badge } from '@/components/admin/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/admin/ui/table';
import { Card, CardContent } from '@/components/admin/ui/card';

interface Props { params: Promise<{ type: string }>; }
const STATUS_LABEL: Record<string, string> = { DRAFT: 'טיוטה', PUBLISHED: 'פורסם', SCHEDULED: 'מתוזמן', TRASH: 'אשפה' };
const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  DRAFT: 'outline', PUBLISHED: 'default', SCHEDULED: 'secondary', TRASH: 'destructive',
};

export default async function PostTypeListPage({ params }: Props) {
  const { type } = await params;
  const postType = await prisma.postType.findUnique({ where: { slug: type } });
  if (!postType) notFound();

  const posts = await prisma.post.findMany({
    where: { postTypeId: postType.id },
    orderBy: { updatedAt: 'desc' },
    include: { author: { select: { name: true } } },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{postType.name}</h1>
          <p className="text-muted-foreground text-sm mt-1">{posts.length} פריטים</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/post-types/${type}/fields`}>ניהול שדות</Link>
          </Button>
          <Button asChild><Link href={`/admin/post-types/${type}/new`}>+ חדש</Link></Button>
        </div>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">אין פריטים עדיין</p>
            <Button asChild variant="outline"><Link href={`/admin/post-types/${type}/new`}>צור את הראשון</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">כותרת</TableHead>
                <TableHead className="text-right">סטטוס</TableHead>
                <TableHead className="text-right">מחבר</TableHead>
                <TableHead className="text-right">עדכון</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell><Badge variant={STATUS_VARIANT[post.status] ?? 'outline'}>{STATUS_LABEL[post.status] ?? post.status}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{post.author?.name ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{new Date(post.updatedAt).toLocaleDateString('he-IL')}</TableCell>
                  <TableCell>
                    <Button asChild variant="ghost" size="sm"><Link href={`/admin/post-types/${type}/${post.id}`}>עריכה</Link></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
