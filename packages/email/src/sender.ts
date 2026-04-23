export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const from = process.env['EMAIL_FROM'] ?? 'no-reply@nextpress.local';

  // Resend
  if (process.env['RESEND_API_KEY']) {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env['RESEND_API_KEY']);
    const { error } = await resend.emails.send({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });
    if (error) throw new Error(`Resend error: ${error.message}`);
    return;
  }

  // SMTP via Nodemailer
  if (process.env['SMTP_HOST']) {
    const nodemailer = await import('nodemailer');
    const transport = nodemailer.createTransport({
      host: process.env['SMTP_HOST'],
      port: Number(process.env['SMTP_PORT'] ?? 587),
      secure: process.env['SMTP_PORT'] === '465',
      auth: process.env['SMTP_USER']
        ? { user: process.env['SMTP_USER'], pass: process.env['SMTP_PASS'] }
        : undefined,
    });
    await transport.sendMail({ from, to: payload.to, subject: payload.subject, html: payload.html, text: payload.text });
    return;
  }

  // Development fallback — log to console
  console.log(`[Email] To: ${payload.to} | Subject: ${payload.subject}\n${payload.text}`);
}
