// Holiday booking, and the running balance against each person's annual
// allowance. Same Zoho Events module as the shift clock, same reasoning —
// one record per request, searchable by the date it starts.
//
// Company policy, confirmed by Damian 23 Oct 2026: 32 days a year, in three
// parts —
//   14 public holidays   fixed, non-negotiable, nothing to book
//   10 holiday days       booked by the person, 4 weeks' notice required
//    8 sick days          no notice needed, taken as sick
// Four weeks' notice on a HOLIDAY day: less than that costs DOUBLE days,
// unless it is a medical emergency with proof (a PDF) uploaded at the time,
// which keeps the normal rate. SICK days never carry that penalty — that is
// the whole point of having them as a separate pool.

import { search, createRecord, uploadAttachment } from "./zoho.mjs";

const NOTICE_DAYS_REQUIRED = 28;
const DEFAULTS = { publicHolidays: 14, holidayAllowance: 10, sickAllowance: 8 };

function zohoDateTime(d) {
  const p = (n) => String(n).padStart(2, "0");
  const offMin = -d.getTimezoneOffset();
  const sign = offMin >= 0 ? "+" : "-";
  const off = `${sign}${p(Math.floor(Math.abs(offMin) / 60))}:${p(Math.abs(offMin) % 60)}`;
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}${off}`;
}

const parseDate = (s) => { const d = new Date(`${s}T00:00:00`); return Number.isNaN(d.getTime()) ? null : d; };
const isoDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Working days in [start, end] inclusive. Sunday is the one weekly day off for a 6-day week, so it's never charged. */
function workingDaysBetween(start, end) {
  let count = 0;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    if (d.getDay() !== 0) count++;
  }
  return count;
}

const TITLE = { holiday: "HOLIDAY", sick: "SICK" };
const leaveTitle = (type, startDate, slug, id) => `${TITLE[type]}: ${startDate}: ${slug}: ${id}`;

function loadDirectory() {
  if (!process.env.STAFF_DIRECTORY_JSON) return [];
  try { return JSON.parse(process.env.STAFF_DIRECTORY_JSON); } catch { return []; }
}

/** The three-way annual allowance for one person. Per-person overrides come from their STAFF_DIRECTORY_JSON row. */
export function allowanceFor(name) {
  const row = loadDirectory().find((r) => (r.name || "").trim().toLowerCase() === String(name || "").trim().toLowerCase());
  return {
    publicHolidays: Number(row?.publicHolidays) || DEFAULTS.publicHolidays,
    holidayAllowance: Number(row?.holidayAllowance) || DEFAULTS.holidayAllowance,
    sickAllowance: Number(row?.sickAllowance) || DEFAULTS.sickAllowance,
  };
}

export async function requestLeave({ type, staff, startDate, endDate, reason, isEmergency, proof }) {
  const start = parseDate(startDate);
  const end = parseDate(endDate || startDate);
  if (!start || !end || end < start) return { ok: false, error: "That date range doesn't look right." };

  const days = workingDaysBetween(start, end);
  if (days <= 0) return { ok: false, error: "That range doesn't include any working days." };

  const now = new Date();
  let noticeDays = null, shortNotice = false, chargedDays = days;
  if (type === "holiday") {
    noticeDays = Math.floor((start - now) / 86_400_000);
    shortNotice = noticeDays < NOTICE_DAYS_REQUIRED;
    const emergency = Boolean(isEmergency && proof);
    chargedDays = shortNotice && !emergency ? days * 2 : days;
  }
  // Sick days: no notice calculation, no doubling — that's the point of them.

  const id = Math.random().toString(36).slice(2, 8);
  const meta = {
    type, staffName: staff.name, slug: staff.slug,
    startDate: isoDate(start), endDate: isoDate(end),
    requestedAt: now.toISOString(), noticeDays, shortNotice,
    isEmergency: Boolean(isEmergency), proofUploaded: Boolean(proof),
    days, chargedDays, reason: String(reason || "").slice(0, 300),
  };
  const details = await createRecord("Events", {
    Event_Title: leaveTitle(type, meta.startDate, staff.slug, id),
    Start_DateTime: zohoDateTime(start),
    End_DateTime: zohoDateTime(new Date(end.getTime() + 23 * 3_600_000 + 59 * 60_000)),
    Description: JSON.stringify(meta),
  });
  if (proof) {
    try { await uploadAttachment("Events", details.id, "emergency-proof.pdf", Buffer.from(proof, "base64"), "application/pdf"); }
    catch (e) { console.error("holiday proof upload failed", e.message); }
  }
  return { ok: true, ...meta };
}

/** Every holiday + sick request for one person this year, newest first, with both totals. */
export async function leaveForStaff(slug, year = new Date().getFullYear()) {
  const [holidayRows, sickRows] = await Promise.all([
    search("Events", `(Event_Title:starts_with:HOLIDAY: ${year})`, "id,Event_Title,Description", 500).catch(() => []),
    search("Events", `(Event_Title:starts_with:SICK: ${year})`, "id,Event_Title,Description", 500).catch(() => []),
  ]);
  const parse = (rows) => rows
    .map((r) => { let meta = {}; try { meta = JSON.parse(r.Description || "{}"); } catch { /* ignore */ } return meta; })
    .filter((r) => r.slug === slug);
  const holidayRequests = parse(holidayRows);
  const sickRequests = parse(sickRows);
  const holidayTakenDays = holidayRequests.reduce((sum, r) => sum + (r.chargedDays || 0), 0);
  const sickTakenDays = sickRequests.reduce((sum, r) => sum + (r.chargedDays || 0), 0);
  const requests = [...holidayRequests, ...sickRequests].sort((a, b) => (b.startDate || "").localeCompare(a.startDate || ""));
  return { requests, holidayTakenDays, sickTakenDays };
}

/** Every holiday + sick request across all staff for a year, grouped by person — for the admin view. */
export async function leaveSummary(year = new Date().getFullYear()) {
  const [holidayRows, sickRows] = await Promise.all([
    search("Events", `(Event_Title:starts_with:HOLIDAY: ${year})`, "id,Event_Title,Description", 500).catch(() => []),
    search("Events", `(Event_Title:starts_with:SICK: ${year})`, "id,Event_Title,Description", 500).catch(() => []),
  ]);
  const byStaff = new Map();
  for (const r of [...holidayRows, ...sickRows]) {
    let meta = {};
    try { meta = JSON.parse(r.Description || "{}"); } catch { /* ignore */ }
    if (!meta.staffName) continue;
    if (!byStaff.has(meta.staffName)) byStaff.set(meta.staffName, { name: meta.staffName, holidayTakenDays: 0, sickTakenDays: 0, requests: [] });
    const s = byStaff.get(meta.staffName);
    if (meta.type === "sick") s.sickTakenDays += meta.chargedDays || 0;
    else s.holidayTakenDays += meta.chargedDays || 0;
    s.requests.push(meta);
  }
  return Array.from(byStaff.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export const config = { NOTICE_DAYS_REQUIRED, DEFAULTS };
