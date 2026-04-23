import { prisma } from '@nextpress/db';
import { auth } from '@/auth';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { RevenueChart } from '@/components/admin/RevenueChart';

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDING: 'outline', PROCESSING: 'secondary', COMPLETED: 'default',
  CANCELLED: 'destructive', REFUNDED: 'secondary', FAILED: 'destructive',
};
const STATUS_LABELS: Record<string, string> = {
  PENDING: 'ממתין', PROCESSING: 'בעיבוד', COMPLETED: 'הושלם',
  CANCELLED: 'בוטל', REFUNDED: 'הוחזר', FAILED: 'נכשל',
};

function fmt(n: number) { return `₪${n.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }

export default async function DashboardPage() {
  const session = await auth();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

  const [
    postsCount,
    productsCount,
    ordersCount,
    customersCount,
    allTimeRevenue,
    monthRevenue,
    recentOrders,
    ordersByStatus,
    last30Orders,
    topProducts,
  ] = await Promise.all([
    prisma.post.count({ where: { postType: { slug: 'post' }, status: 'PUBLISHED' } }),
    prisma.post.count({ where: { postType: { slug: 'product' }, status: 'PUBLISHED' } }),
    prisma.order.count({ where: { status: { notIn: ['CANCELLED', 'FAILED'] } } }),
    prisma.customer.count(),
    prisma.order.aggregate({
      where: { status: { notIn: ['CANCELLED', 'REFUNDED', 'FAILED'] } },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: { createdAt: { gte: startOfMonth }, status: { notIn: ['CANCELLED', 'REFUNDED', 'FAILED'] } },
      _sum: { total: true },
    }),
    prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: { items: { select: { name: true, quantity: true }, take: 1 } },
    }),
    prisma.order.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo }, status: { notIn: ['CANCELLED', 'FAILED'] } },
      select: { createdAt: true, total: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.orderItem.groupBy({
      by: ['name', 'productId'],
      _sum: { total: true, quantity: true },
      orderBy: { _sum: { total: 'desc' } },
      take: 5,
    }),
  ]);

  // Build 30-day revenue buckets
  const buckets: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo);
    d.setDate(d.getDate() + i);
    const key = `${d.getMonth() + 1}/${d.getDate()}`;
    buckets[key] = 0;
  }
  for (const o of last30Orders) {
    const d = new Date(o.createdAt);
    const key = `${d.getMonth() + 1}/${d.getDate()}`;
    if (key in buckets) buckets[key] += Number(o.total);
  }
  const chartData = Object.entries(buckets).map(([date, revenue]) => ({ date, revenue }));

  const totalRevenue = Number(allTimeRevenue._sum.total ?? 0);
  const monthlyRevenue = Number(monthRevenue._sum.total ?? 0);
  const avgOrder = ordersCount > 0 ? totalRevenue / ordersCount : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">שלום, {session?.user?.name ?? 'מנהל'}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">סקירת המערכת</p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm"><Link href="/admin/post-types/post/new">+ פוסט</Link></Button>
          <Button asChild size="sm" variant="outline"><Link href="/admin/post-types/product/new">+ מוצר</Link></Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'הכנסות (סה"כ)', value: fmt(totalRevenue), sub: 'כל הזמנות', href: '/admin/orders' },
          { label: 'הכנסות החודש', value: fmt(monthlyRevenue), sub: `מתחילת ${now.toLocaleDateString('he-IL', { month: 'long' })}`, href: '/admin/orders' },
          { label: 'ממוצע הזמנה', value: fmt(avgOrder), sub: `${ordersCount} הזמנות`, href: '/admin/orders' },
          { label: 'לקוחות', value: customersCount.toLocaleString(), sub: `${productsCount} מוצרים`, href: '/admin/post-types/product' },
        ].map((kpi) => (
          <Link key={kpi.label} href={kpi.href}>
            <Card className="hover:bg-accent/40 transition-colors cursor-pointer">
              <CardHeader className="pb-1 pt-4 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground">{kpi.label}</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-bold tabular-nums">{kpi.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{kpi.sub}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Revenue chart + Status breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">הכנסות — 30 ימים אחרונים</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={chartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">הזמנות לפי סטטוס</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {ordersByStatus.map((row) => (
              <div key={row.status} className="flex items-center justify-between text-sm">
                <Badge variant={STATUS_VARIANT[row.status] ?? 'outline'} className="text-xs">
                  {STATUS_LABELS[row.status] ?? row.status}
                </Badge>
                <span className="font-medium tabular-nums">{row._count._all}</span>
              </div>
            ))}
            {ordersByStatus.length === 0 && <p className="text-sm text-muted-foreground">אין הזמנות</p>}
          </CardContent>
        </Card>
      </div>

      {/* Top products + Recent orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">מוצרים מובילים</CardTitle>
              <Link href="/admin/post-types/product" className="text-xs text-muted-foreground hover:text-foreground">הכל</Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {topProducts.length === 0
              ? <p className="text-sm text-muted-foreground px-4 pb-4">אין נתונים</p>
              : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right text-xs">מוצר</TableHead>
                      <TableHead className="text-right text-xs">יח׳</TableHead>
                      <TableHead className="text-right text-xs">הכנסה</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topProducts.map((p, i) => (
                      <TableRow key={p.productId}>
                        <TableCell className="text-sm">
                          <span className="text-muted-foreground text-xs ml-1">{i + 1}.</span>
                          {p.name}
                        </TableCell>
                        <TableCell className="text-sm tabular-nums">{p._sum.quantity ?? 0}</TableCell>
                        <TableCell className="text-sm tabular-nums font-medium">{fmt(Number(p._sum.total ?? 0))}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">הזמנות אחרונות</CardTitle>
              <Link href="/admin/orders" className="text-xs text-muted-foreground hover:text-foreground">הכל</Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentOrders.length === 0
              ? <p className="text-sm text-muted-foreground px-4 pb-4">אין הזמנות</p>
              : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right text-xs">#</TableHead>
                      <TableHead className="text-right text-xs">לקוח</TableHead>
                      <TableHead className="text-right text-xs">סכום</TableHead>
                      <TableHead className="text-right text-xs">סטטוס</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {order.orderNumber.slice(-6).toUpperCase()}
                        </TableCell>
                        <TableCell className="text-sm max-w-[120px] truncate">{order.customerName}</TableCell>
                        <TableCell className="text-sm tabular-nums">{fmt(Number(order.total))}</TableCell>
                        <TableCell>
                          <Badge variant={STATUS_VARIANT[order.status] ?? 'outline'} className="text-xs">
                            {STATUS_LABELS[order.status] ?? order.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Content counters */}
      <div className="grid grid-cols-3 gap-4">
        <Link href="/admin/post-types/post">
          <Card className="hover:bg-accent/40 transition-colors cursor-pointer">
            <CardHeader className="pb-1 pt-4 px-4"><CardTitle className="text-xs font-medium text-muted-foreground">פוסטים פורסמו</CardTitle></CardHeader>
            <CardContent className="px-4 pb-4"><div className="text-3xl font-bold">{postsCount}</div></CardContent>
          </Card>
        </Link>
        <Link href="/admin/post-types/product">
          <Card className="hover:bg-accent/40 transition-colors cursor-pointer">
            <CardHeader className="pb-1 pt-4 px-4"><CardTitle className="text-xs font-medium text-muted-foreground">מוצרים פעילים</CardTitle></CardHeader>
            <CardContent className="px-4 pb-4"><div className="text-3xl font-bold">{productsCount}</div></CardContent>
          </Card>
        </Link>
        <Link href="/admin/orders">
          <Card className="hover:bg-accent/40 transition-colors cursor-pointer">
            <CardHeader className="pb-1 pt-4 px-4"><CardTitle className="text-xs font-medium text-muted-foreground">הזמנות</CardTitle></CardHeader>
            <CardContent className="px-4 pb-4"><div className="text-3xl font-bold">{ordersCount}</div></CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
