// GET  /api/team-shift   -> am I signed in, and to what?
// POST /api/team-shift   { action: 'in' | 'out' | 'help', coords, note }
//
// The office clock. Requires the staff bearer token from /api/team-signin.
// Deliberately there is no way for the caller to assert where they are: the
// address comes from Vercel's forwarded-for header, the coordinates are
// checked against the office's own, and the time is the server's.
import { verify, sign } from "../src/chat/crypto.mjs";
import { staffSlug } from "../src/chat/staff.mjs";
import { assess, clockIn, clockOut, startBreak, endBreak, openShift, logAttempt, OFFICE } from "../src/chat/shiftclock.mjs";
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

function coordsFrom(body) {
  const c = body?.coords;
  if (!c) return null;
  const lat = Number(c.lat), lng = Number(c.lng), accuracy = Number(c.accuracy);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng, accuracy: Number.isFinite(accuracy) ? accuracy : null };
}

export async function GET(request) {
  const staff = staffFrom(request);
  if (!staff) return json(401, { error: "Please sign in again." });
  const open = await openShift(staff.slug).catch(() => null);
  return json(200, { staff: { name: staff.name, role: staff.role }, open, office: { name: OFFICE.name, address: OFFICE.address } });
}

export async function POST(request) {
  const staff = staffFrom(request);
  if (!staff) return json(401, { error: "Please sign in again." });

  let body;
  try { body = await request.json(); } catch { return json(400, { error: "bad_json" }); }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const coords = coordsFrom(body);
  const action = String(body.action || "").toLowerCase();

  if (!limit(`shift:${staff.slug}`, 40, 3600 * 1000)) return json(429, { error: "Too many attempts. Please ring the office." });

  // "Ask the office" — the honest escape hatch. It does not clock anybody
  // in; it tells Damian the whole picture and leaves him to decide.
  if (action === "help") {
    const open = await openShift(staff.slug).catch(() => null);
    await logAttempt({ slug: staff.slug, staffName: staff.name, status: "help", ip, distance: null, accuracy: coords?.accuracy ?? null, reasons: [String(body.note || "").slice(0, 300)], action: "help" });
    await sendEmail({
      to: TEAM_EMAIL,
      subject: `Shift clock — ${staff.name} cannot sign ${open ? "out" : "in"}`,
      text: [
        `${staff.name} pressed "Ask the office".`,
        `Their note: ${String(body.note || "(none)").slice(0, 300)}`,
        `Address seen: ${ip}`,
        coords ? `Device location: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)} (±${Math.round(coords.accuracy ?? 0)} m)` : "Device location: not given",
        open ? `They have an open shift since ${open.startedAt}.` : "They have no open shift.",
        "",
        "Nothing has been clocked. Confirm with them and set the time by hand if it is genuine.",
      ].join("\n"),
    }).catch(() => {});
    return json(200, { ok: true, raised: true, message: "The office has been told. Ring them if it is urgent." });
  }

  if (!["in", "out", "break", "return"].includes(action)) return json(400, { error: "action must be in, out, break, return or help." });

  const open = await openShift(staff.slug).catch(() => null);
  if ((action === "out" || action === "break" || action === "return") && !open) return json(409, { error: "You are not signed in to a shift." });
  if (action === "break" && open.onBreak) return json(409, { error: `You are already on a break since ${(open.breakStartedAt || "").slice(11, 16)}.` });
  if (action === "return" && !open.onBreak) return json(409, { error: "You are not on a break." });

  const verdict = await assess({ ip, coords });

  if (!verdict.allow) {
    await logAttempt({ slug: staff.slug, staffName: staff.name, status: verdict.status, ip, distance: verdict.distance, accuracy: coords?.accuracy ?? null, reasons: verdict.reasons, action });
    return json(403, { ok: false, status: verdict.status, message: verdict.reasons.join(" "), fix: verdict.fix });
  }

  const who = { name: staff.name, role: staff.role, slug: staff.slug };
  let result;
  if (action === "in") result = await clockIn({ staff: who, verdict, ip, coords });
  else if (action === "out") result = await clockOut({ staff: who, verdict, ip, coords });
  else if (action === "break") result = await startBreak({ staff: who, verdict, ip });
  else result = await endBreak({ staff: who, verdict, ip });

  if (!result.ok) return json(409, { error: result.error });

  // Anything other than a clean pass is worth Damian knowing the same day.
  if (verdict.status === "conflict" || verdict.status === "learned" || result.overrun) {
    await sendEmail({
      to: TEAM_EMAIL,
      subject: `Shift clock — ${verdict.status === "learned" ? "new office broadband address" : "needs a look"}: ${staff.name}`,
      text: [
        `${staff.name} signed ${action}.`,
        `Outcome: ${verdict.status}.`,
        ...verdict.reasons,
        `Address seen: ${ip}`,
        result.overrun ? `That shift ran ${Math.round(result.minutes / 60)} hours — probably a forgotten sign-out.` : "",
        verdict.status === "learned" ? "Confirm or remove that address on the staff admin page so the register stays clean." : "",
      ].filter(Boolean).join("\n"),
    }).catch(() => {});
  }

  return json(200, {
    ok: true,
    status: verdict.status,
    ...(action === "in" ? { signedInAt: result.shift.startedAt } : {}),
    ...(action === "out" ? { minutes: result.minutes, breakMinutes: result.breakMinutes } : {}),
    ...(action === "break" ? { onBreakSince: result.breakStartedAt } : {}),
    ...(action === "return" ? { breakMinutes: result.breakMinutes } : {}),
    note: verdict.status === "verified" ? null : verdict.reasons.join(" "),
  });
}
