// The landlord portal's data. Zoho CRM when it is configured (see zoho.mjs):
// the landlord is identified by the email address on their property records,
// certificates and rent come from the property, repairs from Maintenance and
// documents from the property's attachments. Otherwise three published sheets
// (LANDLORD_/PROPERTY_/DOCUMENT_DIRECTORY_URL, templates in docs/) as a fallback.
import { parseCsv, normaliseRef } from "./directory.mjs";
// Certificates held in Google Drive, indexed per property by scripts run from the office (docs/certificates/drive-certificates.json).
import driveCerts from "../../docs/certificates/drive-certificates.json" with { type: "json" };
import { zohoConfigured, findLandlordByEmail, propertiesByLandlordEmail, propertiesByOwner, ownersList, isAdminEmail, jobsForProperty, listAttachments, tenantById, normaliseEmail } from "./zoho.mjs";

const cache = new Map();
const TTL = 5 * 60 * 1000;
async function rows(kind) {
  const key = kind.toUpperCase();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.rows;
  let out = [];
  if (process.env[`${key}_DIRECTORY_JSON`]) out = JSON.parse(process.env[`${key}_DIRECTORY_JSON`]);
  else if (process.env[`${key}_DIRECTORY_URL`]) {
    const r = await fetch(process.env[`${key}_DIRECTORY_URL`], { headers: { "cache-control": "no-cache" } });
    if (!r.ok) throw new Error(`${kind} fetch failed: ${r.status}`);
    const text = await r.text();
    out = text.trim().startsWith("[") ? JSON.parse(text) : parseCsv(text);
  }
  cache.set(key, { at: Date.now(), rows: out });
  return out;
}

export const landlordsConfigured = () => zohoConfigured() || Boolean(process.env.LANDLORD_DIRECTORY_JSON || process.env.LANDLORD_DIRECTORY_URL);

/* Sign-in lookup: an email address (Zoho) or a landlord reference (sheets). */
export async function findLandlord(idOrEmail) {
  if (zohoConfigured()) return findLandlordByEmail(idOrEmail);
  const want = normaliseRef(idOrEmail);
  if (!want) return null;
  const row = (await rows("landlord")).find((r) => normaliseRef(r.landlord_ref) === want || normaliseEmail(r.email) === normaliseEmail(idOrEmail));
  if (!row) return null;
  return { reference: String(row.landlord_ref).trim(), name: row.name || "", firstName: (row.name || "").split(/\s+/)[0] || "there", email: (row.email || "").trim(), phone: (row.phone || "").replace(/[\s()-]/g, "") };
}

/* Everything the dashboard needs, already normalised for scoreProperty.
   viewAs (office use only) is an Established Landlord name: that landlord's
   properties instead of the signed-in landlord's own. */
/* The landlords a sign-in can see: every Established Landlord for the office,
   or the companies and names behind one landlord's login (a landlord who owns
   through several companies gets one entry per company). */
export async function landlordNames(ref) {
  if (!zohoConfigured()) return [];
  if (isAdminEmail(ref)) return ownersList();
  const counts = {};
  for (const p of await propertiesByLandlordEmail(ref)) { const k = p.owner || "(no landlord name on the record)"; counts[k] = (counts[k] || 0) + 1; }
  return Object.entries(counts).map(([name, properties]) => ({ name, properties, signIn: true, fromRecord: 0 })).sort((a, b) => b.properties - a.properties || a.name.localeCompare(b.name, "en-GB"));
}
export async function propertiesFor(landlordRef, viewAs = "") {
  if (zohoConfigured()) {
    const props = viewAs ? await propertiesByOwner(viewAs) : await propertiesByLandlordEmail(landlordRef);
    return Promise.all(props.map(async (p) => {
      const [jobs, attachments, tenant] = await Promise.all([
        jobsForProperty(p.id).catch(() => []),
        listAttachments("Accounts", p.id).catch(() => []),
        p.tenantId ? tenantById(p.tenantId).catch(() => null) : null,
      ]);
      return fromZoho(p, tenant, jobs, attachments);
    }));
  }
  const want = normaliseRef(landlordRef);
  const props = (await rows("property")).filter((r) => normaliseRef(r.landlord_ref) === want);
  const docs = await rows("document");
  return props.map((p) => ({ ...p, documents: docs.filter((d) => normaliseRef(d.property_ref) === normaliseRef(p.property_ref)) }));
}

