// Ops 02 appendix B: one "Tenancy Checklist - <address>.pdf" per let property,
// built from the move-in document pack the most recent tenant was actually sent
// from Zoho CRM, compared with what the Landlord record says the property needs.
//
//   node --env-file=.env scripts/tenancy-checklist.mjs [--property "Catterick"] [--attach] [--limit 5]
//
//   --property   only Landlord records whose name contains this text
//   --attach     upload each PDF to the Landlord (Accounts) record, replacing an older copy
//   --limit      stop after N properties (for a pilot)
//   --out        output folder, default out/tenancy-checklists
//
// Reads: Accounts (Landlord), Contacts (Tenant) and each tenant's sent Emails.
// Writes: the PDFs, summary.csv and data.json in the output folder; attachments only with --attach.
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { accessToken } from "../src/chat/zoho.mjs";

const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, arr) => { if (x.startsWith("--")) a.push([x.slice(2), arr[i + 1] && !arr[i + 1].startsWith("--") ? arr[i + 1] : "true"]); return a; }, []));
const DC = (process.env.ZOHO_DC || "com").toLowerCase();
const API = `https://www.zohoapis.${DC}/crm/v8`;
const OUT = args.out || "out/tenancy-checklists";
const LIMIT = args.limit ? Number(args.limit) : Infinity;
mkdirSync(OUT, { recursive: true });

