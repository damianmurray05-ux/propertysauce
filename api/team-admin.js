// GET  /api/team-admin?key=...&date=YYYY-MM-DD
//        The day's clock events — accepted and refused — plus the register
//        of known office broadband addresses and anything awaiting
//        confirmation.
// GET  /api/team-admin?key=...&callId=...
//        Read back one outbound call's status/result.
// POST /api/team-admin   { key, action: 'confirm' | 'forget', ip }
// POST /api/team-admin   { key, action: 'call', to, reason, onVoicemail?, voicemailMessage? }
//        Places a real outbound call via Inkbox Voice AI.
//
// Key-protected with STAFF_ADMIN_KEY rather than a full sign-in: this is a
// one-person admin view, not a portal, and matches how Luxe Stay's
// equivalent page works. Outbound calling lives here too, not its own
// route file, to stay under Vercel Hobby's 12-serverless-function cap.
import { timingSafeEqual } from "node:crypto";
import { dayLog, knownIps, rememberIp, forgetIp, config } from "../src/chat/shiftclock.mjs";
import { roster } from "../src/chat/staff.mjs";
import { allowanceFor, leaveSummary } from "../src/chat/holidays.mjs";
import { placeCall, getCall, getTranscript, outboundCallConfigured } from "../src/chat/outbound-call.mjs";
import { limit } from "../src/chat/ratelimit.mjs";

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

function authorised(supplied) {
  const want = process.env.STAFF_ADMIN_KEY || "";
  const a = Buffer.from(String(supplied || ""));
  const b = Buffer.from(want);
  if (!want || a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || "");

export async function GET(request) {
  const url = new URL(request.url);
  // 404 rather than 401: an unauthenticated caller learns nothing about
  // whether this address is a real endpoint.
  if (!authorised(url.searchParams.get("key"))) return json(404, { error: "not_found" });

  const callId = url.searchParams.get("callId");
  if (callId) {
    const call = await getCall(callId);
    if (url.searchParams.get("transcript")) call.transcript = await getTranscript(callId).catch(() => []);
    return json(200, call);
  }

  const date = url.searchParams.get("date");
  const day = isDate(date) ? date : new Date().toISOString().slice(0, 10);

  const ips = await knownIps();
  const pending = ips.filter((r) => !r.confirmedAt);

  const taken = await leaveSummary().catch(() => []);
  const takenByName = new Map(taken.map((t) => [t.name, t]));
  const holidays = roster().map((s) => {
    const { publicHolidays, holidayAllowance, sickAllowance } = allowanceFor(s.name);
    const t = takenByName.get(s.name) || { holidayTakenDays: 0, sickTakenDays: 0 };
    return {
      name: s.name, publicHolidays,
      holidayAllowance, holidayTakenDays: t.holidayTakenDays, holidayRemaining: holidayAllowance - t.holidayTakenDays,
      sickAllowance, sickTakenDays: t.sickTakenDays, sickRemaining: sickAllowance - t.sickTakenDays,
    };
  });

  return json(200, {
    date: day,
    events: await dayLog(day),
    register: ips,
    pending,
    staff: roster(),
    holidays,
    config,
  });
}

export async function POST(request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (!limit(`teamadmin:${ip}`, 120, 3600 * 1000)) return json(429, { error: "rate_limited" });

  let body;
  try { body = await request.json(); } catch { return json(400, { error: "bad_json" }); }
  if (!authorised(body.key)) return json(404, { error: "not_found" });

  const action = String(body.action || "");

  if (action === "call") {
    if (!outboundCallConfigured()) return json(503, { error: "not_configured" });
    const to = String(body.to || "").trim();
    const reason = String(body.reason || "").trim();
    if (!to || !reason) return json(400, { error: "to and reason are required" });
    const call = await placeCall({ to, reason, onVoicemail: body.onVoicemail, voicemailMessage: body.voicemailMessage });
    return json(200, call);
  }

  const target = String(body.ip || "").trim();
  if (!target) return json(400, { error: "Which address?" });

  if (action === "confirm") { await rememberIp(target, { confirmed: true, by: "office" }); return json(200, { ok: true, message: `${target} confirmed.` }); }
  if (action === "forget") { await forgetIp(target); return json(200, { ok: true, message: `${target} removed. Sign-ins from it will be refused.` }); }
  return json(400, { error: "action must be confirm, forget or call." });
}
