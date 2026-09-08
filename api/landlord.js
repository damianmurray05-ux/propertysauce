// The landlord portal. POST { action, ... }
//   lookup    { reference }               -> masked email / phone
//   start     { reference, channel }      -> signed challenge token, code sent
//   check     { token, code }             -> signed landlord session
//   portfolio { session }                 -> scored properties, certificates, documents
import { findLandlord, propertiesFor, landlordsConfigured, scorePortfolio } from "../src/chat/landlords.mjs";
import { maskEmail, maskPhone } from "../src/chat/directory.mjs";
import { sign, verify, otp, hashCode } from "../src/chat/crypto.mjs";
import { sendEmail, sendSms, emailConfigured, smsConfigured } from "../src/chat/notify.mjs";
import { limit } from "../src/chat/ratelimit.mjs";

const devEcho = () => process.env.CHAT_DEV_ECHO_CODE === "1" && !String(process.env.VERCEL_ENV || "").startsWith("prod");
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export async function POST(request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (!limit(`landlord:${ip}`, 30, 10 * 60 * 1000)) return json(429, { error: "rate_limited" });
  let body;
  try { body = await request.json(); } catch { return json(400, { error: "bad_json" }); }
  if (!landlordsConfigured()) return json(503, { error: "portal_unavailable" });

  if (body.action === "lookup") {
    const l = await findLandlord(body.reference);
    if (!l) return json(404, { error: "not_found" });
    const channels = { email: (emailConfigured() || devEcho()) && l.email ? maskEmail(l.email) : null, phone: smsConfigured() && l.phone ? maskPhone(l.phone) : null };
    if (!channels.email && !channels.phone) return json(503, { error: "portal_unavailable" });
    return json(200, channels);
  }

  if (body.action === "start") {
    const l = await findLandlord(body.reference);
    if (!l) return json(404, { error: "not_found" });
    const code = otp();
    const token = sign({ t: "landlord-challenge", ref: l.reference, h: hashCode(`L:${l.reference}`, code), exp: Date.now() + 10 * 60 * 1000 });
    let sent;
    if (devEcho() && !emailConfigured() && !smsConfigured()) sent = { ok: true };
    else if (body.channel === "sms" && l.phone) sent = await sendSms({ to: l.phone, text: `Property Sauce: your landlord portal code is ${code}. It expires in 10 minutes.` });
    else if (l.email) sent = await sendEmail({ to: l.email, subject: `Your Property Sauce portal code: ${code}`, text: `Your one-time code is ${code}.\n\nEnter it on the landlord portal at propertysauce.co to continue. It expires in 10 minutes. If you did not request this, ignore this email.\n\nProperty Sauce` });
    else return json(400, { error: "no_channel" });
    if (!sent.ok) return json(503, { error: "send_failed" });
    const res = { ok: true, token };
    if (devEcho()) res.devCode = code;
    return json(200, res);
  }

  if (body.action === "check") {
    const ch = verify(body.token);
    if (!ch || ch.t !== "landlord-challenge") return json(400, { error: "bad_token" });
    if (ch.expired) return json(410, { error: "expired" });
    const code = String(body.code || "").replace(/\D/g, "");
    if (code.length !== 6 || hashCode(`L:${ch.ref}`, code) !== ch.h) return json(400, { error: "wrong_code" });
    const l = await findLandlord(ch.ref);
    if (!l) return json(404, { error: "not_found" });
    const session = sign({ t: "landlord", ref: l.reference, name: l.name, exp: Date.now() + 4 * 60 * 60 * 1000 });
    return json(200, { ok: true, session, landlord: { firstName: l.firstName, name: l.name } });
  }

  if (body.action === "portfolio") {
    const s = verify(body.session);
    if (!s || s.t !== "landlord" || s.expired) return json(401, { error: "session_expired" });
    const props = await propertiesFor(s.ref);
    return json(200, { firstName: (s.name || "").split(/\s+/)[0] || "there", name: s.name, ...scorePortfolio(props) });
  }

  return json(400, { error: "bad_action" });
}
