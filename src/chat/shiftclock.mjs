// The office shift clock — sign in and out, with proof of being on site.
// Ported from Luxe Stay's housekeeper clock (src/chatbot/shifts.js), adapted
// from many properties down to one office, and from Cloudflare KV down to
// Zoho CRM's Events module as the store (Property Sauce has no KV; Zoho is
// already this site's system of record for everything else).
//
// Two independent signals, neither trusted alone:
//
//   1. PUBLIC IP. Vercel hands us x-forwarded-for: the public address of
//      whatever router the phone or laptop is behind. On the office
//      broadband that is the office's own line. The caller cannot influence
//      this — it is observed at the edge, not reported by the browser.
//
//   2. GPS. The browser's Geolocation API, checked against the office's own
//      coordinates. Reported BY the device, so spoofable with developer
//      tools — treated as corroboration, never alone.
//
// The clock time is always the server's.
//
// Storage: each known office IP, each open shift and each closed shift is
// its own Zoho Events record (module "Events" — a standard CRM module, not
// a new custom one, so no extra API scope was needed). The record's title
// is a machine-readable key; Start/End_DateTime hold the real times;
// Description holds the human-readable detail. See the title conventions
// below each store function.

import { search, createRecord, updateRecord, deleteRecord } from "./zoho.mjs";

export const OFFICE = {
  name: "The Property Sauce office",
  address: "Top Floor, 55 Coopers Lane, Leyton, London E10 5DG",
  lat: 51.569413,
  lng: -0.010244,
};

// GPS indoors/upstairs is imprecise; 150 m is Luxe Stay's own figure for the
// same reason (thick walls, no sky) and holds up fine for one building.
const FENCE_METRES = 150;
const MAX_ACCURACY_METRES = 500;
const MAX_SHIFT_HOURS = 12;

const nowIso = () => new Date().toISOString();

