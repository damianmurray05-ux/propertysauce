// Ops 07: the messages the certificate routine would send, written out for
// review. Nothing here posts to Slack, sends email or writes to Zoho CRM.
//
//   node scripts/ops/certificate-reminders.mjs             from docs/ops/certificate-register.csv (run the register first)
//   node --env-file=.env scripts/ops/certificate-reminders.mjs --live   rebuild the register from Zoho first
//
// Writes docs/ops/certificate-reminders-preview.md with:
//   1. one Slack post for #claude-urgent: everything expired or due, by area
//   2. one engineer booking email per area per item (gas, EICR, EPC), with
//      placeholders for the engineer's name and address until Usman supplies
//      the engineer list, and the exact landlord-name and full-address wording
//      from docs/ops/07-certificates-and-licences.md section 2
//   3. licence renewals by area for the office (council applications, not
//      engineer bookings)
//
// --post and --send are recognised but not enabled: they print a message and
// do nothing, so the flags cannot send anything by accident before Damian has
// reviewed a preview.

import { existsSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildRegister, readRegisterCsv, REGISTER_CSV, ITEMS, todayISO } from "./certificate-register.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const PREVIEW_MD = join(ROOT, "docs/ops/certificate-reminders-preview.md");
const SLACK_CHANNEL = "#claude-urgent";
const SLACK_CHANNEL_ID = "C0BTPPZ3JJE";
const OFFICE_EMAIL = "contact@propertysauce.co";
const ENGINEER_ITEMS = ["gas", "eicr", "epc"]; // licences are council applications, not engineer visits

const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, arr) => { if (x.startsWith("--")) a.push([x.slice(2), arr[i + 1] && !arr[i + 1].startsWith("--") ? arr[i + 1] : "true"]); return a; }, []));

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtDate = (iso) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || ""); return m ? `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}` : "no date"; };
const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
function fmtDays(r) {
  if (r.daysLeft === null || r.daysLeft === undefined) return "no date on the record";
  if (r.daysLeft < 0) return `expired ${plural(-r.daysLeft, "day")} ago`;
  if (r.daysLeft === 0) return "expires today";
  return `${plural(r.daysLeft, "day")} left`;
}
const isFlagged = (r) => r.status === "expired" || r.status === "due";
const propertyCount = (rows) => new Set(rows.map((r) => r.propertyId)).size;
function groupBy(rows, key) {
  const out = new Map();
  for (const r of rows) { const k = key(r); if (!out.has(k)) out.set(k, []); out.get(k).push(r); }
  return out;
}
const byUrgency = (a, b) => (a.daysLeft ?? 1e9) - (b.daysLeft ?? 1e9) || a.address.localeCompare(b.address, "en-GB");
/* "1, 2, 3, 5, 7, 8, 9" becomes "1 to 3, 5, 7 to 9"; non-numeric flats (2a, C) are listed after the numbers. */
function flatRanges(flats) {
  const nums = [...new Set(flats.filter((f) => /^\d+$/.test(f)).map(Number))].sort((a, b) => a - b);
  const others = [...new Set(flats.filter((f) => !/^\d+$/.test(f)))].sort();
  const out = [];
  for (let i = 0; i < nums.length; i++) { let j = i; while (j + 1 < nums.length && nums[j + 1] === nums[j] + 1) j++; out.push(j > i + 1 ? `${nums[i]} to ${nums[j]}` : j === i + 1 ? `${nums[i]}, ${nums[j]}` : String(nums[i])); i = j; }
  return [...out, ...others].join(", ");
}
const landlordCheck = (r) => (/picklist blank/.test(r.notes || "") ? " [CHECK landlord name: the Established Landlord picklist is blank on the record]" : "");

