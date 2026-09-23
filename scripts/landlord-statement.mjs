// Ops 10: the monthly landlord pack. For one landlord and one month it reads
// Zoho Books (the payout bills, the rent invoices still unpaid) and Zoho CRM
// (the properties, repairs, certificates, inspections, tenancy dates) and
// writes three files: the monthly email, the statement and the bill. Nothing
// is sent from here; the Cowork routine in docs/ops/10 does the sending.
//
//   node --env-file=.env scripts/landlord-statement.mjs --landlord "Crackle Property Ltd" --month 2026-09
//
// Options:
//   --landlord   the Established Landlord name in Zoho CRM (required)
//   --month      YYYY-MM, default last month
//   --vendor     the Zoho Books vendor prefix when it differs from the CRM name
//   --to         first name for the greeting; default: the first name on the property records
//   --from       who signs: "team" (default) or a name such as "Damian"
//   --out        output folder, default out/statements
//   --pdf        also print statement.pdf, bill.pdf and email.pdf with headless Chrome
//
// Needs the same ZOHO_* variables as the website (scripts/zoho.env or .env),
// and optionally BOOKS_ORG (default 678590019, the Property Sauce organisation).

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { accessToken, propertiesByOwner, jobsForProperty } from "../src/chat/zoho.mjs";

/* ---------- arguments ---------- */
const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, arr) => { if (x.startsWith("--")) a.push([x.slice(2), arr[i + 1] && !arr[i + 1].startsWith("--") ? arr[i + 1] : "true"]); return a; }, []));
if (!args.landlord) { console.error("--landlord is required"); process.exit(1); }
const now = new Date();
const month = args.month || `${now.getFullYear()}-${String(now.getMonth() === 0 ? 12 : now.getMonth()).padStart(2, "0")}`;
const [Y, M] = month.split("-").map(Number);
const monthStart = `${month}-01`;
const monthEnd = new Date(Y, M, 0).toISOString().slice(0, 10);
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const monthName = MONTHS[M - 1];

/* CRM Established Landlord name to the Books vendor prefix ("<prefix> - <property>"). */
const VENDOR_ALIASES = {
  "Beaucatt Homes Limited": "Beaucatt Homes", "Beaumont Residential Limited": "Beaumont", "Beaumont Residential": "Beaumont",
  "Lancaster Residential Group Limited": "Lancaster Residential Group Ltd", "D Murray & R Sullivan": "Murray & Sullivan",
  "Tanc Residential Limited": "Tanc Residential", "NSUK Limited": "NSUK", "D & D Homes": "D & D Homes Ltd",
};
const vendorPrefix = args.vendor || VENDOR_ALIASES[args.landlord] || args.landlord;

