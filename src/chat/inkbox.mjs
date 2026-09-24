// ---------------------------------------------------------------------------
// Verifying that a webhook really came from Inkbox (our UK mobile number
// for texts, propertysauce@inkboxmail.com / +44 7457 410735).
//
// Inkbox signs every delivery for an identity once that identity has a
// signing key. The signature covers three things joined by full stops:
//
//     {X-Inkbox-Request-ID}.{X-Inkbox-Timestamp}.{raw body}
//
// HMAC-SHA256 with the identity's signing secret, compared against the hex
// digest in `X-Inkbox-Signature: sha256=<hex>`.
//
// Two details matter because getting either wrong produces an endpoint that
// looks like it works right up until it doesn't:
//
// 1. The body must be the EXACT bytes that arrived. Parsing the JSON and
//    re-serialising it changes key order and whitespace, and the signature
//    then fails for every legitimate delivery. So the caller reads the raw
//    text once, verifies that string, and only then parses it.
//
// 2. The timestamp has to be checked. Without it a signature stays valid
//    forever, and anyone who ever captures one delivery can replay it back
//    at us indefinitely. Inkbox's own window is five minutes.
//
// Until an identity has a signing key its webhooks arrive UNSIGNED. That is
// a real state, not a hypothetical, and exactly what an attacker would like
// us to believe is happening — so a missing signature is a rejection here,
// never a shrug.
// ---------------------------------------------------------------------------
import { createHmac, timingSafeEqual } from "node:crypto";

const MAX_SKEW_SECONDS = 300;

/**
 * The console shows the secret with a `whsec_` prefix in some places and
 * without it in others. The prefix is a label, not part of the key, so it
 * is stripped before use — this is the difference between every signature
 * matching and none of them matching.
 */
export const normaliseSigningKey = (key) => String(key || "").trim().replace(/^whsec_/, "");

/**
 * Verify one delivery. Returns true only if the signature is present, fresh
 * and correct. Never throws: a malformed header is a failed verification,
 * not a 500, because a 500 tells Inkbox to retry something that will never
 * succeed.
 */
export function verifyWebhook({ signingKey, requestId, timestamp, signature, rawBody, now }) {
  const secret = normaliseSigningKey(signingKey);
  if (!secret || !requestId || !timestamp || !signature) return false;
  if (typeof signature !== "string" || !signature.startsWith("sha256=")) return false;

  const sent = Number(timestamp);
  if (!Number.isFinite(sent)) return false;
  const current = Number.isFinite(now) ? now : Math.floor(Date.now() / 1000);
  // Symmetric: a timestamp far in the FUTURE is just as wrong as a stale
  // one, and accepting it would hand back the replay window just closed.
  if (Math.abs(current - sent) > MAX_SKEW_SECONDS) return false;

  const expected = createHmac("sha256", secret).update(`${requestId}.${timestamp}.${rawBody}`).digest("hex");
  const given = signature.slice("sha256=".length).toLowerCase();
  if (given.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}

/** The text events we subscribe the number to. */
export const TEXT_EVENTS = ["text.received", "text.sent", "text.delivered", "text.delivery_failed", "text.delivery_unconfirmed"];
