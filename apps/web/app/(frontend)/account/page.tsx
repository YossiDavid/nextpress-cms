import { getSession } from '@/lib/auth-session';
import { prisma } from '@nextpress/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const metadata = { title: 'החשבון שלי' };

export default async function AccountPage() {
  const session = await getSession();
  if (!session?.user?.email) redirect('/login');

  const customer = await prisma.customer.findUnique({
    where: { email: session.user.email },
    include: { _count: { select: { orders: true } } },
  });

  const recentOrders = await prisma.order.findMany({
    where: { customerEmail: session.user.email },
    orderBy: { createdAt: 'desc' },
    take: 3,
    include: { items: { select: { name: true, quantity: true } } },
  });

  return (
    <main className="min-h-screen py-12 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold">שלום, {session.user.name ?? session.user.email}</h1>
          <p className="text-muted-foreground text-sm mt-1">{session.user.email}</p>
        </div>

        {/* Quick nav */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { href: '/account/orders', label: 'ההזמנות שלי', value: customer?._count.orders ?? 0, unit: 'הזמנות' },
            { href: '/account/profile', label: 'פרטים אישיים', value: null, unit: null },
          ].map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="block border border-border rounded-xl p-5 bg-card hover:bg-muted/40 transition-colors"
            >
              <p className="text-sm text-muted-foreground mb-1">{card.label}</p>
              {card.value !== null && (
                <p className="text-2xl font-bold">{card.value} <span className="text-sm font-normal text-muted-foreground">{card.unit}</span></p>
              )}
              {card.value === null && <p className="text-sm font-medium">עדכן פרטים ←</p>}
            </Link>
          ))}
        </div>

        {/* Recent orders */}
        {recentOrders.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">הזמנות אחרונות</h2>
              <Link href="/account/orders" className="text-sm text-muted-foreground hover:text-foreground">הכל ←</Link>
            </div>
            <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between px-5 py-4 bg-card">
                  <div>
                    <p className="font-medium text-sm">#{order.orderNumber.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {order.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">₪{Number(order.total).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
