'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@nextpress/db';
import { getCart, saveCart } from '@/lib/cart';
import { getStripe } from '@/lib/stripe';
import { sendOrderConfirmation, sendNewOrderAlert } from '@nextpress/email';
import { hooks } from '@nextpress/core';

export async function createOrder(formData: FormData) {
  const cart = await getCart();
  if (cart.items.length === 0) redirect('/cart');

  await hooks.doAction('checkout.before', { cart });

  const customerName = formData.get('customerName') as string;
  const customerEmail = formData.get('customerEmail') as string;
  const street = formData.get('street') as string;
  const city = formData.get('city') as string;
  const zip = (formData.get('zip') as string) || undefined;
  const phone = (formData.get('phone') as string) || undefined;
  const notes = (formData.get('notes') as string) || undefined;
  const shippingMethodId = formData.get('shippingMethodId') as string | null;

  const billingAddress = { street, city, zip, phone };

  // Resolve coupon and shipping in parallel
  const [coupon, shippingMethod, taxRateOpt] = await Promise.all([
    cart.couponCode ? prisma.coupon.findUnique({ where: { code: cart.couponCode } }) : Promise.resolve(null),
    shippingMethodId ? prisma.shippingMethod.findUnique({ where: { id: shippingMethodId } }) : Promise.resolve(null),
    prisma.option.findUnique({ where: { key: 'tax_rate' } }),
  ]);

  const TAX_RATE = taxRateOpt ? Number(taxRateOpt.value) / 100 : 0.17;
  const subtotal = cart.subtotal;
  const discount = cart.discount ?? 0;
  const afterDiscount = Math.max(0, subtotal - discount);

  // Determine shipping cost
  const isFreeShipping = coupon?.type === 'FREE_SHIPPING';
  let shippingCost = 0;
  if (!isFreeShipping && shippingMethod) {
    shippingCost =
      shippingMethod.freeAbove && subtotal >= Number(shippingMethod.freeAbove)
        ? 0
        : Number(shippingMethod.cost);
  }

  const tax = Math.round(afterDiscount * TAX_RATE * 100) / 100;
  const total = afterDiscount + tax + shippingCost;

  const order = await prisma.order.create({
    data: {
      customerName,
      customerEmail,
      billingAddress,
      subtotal,
      discount,
      couponCode: cart.couponCode,
      total,
      tax,
      shipping: shippingCost,
      notes,
      status: 'PENDING',
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          name: item.name,
          sku: item.sku,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity,
          meta: item.variantId
            ? { variantId: item.variantId, variantName: item.variantName }
            : undefined,
        })),
      },
    },
  });

  await hooks.doAction('order.created', order);

  // Increment coupon usage
  if (coupon) {
    await prisma.coupon.update({
      where: { id: coupon.id },
      data: { usageCount: { increment: 1 } },
    });
  }

  await saveCart({ items: [], subtotal: 0, discount: 0, total: 0 });

  const baseUrl = process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000';

  const [siteTitle, adminEmail] = await Promise.all([
    prisma.option.findUnique({ where: { key: 'site_title' } }),
    prisma.option.findUnique({ where: { key: 'admin_email' } }),
  ]);
  const emailData = {
    orderNumber: order.orderNumber,
    customerName,
    items: cart.items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price, total: i.price * i.quantity })),
    subtotal: Number(subtotal),
    tax: Number(tax),
    shipping: Number(shippingCost),
    total: Number(total),
    siteTitle: siteTitle?.value ?? 'NextPress',
    siteUrl: baseUrl,
  };
  void sendOrderConfirmation(customerEmail, emailData).catch(console.error);
  if (adminEmail?.value) {
    void sendNewOrderAlert(adminEmail.value, {
      orderNumber: order.orderNumber,
      customerName,
      customerEmail,
      total,
      itemCount: cart.items.reduce((s, i) => s + i.quantity, 0),
      adminUrl: `${baseUrl}/admin/orders`,
      siteTitle: siteTitle?.value ?? 'NextPress',
    }).catch(console.error);
  }

  if (process.env.STRIPE_SECRET_KEY) {
    const stripe = getStripe();
    const lineItems = cart.items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: 'ils',
        unit_amount: Math.round(item.price * 100),
        product_data: {
          name: item.name,
          ...(item.image ? { images: [item.image] } : {}),
        },
      },
    }));

    if (discount > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: 'ils',
          unit_amount: -Math.round(discount * 100),
          product_data: { name: `קופון ${cart.couponCode ?? ''}` },
        },
      });
    }
    if (tax > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: 'ils',
          unit_amount: Math.round(tax * 100),
          product_data: { name: 'מע"מ 17%' },
        },
      });
    }
    if (shippingCost > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: 'ils',
          unit_amount: Math.round(shippingCost * 100),
          product_data: { name: 'משלוח' },
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: customerEmail,
      line_items: lineItems,
      metadata: { orderId: order.id, orderNumber: order.orderNumber },
      success_url: `${baseUrl}/checkout/success?order=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
    });

    redirect(session.url!);
  }

  await hooks.doAction('checkout.after', order);
  redirect(`/checkout/success?order=${order.id}`);
}
