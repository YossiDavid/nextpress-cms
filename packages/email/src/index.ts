export { sendEmail } from './sender';

import { sendEmail } from './sender';
import { orderConfirmationHtml, orderConfirmationText } from './templates/order-confirmation';
import { newOrderAlertHtml, newOrderAlertText } from './templates/new-order-alert';
import { orderStatusUpdateHtml, orderStatusUpdateText } from './templates/order-status-update';

export type { OrderConfirmationData } from './templates/order-confirmation';
export type { NewOrderAlertData } from './templates/new-order-alert';
export type { OrderStatusUpdateData } from './templates/order-status-update';

export async function sendOrderConfirmation(
  to: string,
  data: import('./templates/order-confirmation').OrderConfirmationData,
): Promise<void> {
  await sendEmail({
    to,
    subject: `אישור הזמנה #${data.orderNumber} — ${data.siteTitle}`,
    html: orderConfirmationHtml(data),
    text: orderConfirmationText(data),
  });
}

export async function sendNewOrderAlert(
  to: string,
  data: import('./templates/new-order-alert').NewOrderAlertData,
): Promise<void> {
  await sendEmail({
    to,
    subject: `הזמנה חדשה #${data.orderNumber} — ₪${data.total.toFixed(2)}`,
    html: newOrderAlertHtml(data),
    text: newOrderAlertText(data),
  });
}

export async function sendOrderStatusUpdate(
  to: string,
  data: import('./templates/order-status-update').OrderStatusUpdateData,
): Promise<void> {
  await sendEmail({
    to,
    subject: `עדכון הזמנה #${data.orderNumber} — ${data.siteTitle}`,
    html: orderStatusUpdateHtml(data),
    text: orderStatusUpdateText(data),
  });
}