async function api(path, init = {}) {
  const t = await accessToken();
  const r = await fetch(`${API}${path}`, { ...init, headers: { authorization: `Zoho-oauthtoken ${t}`, ...(init.headers || {}) } });
  if (r.status === 204) return {};
  const text = await r.text();
  let d = {}; try { d = text ? JSON.parse(text) : {}; } catch { d = { raw: text }; }
  if (!r.ok) throw new Error(`zoho ${init.method || "GET"} ${path} ${r.status}: ${text.slice(0, 200)}`);
  return d;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- 1. Landlord records ---------- */
const ACC_FIELDS = "id,Account_Name,Status,Occupied,Existing_Tenant,Established_Landlord,Established_Vendor,Gas_Safety_Applicable,Gas_Safe_Certificate,NICEIC_Certificate,EPC_Expiry,EPC_Rating,Landlords_Property_License,Landlord_License_Exempt,Landlords_License_Number,Tenancy_Start_Date,Inspection_Area";
let accounts = [];
for (let page = 1; page <= 20; page++) {
  const d = await api(`/Accounts?fields=${ACC_FIELDS}&per_page=200&page=${page}`);
  accounts.push(...(d.data || []));
  if (!d.info?.more_records) break;
}
const LET_STATUSES = new Set(["Rented", "To Let", "Let Agreed"]);
const isUnit = (a) => LET_STATUSES.has(a.Status) && !/\bmain\b/i.test(a.Account_Name || "") && !/^catterick house main|^lancaster house main/i.test(a.Account_Name || "");
let props = accounts.filter(isUnit);
if (args.property) props = props.filter((a) => (a.Account_Name || "").toLowerCase().includes(args.property.toLowerCase()));
props.sort((a, b) => (a.Account_Name || "").localeCompare(b.Account_Name || "", "en", { numeric: true }));
const hist = {}; for (const a of accounts) hist[a.Status || "(blank)"] = (hist[a.Status || "(blank)"] || 0) + 1;
console.error(`${accounts.length} landlord records by status: ${Object.entries(hist).map(([k, v]) => `${k} ${v}`).join(", ")}; ${props.length} lettable units selected`);

/* ---------- 2. the standard pack ---------- */
const ITEMS = [
  { key: "agreement", label: "Assured Periodic Tenancy Agreement (copy as issued)", test: /tenancy.?agreement|assured|\bTA\b|\bAST\b|periodic/i },
  { key: "depositcert", label: "Mydeposits deposit protection certificate", test: /deposit.?(protection.?)?cert|\bDPC\b|deposit certificate|deposit\b(?!.*leaflet)/i },
  { key: "prescribed", label: "Prescribed information (deposit)", test: /prescribed/i },
  { key: "leaflet", label: "Mydeposits scheme leaflet and information for tenants", test: /leaflet|information for tenants|scheme/i },
  { key: "howtorent", label: "How to Rent guide (withdrawn by gov.uk on 1 May 2026; replaced by the Renters' Rights Act information sheet)", test: /how.?to.?rent/i },
  { key: "eicr", label: "Electrical installation condition report (EICR)", test: /\bEICR\b|electric/i },
  { key: "gas", label: "Gas safety record", test: /\bgas\b|CP12/i },
  { key: "epc", label: "Energy performance certificate (EPC)", test: /\bEPC\b|energy perf/i },
  { key: "licence", label: "Selective licence", test: /licen[cs]e/i },
  { key: "fire", label: "Fire safety information and emergency procedures (block)", test: /fire/i },
  { key: "rra", label: "Renters' Rights Act Information Sheet 2026 (gov.uk; replaces How to Rent from 1 May 2026)", test: /renters|rights.?act/i },
  { key: "checklist", label: "Required Document Checklist", test: /check.?list/i },
  { key: "inventory", label: "Inventory and schedule of condition", test: /inventory|schedule of condition/i },
];
const classify = (name) => {
  const n = String(name || "");
  // order matters: leaflets and checklists before the broad deposit/agreement tests
  for (const k of ["leaflet", "checklist", "howtorent", "prescribed", "rra", "fire", "inventory", "licence", "epc", "eicr", "gas", "depositcert", "agreement"]) {
    const it = ITEMS.find((i) => i.key === k);
    if (it.test.test(n)) return k;
  }
  return "other";
};
const landlordOf = (a) => a.Established_Landlord || a.Established_Vendor || "";
const isBlock = (name) => /catterick house|lancaster house/i.test(name || "");
const isYes = (v) => v === true || /^(yes|true)$/i.test(String(v || ""));
// Picklists on the Landlord record: Gas_Safety_Applicable is "Yes", "No Gas Supply - N/A" or "Not Yet Confirmed";
// Landlord_License_Exempt is "Exempt From Licensing" (or blank).
const gasState = (a) => { const v = String(a.Gas_Safety_Applicable || ""); if (/no gas|n\/a|not applicable/i.test(v)) return "n/a"; if (isYes(v) || a.Gas_Safe_Certificate) return "needed"; return "check"; };
const licenceState = (a) => { if (/exempt/i.test(String(a.Landlord_License_Exempt || "")) || isYes(a.Landlord_License_Exempt)) return "n/a"; return a.Landlords_Property_License || a.Landlords_License_Number ? "needed" : "check"; };
const needs = (a) => ({
  agreement: "needed", depositcert: "needed", prescribed: "check", leaflet: "needed", howtorent: "n/a", eicr: "needed", epc: "needed", rra: "needed", checklist: "needed",
  gas: gasState(a),
  licence: licenceState(a),
  fire: isBlock(a.Account_Name) ? "needed" : "check",
  inventory: "check",
});

/* ---------- 3. find the pack email ---------- */
const PACK_SUBJECT = /check.?list|tenancy documents|ta documents|move.?in documents|tenancy pack/i;
async function tenantsOf(a) {
  const list = [];
  const seen = new Set();
  const push = (c) => { if (c && c.id && !seen.has(c.id)) { seen.add(c.id); list.push(c); } };
  if (a.Existing_Tenant?.id) push({ id: a.Existing_Tenant.id, name: a.Existing_Tenant.name, start: null });
  try {
    const d = await api(`/Contacts/search?criteria=${encodeURIComponent(`(Account_Name:equals:${a.id})`)}&fields=id,Last_Name,Tenancy_Start_Date,Status,Email&per_page=200`);
    const rows = (d.data || []).sort((x, y) => String(y.Tenancy_Start_Date || "").localeCompare(String(x.Tenancy_Start_Date || "")));
    for (const r of rows) push({ id: r.id, name: r.Last_Name, start: r.Tenancy_Start_Date, status: r.Status });
  } catch (e) { console.error(`  contacts search failed for ${a.Account_Name}: ${e.message}`); }
  return list;
}
async function packFor(a) {
  const tenants = await tenantsOf(a);
  for (const t of tenants) {
    let emails = [];
    try { emails = (await api(`/Contacts/${t.id}/Emails?per_page=200`)).Emails || []; } catch (e) { if (!/204|no content/i.test(e.message)) console.error(`  emails failed for ${t.name}: ${e.message}`); }
    const cands = emails.filter((e) => e.sent && e.has_attachment && PACK_SUBJECT.test(e.subject || "")).sort((x, y) => String(y.time).localeCompare(String(x.time)));
    for (const c of cands) {
      const d = await api(`/Contacts/${t.id}/Emails/${c.message_id}`);
      const m = (d.Emails || [])[0];
      if (!m) continue;
      const atts = (m.attachments || []).map((x) => ({ name: x.name, size: Number(x.size) || 0, kind: classify(x.name) }));
      if (!atts.length) continue;
      return { tenant: t, subject: m.subject, time: c.time, from: c.from?.email || "", to: (m.to || []).map((x) => x.email).join(", "), cc: (m.cc || []).map((x) => x.email).join(", "), attachments: atts, tenantsChecked: tenants.length };
    }
    await sleep(120);
  }
  return { tenant: tenants[0] || null, attachments: [], tenantsChecked: tenants.length };
}

/* ---------- 4. the PDF ---------- */
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const nice = (iso) => { if (!iso) return ""; const d = new Date(iso); return isNaN(d) ? "" : `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; };
const today = nice(new Date().toISOString());
const dateState = (iso) => { if (!iso) return ["none on record", "warn"]; const days = Math.round((Date.parse(iso) - Date.now()) / 86400000); return days < 0 ? [`${nice(iso)} (expired)`, "bad"] : days < 60 ? [`${nice(iso)} (due within 60 days)`, "warn"] : [nice(iso), "ok"]; };
const safeName = (s) => String(s).replace(/[\/\\:*?"<>|]+/g, "-").replace(/\s+/g, " ").trim();

function html(a, pack) {
  const need = needs(a);
  const sentKinds = new Set(pack.attachments.map((x) => x.kind));
  const rows = ITEMS.map((it) => {
    const n = need[it.key];
    const sent = sentKinds.has(it.key);
    let state, cls;
    if (it.key === "howtorent") { state = sent ? "Sent in the last pack; no longer required, do not send" : "Not required since 1 May 2026"; cls = "na"; }
    else if (n === "n/a") { state = sent ? "Sent (not required at this property)" : "Not applicable at this property"; cls = "na"; }
    else if (sent) { state = "Sent"; cls = "ok"; }
    else if (it.key === "prescribed") { state = "Printed inside the agreement (pages 6 to 8); confirm the Mydeposits prescribed information also goes in"; cls = "warn"; }
    else if (it.key === "rra" || it.key === "fire") { state = n === "needed" ? "Not in the last pack: add from now on" : "Not sent: confirm whether this property needs it"; cls = "warn"; }
    else if (n === "check") { state = "Not sent: confirm whether this property needs it"; cls = "warn"; }
    else { state = "NOT SENT"; cls = "bad"; }
    const files = pack.attachments.filter((x) => x.kind === it.key).map((x) => esc(x.name)).join("<br>");
    return `<tr><td>${esc(it.label)}</td><td class="${cls}">${state}</td><td class="file">${files}</td><td class="box"></td></tr>`;
  }).join("");
  const others = pack.attachments.filter((x) => x.kind === "other");
  const certs = [["EICR expiry", a.NICEIC_Certificate], ["Gas safety expiry", need.gas === "n/a" ? null : a.Gas_Safe_Certificate], ["EPC expiry", a.EPC_Expiry], ["Selective licence expiry", need.licence === "n/a" ? null : a.Landlords_Property_License]]
    .map(([l, v]) => { if (v === null && (l.startsWith("Gas") || l.startsWith("Selective"))) return `<tr><td>${l}</td><td class="na">not applicable</td></tr>`; const [t, c] = dateState(v); return `<tr><td>${l}</td><td class="${c}">${t}</td></tr>`; }).join("");
  const flatOf = (s) => (String(s || "").match(/\b(?:flat|apartment|unit)\s*0*(\d+[a-z]?)\b/i) || [])[1];
  const mismatch = pack.attachments.length && flatOf(pack.subject) && flatOf(a.Account_Name) && flatOf(pack.subject).toLowerCase() !== flatOf(a.Account_Name).toLowerCase();
  const source = (mismatch ? `<p class="bad">Warning: the email subject names Flat ${esc(flatOf(pack.subject))} but this record is Flat ${esc(flatOf(a.Account_Name))}. Check the attachments were for this property.</p>` : "") + (pack.attachments.length
    ? `<p>Built from the move-in pack sent from Zoho CRM to <b>${esc(pack.tenant?.name || "")}</b> on <b>${esc(nice(pack.time))}</b>, subject "${esc(pack.subject)}", from ${esc(pack.from)}${pack.cc ? `, copied to ${esc(pack.cc)}` : ""}. It carried ${pack.attachments.length} attachment${pack.attachments.length === 1 ? "" : "s"}.</p>`
    : `<p class="bad"><b>No move-in pack email was found on any tenant record for this property</b> (${pack.tenantsChecked} tenant record${pack.tenantsChecked === 1 ? "" : "s"} checked${pack.tenant ? `, latest ${esc(pack.tenant.name)}` : ""}). The list below is derived from the Landlord record only, not from anything seen sent. Please confirm every line.</p>`);
  return `<!doctype html><html><head><meta charset="utf-8"><title>Tenancy Checklist - ${esc(a.Account_Name)}</title><style>
  @page { size: A4; margin: 12mm 13mm; }
  body { font-family: Georgia, "Times New Roman", serif; color: #1f2937; font-size: 11px; line-height: 1.4; }
  .head { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #b8860b; padding-bottom: 8px; margin-bottom: 14px; }
  .brand { font-family: Arial, Helvetica, sans-serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #b8860b; font-weight: bold; }
  h1 { font-size: 20px; margin: 4px 0 0; font-weight: normal; }
  .sub { font-family: Arial, Helvetica, sans-serif; font-size: 10px; color: #6b7280; text-align: right; }
  .meta { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px 16px; margin: 10px 0 14px; font-family: Arial, Helvetica, sans-serif; font-size: 10.5px; }
  .meta .k { color: #6b7280; font-size: 9px; letter-spacing: 1.2px; text-transform: uppercase; } .meta .v { font-size: 11.5px; }
  h2 { font-family: Arial, Helvetica, sans-serif; font-size: 9.5px; letter-spacing: 1.8px; text-transform: uppercase; color: #b8860b; margin: 14px 0 5px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; } th { font-family: Arial, Helvetica, sans-serif; font-size: 9px; letter-spacing: 1.2px; text-transform: uppercase; color: #6b7280; text-align: left; padding: 4px 6px; border-bottom: 1px solid #e5e7eb; }
  td { padding: 4px 6px; border-bottom: 1px solid #f1f5f9; vertical-align: top; } td.file { font-family: Arial, Helvetica, sans-serif; font-size: 9.5px; color: #4b5563; }
  td.box { width: 34px; } td.box::before { content: ""; display: block; width: 14px; height: 14px; border: 1px solid #9ca3af; margin: 0 auto; }
  .ok { color: #166534; } .bad { color: #991b1b; font-weight: bold; } .warn { color: #92400e; } .na { color: #9ca3af; }
  .sign { margin-top: 22px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; font-family: Arial, Helvetica, sans-serif; font-size: 10px; color: #6b7280; }
  .sign div { border-top: 1px solid #9ca3af; padding-top: 4px; }
  .foot { margin-top: 18px; font-family: Arial, Helvetica, sans-serif; font-size: 9px; color: #9ca3af; }
  </style></head><body>
  <div class="head"><div><div class="brand">Property Sauce</div><h1>Tenancy Checklist</h1></div><div class="sub">Ops 02 move-in pack reference<br>Generated ${today}</div></div>
  <div class="meta">
    <div><div class="k">Property</div><div class="v">${esc(a.Account_Name)}</div></div>
    <div><div class="k">Landlord</div><div class="v">${esc(landlordOf(a))}</div></div>
    <div><div class="k">Record status</div><div class="v">${esc(a.Status || "")}${a.Occupied ? ", " + esc(a.Occupied) : ""}</div></div>
  </div>
  <h2>Where this list comes from</h2>${source}
  <h2>What the move-in pack for this property must contain</h2>
  <table><tr><th>Document</th><th>Last pack</th><th>File sent</th><th>OK?</th></tr>${rows}</table>
  ${others.length ? `<p style="margin-top:8px"><b>Also sent, not on the standard list:</b> ${others.map((x) => esc(x.name)).join("; ")}</p>` : ""}
  <h2>Certificate dates on the Landlord record</h2>
  <table>${certs}</table>
  <h2>Checked by the office</h2>
  <p>Please confirm each line above is right for this property (tick the box), correct anything wrong on this sheet, and return it. The Ops 02 routine uses this list for every new tenancy at this property until it is regenerated.</p>
  <div class="sign"><div>Checked by (name)</div><div>Date</div><div>Corrections made in Zoho on</div></div>
  <div class="foot">Legal reminders: gas safety record and EICR before move-in; EPC free of charge; deposit protected and prescribed information given within 30 days of receipt; the Renters' Rights Act Information Sheet 2026 in place of the withdrawn How to Rent guide; alarms tested on day one. Gas and licence lines follow this property's Landlord record (Gas Safety Applicable, Landlord License Exempt). Ops 02, docs/ops/02-tenant-paperwork-and-due-diligence.md.</div>
  </body></html>`;
}
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
function toPdf(htmlPath, pdfPath) {
  // Chrome sometimes lingers after writing the PDF; a timeout with the file present is a success.
  try { execFileSync(CHROME, ["--headless=new", "--disable-gpu", "--no-pdf-header-footer", `--user-data-dir=${process.env.TMPDIR || "/tmp"}/chrome-ops02`, `--print-to-pdf=${pdfPath}`, `file://${htmlPath}`], { stdio: "ignore", timeout: 30000 }); }
  catch (e) { if (!existsSync(pdfPath)) throw e; }
  if (!existsSync(pdfPath)) throw new Error(`no PDF written for ${pdfPath}`);
}

/* ---------- 5. attach ---------- */
async function attach(a, pdfPath, fileName) {
  const existing = (await api(`/Accounts/${a.id}/Attachments?fields=id,File_Name`)).data || [];
  for (const e of existing.filter((x) => x.File_Name === fileName)) await api(`/Accounts/${a.id}/Attachments/${e.id}`, { method: "DELETE" });
  const form = new FormData();
  form.append("file", new Blob([readFileSync(pdfPath)], { type: "application/pdf" }), fileName);
  const d = await api(`/Accounts/${a.id}/Attachments`, { method: "POST", body: form });
  return d.data?.[0]?.details?.id || d.data?.[0]?.code || "ok";
}

/* ---------- run ---------- */
const summary = [];
let n = 0;
for (const a of props) {
  if (n++ >= LIMIT) break;
  process.stderr.write(`${a.Account_Name} ... `);
  let pack;
  try { pack = await packFor(a); } catch (e) { console.error(`failed: ${e.message}`); summary.push({ address: a.Account_Name, error: e.message }); continue; }
  const need = needs(a);
  const sentKinds = new Set(pack.attachments.map((x) => x.kind));
  const missing = ITEMS.filter((i) => need[i.key] === "needed" && !sentKinds.has(i.key)).map((i) => i.key);
  const check = ITEMS.filter((i) => need[i.key] === "check" && !sentKinds.has(i.key)).map((i) => i.key);
  const fileName = `Tenancy Checklist - ${safeName(a.Account_Name)}.pdf`;
  const base = join(process.cwd(), OUT, safeName(a.Account_Name));
  writeFileSync(`${base}.html`, html(a, pack));
  toPdf(`${base}.html`, `${base}.pdf`);
  let attached = "";
  if (args.attach === "true") { try { attached = await attach(a, `${base}.pdf`, fileName); } catch (e) { attached = `FAILED ${e.message}`; } }
  const flatOf2 = (s) => (String(s || "").match(/\b(?:flat|apartment|unit)\s*0*(\d+[a-z]?)\b/i) || [])[1];
  const mismatch = pack.subject && flatOf2(pack.subject) && flatOf2(a.Account_Name) && flatOf2(pack.subject).toLowerCase() !== flatOf2(a.Account_Name).toLowerCase() ? `subject says Flat ${flatOf2(pack.subject)}` : "";
  const row = { address: a.Account_Name, status: a.Status, mismatch, landlord: landlordOf(a), sourceTenant: pack.tenant?.name || "", packDate: pack.time ? pack.time.slice(0, 10) : "", subject: pack.subject || "", attachments: pack.attachments.length, sent: [...sentKinds].filter((k) => k !== "other").join(" "), missing: missing.join(" "), toConfirm: check.join(" "), eicr: a.NICEIC_Certificate || "", gas: need.gas === "n/a" ? "n/a" : (a.Gas_Safe_Certificate || ""), epc: a.EPC_Expiry || "", licence: need.licence === "n/a" ? "n/a" : (a.Landlords_Property_License || ""), pdf: fileName, attached, tenantsChecked: pack.tenantsChecked, files: pack.attachments.map((x) => x.name) };
  summary.push(row);
  console.error(pack.attachments.length ? `pack of ${pack.attachments.length} (${row.packDate}); missing: ${missing.join(", ") || "none"}${attached ? `; attached ${attached}` : ""}` : `NO PACK FOUND (${pack.tenantsChecked} tenants)${attached ? `; attached ${attached}` : ""}`);
  await sleep(150);
}
const cols = ["address", "status", "mismatch", "landlord", "sourceTenant", "packDate", "subject", "attachments", "sent", "missing", "toConfirm", "eicr", "gas", "epc", "licence", "pdf", "attached", "tenantsChecked"];
const csv = [cols.join(","), ...summary.map((r) => cols.map((c) => `"${String(r[c] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
writeFileSync(join(OUT, "summary.csv"), csv);
writeFileSync(join(OUT, "data.json"), JSON.stringify(summary, null, 2));
console.error(`\n${summary.length} properties written to ${OUT}/ (summary.csv, data.json)`);
