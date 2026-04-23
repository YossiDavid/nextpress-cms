const STATUS_LABELS: Record<string, string> = {
  PENDING: 'ממתינה לאישור',
  PROCESSING: 'בעיבוד',
  SHIPPED: 'נשלחה',
  DELIVERED: 'נמסרה',
  COMPLETED: 'הושלמה',
  CANCELLED: 'בוטלה',
  REFUNDED: 'זוכתה',
};

export interface OrderStatusUpdateData {
  orderNumber: string;
  customerName: string;
  status: string;
  siteTitle: string;
  siteUrl: string;
}

export function orderStatusUpdateHtml(d: OrderStatusUpdateData): string {
  const label = STATUS_LABELS[d.status] ?? d.status;
  const isPositive = ['SHIPPED', 'DELIVERED', 'COMPLETED'].includes(d.status);
  const isCancelled = ['CANCELLED', 'REFUNDED'].includes(d.status);
  const badgeColor = isPositive ? '#16a34a' : isCancelled ? '#dc2626' : '#d97706';

  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head><meta charset="UTF-8"><title>עדכון הזמנה #${d.orderNumber}</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:560px;width:100%;">

        <tr><td style="background:#0f0f0f;padding:28px 36px;">
          <p style="margin:0;color:#ffffff;font-size:22px;font-weight:bold;">${d.siteTitle}</p>
          <p style="margin:6px 0 0;color:#888;font-size:14px;">עדכון הזמנה #${d.orderNumber}</p>
        </td></tr>

        <tr><td style="padding:40px;text-align:center;">
          <p style="margin:0 0 16px;font-size:16px;color:#555;">שלום ${d.customerName},</p>
          <p style="margin:0 0 28px;font-size:15px;color:#555;">סטטוס הזמנתך עודכן:</p>

          <span style="display:inline-block;background:${badgeColor};color:#fff;padding:10px 24px;border-radius:20px;font-size:16px;font-weight:bold;letter-spacing:0.5px;">
            ${label}
          </span>

          <p style="margin:32px 0 0;font-size:14px;color:#888;">יש שאלות? פנו אלינו דרך האתר.</p>
        </td></tr>

        <tr><td style="padding:0 36px 36px;text-align:center;">
          <a href="${d.siteUrl}" style="display:inline-block;background:#0f0f0f;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600;">חזרה לאתר</a>
        </td></tr>

        <tr><td style="background:#f5f5f5;padding:20px 36px;text-align:center;">
          <p style="margin:0;color:#aaa;font-size:12px;">© ${new Date().getFullYear()} ${d.siteTitle}</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function orderStatusUpdateText(d: OrderStatusUpdateData): string {
  const label = STATUS_LABELS[d.status] ?? d.status;
  return `שלום ${d.customerName},\n\nסטטוס הזמנה #${d.orderNumber} עודכן ל: ${label}\n\n${d.siteTitle} — ${d.siteUrl}`;
}
