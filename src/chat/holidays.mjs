// Holiday booking, and the running balance against each person's annual
// allowance. Same Zoho Events module as the shift clock, same reasoning —
// one record per request, searchable by the date it starts.
//
// Company protocol, from Damian: four weeks' notice. Less than that costs
// DOUBLE days, unless it is a medical emergency with proof (a PDF) uploaded
// at the time of the request, in which case it costs the normal,
// un-doubled amount. The allowance itself has Pakistan's public holidays
// for the year already taken off it — see allowanceFor().

import { search, createRecord, uploadAttachment } from "./zoho.mjs";

const NOTICE_DAYS_REQUIRED = 28;
// Pakistan's Factories Act 1934 / Shops & Establishments Ordinance norm for
// paid annual leave is 14 days. This is a starting default, not a decision —
// confirm the real figure with Damian, then set it per person with
// "holidayAllowance" on their STAFF_DIRECTORY_JSON row.
const DEFAULT_ALLOWANCE = 14;

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

const holidayTitle = (startDate, slug, id) => `HOLIDAY: ${startDate}: ${slug}: ${id}`;

function loadDirectory() {
  if (!process.env.STAFF_DIRECTORY_JSON) return [];
  try { return JSON.parse(process.env.STAFF_DIRECTORY_JSON); } catch { return []; }
}

/**
 * The annual allowance for one person, and how many of Pakistan's public
 * holidays come off it this year. PUBLIC_HOLIDAYS_JSON is a plain
 * {"2026": 17} map — one number per year, updated each January once that
 * year's gazetted list is confirmed (the Islamic-calendar ones move).
 */
export function allowanceFor(name, year = new Date().getFullYear()) {
  const row = loadDirectory().find((r) => (r.name || "").trim().toLowerCase() === String(name || "").trim().toLowerCase());
  const allowance = Number(row?.holidayAllowance) || DEFAULT_ALLOWANCE;
  let publicHolidays = {};
  try { publicHolidays = JSON.parse(process.env.PUBLIC_HOLIDAYS_JSON || "{}"); } catch { /* ignore */ }
  const deducted = Number(publicHolidays[String(year)]) || 0;
  return { allowance, publicHolidaysDeducted: deducted, adjustedAllowance: Math.max(0, allowance - deducted) };
}

export async function requestHoliday({ staff, startDate, endDate, reason, isEmergency, proof }) {
  const start = parseDate(startDate);
  const end = parseDate(endDate || startDate);
  if (!start || !end || end < start) return { ok: false, error: "That date range doesn't look right." };

  const days = workingDaysBetween(start, end);
  if (days <= 0) return { ok: false, error: "That range doesn't include any working days." };

  const now = new Date();
  const noticeDays = Math.floor((start - now) / 86_400_000);
  const shortNotice = noticeDays < NOTICE_DAYS_REQUIRED;
  const emergency = Boolean(isEmergency && proof);
  const chargedDays = shortNotice && !emergency ? days * 2 : days;

  const id = Math.random().toString(36).slice(2, 8);
  const meta = {
    staffName: staff.name, slug: staff.slug,
    startDate: isoDate(start), endDate: isoDate(end),
    requestedAt: now.toISOString(), noticeDays, shortNotice,
    isEmergency: Boolean(isEmergency), proofUploaded: Boolean(proof),
    days, chargedDays, reason: String(reason || "").slice(0, 300),
  };
  const details = await createRecord("Events", {
    Event_Title: holidayTitle(meta.startDate, staff.slug, id),
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

/** Every holiday request for one person in a given year, newest first, with the total charged. */
export async function holidaysForStaff(slug, year = new Date().getFullYear()) {
  const rows = await search("Events", `(Event_Title:starts_with:HOLIDAY: ${year})`, "id,Event_Title,Description", 500).catch(() => []);
  const mine = rows
    .map((r) => { let meta = {}; try { meta = JSON.parse(r.Description || "{}"); } catch { /* ignore */ } return meta; })
    .filter((r) => r.slug === slug);
  const takenDays = mine.reduce((sum, r) => sum + (r.chargedDays || 0), 0);
  return { requests: mine.sort((a, b) => (b.startDate || "").localeCompare(a.startDate || "")), takenDays };
}

/** Every holiday request across all staff for a year, grouped by person — for the admin view. */
export async function holidaysSummary(year = new Date().getFullYear()) {
  const rows = await search("Events", `(Event_Title:starts_with:HOLIDAY: ${year})`, "id,Event_Title,Description", 500).catch(() => []);
  const byStaff = new Map();
  for (const r of rows) {
    let meta = {};
    try { meta = JSON.parse(r.Description || "{}"); } catch { /* ignore */ }
    if (!meta.staffName) continue;
    if (!byStaff.has(meta.staffName)) byStaff.set(meta.staffName, { name: meta.staffName, takenDays: 0, requests: [] });
    const s = byStaff.get(meta.staffName);
    s.takenDays += meta.chargedDays || 0;
    s.requests.push(meta);
  }
  return Array.from(byStaff.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export const config = { NOTICE_DAYS_REQUIRED, DEFAULT_ALLOWANCE };
