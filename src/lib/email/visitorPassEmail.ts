import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export interface VisitorPassEmailData {
  visitorName: string;
  visitorEmail: string;
  accessCode: string;
  qrCodeDataUrl: string;
  targetUnit: string;
  purpose: string;
  expectedArrival: string;
}

function formatArrival(isoString: string): string {
  return new Date(isoString).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildHtml(data: VisitorPassEmailData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Visitor Pass</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#1d4ed8;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:0.5px;">
                VisitVault
              </h1>
              <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">Visitor Management System</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:36px 40px 0;">
              <h2 style="margin:0 0 8px;color:#111827;font-size:20px;">Hi ${data.visitorName},</h2>
              <p style="margin:0;color:#6b7280;font-size:15px;line-height:1.6;">
                Your visitor pass has been registered. Please present the QR code below at the entrance on your arrival.
              </p>
            </td>
          </tr>

          <!-- Visit details -->
          <tr>
            <td style="padding:28px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px;color:#374151;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Visit Details</p>
                    <table width="100%" cellpadding="4" cellspacing="0">
                      <tr>
                        <td style="color:#6b7280;font-size:14px;width:140px;">Unit / Destination</td>
                        <td style="color:#111827;font-size:14px;font-weight:600;">${data.targetUnit}</td>
                      </tr>
                      <tr>
                        <td style="color:#6b7280;font-size:14px;">Purpose</td>
                        <td style="color:#111827;font-size:14px;">${data.purpose}</td>
                      </tr>
                      <tr>
                        <td style="color:#6b7280;font-size:14px;">Expected Arrival</td>
                        <td style="color:#111827;font-size:14px;">${formatArrival(data.expectedArrival)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- QR Code -->
          <tr>
            <td style="padding:28px 40px 0;text-align:center;">
              <p style="margin:0 0 16px;color:#374151;font-size:15px;font-weight:600;">Your QR Code</p>
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.accessCode)}" alt="Visitor QR Code" width="200" style="border-radius:8px;border:1px solid #e5e7eb;" />
            </td>
          </tr>

          <!-- Access Code -->
          <tr>
            <td style="padding:20px 40px 0;text-align:center;">
              <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">Access Code</p>
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background:#1d4ed8;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:6px;padding:12px 28px;border-radius:8px;">
                    ${data.accessCode}
                  </td>
                </tr>
              </table>
              <p style="margin:12px 0 0;color:#9ca3af;font-size:12px;">Show this code or the QR above to the guard at the entrance.</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:36px 40px;text-align:center;border-top:1px solid #f3f4f6;margin-top:28px;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                This pass was generated automatically by VisitVault. If you did not expect this email, please disregard it.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendVisitorPassEmail(data: VisitorPassEmailData): Promise<void> {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error(
      "Email not configured: GMAIL_USER and GMAIL_APP_PASSWORD must be set in the environment."
    );
  }
  await transporter.sendMail({
    from: `VisitVault <${process.env.GMAIL_USER}>`,
    to: data.visitorEmail,
    subject: `Your Visitor Pass — ${data.accessCode}`,
    html: buildHtml(data),
  });
}
