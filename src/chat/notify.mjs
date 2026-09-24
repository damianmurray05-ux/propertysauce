// Outbound messages: email through Resend, SMS through Inkbox (our own UK
// mobile number) or Twilio, and an optional webhook (Zapier, Make, Trello)
// for every raised job. Each is switched on by its environment variables
// and silently skipped otherwise, so the site keeps working before they
// are configured.
//
// SMS: Inkbox is tried first — it is our own registered UK number, and a UK
// number is the one a UK tenant or landlord will actually answer. Twilio is
// kept as a fallback for a deployment that already has it configured, but
// whichever is used, the caller-facing behaviour is identical. There is no
// fallback from one to the other on a single send: a code sent twice from
// two different numbers is worse than one send that failed honestly.

const FROM = process.env.MAIL_FROM || "Property Sauce <assistant@propertysauce.co>";
export const TEAM_EMAIL = process.env.TEAM_EMAIL || "contact@propertysauce.co";

export const emailConfigured = () => Boolean(process.env.RESEND_API_KEY);
const inkboxConfigured = () => Boolean(process.env.INKBOX_API_KEY && process.env.INKBOX_PHONE_NUMBER_ID);
const twilioConfigured = () => Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM);
export const smsConfigured = () => inkboxConfigured() || twilioConfigured();

/**
 * Inkbox refuses a recipient who has never texted START to our number, with
 * 403 recipient_not_opted_in. The rule is aimed at US carriers; Inkbox has
 * agreed to lift it for our UK numbers but had not done so as of 24 Sep
 * 2026. Until then this is the failure every real tenant or landlord will
 * hit, because receiving the one-time code IS their first contact with us.
 * Named rather than folded into a generic error so a log line says which of
 * the two problems we have: an unreachable number, or a platform that will
 * not yet let us reach it.
 */
const maskTail = (p) => `•••••• ${String(p || "").slice(-4)}`;

export class SmsNotOptedInError extends Error {
  constructor(to) {
    super(`recipient ${maskTail(to)} has not opted in to receive our texts yet`);
    this.name = "SmsNotOptedInError";
    this.code = "recipient_not_opted_in";
  }
}

export async function sendEmail({ to, subject, text, html, attachments = [], replyTo }) {
  if (!emailConfigured()) return { ok: false, skipped: true };
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: Array.isArray(to) ? to : [to],
      subject,
      text,
      html: html || `<pre style="font: 14px/1.5 -apple-system, Segoe UI, sans-serif; white-space: pre-wrap">${escapeHtml(text)}</pre>`,
      reply_to: replyTo,
      attachments: attachments.map((a) => ({ filename: a.filename, content: a.data })),
    }),
  });
  if (!r.ok) return { ok: false, error: `resend ${r.status}: ${(await r.text()).slice(0, 200)}` };
  return { ok: true };
}

async function sendSmsInkbox({ to, text }) {
  const r = await fetch(`https://inkbox.ai/api/v1/phone/numbers/${process.env.INKBOX_PHONE_NUMBER_ID}/texts`, {
    method: "POST",
    headers: { "X-API-Key": process.env.INKBOX_API_KEY, "content-type": "application/json" },
    body: JSON.stringify({ to, text }),
  });
  if (r.ok) return { ok: true };
  const detail = await r.text();
  if (r.status === 403 && detail.includes("recipient_not_opted_in")) return { ok: false, error: new SmsNotOptedInError(to).message, notOptedIn: true };
  return { ok: false, error: `inkbox ${r.status}: ${detail.slice(0, 200)}` };
}

async function sendSmsTwilio({ to, text }) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      authorization: "Basic " + Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64"),
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: to, From: process.env.TWILIO_FROM, Body: text }),
  });
  if (!r.ok) return { ok: false, error: `twilio ${r.status}: ${(await r.text()).slice(0, 200)}` };
  return { ok: true };
}

export async function sendSms({ to, text }) {
  if (!smsConfigured()) return { ok: false, skipped: true };
  if (inkboxConfigured()) return sendSmsInkbox({ to, text });
  return sendSmsTwilio({ to, text });
}

export async function postWebhook(payload) {
  const url = process.env.MAINTENANCE_WEBHOOK_URL;
  if (!url) return { ok: false, skipped: true };
  try {
    const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    return { ok: r.ok };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export const escapeHtml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
