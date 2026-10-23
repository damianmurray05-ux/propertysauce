// GET  /api/team-holiday   -> this person's holiday balance and history
// POST /api/team-holiday   { startDate, endDate, reason, isEmergency, proof }
//   proof: base64 PDF. Required for isEmergency to actually exempt the
//   request from the short-notice doubling — see holidays.mjs.
import { verify } from "../src/chat/crypto.mjs";
import { allowanceFor, requestHoliday, holidaysForStaff } from "../src/chat/holidays.mjs";
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
  const { allowance, publicHolidaysDeducted, adjustedAllowance } = allowanceFor(staff.name);
  const { requests, takenDays } = await holidaysForStaff(staff.slug).catch(() => ({ requests: [], takenDays: 0 }));
  return json(200, {
    allowance, publicHolidaysDeducted, adjustedAllowance,
    takenDays, remaining: adjustedAllowance - takenDays,
    requests,
  });
}

export async function POST(request) {
  const staff = staffFrom(request);
  if (!staff) return json(401, { error: "Please sign in again." });
  if (!limit(`holiday:${staff.slug}`, 15, 3600 * 1000)) return json(429, { error: "Too many attempts. Please ring the office." });

  let body;
  try { body = await request.json(); } catch { return json(400, { error: "bad_json" }); }

  if (body.isEmergency && !body.proof) return json(400, { error: "An emergency claim needs the PDF uploaded with it." });

  const result = await requestHoliday({
    staff: { name: staff.name, slug: staff.slug },
    startDate: body.startDate, endDate: body.endDate, reason: body.reason,
    isEmergency: Boolean(body.isEmergency), proof: body.proof || null,
  });
  if (!result.ok) return json(400, { error: result.error });

  await sendEmail({
    to: TEAM_EMAIL,
    subject: `Holiday booked — ${staff.name}: ${result.startDate}${result.endDate !== result.startDate ? ` to ${result.endDate}` : ""}`,
    text: [
      `${staff.name} booked ${result.days} day(s), ${result.startDate} to ${result.endDate}.`,
      `Notice given: ${result.noticeDays} day(s).`,
      result.shortNotice && !result.isEmergency ? `Less than 4 weeks' notice — charged as ${result.chargedDays} days instead of ${result.days}.` : "",
      result.isEmergency ? "Logged as a medical emergency, with proof uploaded." : "",
      result.reason ? `Reason given: ${result.reason}` : "",
    ].filter(Boolean).join("\n"),
  }).catch(() => {});

  return json(200, { ok: true, ...result });
}
