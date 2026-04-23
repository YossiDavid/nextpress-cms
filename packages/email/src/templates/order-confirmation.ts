export interface OrderConfirmationData {
  orderNumber: string;
  customerName: string;
  items: { name: string; quantity: number; price: number; total: number }[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  siteTitle: string;
  siteUrl: string;
}

export function orderConfirmationHtml(d: OrderConfirmationData): string {
  const rows = d.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;">${item.name}</td>
        <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
        <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:left;">₪${item.total.toFixed(2)}</td>
      </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>אישור הזמנה #${d.orderNumber}</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:#0f0f0f;padding:32px 40px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="color:#ffffff;font-size:22px;font-weight:bold;">${d.siteTitle}</td>
              <td align="left" style="color:#a855f7;font-size:14px;">הזמנה #${d.orderNumber}</td>
            </tr>
          </table>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:40px;">
          <p style="margin:0 0 8px;font-size:22px;font-weight:bold;color:#111;">תודה על הזמנתך, ${d.customerName}!</p>
          <p style="margin:0 0 32px;color:#666;font-size:15px;">קיבלנו את הזמנתך ונעדכן אותך כשתצא לדרך.</p>

          <!-- Items table -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <thead>
              <tr style="border-bottom:2px solid #111;">
                <th style="padding:8px 0;text-align:right;font-size:13px;color:#888;font-weight:600;">מוצר</th>
                <th style="padding:8px 0;text-align:center;font-size:13px;color:#888;font-weight:600;">כמות</th>
                <th style="padding:8px 0;text-align:left;font-size:13px;color:#888;font-weight:600;">סכום</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>

          <!-- Totals -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
            <tr>
              <td style="padding:6px 0;color:#666;font-size:14px;">סכום ביניים</td>
              <td style="padding:6px 0;text-align:left;color:#666;font-size:14px;">₪${d.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#666;font-size:14px;">מע"מ 17%</td>
              <td style="padding:6px 0;text-align:left;color:#666;font-size:14px;">₪${d.tax.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#666;font-size:14px;">משלוח</td>
              <td style="padding:6px 0;text-align:left;color:#666;font-size:14px;">${d.shipping === 0 ? 'חינם' : `₪${d.shipping.toFixed(2)}`}</td>
            </tr>
            <tr style="border-top:2px solid #111;">
              <td style="padding:12px 0 0;font-size:16px;font-weight:bold;color:#111;">סה"כ</td>
              <td style="padding:12px 0 0;text-align:left;font-size:16px;font-weight:bold;color:#111;">₪${d.total.toFixed(2)}</td>
            </tr>
          </table>

          <a href="${d.siteUrl}" style="display:inline-block;background:#0f0f0f;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:6px;font-size:15px;font-weight:600;">המשך לקנות</a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f5f5f5;padding:24px 40px;text-align:center;">
          <p style="margin:0;color:#aaa;font-size:12px;">© ${new Date().getFullYear()} ${d.siteTitle}. כל הזכויות שמורות.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function orderConfirmationText(d: OrderConfirmationData): string {
  const lines = d.items.map((i) => `- ${i.name} x${i.quantity}: ₪${i.total.toFixed(2)}`).join('\n');
  return `תודה על הזמנתך, ${d.customerName}!\n\nהזמנה מספר: #${d.orderNumber}\n\n${lines}\n\nסה"כ: ₪${d.total.toFixed(2)}\n\n${d.siteTitle}`;
}