/* Map a Zoho property (plus its tenant, jobs and attachments) onto the sheet
   shape so one scorer serves both sources. Rent history month by month is not
   held in the CRM, so the rent parts are read from the tenancy's status and
   missed-payment date instead. */
function fromZoho(p, tenant, allJobs, attachments) {
  const jobs = allJobs.filter((j) => !j.certificate);
  const t = tenant ? tenant.raw : {};
  const status = tenant ? tenant.status : "";
  const missedDays = Number(t.Days_Since_Missed_Payment) || 0;
  const missedDate = t.Tenants_Missed_Payment_Date || "";
  // Twelve-month history inferred: every month on time unless a missed payment is recorded.
  let history = "";
  if (tenant && CURRENT.has(status)) {
    history = "OOOOOOOOOOOO";
    if (missedDate) {
      const monthsAgo = Math.floor((Date.now() - Date.parse(missedDate)) / (30.44 * 86400000));
      if (monthsAgo >= 0 && monthsAgo < 12) history = history.slice(0, 11 - monthsAgo) + "M" + history.slice(12 - monthsAgo);
    }
    if (status === "Arrears" && !missedDate) history = history.slice(0, 11) + "L";
  }
  const rent = p.rentPcm || Number(t.Rent) || 0;
  const arrears = status === "Arrears" || status === "Possession Proceedings" || status === "Court" ? (missedDays ? Math.round((missedDays / 30) * rent) : rent) : 0;
  const invoices = jobs.filter((j) => j.invoiced).map((j) => ({ type: "invoice", title: `${j.ticket ? `Ticket ${j.ticket}: ` : ""}${j.title}`, date: j.paid || j.updated, url: "", amount: j.invoiced, job: j }));
  const fromDrive = (driveCerts[p.id] || []).map((d) => { const type = d.type === "eic" ? "eicr" : d.type === "fire" ? "other" : d.type || classify(d.name); return { type, title: docTitle(type, "", d.date), file: d.name, date: d.date || "", url: d.url || "", amount: null, drive: true }; });
  const documents = attachments.map((a) => { const type = classify(a.name); return { type, title: docTitle(type, a.name, a.date), file: a.name, date: a.date, url: `/api/file/?m=${a.module}&r=${a.record}&a=${a.id}`, amount: null }; }).concat(fromDrive, invoices);
  return {
    property_ref: p.reference || p.id, address: p.address, tenant_ref: tenant ? tenant.reference : "", rent_pcm: rent,
    rent_history_12m: history, rent_due_12m: tenant && CURRENT.has(status) ? rent * 12 : 0, rent_collected_12m: tenant && CURRENT.has(status) ? rent * 12 - arrears : 0,
    arrears, landlord_payments_12m: "", landlord_paid_on_time_12m: "",
    gas_expiry: p.gasApplicable ? p.gas : "none", eicr_expiry: p.eicr, epc_expiry: p.epc, epc_rating: p.epcRating,
    licence_expiry: p.licenceRequired ? p.licence || "missing" : "", deposit_protected: tenant ? (/protected|periodical/i.test(String(t.Deposit_Statue || "")) || t.Deposit_Registered === true ? "yes" : t.Deposit_Statue ? "no" : "") : "",
    tenancy_start: p.tenancyStart || t.Tenancy_Start_Date || "", tenant_name: p.tenantName, occupied: p.occupied, status: p.status, tenancy_status: status,
    jobs, documents, notes: "", inspection: p.inspection || null, owner: p.owner || "",
    finance: p.finance || null,
  };
}
/* Every document of a kind gets the same title; only the date changes. The date
   comes from the file name when it carries one, otherwise from when it was filed. */
