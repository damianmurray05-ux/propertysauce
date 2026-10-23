// POST /api/team-call   { key, to, reason, onVoicemail?, voicemailMessage? }
//   Places a real outbound call via Inkbox Voice AI. Key-protected the same
//   way as /api/team-admin — this is Damian's own lever, not something
//   exposed to staff or tenants.
// GET  /api/team-call?key=...&id=<call_id>
//   Reads back a call's current status/result.
import { timingSafeEqual } from "node:crypto";
import { placeCall, getCall, outboundCallConfigured } from "../src/chat/outbound-call.mjs";
import { limit } from "../src/chat/ratelimit.mjs";

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

function authorised(supplied) {
  const want = process.env.STAFF_ADMIN_KEY || "";
  const a = Buffer.from(String(supplied || ""));
  const b = Buffer.from(want);
  if (!want || a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function GET(request) {
  const url = new URL(request.url);
  if (!authorised(url.searchParams.get("key"))) return json(404, { error: "not_found" });
  const id = url.searchParams.get("id");
  if (!id) return json(400, { error: "id required" });
  const call = await getCall(id);
  return json(200, call);
}

export async function POST(request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (!limit(`teamcall:${ip}`, 30, 3600 * 1000)) return json(429, { error: "rate_limited" });

  let body;
  try { body = await request.json(); } catch { return json(400, { error: "bad_json" }); }
  if (!authorised(body.key)) return json(404, { error: "not_found" });
  if (!outboundCallConfigured()) return json(503, { error: "not_configured" });

  const to = String(body.to || "").trim();
  const reason = String(body.reason || "").trim();
  if (!to || !reason) return json(400, { error: "to and reason are required" });

  const call = await placeCall({ to, reason, onVoicemail: body.onVoicemail, voicemailMessage: body.voicemailMessage });
  return json(200, call);
}
