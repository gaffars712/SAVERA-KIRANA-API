/**
 * Email service — Nodemailer with Gmail SMTP.
 * FREE forever: Gmail SMTP allows 500 emails/day per account.
 *
 * Env vars needed (in .env):
 *   SMTP_HOST       = smtp.gmail.com
 *   SMTP_PORT       = 587
 *   SMTP_USER       = your@gmail.com
 *   SMTP_PASS       = 16-char App Password (NOT your Gmail password)
 *   SMTP_FROM       = "Savera Kirana <your@gmail.com>"
 *
 * To get SMTP_PASS:
 *   1. Enable 2-Step Verification on your Google account
 *   2. Go to https://myaccount.google.com/apppasswords
 *   3. Create an app password for "Mail" → copy the 16-char string
 *
 * If SMTP not configured, OTPs print to console + returned as devOtp.
 */

const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../config/logger');

let transporter = null;

const ensureTransporter = () => {
  if (transporter) return transporter;
  if (!config.smtp.host || !config.smtp.user || !config.smtp.pass) return null;
  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465, // true for 465, false for 587
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });
  return transporter;
};

const isConfigured = () => !!ensureTransporter();

const sendMail = async ({ to, subject, html, text }) => {
  const t = ensureTransporter();
  if (!t) {
    logger.info(`[EMAIL-DEV] to=${to} :: ${subject}`);
    logger.info(`  ${(text || html || '').slice(0, 200)}`);
    return { dev: true };
  }
  return t.sendMail({
    from: config.smtp.from || `Savera Kirana <${config.smtp.user}>`,
    to,
    subject,
    text,
    html,
  });
};

/* ─────────────────── OTP email ─────────────────── */

const otpTemplate = (code) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your Savera Kirana login code</title>
</head>
<body style="margin:0;padding:0;background:#F8F9FC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#F8F9FC;padding:40px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="520" style="max-width:520px;background:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 4px 16px rgba(0,108,76,0.08);">

          <!-- HERO / HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#006C4C 0%,#0DA678 100%);padding:36px 32px 32px;color:#FFFFFF;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td>
                    <!-- Logo mark -->
                    <div style="display:inline-block;background:#FFFFFF;border-radius:14px;padding:8px 12px;margin-bottom:16px;">
                      <span style="font-size:22px;">🌱</span>
                      <span style="font-weight:800;color:#006C4C;font-size:16px;letter-spacing:-0.2px;vertical-align:middle;margin-left:4px;">SAVERA KIRANA</span>
                    </div>
                    <h1 style="margin:8px 0 4px;font-size:26px;font-weight:700;letter-spacing:-0.5px;line-height:1.2;">
                      Namaste 👋
                    </h1>
                    <p style="margin:0;opacity:0.92;font-size:15px;line-height:1.5;">
                      Your one-time password is ready.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- OTP CODE -->
          <tr>
            <td style="padding:36px 32px 24px;">
              <p style="margin:0 0 20px;color:#3D4A43;font-size:15px;line-height:1.6;">
                Use this code to log in to your Savera Kirana account.
                <br>
                It's valid for the next <strong style="color:#006C4C;">5 minutes</strong>.
              </p>

              <!-- Code card -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:2px dashed #0DA678;border-radius:16px;background:linear-gradient(135deg,rgba(13,166,120,0.05),rgba(255,196,43,0.05));">
                <tr>
                  <td align="center" style="padding:28px 20px;">
                    <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:#0DA678;text-transform:uppercase;margin-bottom:8px;">
                      Your Login Code
                    </div>
                    <div style="font-family:'SF Mono','Menlo','Consolas',monospace;font-size:44px;font-weight:800;color:#006C4C;letter-spacing:10px;line-height:1.1;padding:4px 0;">
                      ${code}
                    </div>
                    <div style="font-size:12px;color:#6D7A72;margin-top:8px;">
                      Enter this on the login screen
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Security notice -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:24px;background:#FFF8E5;border-left:4px solid #F8BE23;border-radius:8px;">
                <tr>
                  <td style="padding:14px 16px;">
                    <p style="margin:0;color:#5B4300;font-size:13px;line-height:1.5;">
                      🔒 <strong>Security tip:</strong> Savera Kirana team will never ask for this code.
                      Don't share it with anyone.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;color:#6D7A72;font-size:13px;line-height:1.5;">
                Didn't request this? You can safely ignore this email — no changes will be made to your account.
              </p>
            </td>
          </tr>

          <!-- WHAT YOU GET STRIP -->
          <tr>
            <td style="padding:24px 32px;background:#F2F4F6;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td width="33%" align="center" style="padding:0 8px;">
                    <div style="font-size:24px;line-height:1;">⚡</div>
                    <div style="font-size:11px;color:#3D4A43;font-weight:600;margin-top:6px;line-height:1.3;">
                      90 min<br>delivery
                    </div>
                  </td>
                  <td width="33%" align="center" style="padding:0 8px;border-left:1px solid #E1E2E5;border-right:1px solid #E1E2E5;">
                    <div style="font-size:24px;line-height:1;">💰</div>
                    <div style="font-size:11px;color:#3D4A43;font-weight:600;margin-top:6px;line-height:1.3;">
                      COD<br>available
                    </div>
                  </td>
                  <td width="33%" align="center" style="padding:0 8px;">
                    <div style="font-size:24px;line-height:1;">🥬</div>
                    <div style="font-size:11px;color:#3D4A43;font-weight:600;margin-top:6px;line-height:1.3;">
                      Fresh<br>daily</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:24px 32px 28px;text-align:center;">
              <p style="margin:0 0 8px;color:#191C1E;font-size:13px;font-weight:600;">
                Savera Kirana
              </p>
              <p style="margin:0 0 12px;color:#6D7A72;font-size:12px;line-height:1.5;">
                Fresh groceries at your doorstep · Made with 💚 in Jaipur
              </p>
              <p style="margin:0;color:#6D7A72;font-size:11px;">
                Need help? <a href="mailto:support@saverakirana.in" style="color:#006C4C;text-decoration:none;font-weight:600;">support@saverakirana.in</a>
              </p>
              <p style="margin:16px 0 0;color:#BCCAC0;font-size:10px;">
                © ${new Date().getFullYear()} Savera Kirana. All rights reserved.
              </p>
            </td>
          </tr>
        </table>

        <p style="max-width:520px;margin:20px auto 0;color:#BCCAC0;font-size:11px;text-align:center;line-height:1.5;">
          You received this email because someone requested a login for your account.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

