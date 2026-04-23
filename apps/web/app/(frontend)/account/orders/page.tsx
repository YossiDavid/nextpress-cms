import { auth } from '@/auth';
import { prisma } from '@nextpress/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const metadata = { title: 'ההזמנות שלי' };

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'ממתינה',
  PROCESSING: 'בעיבוד',
  SHIPPED: 'נשלחה',
  DELIVERED: 'נמסרה',
  COMPLETED: 'הושלמה',
  CANCELLED: 'בוטלה',
  REFUNDED: 'זוכתה',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  PROCESSING: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  SHIPPED: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  DELIVERED: 'bg-green-500/10 text-green-600 dark:text-green-400',
  COMPLETED: 'bg-green-500/10 text-green-600 dark:text-green-400',
  CANCELLED: 'bg-red-500/10 text-red-600 dark:text-red-400',
  REFUNDED: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.email) redirect('/login');

  const orders = await prisma.order.findMany({
    where: { customerEmail: session.user.email },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });

  return (
    <main className="min-h-screen py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/account" className="text-muted-foreground hover:text-foreground text-sm">← חזרה</Link>
          <h1 className="text-2xl font-bold">ההזמנות שלי</h1>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg mb-4">אין הזמנות עדיין</p>
            <Link href="/shop" className="text-foreground underline-offset-4 hover:underline text-sm">לחנות ←</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-border rounded-xl overflow-hidden bg-card">
                {/* Order header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <div>
                    <p className="font-semibold text-sm">#{order.orderNumber.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[order.status] ?? 'bg-muted text-muted-foreground'}`}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                    <span className="font-bold text-sm">₪{Number(order.total).toFixed(2)}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="px-5 py-3 space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.name} <span className="text-xs">×{item.quantity}</span></span>
                      <span>₪{Number(item.total).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Totals footer */}
                <div className="px-5 py-3 bg-muted/30 text-xs text-muted-foreground flex gap-4 border-t border-border">
                  <span>סכום ביניים: ₪{Number(order.subtotal).toFixed(2)}</span>
                  <span>מע״מ: ₪{Number(order.tax).toFixed(2)}</span>
                  <span>משלוח: {Number(order.shipping) === 0 ? 'חינם' : `₪${Number(order.shipping).toFixed(2)}`}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
