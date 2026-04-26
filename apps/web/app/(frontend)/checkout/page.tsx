import { redirect } from 'next/navigation';
import { getCart } from '@/lib/cart';
import { createOrder } from '@/app/actions/checkout';
import { prisma } from '@nextpress/db';

export default async function CheckoutPage() {
  const cart = await getCart();
  if (cart.items.length === 0) redirect('/cart');

  const [shippingMethods, taxRateOpt] = await Promise.all([
    prisma.shippingMethod.findMany({
      where: { active: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    }),
    prisma.option.findUnique({ where: { key: 'tax_rate' } }),
  ]);

  const TAX_RATE = taxRateOpt ? Number(taxRateOpt.value) / 100 : 0.17;
  const discount = cart.discount ?? 0;
  const afterDiscount = Math.max(0, cart.subtotal - discount);
  const tax = Math.round(afterDiscount * TAX_RATE * 100) / 100;

  // Default shipping = first method (or 0 if none configured)
  const defaultShipping = shippingMethods[0];
  const defaultShippingCost = defaultShipping
    ? (defaultShipping.freeAbove && cart.subtotal >= Number(defaultShipping.freeAbove)
        ? 0
        : Number(defaultShipping.cost))
    : 0;

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">תשלום</h1>

      <form action={createOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Contact */}
          <section className="border border-border rounded-lg p-6 bg-card space-y-4">
            <h2 className="font-semibold text-lg">פרטי קשר</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="customerName">שם מלא *</label>
                <input id="customerName" name="customerName" required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="ישראל ישראלי" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="customerEmail">אימייל *</label>
                <input id="customerEmail" name="customerEmail" type="email" required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="israel@example.com" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="phone">טלפון</label>
                <input id="phone" name="phone" type="tel"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="050-0000000" />
              </div>
            </div>
          </section>

          {/* Address */}
          <section className="border border-border rounded-lg p-6 bg-card space-y-4">
            <h2 className="font-semibold text-lg">כתובת משלוח</h2>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="street">רחוב ומספר *</label>
                <input id="street" name="street" required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="הרצל 1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="city">עיר *</label>
                  <input id="city" name="city" required
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="תל אביב" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="zip">מיקוד</label>
                  <input id="zip" name="zip"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="6100000" />
                </div>
              </div>
            </div>
          </section>

          {/* Shipping methods */}
          <section className="border border-border rounded-lg p-6 bg-card space-y-4">
            <h2 className="font-semibold text-lg">שיטת משלוח</h2>
            {shippingMethods.length === 0 ? (
              <p className="text-sm text-muted-foreground">לא הוגדרו שיטות משלוח. ניצור הזמנה ללא חיוב משלוח.</p>
            ) : (
              <div className="space-y-3">
                {shippingMethods.map((m, i) => {
                  const effectiveCost =
                    m.freeAbove && cart.subtotal >= Number(m.freeAbove)
                      ? 0
                      : Number(m.cost);
                  return (
                    <label key={m.id} className="flex items-center gap-3 p-3 rounded-md border border-input cursor-pointer hover:bg-accent/50 transition-colors">
                      <input
                        type="radio"
                        name="shippingMethodId"
                        value={m.id}
                        defaultChecked={i === 0}
                        className="h-4 w-4"
                      />
                      <div className="flex-1 flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium">{m.name}</span>
                          {m.description && (
                            <span className="text-xs text-muted-foreground mr-2">{m.description}</span>
                          )}
                          {m.freeAbove && (
                            <span className="text-xs text-green-600 mr-2">
                              (חינם מעל ₪{Number(m.freeAbove).toFixed(0)})
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-semibold">
                          {effectiveCost === 0
                            ? <span className="text-green-600">חינם</span>
                            : `₪${effectiveCost.toFixed(2)}`}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </section>

          {/* Notes */}
          <section className="border border-border rounded-lg p-6 bg-card space-y-4">
            <h2 className="font-semibold text-lg">הערות להזמנה</h2>
            <textarea name="notes" rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="הערות אופציונליות..." />
          </section>

          {/* Payment */}
          <section className="border border-border rounded-lg p-6 bg-card space-y-4">
            <h2 className="font-semibold text-lg">תשלום</h2>
            {process.env.STRIPE_SECRET_KEY ? (
              <div className="rounded-md bg-muted/50 border border-border p-4 flex items-center gap-3 text-sm">
                
                <div>
                  <p className="font-medium">תשלום מאובטח דרך Stripe</p>
                  <p className="text-muted-foreground text-xs mt-0.5">תועבר לדף תשלום מאובטח לאחר אישור ההזמנה</p>
                </div>
              </div>
            ) : (
              <div className="rounded-md bg-yellow-500/10 border border-yellow-500/30 p-4 text-sm text-yellow-700 dark:text-yellow-400">
                מצב פיתוח — ההזמנה תאושר ללא תשלום אמיתי
              </div>
            )}
          </section>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="border border-border rounded-lg p-6 bg-card sticky top-8 space-y-4">
            <h2 className="font-semibold text-lg">סיכום הזמנה</h2>
            <div className="space-y-2 text-sm">
              {cart.items.map((item) => (
                <div key={`${item.productId}-${item.variantId ?? ''}`} className="flex justify-between">
                  <span className="text-muted-foreground truncate ml-2">
                    {item.name}{item.variantName ? ` — ${item.variantName}` : ''} × {item.quantity}
                  </span>
                  <span className="flex-shrink-0">₪{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}

              <div className="border-t border-border pt-2 mt-2 space-y-1.5">
                <div className="flex justify-between text-muted-foreground">
                  <span>סכום ביניים</span>
                  <span>₪{cart.subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>הנחה {cart.couponCode && `(${cart.couponCode})`}</span>
                    <span>−₪{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>מע&quot;מ {Math.round(TAX_RATE * 100)}%</span>
                  <span>₪{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>משלוח</span>
                  <span>
                    {defaultShippingCost === 0
                      ? <span className="text-green-600">חינם</span>
                      : `₪${defaultShippingCost.toFixed(2)}`}
                  </span>
                </div>
              </div>

              <div className="border-t border-border pt-2 flex justify-between font-semibold text-base">
                <span>סה&quot;כ</span>
                <span>₪{(afterDiscount + tax + defaultShippingCost).toFixed(2)}</span>
              </div>
            </div>
            <button type="submit"
              className="w-full bg-foreground text-background py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
              {process.env.STRIPE_SECRET_KEY ? 'המשך לתשלום ←' : 'אישור הזמנה'}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