const sendOtp = (email, code) =>
  sendMail({
    to: email,
    subject: `${code} is your Savera Kirana login code`,
    text:
      `Namaste!\n\n` +
      `Your Savera Kirana login code is: ${code}\n\n` +
      `This code is valid for the next 5 minutes.\n` +
      `Do not share it with anyone — our team will never ask for it.\n\n` +
      `Didn't request this? You can safely ignore this email.\n\n` +
      `— Team Savera Kirana\n` +
      `Fresh groceries, delivered.\n` +
      `support@saverakirana.in`,
    html: otpTemplate(code),
  });

/* ─────────────────── Order emails ─────────────────── */

const orderConfirmationTemplate = (order) => `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8F9FC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="padding:40px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="520" style="max-width:520px;background:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 4px 16px rgba(0,108,76,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#006C4C 0%,#0DA678 100%);padding:36px 32px;color:#FFFFFF;text-align:center;">
              <div style="font-size:56px;line-height:1;margin-bottom:8px;">🎉</div>
              <h1 style="margin:0;font-size:26px;font-weight:700;">Order Confirmed!</h1>
              <p style="margin:8px 0 0;opacity:0.9;font-size:15px;">Thank you for shopping with Savera Kirana</p>
            </td>
          </tr>

          <tr>
            <td style="padding:32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#F2F4F6;border-radius:12px;">
                <tr>
                  <td style="padding:20px;">
                    <div style="font-size:11px;font-weight:700;color:#6D7A72;text-transform:uppercase;letter-spacing:1.5px;">Order ID</div>
                    <div style="font-family:'SF Mono',monospace;font-size:20px;font-weight:800;color:#191C1E;margin-top:4px;">${order.code}</div>
                    <div style="margin-top:16px;font-size:11px;font-weight:700;color:#6D7A72;text-transform:uppercase;letter-spacing:1.5px;">Total</div>
                    <div style="font-size:28px;font-weight:800;color:#006C4C;margin-top:4px;">₹${order.total}</div>
                  </td>
                </tr>
              </table>

              ${order.fulfillmentType === 'pickup' && order.pickup?.code ? `
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:20px;border:2px dashed #F8BE23;border-radius:12px;background:#FFF8E5;">
                <tr>
                  <td align="center" style="padding:20px;">
                    <div style="font-size:11px;font-weight:700;color:#5B4300;text-transform:uppercase;letter-spacing:1.5px;">Pickup Code — Show at counter</div>
                    <div style="font-family:'SF Mono',monospace;font-size:36px;font-weight:800;color:#006C4C;letter-spacing:8px;margin-top:8px;">${order.pickup.code}</div>
                  </td>
                </tr>
              </table>
              ` : ''}

              <p style="margin:24px 0 0;color:#3D4A43;font-size:14px;line-height:1.6;">
                ${order.fulfillmentType === 'pickup'
                  ? "Your order will be ready in ~30 minutes. We'll email you when it's ready to collect."
                  : "Your order is being packed. We'll email you when it's out for delivery."}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 32px 28px;background:#F2F4F6;text-align:center;">
              <p style="margin:0 0 8px;color:#191C1E;font-size:13px;font-weight:600;">Savera Kirana</p>
              <p style="margin:0;color:#6D7A72;font-size:11px;">
                Need help? <a href="mailto:support@saverakirana.in" style="color:#006C4C;text-decoration:none;font-weight:600;">support@saverakirana.in</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const sendOrderConfirmation = (email, order) =>
  sendMail({
    to: email,
    subject: `🎉 Order confirmed — ${order.code}`,
    html: orderConfirmationTemplate(order),
    text:
      `Order confirmed!\n\n` +
      `Order ID: ${order.code}\n` +
      `Total: ₹${order.total}\n` +
      (order.fulfillmentType === 'pickup' && order.pickup?.code
        ? `Pickup code: ${order.pickup.code}\n\nShow this at the counter when you come to collect.\n\n`
        : `\nWe'll email you when it's out for delivery.\n\n`) +
      `Thank you for shopping with Savera Kirana!`,
  });

module.exports = { sendMail, sendOtp, sendOrderConfirmation, isConfigured };