/* ---------- Zoho Books ---------- */
const DC = (process.env.ZOHO_DC || "com").toLowerCase();
const BOOKS = `https://www.zohoapis.${DC}/books/v3`;
const ORG = process.env.BOOKS_ORG || "678590019";
async function books(path, params = {}) {
  const t = await accessToken();
  const q = new URLSearchParams({ organization_id: ORG, ...params });
  const r = await fetch(`${BOOKS}${path}?${q}`, { headers: { authorization: `Zoho-oauthtoken ${t}` } });
  const d = await r.json();
  if (!r.ok || (d.code && d.code !== 0)) throw new Error(`books ${path}: ${d.message || r.status}`);
  return d;
}
async function pages(path, key, params) {
  const out = [];
  for (let page = 1; page <= 10; page++) {
    const d = await books(path, { ...params, per_page: 200, page });
    out.push(...(d[key] || []));
    if (!d.page_context || !d.page_context.has_more_page) break;
  }
  return out;
}
const mine = (b) => b.vendor_name === vendorPrefix || b.vendor_name.startsWith(`${vendorPrefix} - `) || b.vendor_name.startsWith(`${vendorPrefix}-`);
const propertyOfVendor = (name) => name.includes(" - ") ? name.split(" - ").slice(1).join(" - ").trim() : name.replace(vendorPrefix, "").replace(/^\s*-\s*/, "").trim();
const norm = (s) => String(s || "").toLowerCase().replace(/\bflat\s*0+(\d)/g, "flat $1").replace(/^\s*(flat|apartment|apt)\s+/, "").replace(/[^a-z0-9]+/g, " ").trim();
const gbp = (n) => (n < 0 ? "-" : "") + "£" + Math.abs(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nice = (iso) => { if (!iso) return ""; const d = new Date(iso); return isNaN(d) ? "" : `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`; };
const daysFrom = (iso, base = monthEnd) => Math.round((Date.parse(iso) - Date.parse(base)) / 86400000);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* ---------- gather ---------- */
console.error(`Ops 10 pack: ${args.landlord} (Books vendor "${vendorPrefix}"), ${monthName} ${Y}`);
const [billsInMonth, billsUnpaid, properties] = await Promise.all([
  pages("/bills", "bills", { date_start: monthStart, date_end: monthEnd, sort_column: "date", sort_order: "A" }),
  pages("/bills", "bills", { status: "unpaid" }),
  propertiesByOwner(args.landlord),
]);
const monthBills = billsInMonth.filter(mine);
const heldDays = Number(args["held-days"] || 90);
const heldAll = billsUnpaid.filter(mine);
const heldBills = heldAll.filter((b) => daysFrom(b.date) >= -heldDays);
const heldStale = heldAll.filter((b) => daysFrom(b.date) < -heldDays);
const detail = async (b) => (await books(`/bills/${b.bill_id}`)).bill;
const billDetails = await Promise.all(monthBills.map(detail));

/* One row per bill: rent received, fee, other deductions, net paid, paid date. */
const rows = billDetails.map((b) => {
  const rent = b.line_items.filter((l) => /rent/i.test(l.name) && Number(l.item_total) > 0).reduce((a, l) => a + Number(l.item_total), 0);
  const fee = b.line_items.filter((l) => /management fee|managing agent|property sauce fee/i.test(l.name)).reduce((a, l) => a + Number(l.item_total), 0);
  const other = b.line_items.filter((l) => !(/rent/i.test(l.name) && Number(l.item_total) > 0) && !/management fee|managing agent|property sauce fee/i.test(l.name));
  const otherTotal = other.reduce((a, l) => a + Number(l.item_total), 0);
  const feeLine = b.line_items.find((l) => /management fee|managing agent|property sauce fee/i.test(l.name));
  const pct = feeLine ? (String(feeLine.description || "").match(/(\d+(?:\.\d+)?)\s*%/) || [])[1] : "";
  const paid = (b.payments || []).map((p) => p.date).sort().pop() || "";
  const rentDate = (String(b.line_items.find((l) => /rent/i.test(l.name))?.description || "").match(/received[^0-9]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i) || [])[1] || "";
  return { id: b.bill_id, number: b.bill_number, date: b.date, property: propertyOfVendor(b.vendor_name), rent, fee, other, otherTotal, net: Number(b.total), pct, paid, balance: Number(b.balance), status: b.status, rentDate };
});

/* Properties from the CRM, with this month's repairs and what is coming up. */
const jobsByProp = Object.fromEntries(await Promise.all(properties.map(async (p) => [p.id, await jobsForProperty(p.id).catch(() => [])])));
const inMonth = (d) => d && d >= monthStart && d <= monthEnd;
const finished = (j) => j.closed || /complete|signed off|invoice/i.test(j.status || "");
const recent = (j) => daysFrom(j.updated || j.created) >= -60;
const props = properties.map((p) => {
  const short = p.address.split(",")[0].trim();
  const jobs = (jobsByProp[p.id] || []).map((j) => ({ ...j, title: j.title.replace(new RegExp(`^${short.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^A-Za-z0-9]*`, "i"), "").replace(/^[^:]{0,40}:\s*/, "").replace(/^\W+/, "").replace(/^\w/, (c) => c.toUpperCase()) }));
  const repairs = jobs.filter((j) => !j.certificate);
  // Done: finished in the month. Open: not finished and touched in the last 60 days; older open tickets are an office check, not news for the landlord.
  const done = repairs.filter((j) => finished(j) && (inMonth(j.staffSignedOff) || inMonth(j.tenantSignedOff) || inMonth(j.updated)));
  const opened = repairs.filter((j) => inMonth(j.created));
  const open = repairs.filter((j) => !finished(j) && recent(j));
  const stale = repairs.filter((j) => !finished(j) && !recent(j));
  const certs = [["Gas safety certificate", p.gasApplicable ? p.gas : ""], ["Electrical report (EICR)", p.eicr], ["Energy performance certificate", p.epc], ["Property licence", p.licenceRequired ? p.licence : ""]]
    .filter(([, d]) => d).map(([label, d]) => ({ label, expiry: d, days: daysFrom(d) }));
  const certJobs = jobs.filter((j) => j.certificate && (inMonth(j.created) || inMonth(j.updated)));
  const bill = rows.find((r) => norm(p.address).startsWith(norm(r.property)) || norm(r.property).startsWith(norm(p.address)) || norm(p.address).includes(norm(r.property)));
  return { ...p, jobs, done, opened, open, stale, certs, certJobs, bill };
});
props.sort((a, b) => a.address.localeCompare(b.address, "en-GB", { numeric: true }));
const unmatchedBills = rows.filter((r) => !props.some((p) => p.bill === r));

/* Arrears: unpaid rent invoices for the current tenancy at each property, due on or before month end. */
for (const p of props) {
  const short = p.address.split(",").slice(0, 2).join(",").trim();
  let inv = [];
  try { inv = (await books("/invoices", { status: "unpaid", search_text: short.slice(0, 40), per_page: 100 })).invoices || []; } catch { inv = []; }
  p.arrears = inv.filter((i) => !/^\s*x\s*-/i.test(i.customer_name) && norm(i.customer_name).startsWith(norm(short)) && i.due_date <= monthEnd && Number(i.balance) > 0)
    .map((i) => ({ number: i.invoice_number, due: i.due_date, balance: Number(i.balance), tenant: i.customer_name.split(" - ").slice(1).join(" - ").trim() }));
  p.arrearsTotal = p.arrears.reduce((a, i) => a + i.balance, 0);
  p.arrearsOldest = p.arrears.map((i) => i.due).sort()[0] || "";
  // The office sometimes raises the payout bill before the rent lands. An unpaid bill whose
  // rent equals an unpaid invoice at the same property is not rent received yet.
  if (p.bill && !p.bill.paid && p.bill.balance === p.bill.net && p.arrears.some((i) => Math.abs(i.balance - p.bill.rent) < 0.01)) { p.bill.awaiting = true; }
}
const rowsLive = rows.filter((r) => !r.awaiting);

/* ---------- totals ---------- */
const T = {
  rent: rowsLive.reduce((a, r) => a + r.rent, 0), fee: rowsLive.reduce((a, r) => a + r.fee, 0), other: rowsLive.reduce((a, r) => a + r.otherTotal, 0), net: rowsLive.reduce((a, r) => a + r.net, 0),
  paidOut: rowsLive.filter((r) => r.paid).reduce((a, r) => a + r.net, 0),
  held: heldBills.filter((b) => !rows.some((r) => r.id === b.bill_id && r.awaiting)).reduce((a, b) => a + Number(b.balance), 0),
  heldStale: heldStale.reduce((a, b) => a + Number(b.balance), 0),
  arrears: props.reduce((a, p) => a + p.arrearsTotal, 0),
};
const rentsIn = props.filter((p) => p.bill && !p.bill.awaiting && p.bill.rent > 0).length;
const late = props.filter((p) => p.arrearsTotal > 0);
const doneJobs = props.flatMap((p) => p.done.map((j) => ({ ...j, address: p.address })));
const openJobs = props.flatMap((p) => p.open.map((j) => ({ ...j, address: p.address })));
const certsDue = props.flatMap((p) => p.certs.filter((c) => c.days <= 90).map((c) => ({ ...c, address: p.address }))).sort((a, b) => a.days - b.days);
const tenancyEnds = props.filter((p) => p.tenancyEnd && daysFrom(p.tenancyEnd) >= -31 && daysFrom(p.tenancyEnd) <= 90);
const inspected = props.filter((p) => inMonth(p.inspection.last));
const inspectionsDue = props.filter((p) => p.inspection.next && daysFrom(p.inspection.next) <= 60 && daysFrom(p.inspection.next) >= -30);
const streetName = (() => { const c = {}; for (const p of props) { const s = p.address.replace(/^(flat|apartment|unit)\s*\w+,?\s*/i, "").split(",")[0].trim(); c[s] = (c[s] || 0) + 1; } const top = Object.entries(c).sort((a, b) => b[1] - a[1])[0]; return top && top[1] >= Math.max(2, props.length * 0.6) ? top[0] : ""; })();
const portfolioWord = props.length === 1 ? props[0].address.split(",")[0] : streetName ? `the ${streetName} flats` : `your ${props.length} properties`;
const words = (n) => ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"][n] || String(n);

/* ---------- words ---------- */
const firstName = args.to || (props.find((p) => p.landlord.name && /^[A-Z][a-z]+ /.test(p.landlord.name)) || { landlord: {} }).landlord.name?.split(/\s+/)[0] || "there";
const hash = [...args.landlord].reduce((a, c) => a + c.charCodeAt(0), 0);
const OPENERS = [
  (m) => `Just a quick one to send over your ${m} statement and our bill for the month, both attached.`,
  (m) => `Here is how ${m} went at ${portfolioWord}. Your statement and our bill are attached.`,
  (m) => `Your ${m} statement is attached, along with our bill for the month.`,
  (m) => `${m} is wrapped up, so here are your statement and our bill for the month.`,
  (m) => `A short note with your ${m} statement and our bill attached, and a word on what happened at ${portfolioWord}.`,
  (m) => `Thought you would like your ${m} statement and bill straight away, so here they are.`,
];
const opener = OPENERS[(hash + M) % OPENERS.length](monthName);

/* The line that makes it personal: it comes from the month's numbers, never from a synonym list. */
const rentLine = (() => {
  const n = props.length;
  if (!n) return "";
  if (rentsIn === n && !late.length) return n === 1 ? `The rent came in and ${gbp(T.net)} went to you.` : `All ${words(n)} rents came in and ${gbp(T.net)} went to you across the month.`;
  const lateNames = late.map((p) => p.address.split(",")[0]).join(late.length === 2 ? " and " : ", ").replace(/, ([^,]*)$/, " and $1");
  const chase = late.length === 1 ? "is being chased under our arrears timetable and you will hear from us at each stage" : "are being chased under our arrears timetable and you will hear from us at each stage";
  return `${rentsIn === n ? `All ${words(n)}` : `${words(rentsIn).replace(/^\w/, (c) => c.toUpperCase())} of the ${words(n)}`} rents came in${rentsIn ? `, ${gbp(T.net)} went to you` : ""}; ${lateNames} ${chase}.`;
})();
const repairLine = (() => {
  if (!doneJobs.length && !openJobs.length) return "Nothing needed fixing this month.";
  const parts = [];
  if (doneJobs.length) parts.push(`${words(doneJobs.length).replace(/^\w/, (c) => c.toUpperCase())} repair${doneJobs.length === 1 ? " was" : "s were"} completed (${doneJobs.slice(0, 2).map((j) => `${j.title.toLowerCase()} at ${j.address.split(",")[0]}`).join(", ")}${doneJobs.length > 2 ? " and more below" : ""})`);
  if (openJobs.length) parts.push(doneJobs.length ? `and ${words(openJobs.length)} ${openJobs.length === 1 ? "is" : "are"} still in hand` : `${words(openJobs.length).replace(/^\w/, (c) => c.toUpperCase())} repair${openJobs.length === 1 ? " is" : "s are"} in hand and listed below`);
  return parts.join(" ") + ".";
})();
const aheadLine = certsDue.length ? `Coming up: ${certsDue.slice(0, 2).map((c) => `the ${c.label.toLowerCase()} at ${c.address.split(",")[0]} ${c.days < 0 ? "has expired and is being renewed" : `is due on ${nice(c.expiry)} and the renewal is booked in our diary`}`).join(", and ")}.` : "";

/* ---------- shared style ---------- */
const C = { ink: "#0F2A22", gold: "#B4924A", text: "#3B4A44", muted: "#7B8781", rule: "#E1E4DC", bg: "#F6F5F1", paper: "#FFFFFF", red: "#A43D2C", green: "#2F6B4F" };
const SITE = "https://propertysauce.co";
const F = "'Helvetica Neue',Helvetica,Arial,sans-serif";
const signer = args.from && args.from !== "team" ? args.from : "";
const code = args.landlord.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase();
const stmtNo = `PS-${code}-${Y}${String(M).padStart(2, "0")}`;
const FOOTER = `Property Sauce is a trading name of Sure Lets and Manage Limited, registered in England and Wales, company number 16613860. Director: Usman Tufail. Registered office: Lancaster House, Brownrigg Drive, Cramlington NE23 6UN. Member of the Property Redress Scheme, PRS058008. ICO registration ZC027659.`;

/* ---------- the email ---------- */
const tile = (label, value, tone = C.ink) => `<td width="25%" style="padding:0 6px"><table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${C.bg};border-radius:4px"><tr><td style="padding:14px 12px 12px"><div style="font-family:Arial,Helvetica,sans-serif;font-size:9px;font-weight:bold;letter-spacing:1.6px;text-transform:uppercase;color:${C.gold};line-height:1.4">${label}</div><div style="font-family:${F};font-size:20px;font-weight:bold;color:${tone};padding-top:6px;letter-spacing:-0.3px">${value}</div></td></tr></table></td>`;
const th = (t, right) => `<th style="font-family:Arial,Helvetica,sans-serif;font-size:9px;font-weight:bold;letter-spacing:1.4px;text-transform:uppercase;color:${C.muted};text-align:${right ? "right" : "left"};padding:0 8px 8px;border-bottom:1px solid ${C.rule};white-space:nowrap">${t}</th>`;
const td = (t, right, extra = "") => `<td style="font-family:${F};font-size:13px;color:${C.text};text-align:${right ? "right" : "left"};padding:9px 8px;border-bottom:1px solid ${C.rule};vertical-align:top;${extra}">${t}</td>`;
const propRows = props.map((p) => {
  const b = p.bill && !p.bill.awaiting ? p.bill : null;
  const short = esc(p.address.split(",").slice(0, 2).join(","));
  if (!b) return `<tr>${td(`<strong style="color:${C.ink}">${short}</strong><br><span style="font-size:11.5px;color:${C.muted}">${p.arrearsTotal ? `No rent received. ${gbp(p.arrearsTotal)} outstanding, being chased` : p.tenantName ? "No rent fell due in the month" : "Vacant"}</span>`)}${td("", 1)}${td("", 1)}${td("", 1)}${td("", 1)}</tr>`;
  return `<tr>${td(`<strong style="color:${C.ink}">${short}</strong>${p.arrearsTotal ? `<br><span style="font-size:11.5px;color:${C.red}">${gbp(p.arrearsTotal)} still outstanding from the tenant</span>` : ""}`)}${td(gbp(b.rent), 1)}${td(gbp(b.fee + b.otherTotal), 1)}${td(`<strong style="color:${C.ink}">${gbp(b.net)}</strong>`, 1)}${td(b.paid ? nice(b.paid) : `<span style="color:${C.gold}">next run</span>`, 1, "white-space:nowrap")}</tr>`;
}).join("") + unmatchedBills.map((b) => `<tr>${td(`<strong style="color:${C.ink}">${esc(b.property)}</strong>`)}${td(gbp(b.rent), 1)}${td(gbp(b.fee + b.otherTotal), 1)}${td(`<strong style="color:${C.ink}">${gbp(b.net)}</strong>`, 1)}${td(b.paid ? nice(b.paid) : `<span style="color:${C.gold}">next run</span>`, 1)}</tr>`).join("");
const bullets = (items) => items.length ? `<ul style="margin:6px 0 0;padding:0 0 0 18px">${items.map((i) => `<li style="font-family:${F};font-size:13px;line-height:1.55;color:${C.text};padding:2px 0">${i}</li>`).join("")}</ul>` : "";
const thisMonth = [
  ...doneJobs.map((j) => `${esc(j.title)} at ${esc(j.address.split(",")[0])}: completed${j.invoiced ? `, ${gbp(j.invoiced)}` : ""}${j.rating ? `, tenant rated it ${j.rating}/5` : ""}.`),
  ...openJobs.map((j) => `${esc(j.title)} at ${esc(j.address.split(",")[0])}: ${esc((j.status || "in hand").toLowerCase())}${j.agreed ? `, visit ${nice(j.agreed)}` : ""}.`),
  ...inspected.map((p) => `Inspection at ${esc(p.address.split(",")[0])} on ${nice(p.inspection.last)}: ${esc(p.inspection.outcome || "no issues found")}.`),
  ...props.flatMap((p) => p.certJobs.map((j) => `${esc(j.title)} at ${esc(p.address.split(",")[0])}: ${esc((j.status || "in progress").toLowerCase())}.`)),
  ...late.map((p) => `${esc(p.address.split(",")[0])}: ${gbp(p.arrearsTotal)} outstanding since ${nice(p.arrearsOldest)}. Reminders sent on our timetable; we will tell you at each stage.`),
];
const comingUp = [
  ...certsDue.map((c) => `${c.label} at ${esc(c.address.split(",")[0])}: ${c.days < 0 ? `expired ${nice(c.expiry)}, renewal in progress` : `due ${nice(c.expiry)}, renewal booked`}.`),
  ...tenancyEnds.map((p) => `Tenancy at ${esc(p.address.split(",")[0])} reaches the end of its fixed term on ${nice(p.tenancyEnd)}. We will be in touch about the renewal and the rent.`),
  ...inspectionsDue.map((p) => `Routine inspection at ${esc(p.address.split(",")[0])} due ${nice(p.inspection.next)}${p.inspection.inspector ? ` (${esc(p.inspection.inspector)})` : ""}.`),
];
const section = (title, inner) => `<tr><td style="padding:22px 0 0"><div style="font-family:Arial,Helvetica,sans-serif;font-size:9.5px;font-weight:bold;letter-spacing:1.8px;text-transform:uppercase;color:${C.gold}">${title}</div><div style="height:1px;background:${C.rule};margin:8px 0 4px"></div>${inner}</td></tr>`;

const emailHtml = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Your ${monthName} statement</title></head>
<body style="margin:0;padding:0;background:${C.bg}">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${C.bg}"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:${C.paper};border-radius:6px;border-top:3px solid ${C.gold}">
<tr><td style="padding:26px 32px 0">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr>
    <td style="vertical-align:middle"><a href="${SITE}" style="text-decoration:none"><img src="${SITE}/brand/mark-512.png" width="44" height="44" alt="Property Sauce" style="display:block;border:0;border-radius:3px"></a></td>
    <td style="vertical-align:middle;padding-left:14px"><div style="font-family:${F};font-size:15px;font-weight:bold;letter-spacing:2.4px;text-transform:uppercase;color:${C.ink}">Property Sauce</div><div style="font-family:Arial,Helvetica,sans-serif;font-size:8.5px;font-weight:bold;letter-spacing:1.8px;text-transform:uppercase;color:${C.gold};padding-top:3px">Monthly statement &middot; ${monthName} ${Y}</div></td>
    <td align="right" style="vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:10px;color:${C.muted}">${esc(args.landlord)}<br>${stmtNo}</td>
  </tr></table>
</td></tr>
<tr><td style="padding:26px 32px 0">
  <p style="font-family:${F};font-size:15px;line-height:1.6;color:${C.ink};margin:0 0 12px">Dear ${esc(firstName)},</p>
  <p style="font-family:${F};font-size:14.5px;line-height:1.65;color:${C.text};margin:0 0 12px">${opener} ${rentLine}</p>
  <p style="font-family:${F};font-size:14.5px;line-height:1.65;color:${C.text};margin:0">${repairLine}${aheadLine ? ` ${aheadLine}` : ""}</p>
</td></tr>
<tr><td style="padding:22px 26px 0"><table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr>${tile("Rent received", gbp(T.rent))}${tile("Our fee", gbp(-T.fee))}${tile("Other deductions", gbp(-T.other), T.other ? C.ink : C.muted)}${tile("Paid to you", gbp(T.net), C.green)}</tr></table></td></tr>
<tr><td style="padding:0 32px"><table role="presentation" cellpadding="0" cellspacing="0" width="100%">
${section("By property", `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top:8px"><tr>${th("Property")}${th("Rent in", 1)}${th("Deducted", 1)}${th("Paid to you", 1)}${th("Paid on", 1)}</tr>${propRows}<tr>${td(`<strong style="color:${C.ink}">Total</strong>`, 0, "border-bottom:0")}${td(`<strong style="color:${C.ink}">${gbp(T.rent)}</strong>`, 1, "border-bottom:0")}${td(`<strong style="color:${C.ink}">${gbp(T.fee + T.other)}</strong>`, 1, "border-bottom:0")}${td(`<strong style="color:${C.green}">${gbp(T.net)}</strong>`, 1, "border-bottom:0")}${td("", 1, "border-bottom:0")}</tr></table>${T.held ? `<p style="font-family:${F};font-size:12.5px;line-height:1.5;color:${C.muted};margin:8px 0 0">${gbp(T.held)} is cleared and will be in our next payment run; runs go out every working day at midday.</p>` : ""}`)}
${thisMonth.length ? section("This month at your properties", bullets(thisMonth)) : section("This month at your properties", `<p style="font-family:${F};font-size:13px;line-height:1.55;color:${C.text};margin:6px 0 0">A quiet month: no repairs reported, no inspections due, and every certificate in date.</p>`)}
${comingUp.length ? section("Coming up", bullets(comingUp)) : ""}
</table></td></tr>
<tr><td style="padding:24px 32px 0">
  <table role="presentation" cellpadding="0" cellspacing="0"><tr>
    <td style="padding:0 8px 0 0"><a href="${SITE}/landlord-portal/" style="display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:bold;letter-spacing:1.4px;text-transform:uppercase;color:#ffffff;background:${C.ink};padding:10px 16px;text-decoration:none;border-radius:2px">Open the landlord portal</a></td>
    <td><a href="mailto:accounts@propertysauce.co?subject=${encodeURIComponent(`${monthName} statement ${stmtNo}`)}" style="display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:bold;letter-spacing:1.4px;text-transform:uppercase;color:${C.ink};border:1px solid ${C.ink};padding:9px 15px;text-decoration:none;border-radius:2px">Ask a question</a></td>
  </tr></table>
  <p style="font-family:${F};font-size:13px;line-height:1.6;color:${C.text};margin:18px 0 0">Attached: <strong>Statement ${stmtNo}</strong> (every property, with the running position) and <strong>Bill ${stmtNo}</strong> (our fee, already deducted, so nothing is owed). Anything you would like explained, reply to this email or call the office and ask for accounts.</p>
  <p style="font-family:${F};font-size:14px;line-height:1.6;color:${C.ink};margin:18px 0 0">${signer ? `Kind regards,<br><strong>${esc(signer)}</strong><br><span style="color:${C.muted};font-size:12.5px">for the Property Sauce accounts team</span>` : `Kind regards,<br><strong>The Property Sauce accounts team</strong>`}</p>
</td></tr>
<tr><td style="padding:22px 32px 26px">
  <div style="height:1px;background:${C.rule}"></div>
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:14px"><tr>
    <td style="font-family:Arial,Helvetica,sans-serif;font-size:11.5px;line-height:1.8;color:${C.text}"><a href="mailto:accounts@propertysauce.co" style="color:${C.ink};text-decoration:none">accounts@propertysauce.co</a> &nbsp;&middot;&nbsp; <a href="tel:+442089888434" style="color:${C.ink};text-decoration:none">+44 (0)20 8988 8434</a> &nbsp;&middot;&nbsp; <a href="${SITE}" style="color:${C.ink};text-decoration:none">propertysauce.co</a><br><span style="color:${C.muted}">Top Floor, 55 Coopers Lane, Leyton, London E10 5DG</span></td>
  </tr></table>
  <p style="font-family:Arial,Helvetica,sans-serif;font-size:9.5px;line-height:1.6;color:${C.muted};margin:14px 0 0">${FOOTER}</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;

/* ---------- the statement (A4) ---------- */
const PRINT = `<style>
@page{size:A4;margin:16mm 16mm 18mm}*{box-sizing:border-box}body{margin:0;font-family:${F};color:${C.text};font-size:11.5px;line-height:1.5;background:#fff}
.head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid ${C.gold};padding-bottom:14px}
.brand{display:flex;align-items:center;gap:12px}.brand img{width:46px;height:46px;border-radius:3px}.wm{font-size:15px;font-weight:700;letter-spacing:2.4px;text-transform:uppercase;color:${C.ink}}.tag{font-size:8px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:${C.gold};margin-top:3px}
.doc{text-align:right}.doc h1{font-size:22px;font-weight:700;letter-spacing:-0.3px;color:${C.ink};margin:0}.doc .no{font-size:10.5px;color:${C.muted};margin-top:4px}
.meta{display:grid;grid-template-columns:1fr 1fr 1fr;gap:18px;padding:16px 0;border-bottom:1px solid ${C.rule}}.meta .k{font-size:8.5px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:${C.gold}}.meta .v{color:${C.ink};margin-top:4px;font-size:11.5px}
.tiles{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:18px 0 6px}.tile{background:${C.bg};border-radius:4px;padding:12px 14px}.tile .k{font-size:8.5px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:${C.gold}}.tile .v{font-size:19px;font-weight:700;color:${C.ink};margin-top:5px;letter-spacing:-0.3px}.tile .v.g{color:${C.green}}
h2{font-size:9.5px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:${C.gold};margin:22px 0 6px;padding-bottom:6px;border-bottom:1px solid ${C.rule}}
table{width:100%;border-collapse:collapse}th{font-size:8.5px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:${C.muted};text-align:left;padding:6px 6px;border-bottom:1px solid ${C.rule}}td{padding:7px 6px;border-bottom:1px solid ${C.rule};vertical-align:top}th.r,td.r{text-align:right;white-space:nowrap}td.p{color:${C.ink};font-weight:600}tr.tot td{border-bottom:0;border-top:2px solid ${C.ink};font-weight:700;color:${C.ink}}
.sub{font-size:10px;color:${C.muted}}.red{color:${C.red}}.g{color:${C.green}}
.note{font-size:10.5px;color:${C.muted};margin-top:10px;line-height:1.55}
.foot{margin-top:26px;font-size:8px;color:${C.muted};line-height:1.5;border-top:1px solid ${C.rule};padding-top:6px}
td.prop{min-width:150px}table.rent th:nth-child(1){width:26%}table.rent th:nth-child(2){width:11%}table.rent th:nth-child(7){width:22%}
</style>`;
const head = (title) => `<div class="head"><div class="brand"><img src="${SITE}/brand/mark-512.png" alt=""><div><div class="wm">Property Sauce</div><div class="tag">Portfolios &middot; Block management &middot; Acquisitions</div></div></div><div class="doc"><h1>${title}</h1><div class="no">${stmtNo} &middot; ${monthName} ${Y}</div></div></div>`;
const meta = (extra = "") => `<div class="meta"><div><div class="k">Landlord</div><div class="v">${esc(args.landlord)}</div></div><div><div class="k">Period</div><div class="v">1 to ${new Date(Y, M, 0).getDate()} ${monthName} ${Y}</div></div><div><div class="k">${extra ? "Issued" : "Issued"}</div><div class="v">${nice(new Date().toISOString())}</div></div></div>`;

const stmtRows = props.map((p) => {
  const b = p.bill && !p.bill.awaiting ? p.bill : null;
  const short = esc(p.address.split(",").slice(0, 2).join(","));
  const tenant = p.tenantName ? `<div class="sub">${esc(p.tenantName)}${p.rentPcm ? ` &middot; ${gbp(p.rentPcm)} pcm` : ""}</div>` : `<div class="sub">Vacant</div>`;
  if (!b) return `<tr><td class="p prop">${short}${tenant}</td><td class="r">${p.arrearsTotal ? "" : ""}</td><td class="r"></td><td class="r"></td><td class="r"></td><td class="r ${p.arrearsTotal ? "red" : ""}">${p.arrearsTotal ? gbp(p.arrearsTotal) : ""}</td><td>${p.arrearsTotal ? `No rent received. Outstanding since ${nice(p.arrearsOldest)}, being chased.` : p.tenantName ? "No rent fell due in the period" : ""}</td></tr>`;
  const deductions = [b.fee ? `Management fee${b.pct ? ` ${b.pct}%` : ""}` : "", ...b.other.map((l) => `${l.name}${l.description ? `: ${l.description}` : ""}`.slice(0, 60))].filter(Boolean).join("; ");
  return `<tr><td class="p prop">${short}${tenant}</td><td class="r">${b.rentDate ? nice(b.rentDate.split(/[\/\-]/).reverse().join("-")) : nice(b.date)}</td><td class="r">${gbp(b.rent)}</td><td class="r">${gbp(b.fee + b.otherTotal)}<div class="sub">${esc(deductions)}</div></td><td class="r g">${gbp(b.net)}<div class="sub">${b.paid ? `paid ${nice(b.paid)}` : "next payment run"}</div></td><td class="r ${p.arrearsTotal ? "red" : ""}">${p.arrearsTotal ? gbp(p.arrearsTotal) : "&ndash;"}</td><td>${p.arrearsTotal ? `Outstanding since ${nice(p.arrearsOldest)}; reminders on our timetable` : "Up to date"}</td></tr>`;
}).join("") + unmatchedBills.map((b) => `<tr><td class="p">${esc(b.property)}</td><td class="r">${nice(b.date)}</td><td class="r">${gbp(b.rent)}</td><td class="r">${gbp(b.fee + b.otherTotal)}</td><td class="r g">${gbp(b.net)}<div class="sub">${b.paid ? `paid ${nice(b.paid)}` : "next payment run"}</div></td><td class="r">&ndash;</td><td></td></tr>`).join("");

const heldRows = heldBills.filter((b) => !rows.some((r) => r.id === b.bill_id && r.awaiting)).map((b) => `<tr><td class="p">${esc(propertyOfVendor(b.vendor_name))}</td><td class="r">${nice(b.date)}</td><td>${esc(b.bill_number)}</td><td class="r g">${gbp(Number(b.balance))}</td></tr>`).join("");
const statementHtml = `<!doctype html><html><head><meta charset="utf-8"><title>Statement ${stmtNo}</title>${PRINT}</head><body>
${head("Statement")}${meta()}
<div class="tiles"><div class="tile"><div class="k">Rent received</div><div class="v">${gbp(T.rent)}</div></div><div class="tile"><div class="k">Our fee</div><div class="v">${gbp(-T.fee)}</div></div><div class="tile"><div class="k">Other deductions</div><div class="v">${gbp(-T.other)}</div></div><div class="tile"><div class="k">Paid to you</div><div class="v g">${gbp(T.net)}</div></div></div>
<h2>Rent account by property</h2>
<table class="rent"><tr><th>Property</th><th class="r">Received on</th><th class="r">Rent</th><th class="r">Deducted</th><th class="r">Paid to you</th><th class="r">Tenant owes</th><th>Position</th></tr>${stmtRows}<tr class="tot"><td>Total</td><td></td><td class="r">${gbp(T.rent)}</td><td class="r">${gbp(T.fee + T.other)}</td><td class="r">${gbp(T.net)}</td><td class="r ${T.arrears ? "red" : ""}">${T.arrears ? gbp(T.arrears) : "&ndash;"}</td><td></td></tr></table>
<p class="note">"Tenant owes" is rent that fell due on or before ${nice(monthEnd)} and had not reached us by the date of this statement. Money we are chasing is not money you have lost: every reminder, call and letter is logged and you are told at day 7, 14 and 21 of any arrears.</p>
${T.held ? `<h2>Cleared and waiting for the next payment run</h2><table><tr><th>Property</th><th class="r">Received</th><th>Reference</th><th class="r">Amount</th></tr>${heldRows}<tr class="tot"><td>Total held for you</td><td></td><td></td><td class="r">${gbp(T.held)}</td></tr></table><p class="note">Payment runs go out every working day at midday. Rent cleared by 11:30 is in that day's run.</p>` : `<h2>Balance held for you</h2><p class="note">Nothing is held: every rent cleared in the period has been paid to you.</p>`}
${(doneJobs.length || openJobs.length || props.some((p) => p.certJobs.length)) ? `<h2>Repairs and compliance in the period</h2><table><tr><th>Property</th><th>Job</th><th>Status</th><th class="r">Cost to you</th></tr>${[...doneJobs, ...openJobs].map((j) => `<tr><td class="p">${esc(j.address.split(",")[0])}</td><td>${esc(j.title)}${j.ticket ? `<div class="sub">Ticket ${esc(j.ticket)}</div>` : ""}</td><td>${j.closed ? "Completed" : esc(j.status || "In hand")}</td><td class="r">${j.invoiced ? gbp(j.invoiced) : "&ndash;"}</td></tr>`).join("")}${props.flatMap((p) => p.certJobs.map((j) => `<tr><td class="p">${esc(p.address.split(",")[0])}</td><td>${esc(j.title)}</td><td>${esc(j.status || "In progress")}</td><td class="r">${j.invoiced ? gbp(j.invoiced) : "&ndash;"}</td></tr>`)).join("")}</table>` : ""}
<h2>Certificates and dates</h2>
<table><tr><th>Property</th><th>Gas safety</th><th>Electrical (EICR)</th><th>EPC</th><th>Licence</th><th>Tenancy to</th><th>Next inspection</th></tr>${props.map((p) => { const cell = (d, applies = true) => !applies ? `<span class="sub">n/a</span>` : !d ? `<span class="red">none on file</span>` : daysFrom(d) < 0 ? `<span class="red">${nice(d)}</span>` : daysFrom(d) <= 90 ? `<span style="color:${C.gold}">${nice(d)}</span>` : nice(d); return `<tr><td class="p">${esc(p.address.split(",")[0])}</td><td>${cell(p.gas, p.gasApplicable)}</td><td>${cell(p.eicr)}</td><td>${cell(p.epc)}${p.epcRating ? ` <span class="sub">${esc(p.epcRating)}</span>` : ""}</td><td>${cell(p.licence, p.licenceRequired)}</td><td>${p.tenancyEnd ? (daysFrom(p.tenancyEnd) < 0 ? `<span class="sub">periodic since ${nice(p.tenancyEnd)}</span>` : nice(p.tenancyEnd)) : "<span class=\"sub\">periodic</span>"}</td><td>${p.inspection.next ? nice(p.inspection.next) : "<span class=\"sub\">to book</span>"}</td></tr>`; }).join("")}</table>
<p class="note">Red means expired or missing and already in hand; gold means due within 90 days and booked. The full history, every document and every job is in the landlord portal at propertysauce.co/landlord-portal/.</p>
<div class="foot">${FOOTER} Questions about this statement: accounts@propertysauce.co, +44 (0)20 8988 8434, quoting ${stmtNo}.</div>
</body></html>`;

/* ---------- the bill (A4) ---------- */
const billRows = rowsLive.map((r) => `<tr><td class="p">${esc(r.property)}<div class="sub">${esc(r.number)}</div></td><td class="r">${gbp(r.rent)}</td><td class="r">${r.fee ? gbp(-r.fee) : "&ndash;"}<div class="sub">${r.pct ? `${r.pct}% of rent` : ""}</div></td><td class="r">${r.otherTotal ? gbp(-r.otherTotal) : "&ndash;"}<div class="sub">${esc(r.other.map((l) => l.name).join(", "))}</div></td><td class="r g">${gbp(r.net)}</td><td class="r">${r.paid ? nice(r.paid) : "next run"}</td></tr>`).join("");
const billHtml = `<!doctype html><html><head><meta charset="utf-8"><title>Bill ${stmtNo}</title>${PRINT}</head><body>
${head("Bill")}
<div class="meta"><div><div class="k">From</div><div class="v">Property Sauce<br><span class="sub">Sure Lets and Manage Limited<br>Top Floor, 55 Coopers Lane, Leyton, London E10 5DG</span></div></div><div><div class="k">To</div><div class="v">${esc(args.landlord)}</div></div><div><div class="k">Period</div><div class="v">${monthName} ${Y}<br><span class="sub">Issued ${nice(new Date().toISOString())}</span></div></div></div>
<div class="tiles"><div class="tile"><div class="k">Rent collected</div><div class="v">${gbp(T.rent)}</div></div><div class="tile"><div class="k">Management fee</div><div class="v">${gbp(-T.fee)}</div></div><div class="tile"><div class="k">Costs recharged</div><div class="v">${gbp(-T.other)}</div></div><div class="tile"><div class="k">Paid to you</div><div class="v g">${gbp(T.net)}</div></div></div>
<h2>Our charges, property by property</h2>
<table><tr><th>Property</th><th class="r">Rent collected</th><th class="r">Management fee</th><th class="r">Costs recharged</th><th class="r">Paid to you</th><th class="r">Paid on</th></tr>${billRows}<tr class="tot"><td>Total</td><td class="r">${gbp(T.rent)}</td><td class="r">${gbp(-T.fee)}</td><td class="r">${gbp(-T.other)}</td><td class="r">${gbp(T.net)}</td><td></td></tr></table>
<p class="note"><strong style="color:${C.ink}">Nothing to pay.</strong> Our fee and any recharged costs were deducted from the rent before it was paid to you, so this bill is your record of what we charged in ${monthName} and needs no action. Keep it with your statement for your tax return: the rent collected is your gross income, and the fee and costs are allowable expenses.</p>
<div class="foot">${FOOTER} Bill ${stmtNo}. Questions: accounts@propertysauce.co, +44 (0)20 8988 8434.</div>
</body></html>`;

/* ---------- write ---------- */
const slug = args.landlord.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const dir = join(args.out || "out/statements", `${slug}-${month}`);
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, "email.html"), emailHtml);
writeFileSync(join(dir, "statement.html"), statementHtml);
writeFileSync(join(dir, "bill.html"), billHtml);
const subject = `${monthName} ${Y}: your statement and bill for ${portfolioWord}`;
writeFileSync(join(dir, "data.json"), JSON.stringify({ landlord: args.landlord, vendor: vendorPrefix, month, statement: stmtNo, subject, firstName, totals: T, rentsIn, properties: props.length, late: late.map((p) => ({ address: p.address, owes: p.arrearsTotal, since: p.arrearsOldest })), bills: rows.map(({ other, ...r }) => r), held: heldBills.map((b) => ({ number: b.bill_number, vendor: b.vendor_name, balance: b.balance })), heldStale: heldStale.map((b) => ({ number: b.bill_number, date: b.date, vendor: b.vendor_name, balance: b.balance })), awaitingRent: rows.filter((r) => r.awaiting).map((r) => r.number), unmatchedBills: unmatchedBills.map((b) => b.number), doneJobs: doneJobs.length, openJobs: openJobs.length, certsDue: certsDue.map((c) => ({ label: c.label, address: c.address, expiry: c.expiry })) }, null, 2));
console.error(`Subject: ${subject}`);
console.error(`Properties ${props.length}, bills in month ${rows.length} (${unmatchedBills.length} unmatched to a CRM record), rent ${gbp(T.rent)}, fee ${gbp(T.fee)}, other ${gbp(T.other)}, net ${gbp(T.net)}, held ${gbp(T.held)}, tenant arrears ${gbp(T.arrears)}`);
if (heldStale.length) console.error(`OFFICE CHECK: ${heldStale.length} unpaid bills older than ${heldDays} days totalling ${gbp(T.heldStale)} are left off the landlord pack until reconciled: ${heldStale.map((b) => b.bill_number).join("; ")}`);
const staleJobs = props.flatMap((p) => p.stale.map((j) => `${j.ticket || j.id} ${p.address.split(",")[0]}: ${j.title} (${j.status}, last touched ${j.updated})`));
if (staleJobs.length) console.error(`OFFICE CHECK: ${staleJobs.length} open repair tickets not touched for 60+ days, left off the pack until closed or updated:\n  ${staleJobs.join("\n  ")}`);
if (rows.some((r) => r.awaiting)) console.error(`OFFICE CHECK: bills raised before the rent arrived (shown as awaiting rent): ${rows.filter((r) => r.awaiting).map((r) => r.number).join("; ")}`);
if (args.pdf) {
  const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  for (const f of ["statement", "bill", "email"]) {
    try { execFileSync(chrome, [`--headless=new`, `--disable-gpu`, `--no-pdf-header-footer`, `--user-data-dir=${process.env.TMPDIR || "/tmp"}/chrome-ops10`, `--print-to-pdf=${join(process.cwd(), dir, `${f}.pdf`)}`, `file://${join(process.cwd(), dir, `${f}.html`)}`], { stdio: "ignore", timeout: 60000 }); }
    catch (e) { console.error(`PDF for ${f} failed (${e.status}); run scripts/print-pdf.sh ${dir} outside the sandbox`); }
  }
}
console.error(`Written to ${dir}`);
