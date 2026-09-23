// Ops 07: the certificate and licence register. Reads every live property
// from Zoho CRM (the record; nothing here writes to it), works out for gas,
// EICR, EPC and selective licence whether the item is expired, due, ok or
// undated, finds the newest matching document on file (Zoho attachment or
// the Drive index in docs/certificates/drive-certificates.json), and writes:
//
//   docs/ops/certificate-register.csv                      committed copy
//   <Drive>/Claude/01 Property Sauce/Compliance/Certificate register.csv
//
//   node --env-file=.env scripts/ops/certificate-register.mjs
//
// Options: --no-attachments   skip the Zoho attachment listing (faster; Drive index only)
//          --no-drive         do not copy the CSV to the Drive folder
//          --json <path>      also write the rows as JSON (for other scripts)
//
// Lead times (Damian, 20 September 2026): gas safety and EICR six weeks,
// EPC and licences four weeks. Expiry dates come only from the Zoho record;
// this script never sets one.

import { mkdirSync, writeFileSync, readFileSync, copyFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { zohoConfigured, liveProperties, listAttachments } from "../../src/chat/zoho.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const REGISTER_CSV = join(ROOT, "docs/ops/certificate-register.csv");
export const DRIVE_CSV = "/Users/damian/Library/CloudStorage/GoogleDrive-damian.murray05@gmail.com/My Drive/Claude/01 Property Sauce/Compliance/Certificate register.csv";
const DRIVE_INDEX = join(ROOT, "docs/certificates/drive-certificates.json");

// Lead time in days per item, and how each item is matched to documents.
export const ITEMS = {
  gas:     { label: "Gas safety (CP12)", lead: 42, field: "Gas_Safe_Certificate",       driveTypes: ["gas"],                name: /gas|cp12/i },
  eicr:    { label: "EICR",              lead: 42, field: "NICEIC_Certificate",         driveTypes: ["eicr", "electrical"], name: /eicr|electrical|niceic|condition report/i },
  epc:     { label: "EPC",               lead: 28, field: "EPC_Expiry",                 driveTypes: ["epc"],                name: /\bepc\b|energy performance/i },
  licence: { label: "Selective licence", lead: 28, field: "Landlords_Property_License", driveTypes: ["licence"],            name: /licen[cs]e/i },
};
export const STATUS_ORDER = ["expired", "due", "no date", "ok"];

const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, arr) => { if (x.startsWith("--")) a.push([x.slice(2), arr[i + 1] && !arr[i + 1].startsWith("--") ? arr[i + 1] : "true"]); return a; }, []));

/* Today in Europe/London as YYYY-MM-DD, and whole days between two such dates. */
export const todayISO = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const dayNumber = (iso) => Math.round(Date.parse(`${iso}T00:00:00Z`) / 86400000);
export const daysBetween = (fromISO, toISO) => dayNumber(toISO) - dayNumber(fromISO);
const isISODate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ""));

/* Area for grouping: the Inspection_Area picklist on the record, else the postcode district. */
const POSTCODE_AREAS = [
  [/^S6[0-6]\b/, "Catterick House (Rotherham)"],
  [/^NE2[0-9]\b|^NE1\d\b/, "Lancaster House (Cramlington)"],
  [/^FY\d/, "Blackpool"],
  [/^CB1[01]\b/, "Saffron Walden"],
  [/^(CO|SS|CM)\d/, "Essex"],
  [/^(E|N|SE|SW|W|NW|EC|WC|IG|RM|EN|CR|BR|DA|HA|UB|TW|KT|SM)\d/, "London"],
];
const postcodeOf = (p) => String((p.raw && p.raw.Post_Code) || "").toUpperCase().replace(/\s+/g, " ").trim() || (String(p.address).toUpperCase().match(/\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/) || [""])[0];
export function areaOf(p) {
  const fromRecord = String((p.inspection && p.inspection.area) || "").trim();
  if (fromRecord) return fromRecord;
  const pc = postcodeOf(p);
  for (const [re, name] of POSTCODE_AREAS) if (re.test(pc)) return name;
  return pc ? `Other (${pc.split(" ")[0]})` : "Other (no postcode on the record)";
}

/* The full postal address with postcode, built from the address fields when the record name lacks the postcode. */
export function fullAddress(p) {
  const raw = p.raw || {};
  const pc = String(raw.Post_Code || "").trim();
  const name = String(p.address || "").trim();
  if (pc && !name.toUpperCase().replace(/\s+/g, "").includes(pc.toUpperCase().replace(/\s+/g, ""))) return `${name}, ${pc}`;
  return name;
}

