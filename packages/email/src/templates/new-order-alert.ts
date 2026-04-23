export interface NewOrderAlertData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  itemCount: number;
  adminUrl: string;
  siteTitle: string;
}

export function newOrderAlertHtml(d: NewOrderAlertData): string {
  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head><meta charset="UTF-8"><title>הזמנה חדשה #${d.orderNumber}</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:560px;width:100%;">

        <tr><td style="background:#0f0f0f;padding:28px 36px;">
          <p style="margin:0;color:#a855f7;font-size:13px;letter-spacing:2px;text-transform:uppercase;">הזמנה חדשה</p>
          <p style="margin:8px 0 0;color:#ffffff;font-size:24px;font-weight:bold;">#${d.orderNumber}</p>
        </td></tr>

        <tr><td style="padding:36px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #eee;color:#888;font-size:13px;">לקוח</td>
              <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;font-weight:600;text-align:left;">${d.customerName}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #eee;color:#888;font-size:13px;">אימייל</td>
              <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;text-align:left;">${d.customerEmail}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #eee;color:#888;font-size:13px;">פריטים</td>
              <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;text-align:left;">${d.itemCount}</td>
            </tr>
            <tr>
              <td style="padding:12px 0 0;color:#888;font-size:13px;">סה"כ</td>
              <td style="padding:12px 0 0;font-size:18px;font-weight:bold;color:#111;text-align:left;">₪${d.total.toFixed(2)}</td>
            </tr>
          </table>

          <a href="${d.adminUrl}" style="display:inline-block;background:#0f0f0f;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:6px;font-size:15px;font-weight:600;">צפה בהזמנה בפאנל</a>
        </td></tr>

        <tr><td style="background:#f5f5f5;padding:20px 36px;text-align:center;">
          <p style="margin:0;color:#aaa;font-size:12px;">${d.siteTitle} — התראת מנהל</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function newOrderAlertText(d: NewOrderAlertData): string {
  return `הזמנה חדשה #${d.orderNumber}\n\nלקוח: ${d.customerName} (${d.customerEmail})\nסה"כ: ₪${d.total.toFixed(2)}\nפריטים: ${d.itemCount}\n\nצפה בהזמנה: ${d.adminUrl}`;
}