const DOC_LABEL = { gas: "Gas safety certificate", eicr: "Electrical installation report", electrical: "Electrical certificate", epc: "Energy performance certificate", tenancy: "Tenancy agreement", licence: "Property licence", inventory: "Inventory and inspection", invoice: "Invoice", statement: "Statement" };
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function niceDate(iso) { const d = new Date(iso); return isNaN(d) ? "" : `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; }
function dateInName(name) {
  const m = String(name).match(/(\d{1,2})[-._ ](\d{1,2})[-._ ](20\d{2})/) || String(name).match(/(20\d{2})[-._](\d{2})[-._](\d{2})/);
  if (!m) return "";
  const [d, mo, y] = m[0].startsWith("20") ? [m[3], m[2], m[1]] : [m[1], m[2], m[3]];
  return niceDate(`${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
}
export function docTitle(type, name, filedDate) {
  const label = DOC_LABEL[type];
  if (!label) return String(name || "").replace(/\.[a-z0-9]{2,4}$/i, "");
  const when = dateInName(name) || niceDate(filedDate);
  return when ? `${label}, ${when}` : label;
}
const CURRENT = new Set(["Tenanted", "Arrears", "Possession Proceedings", "Court", "Let Agreed", "Maintenance Only"]);
/* Certificates held in Drive for a property, as document rows (shared with the tenant file). */
export function driveDocuments(propertyId) {
  return (driveCerts[propertyId] || []).map((d) => { const type = d.type === "eic" ? "eicr" : d.type === "fire" ? "other" : d.type || classify(d.name); return { type, title: docTitle(type, "", d.date), file: d.name, date: d.date || "", url: d.url || "", amount: null, drive: true }; });
}
export function classify(name) {
  const n = String(name || "").toLowerCase();
  if (/tenancy|ast|agreement|lease/.test(n)) return "tenancy";
  if (/gas|cp12|landlord.?gas/.test(n)) return "gas";
  if (/eicr|electric|niceic/.test(n)) return "eicr";
  if (/epc|energy/.test(n)) return "epc";
  if (/licen[cs]e/.test(n)) return "licence";
  if (/inventory|check.?in|check.?out|inspection/.test(n)) return "inventory";
  if (/invoice|receipt/.test(n)) return "invoice";
  if (/statement|remittance|payment/.test(n)) return "statement";
  return "other";
}

// ---------- scoring ----------
const num = (v) => { const x = Number(String(v ?? "").replace(/[£,\s]/g, "")); return Number.isFinite(x) ? x : null; };
const days = (d) => { if (!d) return null; const t = Date.parse(d); return Number.isFinite(t) ? Math.round((t - Date.now()) / 86400000) : null; };
const yes = (v) => /^(y|yes|true|1)$/i.test(String(v || "").trim());

export function certificate(label, expiry, opts = {}) {
  const left = days(expiry);
  let status, note;
  if (opts.notRequired) { status = "na"; note = "Not required"; }
  else if (left === null) { status = "missing"; note = "No certificate on file"; }
  else if (left < 0) { status = "expired"; note = `Expired ${-left} day${left === -1 ? "" : "s"} ago`; }
  else if (left <= 60) { status = "due"; note = `Expires in ${left} day${left === 1 ? "" : "s"}`; }
  else { status = "ok"; note = `Valid until ${expiry}`; }
  return { label, expiry: expiry || "", status, note, extra: opts.extra || "" };
}

export function scoreProperty(p) {
  const history = String(p.rent_history_12m || "").toUpperCase().replace(/[^OLPM-]/g, "").slice(-12);
  const due = [...history].filter((c) => c !== "-").length;
  const onTime = [...history].filter((c) => c === "O").length;
  const late = [...history].filter((c) => c === "L").length;
  const part = [...history].filter((c) => c === "P").length;
  const missed = [...history].filter((c) => c === "M").length;
  const rentDue = num(p.rent_due_12m), collected = num(p.rent_collected_12m), arrears = num(p.arrears) || 0;
  const payments = num(p.landlord_payments_12m), paidOnTime = num(p.landlord_paid_on_time_12m);

  const parts = [];
  const collectedPct = rentDue ? Math.min(1, (collected || 0) / rentDue) : null;
  parts.push({ key: "collected", label: "Rent collected", score: collectedPct === null ? 35 : Math.round(35 * collectedPct), max: 35, detail: rentDue ? `£${(collected || 0).toLocaleString("en-GB")} of £${rentDue.toLocaleString("en-GB")} due in the last 12 months` : p.tenancy_status ? `Tenancy status: ${p.tenancy_status}` : "No tenancy recorded" });
  const onTimeScore = due ? Math.round(20 * ((onTime + late * 0.5 + part * 0.5) / due)) : 20;
  parts.push({ key: "ontime", label: "Paid on time by the tenant", score: onTimeScore, max: 20, detail: due ? `${onTime} of ${due} on time${late ? `, ${late} late` : ""}${part ? `, ${part} part paid` : ""}${missed ? `, ${missed} missed` : ""}` : "No payments due yet" });
  const ltScore = payments ? Math.round(15 * Math.min(1, (paidOnTime || 0) / payments)) : 15;
  parts.push({ key: "paidout", label: "Paid to you on time", score: ltScore, max: 15, detail: payments ? `${paidOnTime || 0} of ${payments} statements paid within five working days` : "Paid within five working days of the rent clearing" });
  const gas = certificate("Gas safety", p.gas_expiry, { notRequired: /^(none|no gas|n\/a)$/i.test(String(p.gas_expiry || "")) });
  const eicr = certificate("Electrical (EICR)", p.eicr_expiry);
  const epc = certificate("EPC", p.epc_expiry, { extra: p.epc_rating ? `Rating ${String(p.epc_rating).toUpperCase()}` : "" });
  const licenceRequired = p.licence_expiry && !/^(none|n\/a|not required)$/i.test(String(p.licence_expiry));
  const licence = certificate("Licence", p.licence_expiry === "missing" ? "" : p.licence_expiry, { notRequired: !licenceRequired });
  const deposit = { label: "Deposit protected", status: p.deposit_protected === undefined || p.deposit_protected === "" ? "missing" : yes(p.deposit_protected) ? "ok" : "expired", note: yes(p.deposit_protected) ? "Protected and prescribed information served" : p.deposit_protected ? "Not protected" : "No record", expiry: "", extra: "" };
  const certScore = (c, w) => (c.status === "ok" || c.status === "na" ? w : c.status === "due" ? w * 0.7 : 0);
  const compliance = Math.round(certScore(gas, 10) + certScore(eicr, 10) + certScore(epc, 5) + certScore(deposit, 5));
  const certs = [gas, eicr, epc, deposit, ...(licence.status === "na" ? [] : [licence])];
  const problems = certs.filter((c) => c.status === "expired" || c.status === "missing").length;
  parts.push({ key: "compliance", label: "Certificates and compliance", score: compliance, max: 30, detail: problems ? `${problems} item${problems === 1 ? "" : "s"} need${problems === 1 ? "s" : ""} attention` : "Everything in date" });

  const score = Math.max(0, Math.min(100, parts.reduce((a, x) => a + x.score, 0)));
  const rag = score >= 85 ? "green" : score >= 65 ? "amber" : "red";
  const alerts = [];
  for (const c of certs) if (c.status === "expired" || c.status === "missing") alerts.push(`${c.label}: ${c.note.toLowerCase()}`);
  for (const c of certs) if (c.status === "due") alerts.push(`${c.label}: ${c.note.toLowerCase()}, renewal being arranged`);
  if (arrears > 0) alerts.push(`Arrears of £${arrears.toLocaleString("en-GB")}`);
  if (missed) alerts.push(`${missed} missed payment${missed === 1 ? "" : "s"} in the last year`);
  const openJobs = (p.jobs || []).filter((j) => !j.closed);
  if (openJobs.length) alerts.push(`${openJobs.length} repair${openJobs.length === 1 ? "" : "s"} in progress`);

  // Value, mortgage and what is left each month. Sheet rows may carry value,
  // mortgage_balance and mortgage_pcm columns; Zoho supplies a finance object.
  // Blank means not known, and a zero balance is treated the same way (the CRM leaves zeros in untouched fields).
  const known = (v) => { const n = num(v); return n === null || n === 0 ? null : n; };
  const f = p.finance || { value: p.value, mortgage: p.mortgage_balance, mortgagePcm: p.mortgage_pcm };
  const rentPcm = num(p.rent_pcm) || 0;
  const value = known(f.value), mortgage = known(f.mortgage), mortgagePcm = known(f.mortgagePcm);
  const costsPa = (known(f.serviceChargePa) || 0) + (known(f.groundRentPa) || 0);
  const finance = {
    value, mortgage, mortgagePcm, lender: f.lender || "", purchasePrice: num(f.purchasePrice), purchaseDate: f.purchaseDate || "", valuedDate: f.valuedDate || "",
    rate: num(f.rate), mortgageType: f.mortgageType || "", mortgageEnd: f.mortgageEnd || "", costsPa,
    equity: value !== null && mortgage !== null ? value - mortgage : null,
    netPcm: Math.round(rentPcm - (mortgagePcm || 0) - costsPa / 12),
    mortgageKnown: mortgage !== null, valueKnown: value !== null,
  };

  return {
    property_ref: p.property_ref, address: p.address || "", tenant_ref: p.tenant_ref || "", tenantName: p.tenant_name || "", rentPcm,
    finance, owner: p.owner || "",
    score, rag, parts, history, arrears, rentDue: rentDue || 0, collected: collected || 0, certificates: certs, alerts, notes: p.notes || "",
    jobs: (p.jobs || []).slice(0, 12),
    documents: (p.documents || []).map((d) => ({ type: String(d.type || "other").toLowerCase(), title: d.title || d.type || "Document", date: d.date || "", url: d.url || "", amount: num(d.amount) })).sort((a, b) => (b.date || "").localeCompare(a.date || "")),
  };
}

export function scorePortfolio(props) {
  const scored = props.map(scoreProperty);
  const totalRent = scored.reduce((a, p) => a + (p.rentPcm || 1), 0);
  const overall = scored.length ? Math.round(scored.reduce((a, p) => a + p.score * (p.rentPcm || 1), 0) / totalRent) : 0;
  return {
    overall, rag: overall >= 85 ? "green" : overall >= 65 ? "amber" : "red",
    properties: scored,
    totals: {
      properties: scored.length,
      rentPcm: scored.reduce((a, p) => a + p.rentPcm, 0),
      due: scored.reduce((a, p) => a + p.rentDue, 0),
      collected: scored.reduce((a, p) => a + p.collected, 0),
      arrears: scored.reduce((a, p) => a + p.arrears, 0),
      alerts: scored.reduce((a, p) => a + p.alerts.length, 0),
      // Equity totals count only what is known; the counts say how complete the picture is.
      value: scored.reduce((a, p) => a + (p.finance.value || 0), 0),
      mortgage: scored.reduce((a, p) => a + (p.finance.mortgage || 0), 0),
      equity: scored.reduce((a, p) => a + (p.finance.equity || 0), 0),
      mortgagePcm: scored.reduce((a, p) => a + (p.finance.mortgagePcm || 0), 0),
      costsPcm: Math.round(scored.reduce((a, p) => a + p.finance.costsPa / 12, 0)),
      netPcm: scored.reduce((a, p) => a + p.finance.netPcm, 0),
      valueKnown: scored.filter((p) => p.finance.valueKnown).length,
      mortgageKnown: scored.filter((p) => p.finance.mortgageKnown).length,
    },
  };
}