function loadDriveIndex() {
  try { return JSON.parse(readFileSync(DRIVE_INDEX, "utf8")); } catch { return {}; }
}

/* Newest document for one item: Zoho attachments by file name, Drive index by type. */
function newestDocument(item, attachments, driveDocs) {
  const spec = ITEMS[item];
  const candidates = [];
  const wrongKind = (name) => (item === "eicr" && /\beic\b/i.test(name)) || (item === "licence" && /\btv\b/i.test(name));
  for (const a of attachments) if (spec.name.test(a.name) && !wrongKind(a.name)) candidates.push({ name: a.name, date: a.date || "", source: "zoho", link: `zoho attachment ${a.id}` });
  for (const d of driveDocs) if (spec.driveTypes.includes(d.type)) candidates.push({ name: d.name, date: d.date || "", source: "drive", link: d.url || "" });
  candidates.sort((a, b) => String(b.date).localeCompare(String(a.date)) || a.name.localeCompare(b.name));
  return candidates[0] || null;
}

async function pool(items, size, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, async () => { while (next < items.length) { const i = next++; out[i] = await fn(items[i], i); } }));
  return out;
}

/* Build the register rows. Read-only against Zoho. */
export async function buildRegister({ attachments = true, log = () => {} } = {}) {
  if (!zohoConfigured()) throw new Error("Zoho is not configured: ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET and ZOHO_REFRESH_TOKEN are needed (node --env-file=.env ...)");
  const today = todayISO();
  const props = (await liveProperties()).sort((a, b) => a.address.localeCompare(b.address, "en-GB"));
  log(`${props.length} live properties from Zoho CRM`);
  const drive = loadDriveIndex();
  const attachmentsById = {};
  if (attachments) {
    let done = 0;
    await pool(props, 4, async (p) => {
      try { attachmentsById[p.id] = await listAttachments("Accounts", p.id); } catch (e) { attachmentsById[p.id] = []; log(`attachments failed for ${p.address}: ${e.message}`); }
      if (++done % 25 === 0) log(`  attachments listed for ${done}/${props.length}`);
    });
  }
  const rows = [];
  for (const p of props) {
    const raw = p.raw || {};
    const exempt = /exempt/i.test(String(raw.Landlord_License_Exempt || ""));
    for (const item of Object.keys(ITEMS)) {
      if (item === "gas" && !p.gasApplicable) continue;
      if (item === "licence" && exempt) continue;
      const spec = ITEMS[item];
      const expiry = isISODate(raw[spec.field]) ? raw[spec.field] : "";
      const days = expiry ? daysBetween(today, expiry) : null;
      const status = !expiry ? "no date" : days < 0 ? "expired" : days <= spec.lead ? "due" : "ok";
      const doc = newestDocument(item, attachmentsById[p.id] || [], drive[p.id] || []);
      const notes = [];
      if (item === "gas" && /not yet confirmed|unknown/i.test(String(raw.Gas_Safety_Applicable || ""))) notes.push(`gas supply not confirmed on the record (${raw.Gas_Safety_Applicable})`);
      if (item === "gas" && !raw.Gas_Safety_Applicable) notes.push("Gas_Safety_Applicable blank; treated as applicable");
      if (item === "licence" && !raw.Landlord_License_Exempt) notes.push("licence exemption not recorded; treated as required");
      if (p.ownerFromRecord) notes.push("landlord name from the record, Established Landlord picklist blank");
      if (!postcodeOf(p)) notes.push("no postcode on the record");
      if (raw[spec.field] && !expiry) notes.push(`unreadable date on the record: ${raw[spec.field]}`);
      rows.push({
        propertyId: p.id, reference: p.reference, address: fullAddress(p), postcode: String(raw.Post_Code || "").trim(), area: areaOf(p), landlord: p.owner || "",
        propertyStatus: p.status, tenant: p.tenantName || "", item, itemLabel: spec.label, expiry, daysLeft: days, leadDays: spec.lead, status,
        document: doc ? doc.name : "", documentDate: doc ? doc.date : "", documentSource: doc ? doc.source : "", documentLink: doc ? doc.link : "",
        notes: notes.join("; "),
      });
    }
  }
  rows.sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) || (a.daysLeft ?? 1e9) - (b.daysLeft ?? 1e9) || a.address.localeCompare(b.address, "en-GB"));
  return { today, properties: props.length, rows };
}

