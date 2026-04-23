import Link from 'next/link';
import { getCart } from '@/lib/cart';
import { removeFromCart, updateQuantity } from '@/app/actions/cart';
import { applyCoupon, removeCoupon } from '@/app/actions/coupons';

export default async function CartPage() {
  const cart = await getCart();

  if (cart.items.length === 0) {
    return (
      <main className="min-h-screen p-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">עגלת קניות</h1>
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg mb-6">העגלה שלך ריקה</p>
          <Link
            href="/shop"
            className="inline-block bg-foreground text-background px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            המשך לקניות
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">עגלת קניות</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item.productId} className="flex gap-4 p-4 border border-border rounded-lg bg-card">
              {item.image && (
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.name}</p>
                <p className="text-muted-foreground text-sm mt-1">₪{item.price.toFixed(2)}</p>
                <div className="flex items-center gap-3 mt-3">
                  <form action={async () => { 'use server'; await updateQuantity(item.productId, item.quantity - 1); }}>
                    <button type="submit" className="w-8 h-8 rounded border border-border hover:bg-muted flex items-center justify-center text-lg leading-none">−</button>
                  </form>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <form action={async () => { 'use server'; await updateQuantity(item.productId, item.quantity + 1); }}>
                    <button type="submit" className="w-8 h-8 rounded border border-border hover:bg-muted flex items-center justify-center text-lg leading-none">+</button>
                  </form>
                </div>
              </div>
              <div className="text-right flex flex-col justify-between flex-shrink-0">
                <p className="font-semibold">₪{(item.price * item.quantity).toFixed(2)}</p>
                <form action={async () => { 'use server'; await removeFromCart(item.productId); }}>
                  <button type="submit" className="text-xs text-muted-foreground hover:text-destructive transition-colors">הסר</button>
                </form>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="border border-border rounded-lg p-6 bg-card sticky top-8">
            <h2 className="font-semibold text-lg mb-4">סיכום הזמנה</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">סכום ביניים</span>
                <span>₪{cart.subtotal.toFixed(2)}</span>
              </div>
              {cart.couponCode && (
                <div className="flex justify-between items-center text-green-600">
                  <span className="flex items-center gap-1.5">
                    קופון <span className="font-mono text-xs bg-green-600/10 px-1.5 py-0.5 rounded">{cart.couponCode}</span>
                    <form action={removeCoupon} className="inline">
                      <button type="submit" className="text-muted-foreground hover:text-destructive text-xs">✕</button>
                    </form>
                  </span>
                  <span>−₪{cart.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-border pt-2 mt-2 flex justify-between font-semibold text-base">
                <span>סה&quot;כ</span>
                <span>₪{cart.total.toFixed(2)}</span>
              </div>
            </div>
            {/* Coupon */}
            {!cart.couponCode && (
              <form action={applyCoupon} className="flex gap-2">
                <input
                  name="couponCode"
                  placeholder="קוד קופון"
                  className="flex-1 min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <button type="submit" className="text-sm border border-border rounded-md px-3 py-2 hover:bg-muted transition-colors flex-shrink-0">
                  החל
                </button>
              </form>
            )}

            <Link
              href="/checkout"
              className="mt-6 block w-full text-center bg-foreground text-background py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              המשך לתשלום
            </Link>
            <Link
              href="/shop"
              className="mt-3 block w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              המשך לקניות
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
