'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@nextpress/db';
import { getSession } from '@/lib/auth-session';
import { redirect } from 'next/navigation';
import { sendOrderStatusUpdate } from '@nextpress/email';
import { hooks } from '@nextpress/core';

export async function updateOrderStatus(orderId: string, status: string) {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: status as never },
  });

  await hooks.doAction('order.statusChanged', { order, status });
  if (status === 'COMPLETED') {
    await hooks.doAction('order.completed', order);
  }

  // Notify customer of status change
  const [siteTitle, siteUrl] = await Promise.all([
    prisma.option.findUnique({ where: { key: 'site_title' } }),
    prisma.option.findUnique({ where: { key: 'site_url' } }),
  ]);
  void sendOrderStatusUpdate(order.customerEmail, {
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    status,
    siteTitle: siteTitle?.value ?? 'NextPress',
    siteUrl: siteUrl?.value ?? 'http://localhost:3000',
  }).catch(console.error);

  revalidatePath('/admin/orders');
}
