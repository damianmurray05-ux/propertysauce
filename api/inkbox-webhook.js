// ---------------------------------------------------------------------------
// POST /api/inkbox-webhook/   Text and call events from our own UK mobile
//                             number (+44 7457 410735, propertysauce@inkboxmail.com)
//
// Registered with a trailing slash because this site redirects every route
// to one (vercel.json trailingSlash:true) and a 308 does not reliably carry
// a POST body across senders the way a same-origin browser follows it.
//
// Three kinds of thing arrive here, and they matter for different reasons:
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
//   call.ended               the post-call package from Inkbox's own hosted
//                            voice agent, which answers every call by
//                            default (see docs/inkbox-voice-instructions.md
//                            for what it is told to do). It can only talk to
//                            the caller, not tell anyone about them, so this
//                            is where a call becomes an email in the team
//                            inbox rather than a lead nobody ever looks at.
//
// Unlike the Luxe Stay site this one is on (Cloudflare Workers, with a KV
// store), Property Sauce has no durable store to keep every event or dedupe
// a replayed call.ended by its event id. That is a real gap — a genuinely
// re-delivered call could email the team twice — accepted deliberately
// rather than adding storage for one low-volume, low-harm edge case; a
// duplicate lead email is a minor annoyance, a dropped one is not.
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

/** Compose the call as a human would want to read it in an inbox. */
function callSummary(call, items) {
  const lines = (items || []).map((i, n) => `${items.length > 1 ? `${n + 1}. ` : ""}${i.action}${i.details ? ` — ${i.details}` : ""}`);
  return [
    `A call came in on the Property Sauce number (+44 7457 410735), from ${call.remote_phone_number || "an unknown number"}.`,
    call.duration_seconds ? `Call length: ${call.duration_seconds}s.` : null,
    "",
    lines.length ? lines.join("\n") : "No action items were recorded — likely a short or silent call.",
  ].filter((l) => l !== null).join("\n");
}

async function onCallEnded(payload) {
  const call = payload.data?.call || {};
  const items = payload.data?.post_call_action_items || call.post_call_action_items || [];
  if (!emailConfigured()) {
    console.error("inkbox: call.ended arrived but no email channel configured; not forwarded", { from: call.remote_phone_number, items });
    return;
  }
  const transcript = payload.data?.transcript_url ? `\n\nFull transcript: ${payload.data.transcript_url}` : "";
  const sent = await sendEmail({ to: TEAM_EMAIL, subject: `Property Sauce call — ${call.remote_phone_number || "unknown number"}`, text: `${callSummary(call, items)}${transcript}` });
  if (!sent.ok) console.error("inkbox: could not forward call.ended", sent.error);
}

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

  if (eventType === "call.ended") {
    await onCallEnded(payload);
  } else if (eventType === "text.received") {
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
