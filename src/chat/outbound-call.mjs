// Placing outbound calls through Inkbox Voice AI — the same hosted agent
// that already answers inbound calls, now also making them. One call to
// Inkbox's REST API; no SDK dependency, just fetch.
//
// This exists because Damian needs real outbound calling — starting with a
// quick capability test, but the same mechanism is how calls chasing unpaid
// rent would go out later.

const FROM_NUMBER = "+447457410735"; // Property Sauce's Inkbox number

export const outboundCallConfigured = () => Boolean(process.env.INKBOX_API_KEY);

export async function placeCall({ to, reason, onVoicemail = "hang_up", voicemailMessage }) {
  if (!outboundCallConfigured()) throw new Error("INKBOX_API_KEY not configured");
  const body = {
    origination: "dedicated_number",
    from_number: FROM_NUMBER,
    to_number: to,
    mode: "hosted_agent",
    reason: String(reason || "").slice(0, 2000),
    on_voicemail: onVoicemail,
  };
  if (onVoicemail === "leave_message" && voicemailMessage) body.voicemail_message = String(voicemailMessage).slice(0, 1000);
  const r = await fetch("https://inkbox.ai/api/v1/phone/place-call", {
    method: "POST",
    headers: { "X-API-Key": process.env.INKBOX_API_KEY, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`inkbox place-call ${r.status}: ${JSON.stringify(d).slice(0, 300)}`);
  return d;
}

export async function getCall(callId) {
  const r = await fetch(`https://inkbox.ai/api/v1/phone/calls/${callId}`, {
    headers: { "X-API-Key": process.env.INKBOX_API_KEY },
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`inkbox get-call ${r.status}: ${JSON.stringify(d).slice(0, 300)}`);
  return d;
}

export async function getTranscript(callId) {
  const r = await fetch(`https://inkbox.ai/api/v1/phone/calls/${callId}/transcripts`, {
    headers: { "X-API-Key": process.env.INKBOX_API_KEY },
  });
  const d = await r.json().catch(() => ([]));
  if (!r.ok) throw new Error(`inkbox transcripts ${r.status}: ${JSON.stringify(d).slice(0, 300)}`);
  return d;
}