/* 1. The Slack post. Null when nothing is expired or due. */
export function slackPost(rows, today) {
  const flagged = rows.filter(isFlagged);
  if (!flagged.length) return null;
  const expired = flagged.filter((r) => r.status === "expired").length;
  const due = flagged.length - expired;
  const lines = [`@channel Certificates and licences, ${fmtDate(today)}: ${plural(expired, "item")} expired, ${due} due for renewal, across ${plural(propertyCount(flagged), "property", "properties")}.`, ""];
  for (const [area, list] of [...groupBy(flagged, (r) => r.area).entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    lines.push(`*${area}* (${list.length})`);
    // Flats in one building with the same item and expiry (a block licence, say) take one line, not one each.
    const building = (r) => { const m = /^flat\s+(\w+),\s*(.+)$/i.exec(r.address); return m ? { flat: m[1], rest: m[2] } : null; };
    const groups = groupBy(list.sort(byUrgency), (r) => { const b = building(r); return b ? `${b.rest}|${r.item}|${r.expiry}` : `${r.propertyId}|${r.item}`; });
    for (const rows of groups.values()) {
      const r = rows[0];
      const when = `${r.status === "expired" ? "expired" : "expires"} ${fmtDate(r.expiry)} (${fmtDays(r)})`;
      if (rows.length >= 3) lines.push(`• ${building(r).rest}, ${plural(rows.length, "flat")} (${flatRanges(rows.map((x) => building(x).flat))}): ${r.itemLabel}, ${when}`);
      else for (const x of rows) lines.push(`• ${x.address}: ${x.itemLabel}, ${when}`);
    }
    lines.push("");
  }
  const undated = rows.filter((r) => r.status === "no date").length;
  if (undated) lines.push(`Also ${plural(undated, "item")} with no expiry date on the Zoho record; they are in the register, not listed here.`);
  lines.push("Full register: Drive > Claude > 01 Property Sauce > Compliance > Certificate register.csv. Dates come from Zoho CRM; a newer certificate that is not on the record yet will still show here until it is filed.");
  return lines.join("\n").trim();
}

/* 2. One booking email per area per item, for the engineer or assessor. */
export function engineerEmails(rows) {
  const out = [];
  const flagged = rows.filter((r) => isFlagged(r) && ENGINEER_ITEMS.includes(r.item));
  for (const [area, areaRows] of [...groupBy(flagged, (r) => r.area).entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    for (const item of ENGINEER_ITEMS) {
      const list = areaRows.filter((r) => r.item === item).sort(byUrgency);
      if (!list.length) continue;
      const label = ITEMS[item].label;
      const who = item === "epc" ? "assessor" : "engineer";
      const body = [
        `Hi [ENGINEER NAME: ${area}, ${label}],`,
        "",
        `Please can you book the following ${label} ${list.length === 1 ? "renewal" : "renewals"} in ${area}. Tell us which days you can do and we will confirm access with each tenant.`,
        "",
        ...list.flatMap((r, i) => [
          `${i + 1}. ${r.address}`,
          `   Current certificate ${r.status === "expired" ? "expired" : "expires"} ${fmtDate(r.expiry)} (${fmtDays(r)}).`,
          `   Can you please ensure that you write this out to the landlord: ${r.landlord || "[LANDLORD NAME MISSING ON THE RECORD]"} at ${r.address}.${landlordCheck(r)}`,
          "",
        ]),
        `Please send each certificate to ${OFFICE_EMAIL} as a PDF as soon as the visit is done, with the landlord name and the full address including postcode exactly as above.${item === "gas" ? " Tell us the same day if anything is classed At Risk or Immediately Dangerous." : item === "eicr" ? " Tell us the same day about any C1, C2 or FI code so we can arrange the remedial work within 28 days." : ""}`,
        "",
        "Many thanks,",
        "Property Sauce",
        OFFICE_EMAIL,
      ].join("\n");
      out.push({ area, item, label, to: `[ENGINEER EMAIL: ${area}, ${label}]`, from: OFFICE_EMAIL, subject: `Booking request: ${label} ${list.length === 1 ? "renewal" : "renewals"}, ${area} (${plural(list.length, "property", "properties")})`, count: list.length, body, who });
    }
  }
  return out;
}

/* 3. Licence renewals by area, for the office to take to the council. */
export function licenceLists(rows) {
  const flagged = rows.filter((r) => isFlagged(r) && r.item === "licence");
  return [...groupBy(flagged, (r) => r.area).entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([area, list]) => ({ area, list: list.sort(byUrgency) }));
}

export function previewMarkdown({ today, rows, source }) {
  const post = slackPost(rows, today);
  const emails = engineerEmails(rows);
  const licences = licenceLists(rows);
  const md = [`# Certificate reminders preview, ${fmtDate(today)}`, "",
    `Generated by scripts/ops/certificate-reminders.mjs from ${source}. Nothing in this file has been sent: Slack posting (--post) and engineer emails (--send) are not enabled yet, and the engineer names and addresses are placeholders until Usman supplies the engineer list. Landlord names are the Established Landlord picklist on the Zoho record; the certificate must carry the name exactly as at Land Registry, so check any line marked CHECK before it goes out.`, "",
    `## 1. Slack post for ${SLACK_CHANNEL} (${SLACK_CHANNEL_ID})`, ""];
  if (post) md.push("```", post, "```"); else md.push("Nothing expired or due today. No post.");
  md.push("", `## 2. Engineer booking emails (${emails.length})`, "");
  if (!emails.length) md.push("None: nothing gas, EICR or EPC is expired or due.");
  for (const e of emails) md.push(`### ${e.area}: ${e.label}, ${plural(e.count, "property", "properties")}`, "", `From: ${e.from}  `, `To: ${e.to}  `, `Subject: ${e.subject}`, "", "```", e.body, "```", "");
  md.push(`## 3. Licence renewals for the office (council applications, not engineer bookings)`, "");
  if (!licences.length) md.push("None.");
  for (const { area, list } of licences) {
    md.push(`### ${area} (${list.length})`, "");
    for (const r of list) md.push(`- ${r.address}: licence ${r.status === "expired" ? "expired" : "expires"} ${fmtDate(r.expiry)} (${fmtDays(r)}); licence holder on the record: ${r.landlord || "missing"}${landlordCheck(r)}${r.document ? `; newest document on file: ${r.document}` : "; no licence document on file"}`);
    md.push("");
  }
  md.push("Before applying, check whether a newer licence already exists that has not been filed on the record: the register only knows what Zoho holds.", "");
  return md.join("\n");
}

async function main() {
  let today, rows, source;
  if (args.live === "true" || !existsSync(REGISTER_CSV)) {
    if (!existsSync(REGISTER_CSV) && args.live !== "true") console.error(`${REGISTER_CSV} not found; building the register from Zoho.`);
    ({ today, rows } = await buildRegister({ log: (m) => console.error(m) }));
    source = "a live read of Zoho CRM";
  } else {
    rows = readRegisterCsv(REGISTER_CSV);
    today = todayISO();
    const written = statSync(REGISTER_CSV).mtime;
    source = `docs/ops/certificate-register.csv (written ${written.toLocaleString("en-GB", { timeZone: "Europe/London" })})`;
    if (written.toISOString().slice(0, 10) !== new Date().toISOString().slice(0, 10)) console.error(`Warning: the register was written on ${written.toISOString().slice(0, 10)}, not today. Run scripts/ops/certificate-register.mjs first, or pass --live.`);
  }
  const md = previewMarkdown({ today, rows, source });
  writeFileSync(PREVIEW_MD, md + "\n");
  const flagged = rows.filter(isFlagged);
  console.log(`Preview written to ${PREVIEW_MD}: ${flagged.length} expired or due item(s) across ${propertyCount(flagged)} propert${propertyCount(flagged) === 1 ? "y" : "ies"}, ${engineerEmails(rows).length} engineer email(s), ${licenceLists(rows).reduce((n, g) => n + g.list.length, 0)} licence renewal(s).`);
  if (args.post === "true") console.log(`--post: posting to ${SLACK_CHANNEL} is not enabled yet. Nothing was posted. Review section 1 of the preview and post it by hand or through the Cowork routine.`);
  if (args.send === "true") console.log("--send: sending engineer emails is not enabled yet. Nothing was sent. The engineer list from Usman is needed first, then Damian's go-ahead.");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch((e) => { console.error(e.message || e); process.exit(1); });