/** Zoho CRM's datetime fields want an offset, not a bare "Z". */
function zohoDateTime(d) {
  const p = (n) => String(n).padStart(2, "0");
  const offMin = -d.getTimezoneOffset();
  const sign = offMin >= 0 ? "+" : "-";
  const off = `${sign}${p(Math.floor(Math.abs(offMin) / 60))}:${p(Math.abs(offMin) % 60)}`;
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}${off}`;
}

export function metresBetween(lat1, lon1, lat2, lon2) {
  const R = 6_371_000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// --- the register of known office broadband addresses -----------------------
// One Zoho Event per known IP. Title: "IP: <address>". Description holds a
// small JSON blob with the confirmation state.

const ipTitle = (ip) => `IP: ${ip}`;

export async function knownIps() {
  const rows = await search("Events", `(Event_Title:starts_with:IP:)`, "id,Event_Title,Description", 200);
  return rows.map((r) => {
    let meta = {};
    try { meta = JSON.parse(r.Description || "{}"); } catch { /* ignore */ }
    return { id: r.id, ip: r.Event_Title.replace(/^IP:\s*/, ""), ...meta };
  });
}

export async function findKnownIp(ip) {
  const rows = await knownIps();
  return rows.find((r) => r.ip === ip) || null;
}

export async function rememberIp(ip, { confirmed = false, by = null, note = "" } = {}) {
  const existing = await findKnownIp(ip);
  const now = nowIso();
  if (existing) {
    const meta = {
      firstSeen: existing.firstSeen || now,
      lastSeen: now,
      seenCount: (existing.seenCount || 0) + 1,
      confirmedAt: existing.confirmedAt || (confirmed ? now : null),
      confirmedBy: existing.confirmedBy || (confirmed ? by : null),
      note: existing.note || note,
    };
    await updateRecord("Events", existing.id, { Description: JSON.stringify(meta) });
    return meta;
  }
  const meta = { firstSeen: now, lastSeen: now, seenCount: 1, confirmedAt: confirmed ? now : null, confirmedBy: confirmed ? by : null, note };
  const start = new Date();
  await createRecord("Events", {
    Event_Title: ipTitle(ip),
    Start_DateTime: zohoDateTime(start),
    End_DateTime: zohoDateTime(new Date(start.getTime() + 60_000)),
    Description: JSON.stringify(meta),
  });
  return meta;
}

export async function forgetIp(ip) {
  const existing = await findKnownIp(ip);
  if (existing) await deleteRecord("Events", existing.id);
}

// --- deciding whether to believe them ---------------------------------------
// Same matrix as Luxe Stay, one office instead of many properties.

export async function assess({ ip, coords }) {
  const known = await findKnownIp(ip);
  const reasons = [];

  let gps = "absent";
  let distance = null;
  if (coords && Number.isFinite(coords.lat) && Number.isFinite(coords.lng)) {
    const accuracy = Number(coords.accuracy);
    if (Number.isFinite(accuracy) && accuracy > MAX_ACCURACY_METRES) {
      reasons.push(`Location was too vague to use (±${Math.round(accuracy)} m).`);
    } else {
      distance = Math.round(metresBetween(coords.lat, coords.lng, OFFICE.lat, OFFICE.lng));
      gps = distance <= FENCE_METRES ? "inside" : "outside";
    }
  }

  const ipMatch = Boolean(known);
  let allow, status, fix = null;

  if (ipMatch && gps === "inside") { allow = true; status = "verified"; }
  else if (ipMatch && gps === "absent") { allow = true; status = "verified-no-gps"; reasons.push("On the office broadband, but no usable location reading."); }
  else if (ipMatch && gps === "outside") { allow = true; status = "conflict"; reasons.push(`On the office broadband, but the device placed itself ${distance} m away.`); }
  else if (!ipMatch && gps === "inside") {
    allow = true; status = "learned";
    reasons.push("New broadband address for the office, accepted because the location matched. Awaiting confirmation.");
    await rememberIp(ip, { confirmed: false, note: "learned from an on-site sign-in" });
  } else {
    allow = false;
    status = gps === "outside" ? "off-site" : "unproven";
    reasons.push(gps === "outside" ? `Not on the office Wi-Fi, and the device placed itself ${distance} m away.` : "Not on the office Wi-Fi, and no location reading to go on.");
    fix = gps === "outside" ? "Connect to the office Wi-Fi and try again." : "Connect to the office Wi-Fi, allow location, and try again. If the Wi-Fi is down, use \"Ask the office\".";
  }

  return { allow, status, reasons, ipMatch, gps, distance, fix };
}

// --- shift records -----------------------------------------------------------
// An OPEN shift: one Zoho Event, title "OPEN: <slug>". On clock-out the SAME
// record is relabelled "SHIFT: <date>: <slug>: <rand>" and gets its real
// End_DateTime — one record for the whole lifecycle, findable afterwards by
// date because the date leads the title.

const openTitle = (slug) => `OPEN: ${slug}`;
const shiftTitle = (date, slug, id) => `SHIFT: ${date}: ${slug}: ${id}`;
const refusedTitle = (date, slug, id) => `REFUSED: ${date}: ${slug}: ${id}`;

export async function openShift(slug) {
  const rows = await search("Events", `(Event_Title:equals:${openTitle(slug)})`, "id,Event_Title,Start_DateTime,Description", 1).catch(() => []);
  if (!rows.length) return null;
  let meta = {};
  try { meta = JSON.parse(rows[0].Description || "{}"); } catch { /* ignore */ }
  return { id: rows[0].id, startedAt: rows[0].Start_DateTime, ...meta };
}

export async function logAttempt({ slug, staffName, status, ip, distance, accuracy, reasons, action }) {
  const at = new Date();
  const date = at.toISOString().slice(0, 10);
  await createRecord("Events", {
    Event_Title: refusedTitle(date, slug, Math.random().toString(36).slice(2, 8)),
    Start_DateTime: zohoDateTime(at),
    End_DateTime: zohoDateTime(new Date(at.getTime() + 60_000)),
    Description: JSON.stringify({ staffName, status, ip, distance, accuracy, reasons, action }),
  }).catch(() => {});
}

export async function clockIn({ staff, verdict, ip, coords }) {
  const slug = staff.slug;
  const existing = await openShift(slug);
  if (existing) return { ok: false, error: `You are already signed in since ${existing.startedAt.slice(11, 16)}. Sign out first.` };

  const start = new Date();
  const meta = { staffName: staff.name, role: staff.role, startStatus: verdict.status, startIp: ip, startDistance: verdict.distance, breaks: [], onBreak: false };
  const details = await createRecord("Events", {
    Event_Title: openTitle(slug),
    Start_DateTime: zohoDateTime(start),
    End_DateTime: zohoDateTime(new Date(start.getTime() + 60_000)),
    Description: JSON.stringify(meta),
  });
  return { ok: true, shift: { id: details.id, startedAt: start.toISOString(), ...meta } };
}

export async function clockOut({ staff, verdict, ip, coords }) {
  const slug = staff.slug;
  const open = await openShift(slug);
  if (!open) return { ok: false, error: "You are not signed in to a shift." };

  const end = new Date();
  const breaks = Array.isArray(open.breaks) ? [...open.breaks] : [];
  if (open.onBreak && open.breakStartedAt) {
    const started = new Date(open.breakStartedAt);
    breaks.push({ start: open.breakStartedAt, end: end.toISOString(), minutes: Math.max(0, Math.round((end - started) / 60_000)) });
  }
  const breakMinutes = breaks.reduce((sum, b) => sum + (b.minutes || 0), 0);

  const minutes = Math.round((end - new Date(open.startedAt)) / 60_000);
  const overrun = minutes > MAX_SHIFT_HOURS * 60;
  const date = open.startedAt.slice(0, 10);

  const meta = { ...open, breaks, breakMinutes, onBreak: false, breakStartedAt: null, endStatus: verdict.status, endIp: ip, endDistance: verdict.distance, minutes, overrun };
  delete meta.id;
  await updateRecord("Events", open.id, {
    Event_Title: shiftTitle(date, slug, open.id.slice(-6)),
    End_DateTime: zohoDateTime(end),
    Description: JSON.stringify(meta),
  });
  return { ok: true, minutes, overrun, breakMinutes, shift: { ...open, endedAt: end.toISOString() } };
}

export async function startBreak({ staff, verdict, ip }) {
  const slug = staff.slug;
  const open = await openShift(slug);
  if (!open) return { ok: false, error: "You are not signed in to a shift." };
  if (open.onBreak) return { ok: false, error: `You are already on a break since ${(open.breakStartedAt || "").slice(11, 16)}.` };

  const start = new Date();
  const meta = { ...open, onBreak: true, breakStartedAt: start.toISOString(), breakStartIp: ip, breakStartStatus: verdict.status };
  delete meta.id;
  await updateRecord("Events", open.id, { Description: JSON.stringify(meta) });
  return { ok: true, breakStartedAt: start.toISOString() };
}

export async function endBreak({ staff, verdict, ip }) {
  const slug = staff.slug;
  const open = await openShift(slug);
  if (!open) return { ok: false, error: "You are not signed in to a shift." };
  if (!open.onBreak) return { ok: false, error: "You are not on a break." };

  const end = new Date();
  const started = new Date(open.breakStartedAt);
  const minutes = Math.max(0, Math.round((end - started) / 60_000));
  const breaks = Array.isArray(open.breaks) ? [...open.breaks] : [];
  breaks.push({ start: open.breakStartedAt, end: end.toISOString(), minutes });

  const meta = { ...open, breaks, onBreak: false, breakStartedAt: null, breakEndIp: ip, breakEndStatus: verdict.status };
  delete meta.id;
  await updateRecord("Events", open.id, { Description: JSON.stringify(meta) });
  return { ok: true, breakMinutes: minutes, totalBreakMinutes: breaks.reduce((sum, b) => sum + (b.minutes || 0), 0) };
}

/** Every shift (closed) and refused attempt for one day, newest first. */
export async function dayLog(date) {
  const [shifts, refused] = await Promise.all([
    search("Events", `(Event_Title:starts_with:SHIFT: ${date})`, "id,Event_Title,Start_DateTime,End_DateTime,Description", 200).catch(() => []),
    search("Events", `(Event_Title:starts_with:REFUSED: ${date})`, "id,Event_Title,Start_DateTime,Description", 200).catch(() => []),
  ]);
  const parsed = [];
  for (const r of shifts) {
    let meta = {};
    try { meta = JSON.parse(r.Description || "{}"); } catch { /* ignore */ }
    parsed.push({ kind: "shift", at: r.Start_DateTime, endedAt: r.End_DateTime, ...meta });
  }
  for (const r of refused) {
    let meta = {};
    try { meta = JSON.parse(r.Description || "{}"); } catch { /* ignore */ }
    parsed.push({ kind: "refused", at: r.Start_DateTime, ...meta });
  }
  return parsed.sort((a, b) => (b.at || "").localeCompare(a.at || ""));
}

export const config = { FENCE_METRES, MAX_ACCURACY_METRES, MAX_SHIFT_HOURS, OFFICE };
