// ---------------------------------------------------------------------------
// POST /api/inkbox-webhook/   Text events from our own UK mobile number
//                             (+44 7457 410735, propertysauce@inkboxmail.com)
//
// Registered with a trailing slash because this site redirects every route
// to one (vercel.json trailingSlash:true) and a 308 does not reliably carry
// a POST body across senders the way a same-origin browser follows it.
//
// Two kinds of thing arrive here, and they matter for different reasons:
//
//   text.received            a human replied to us. This is the one that
//                            must never be dropped silently: a tenant or
//                            landlord answering a code text is talking to
//                            the business, and nobody else is watching this
//                            number, so it is forwarded to the team inbox.
//   text.sent | .delivered   the carrier's account of what happened to a
//   text.delivery_failed      message we sent. Diagnostic only — logged for
//   text.delivery_unconfirmed the Vercel function log, not emailed, so a
//                            burst of delivery receipts never floods the
//                            team inbox the way a missed reply would.
//
// Bindings:
//   INKBOX_WEBHOOK_SECRET   the @propertysauce identity's signing secret.
//                           Returned ONCE, on the first webhook subscription
//                           created for the identity.
//
// Deliberately: no signing key configured means every delivery is refused
// rather than accepted unsigned. Inkbox does send unsigned webhooks for an
// identity with no key yet, which is exactly why "no key" cannot be allowed
// to mean "trust whatever turns up".
// ---------------------------------------------------------------------------
import { verifyWebhook } from "../src/chat/inkbox.mjs";
import { sendEmail, emailConfigured, TEAM_EMAIL } from "../src/chat/notify.mjs";

const text = (status, body) => new Response(body, { status, headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });

export async function POST(request) {
  if (!process.env.INKBOX_WEBHOOK_SECRET) return text(503, "Webhook not configured");

  // Read the body ONCE, as text. Verification is over the exact bytes that
  // arrived, so this string — not a re-serialised object — is what gets signed.
  const raw = await request.text();

  const ok = verifyWebhook({
    signingKey: process.env.INKBOX_WEBHOOK_SECRET,
    requestId: request.headers.get("x-inkbox-request-id"),
    timestamp: request.headers.get("x-inkbox-timestamp"),
    signature: request.headers.get("x-inkbox-signature"),
    rawBody: raw,
  });
  if (!ok) return text(401, "Bad signature");

  let payload;
  try { payload = JSON.parse(raw); } catch { return text(400, "Bad JSON"); }

  const eventType = String(payload.event_type || "unknown");
  const msg = payload.data?.text_message || {};

  if (eventType === "text.received") {
    if (emailConfigured()) {
      const body = [
        `A text arrived on the Property Sauce Inkbox number (+44 7457 410735).`,
        ``,
        `From: ${msg.remote_phone_number || "unknown"}`,
        `To: ${msg.local_phone_number || "unknown"}`,
        `Message: ${msg.text || "(no text)"}`,
        ``,
        `This mailbox is not monitored for replies; the number is for one-time codes and outbound notices, not a support line.`,
      ].join("\n");
      const sent = await sendEmail({ to: TEAM_EMAIL, subject: "Text reply on the Property Sauce number", text: body });
      if (!sent.ok) console.error("inkbox: could not forward text.received", sent.error);
    } else {
      console.error("inkbox: text.received arrived but no email channel configured; message not forwarded", { from: msg.remote_phone_number, text: msg.text });
    }
  } else {
    // Delivery receipts: diagnostic only, kept out of the team inbox.
    console.log("inkbox delivery event", { eventType, to: msg.remote_phone_number, status: msg.delivery_status, error: msg.error_code });
  }

  // Fire-and-forget on Inkbox's side: our status is logged but changes
  // nothing. Answer quickly and unconditionally so a slow reply never
  // looks like a failed delivery.
  return text(200, "ok");
}
