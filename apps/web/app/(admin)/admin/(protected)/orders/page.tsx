import { prisma } from '@nextpress/db';
import { Card, CardContent } from '@/components/admin/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/admin/ui/table';
import { OrderStatusSelect } from '@/components/admin/OrderStatusSelect';

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' } });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">הזמנות</h1>
        <p className="text-muted-foreground text-sm mt-1">{orders.length} הזמנות סה&quot;כ</p>
      </div>

      {orders.length === 0 ? (
        <Card><CardContent className="p-12 text-center"><p className="text-muted-foreground">אין הזמנות עדיין</p></CardContent></Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">מספר הזמנה</TableHead>
                <TableHead className="text-right">לקוח</TableHead>
                <TableHead className="text-right">פריטים</TableHead>
                <TableHead className="text-right">סכום</TableHead>
                <TableHead className="text-right">סטטוס</TableHead>
                <TableHead className="text-right">תאריך</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">#{order.orderNumber.slice(0, 8).toUpperCase()}</TableCell>
                  <TableCell>
                    <div className="font-medium">{order.customerName}</div>
                    <div className="text-xs text-muted-foreground">{order.customerEmail}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{order.items.length} פריטים</TableCell>
                  <TableCell>
                    <div className="font-medium">₪{Number(order.total).toFixed(2)}</div>
                    {order.couponCode && (
                      <div className="text-xs text-green-600 dark:text-green-400 font-mono">{order.couponCode}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{new Date(order.createdAt).toLocaleDateString('he-IL')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
