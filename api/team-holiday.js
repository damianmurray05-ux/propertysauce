// GET  /api/team-holiday   -> this person's holiday + sick balance and history
// POST /api/team-holiday   { type: 'holiday' | 'sick', startDate, endDate, reason, isEmergency, proof }
//   proof: base64 PDF. Only matters for type:'holiday' — it's the only thing
//   that exempts a short-notice request from the doubling. Sick days never
//   need proof or notice; that's the whole point of having them.
import { verify } from "../src/chat/crypto.mjs";
import { allowanceFor, requestLeave, leaveForStaff } from "../src/chat/holidays.mjs";
import { sendEmail, TEAM_EMAIL } from "../src/chat/notify.mjs";
import { limit } from "../src/chat/ratelimit.mjs";

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

function staffFrom(request) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const payload = verify(token);
  if (!payload || payload.t !== "staff" || payload.expired) return null;
  return payload;
}

export async function GET(request) {
  const staff = staffFrom(request);
  if (!staff) return json(401, { error: "Please sign in again." });
  const { publicHolidays, holidayAllowance, sickAllowance } = allowanceFor(staff.name);
  const { requests, holidayTakenDays, sickTakenDays } = await leaveForStaff(staff.slug).catch(() => ({ requests: [], holidayTakenDays: 0, sickTakenDays: 0 }));
  return json(200, {
    publicHolidays,
    holidayAllowance, holidayTakenDays, holidayRemaining: holidayAllowance - holidayTakenDays,
    sickAllowance, sickTakenDays, sickRemaining: sickAllowance - sickTakenDays,
    requests,
  });
}

export async function POST(request) {
  const staff = staffFrom(request);
  if (!staff) return json(401, { error: "Please sign in again." });
  if (!limit(`holiday:${staff.slug}`, 15, 3600 * 1000)) return json(429, { error: "Too many attempts. Please ring the office." });

  let body;
  try { body = await request.json(); } catch { return json(400, { error: "bad_json" }); }

  const type = body.type === "sick" ? "sick" : "holiday";
  if (type === "holiday" && body.isEmergency && !body.proof) return json(400, { error: "An emergency claim needs the PDF uploaded with it." });

  const result = await requestLeave({
    type,
    staff: { name: staff.name, slug: staff.slug },
    startDate: body.startDate, endDate: body.endDate, reason: body.reason,
    isEmergency: Boolean(body.isEmergency), proof: body.proof || null,
  });
  if (!result.ok) return json(400, { error: result.error });

  const { holidayAllowance, sickAllowance } = allowanceFor(staff.name);
  const { holidayTakenDays, sickTakenDays } = await leaveForStaff(staff.slug).catch(() => ({ holidayTakenDays: 0, sickTakenDays: 0 }));
  const remaining = type === "sick" ? sickAllowance - sickTakenDays : holidayAllowance - holidayTakenDays;

  await sendEmail({
    to: TEAM_EMAIL,
    subject: `${type === "sick" ? "Sick day" : "Holiday"} booked — ${staff.name}: ${result.startDate}${result.endDate !== result.startDate ? ` to ${result.endDate}` : ""}`,
    text: [
      `${staff.name} booked ${result.days} ${type} day(s), ${result.startDate} to ${result.endDate}.`,
      type === "holiday" ? `Notice given: ${result.noticeDays} day(s).` : "",
      result.shortNotice && !result.isEmergency ? `Less than 4 weeks' notice — charged as ${result.chargedDays} days instead of ${result.days}.` : "",
      result.isEmergency ? "Logged as a medical emergency, with proof uploaded." : "",
      result.reason ? `Reason given: ${result.reason}` : "",
      `${staff.name} now has ${remaining} ${type} day(s) left this year.`,
    ].filter(Boolean).join("\n"),
  }).catch(() => {});

  return json(200, { ok: true, ...result, remaining });
}