export const CSV_COLUMNS = [
  ["status", "Status"], ["itemLabel", "Item"], ["expiry", "Expiry"], ["daysLeft", "Days left"], ["address", "Address"], ["area", "Area"], ["landlord", "Established Landlord"],
  ["tenant", "Tenant"], ["propertyStatus", "Property status"], ["document", "Newest document"], ["documentDate", "Document date"], ["documentSource", "Document source"], ["documentLink", "Document link"],
  ["notes", "Notes"], ["propertyId", "Zoho id"], ["reference", "Reference"], ["postcode", "Postcode"], ["item", "Item key"], ["leadDays", "Lead days"],
];
const csvCell = (v) => { const s = v === null || v === undefined ? "" : String(v); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
export const toCSV = (rows) => [CSV_COLUMNS.map(([, h]) => h).join(","), ...rows.map((r) => CSV_COLUMNS.map(([k]) => csvCell(r[k])).join(","))].join("\r\n") + "\r\n";

/* Read the committed CSV back into rows (for scripts that run after the register). */
export function readRegisterCsv(path = REGISTER_CSV) {
  const text = readFileSync(path, "utf8");
  const lines = [];
  let cur = [], field = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { field += '"'; i++; } else if (c === '"') q = false; else field += c; }
    else if (c === '"') q = true;
    else if (c === ",") { cur.push(field); field = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; cur.push(field); lines.push(cur); cur = []; field = ""; }
    else field += c;
  }
  if (field || cur.length) { cur.push(field); lines.push(cur); }
  const [header, ...body] = lines.filter((l) => l.length > 1);
  const keyOf = Object.fromEntries(CSV_COLUMNS.map(([k, h]) => [h, k]));
  return body.map((l) => { const r = {}; header.forEach((h, i) => { r[keyOf[h] || h] = l[i] ?? ""; }); r.daysLeft = r.daysLeft === "" ? null : Number(r.daysLeft); r.leadDays = Number(r.leadDays); return r; });
}

export function summaryTable(rows) {
  const items = Object.keys(ITEMS);
  const count = (s, i) => rows.filter((r) => r.status === s && r.item === i).length;
  const SHORT = { gas: "Gas", eicr: "EICR", epc: "EPC", licence: "Licence" };
  const line = (cells) => cells.map((c, i) => (i === 0 ? String(c).padEnd(10) : String(c).padStart(9))).join("");
  const out = [line(["", ...items.map((i) => SHORT[i] || i), "total"])];
  for (const s of STATUS_ORDER) out.push(line([s, ...items.map((i) => count(s, i)), rows.filter((r) => r.status === s).length]));
  out.push(line(["total", ...items.map((i) => rows.filter((r) => r.item === i).length), rows.length]));
  return out.join("\n");
}

async function main() {
  const log = (m) => console.error(m);
  const { today, properties, rows } = await buildRegister({ attachments: args["no-attachments"] !== "true", log });
  mkdirSync(dirname(REGISTER_CSV), { recursive: true });
  writeFileSync(REGISTER_CSV, toCSV(rows));
  console.log(`Register for ${today}: ${properties} properties, ${rows.length} items. Written to ${REGISTER_CSV}`);
  if (args.json) { writeFileSync(args.json, JSON.stringify({ today, properties, rows }, null, 2)); console.log(`JSON written to ${args.json}`); }
  if (args["no-drive"] !== "true") {
    try { mkdirSync(dirname(DRIVE_CSV), { recursive: true }); copyFileSync(REGISTER_CSV, DRIVE_CSV); console.log(`Copied to ${DRIVE_CSV}`); }
    catch (e) { console.log(`Drive copy skipped (${e.code || e.message}); run with the sandbox off to reach ~/Library/CloudStorage. The committed copy is complete.`); }
  }
  console.log("\nBy status and category:\n" + summaryTable(rows));
  const flagged = rows.filter((r) => r.status === "expired" || r.status === "due");
  console.log(`\n${flagged.length} expired or due item(s) across ${new Set(flagged.map((r) => r.propertyId)).size} propert${new Set(flagged.map((r) => r.propertyId)).size === 1 ? "y" : "ies"}; ${rows.filter((r) => r.status === "no date").length} with no date on the record.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch((e) => { console.error(e.message || e); process.exit(1); });
