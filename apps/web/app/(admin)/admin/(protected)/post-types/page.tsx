import { prisma } from '@nextpress/db';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default async function PostTypesPage() {
  const postTypes = await prisma.postType.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">סוגי תוכן</h1>
          <p className="text-muted-foreground text-sm mt-1">ניהול סוגי התוכן במערכת</p>
        </div>
        <Button asChild>
          <Link href="/admin/post-types/new">+ סוג תוכן חדש</Link>
        </Button>
      </div>
      <div className="grid gap-3">
        {postTypes.map((pt) => (
          <Link key={pt.id} href={`/admin/post-types/${pt.slug}`}>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{pt.icon ?? '📄'}</span>
                  <div>
                    <p className="font-medium">{pt.name}</p>
                    {pt.description && <p className="text-xs text-muted-foreground">{pt.description}</p>}
                  </div>
                </div>
                <Badge variant="secondary">{pt._count.posts} פריטים</Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
        {postTypes.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">אין סוגי תוכן עדיין</p>
              <Button asChild variant="outline">
                <Link href="/admin/post-types/new">צור את הראשון</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
