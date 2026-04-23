import Link from 'next/link';
import { prisma } from '@nextpress/db';

interface Props {
  searchParams: Promise<{ order?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { order: orderId } = await searchParams;

  const order = orderId
    ? await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } })
    : null;

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto flex flex-col items-center justify-center text-center">
      <div className="text-5xl mb-6">✅</div>
      <h1 className="text-3xl font-bold mb-3">ההזמנה התקבלה!</h1>
      {order ? (
        <>
          <p className="text-muted-foreground mb-2">
            מספר הזמנה: <span className="font-mono font-medium text-foreground">#{order.orderNumber.slice(0, 8).toUpperCase()}</span>
          </p>
          <p className="text-muted-foreground mb-8">
            אישור יישלח לכתובת <strong>{order.customerEmail}</strong>
          </p>
          <div className="w-full border border-border rounded-lg p-6 bg-card text-right mb-8 space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
                <span>₪{Number(item.total).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-border pt-2 flex justify-between font-semibold">
              <span>סה&quot;כ</span>
              <span>₪{Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </>
      ) : (
        <p className="text-muted-foreground mb-8">תודה על הרכישה!</p>
      )}
      <Link
        href="/"
        className="inline-block bg-foreground text-background px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
      >
        חזרה לדף הבית
      </Link>
    </main>
  );
}
